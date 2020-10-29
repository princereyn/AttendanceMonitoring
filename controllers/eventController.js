const EventModel = require("../models/eventModel");
const mongoose = require("mongoose");
const { body, check, query } = require("express-validator");
const { validate, error, isDateValid, isDateRangeValid } = require("../common/validators.js");
const ExcelExportService = require('../exportService/ExcelExportService');

exports.getAllEvents = async (req, res, next) => {	
	try {
		const events = await EventModel.find({})
			.populate({
				path: "membersAttendance",
				model: "Attendance",
				select: "_id timeIn timeOut",
				populate: {
					path: "member",
					model: "Member",
					select: "_id name",
				}
			});
		res.status(200).send(events);
	} catch (err) {
		error(res, err);
		next(err);
	}
	req.app.get('log').emit('logApiEvents', { req, res });
};

exports.getByEventIdValidator = validate([
	check("id").custom(async (eventId) => {
		if (mongoose.Types.ObjectId.isValid(eventId)) {
			const event = await EventModel.findById(eventId);
			if (!event) throw new Error("Event does not exist!");
		} else {
			throw new Error("Parameter has invalid Event Id!");
		}
    })
]);

exports.getByEventId = async (req, res, next) => {
	try {
		const event = await EventModel.findById(req.params.id)
			.populate({
				path: "membersAttendance",
				model: "Attendance",
				select: "_id timeIn timeOut",
				populate: {
					path: "member",
					model: "Member",
					select: "_id name",
				}
			});
		res.status(200).send(event);
	} catch (err) {
		error(res, err);
		next(err);
	}
	req.app.get('log').emit('logApiEvents', { req, res });
};

exports.searchEventsValidator = validate([
    query("eventname")
        .notEmpty().withMessage("eventname is required!"),
    query("datestart")
        .notEmpty().withMessage("datestart is required!")
        .custom(isDateValid).withMessage("datestart not valid!")
        .custom(isDateRangeValid).withMessage("datestart should not be equal to or past dateend!"),
    query("dateend")
        .notEmpty().withMessage("dateend is required!")
        .custom(isDateValid).withMessage("dateend not valid!"),
]);

exports.searchEvents = async (req, res, next) => {
	try {
		const events = await EventModel.find({
			eventName: { $regex: new RegExp(req.query.eventname, "i") },
			eventStartDate: { $gte: req.query.datestart },
			eventEndDate: { $lte: req.query.dateend },
		}).populate({
			path: "membersAttendance",
			model: "Attendance",
			select: "_id timeIn timeOut",
			populate: {
				path: "member",
				model: "Member",
				select: "_id name",
			}
		});
		if (events.length) res.json(events);
		else res.status(200).send(`No matching events found!`);
	} catch (err) {
		error(res, err);
		next(err);
	}
	req.app.get('log').emit('logApiEvents', { req, res });
};

exports.insertEventValidator = validate([
	body("eventName")
		.notEmpty().withMessage("eventName is required!")
		.custom(async (eventName) => {
			const event = await EventModel.findOne({ eventName });
			if (event) throw new Error("Event Name already in use!");
		}),
    body("eventType")
        .notEmpty().withMessage("eventType is required!"),
	check("eventStartDate")
        .notEmpty().withMessage("eventStartDate is required!")
        .custom(isDateValid).withMessage("eventStartDate not valid!")
        .custom(isDateRangeValid).withMessage("eventStartDate should not be equal to or past eventEndDate!"),
	check("eventEndDate")
		.notEmpty().withMessage("eventEndDate is required!")
		.custom(isDateValid).withMessage("eventEndDate not valid!"),
]);

exports.insertEvent = async (req, res, next) => {
	try {
		const event = new EventModel(req.body);
		await event.save();
		res.status(201).send("Event successfully created.");
	} catch (err) {
		error(res, err);
		next(err);
	}
	req.app.get('log').emit('logApiEvents', { req, res });
};

exports.updateEventValidator = validate([
    check("id")
        .notEmpty().withMessage("eventId is required!")
        .custom(async (eventId) => {
            if (mongoose.Types.ObjectId.isValid(eventId)) {
                const event = await EventModel.findById(eventId);
                if (!event) throw new Error("Event does not exist!");
            } else {
                throw new Error("Parameter has invalid Event Id!");
            }
        }),
	check("eventName")
		.notEmpty().withMessage("eventName is required!")
		.custom(async (eventName, { req }) => {
			const event = await EventModel.findOne({
				eventName,
				_id: { $ne: req.params.id },
			});
			if (event) throw new Error("Event Name already in use!");
		}),
    body("eventType")
        .notEmpty().withMessage("eventType is required!"),
	check("eventStartDate")
		.notEmpty().withMessage("eventStartDate is required!")
        .custom(isDateValid).withMessage("eventStartDate not valid!")
        .custom(isDateRangeValid).withMessage("eventStartDate should not be equal to or past eventEndDate!"),
	check("eventEndDate")
		.notEmpty().withMessage("eventEndDate is required!")
		.custom(isDateValid).withMessage("eventEndDate not valid!"),
]);

exports.updateEvent = async (req, res, next) => {
	try {
		await EventModel.findOneAndUpdate({ _id: req.params.id }, req.body);
		res.status(200).send("Event successfully updated.");
	} catch (err) {
		error(res, err);
		next(err);
	}
	req.app.get('log').emit('logApiEvents', { req, res });
};

exports.deleteEventValidator = validate([
    check("id")
        .notEmpty().withMessage("eventId is required!")
	    .custom(async (eventId) => {
            if (mongoose.Types.ObjectId.isValid(eventId)) {
                const event = await EventModel.findById(eventId);
                if (!event) { 
                    throw new Error(`Event does not exist!`);
                } else {
                    if (event.membersAttendance.length > 0) {
                        throw new Error(`Cannot delete an event with members attendance!`)
                    }
                }
            } else {
                throw new Error("Parameter has invalid Event Id!");
            }
	    }),
]);

exports.deleteEvent = async (req, res, next) => {
	try {
		await EventModel.findByIdAndDelete({ _id: req.params.id });
		res.status(200).send("Event successfully deleted.");
	} catch (err) {
		error(res, err);
		next(err);
	}
	req.app.get('log').emit('logApiEvents', { req, res });
};

exports.exportEventAttendeesValidator = validate([
    check("id")
        .notEmpty().withMessage("eventId is required!")
	    .custom(async (eventId) => {
            if (mongoose.Types.ObjectId.isValid(eventId)) {
                const event = await EventModel.findById(eventId);
                if (!event) { 
                    throw new Error(`Event does not exist!`);
                }
            } else {
                throw new Error("Parameter has invalid Event Id!");
            }
	    }),
]);

const filterData = (membersAttendance) => {
	return membersAttendance
		.map(attendance => {
			return {
				name: attendance.member.name,
				timeIn: attendance.timeIn,
				timeOut: attendance.timeOut
			}
		})
		.sort((a, b) => (a.timeIn > b.timeIn) ? 1 : -1)
};

exports.exportEventAttendees = async (req, res, next) => {
	try {
		const event = await EventModel.findById(req.params.id)
			.populate({
				path: "membersAttendance",
				model: "Attendance",
				select: "_id timeIn timeOut",
				populate: {
					path: "member",
					model: "Member",
					select: "_id name",
				}
			});
		const excelExportService = new ExcelExportService(event.eventName, event.eventStartDate);		
		await excelExportService.export(filterData(event.membersAttendance), res);
	} catch (err) {
		error(res, err);
		next(err);
	}
	req.app.get('log').emit('logApiEvents', { req, res });
};