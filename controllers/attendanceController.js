const AttendanceModel = require('../models/attendanceModel');
const EventModel = require('../models/eventModel');
const MemberModel = require('../models/memberModel');
const moment = require('moment');
const mongoose = require('mongoose');
const { check } = require('express-validator');
const { validate, error, isDateValid, isDateRangeValid } = require("../common/validators.js");

exports.getAllAttendance = async (req, res, next) => {
    try {
        const attendance = await AttendanceModel.find({})
            .populate({
                path: "member",
                model: "Member",
                select: "_id name status",
            })
            .populate({
                path: "event",
                model: "Event",
                select: "_id eventName eventType",
            });
        res.status(200).send(attendance);
    } catch (err) {
        error(res, err);
        next(err);
    }
    req.app.get('log').emit('logApiEvents', { req, res });
};

exports.getByAttendanceIdValidator = validate([
	check("id").custom(async (attendanceId) => {
		if (mongoose.Types.ObjectId.isValid(attendanceId)) {
			const attendance = await AttendanceModel.findById(attendanceId);
			if (!attendance) throw new Error("Attendance does not exist!");
		} else {
			throw new Error("Parameter has invalid Attendance Id!");
		}
    })
]);

exports.getByAttendanceId = async (req, res, next) => {
    try {
        const attendance = await AttendanceModel.findById(req.params.id)
            .populate({
                path: "member",
                model: "Member",
                select: "_id name status",
            })
            .populate({
                path: "event",
                model: "Event",
                select: "_id eventName eventType",
            });
        res.status(200).send(attendance);
    } catch (err) {
        error(res, err);
        next(err);
    }
    req.app.get('log').emit('logApiEvents', { req, res });
};

exports.insertAttendanceValidator = validate([
    check('memberId')
        .notEmpty().withMessage("memberId is required!")
        .custom(async (memberId, { req }) => {            
            const member = await MemberModel.findOne({ _id: memberId });            
            if (member) { 
                if (member.status === 'Inactive') { //TODO: Transform to enum?
                    throw new Error('An inactive member cannot attend events!');
                } else {
                    const attendance = await AttendanceModel.findOne({ event: req.body.eventId, member: memberId });                                    
                    if (attendance) throw new Error('You are already registered in this event!');            
                }
            } else {
                throw new Error('Member not existing!');
            }
    }),
    check('eventId')
        .notEmpty().withMessage("eventId is required!")
        .custom(async (eventId, { req }) => {
            const event = await EventModel.findOne({ _id: eventId });
            if (event) { 
                const timeIn = moment(new Date(req.body.timeIn));
                if (timeIn.diff(event.eventEndDate) > 0) {
                    throw new Error(`The event has already finished!`);
                }
            } else {
                throw new Error('Event not existing!');
            }
    }),
    check('timeIn')
        .notEmpty().withMessage("timeIn is required!")
        .custom(isDateValid).withMessage("timeIn not valid!")
        .custom(isDateRangeValid).withMessage("timeIn should not be equal to or past timeOut!"),      
    check('timeOut')        
        .optional()
        .custom(isDateValid).withMessage("timeOut is not valid!")
]);
  
exports.insertAttendance = async (req, res, next) => {
    try {
        const { eventId, memberId, timeIn, timeOut } = req.body;

        const eventDoc = await EventModel.findById(eventId);
        const memberDoc = await MemberModel.findById(memberId);

        const attendance = new AttendanceModel({
            timeIn,
            timeOut,
            event: eventDoc._id,
            member: memberDoc._id
        });

        eventDoc.membersAttendance.push(attendance._id);
        memberDoc.eventsAttendance.push(attendance._id);

        await attendance.save();
        await eventDoc.save();
        await memberDoc.save();

        res.status(201).send('Attendance successfully created.');
    } catch (err) {
        error(res, err);
        next(err);
    }
    req.app.get('log').emit('logApiEvents', { req, res });
};

exports.updateAttendanceValidator = validate([
    check("id")
        .notEmpty().withMessage("attendanceId is required!")
        .custom(async (attendanceId) => {
            if (mongoose.Types.ObjectId.isValid(attendanceId)) {
                const attendance = await AttendanceModel.findById(attendanceId);
                if (!attendance) throw new Error("Attendance does not exist!");
            } else {
                throw new Error("Parameter has invalid Attendance Id!");
            }
        }),
    check('memberId')
        .notEmpty().withMessage("memberId is required!")
        .custom(async (memberId) => {            
            const member = await MemberModel.findOne({ _id: memberId });            
            if (!member) throw new Error('Member not existing!');
        }),
    check('eventId')
        .notEmpty().withMessage("eventId is required!")
        .custom(async (eventId) => {
            const event = await EventModel.findOne({ _id: eventId });
            if (!event) throw new Error('Event not existing!');            
        }),
    check('timeIn')
        .notEmpty().withMessage("timeIn is required!")
        .custom(isDateValid).withMessage("timeIn not valid!")
        .custom(isDateRangeValid).withMessage("timeIn should not be equal to or past timeOut!"),      
    check('timeOut')        
        .optional()
        .custom(isDateValid).withMessage("timeOut is not valid!")
]);
  
exports.updateAttendance = async (req, res, next) => {
    try {
        await AttendanceModel.findOneAndUpdate({ _id: req.params.id }, req.body);
        res.status(200).send('Attendance successfully updated.');
    } catch (err) {
        error(res, err);
        next(err);
    }
    req.app.get('log').emit('logApiEvents', { req, res });
};

exports.deleteAttendanceValidator = validate([
    check("id")
        .notEmpty().withMessage("attendanceId is required!")
        .custom(async (attendanceId) => {
            if (mongoose.Types.ObjectId.isValid(attendanceId)) {
                const attendance = await AttendanceModel.findById(attendanceId);
                if (!attendance) throw new Error(`Attendance does not exist!`);                
            } else {
                throw new Error("Parameter has invalid Attendance Id!");
            }
	    }),
]);

exports.deleteAttendance = async (req, res, next) => {
    try {
        await AttendanceModel.findByIdAndDelete({ _id: req.params.id });
        res.status(200).send('Attendance successfully deleted.');
    } catch (err) {
        error(res, err);
        next(err);
    }
    req.app.get('log').emit('logApiEvents', { req, res });
};
