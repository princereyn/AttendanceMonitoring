const EventModel = require('../models/eventModel');
const moment = require('moment');
const mongoose = require('mongoose');
const { body, param, check, query, validationResult } = require('express-validator');
const { validate, error } = require('../common/validate.js');

exports.getAllEvents = async (req, res) => {
    try {
        const events = await EventModel.find({});
        res.send(events);
    } catch (err) {
        error(res, err);
        next(err);
    }
};

exports.getByEventIdValidator = validate([
    check('id').custom(async (eventId) => {
        if (mongoose.Types.ObjectId.isValid(eventId)) {
            const event = await EventModel.findById(eventId);
            if (!event) throw new Error('Event does not exist!');            
        } else {
            throw new Error('Parameter has invalid Event Id!');
        }
    })
]);

exports.getByEventId = async (req, res) => {   
    try {
        const event = await EventModel.findById(req.params.id)
            //.populate('attendances', ['attendanceId', 'timeIn', 'timeOut', 'member'])
            .populate({
                path: 'attendances',
                model: 'Attendance',
                select: ['timeIn', 'timeOut', 'member.name'],
                // populate: { 
                //     path: 'member', 
                //     model: 'Member',
                //     select: ['name', 'attendance.timeIn'],
                //     // populate: { 
                //     //     path: 'attendance', 
                //     //     model: 'Attendance',
                //     //     select: ['timeIn']
                //     // }
                // }
              });
            

        // const event = await EventModel.aggregate([
        //     { $match: { _id: req.params.id } },
        //     { $lookup: { from: "memberAttendances", localField: "attendance", foreignField: "_id", as: "member"  } },
        //     { $unwind: "$member" },
        //     { $replaceRoot: { newRoot: "$member" } }
        // ]);

        res.send(event);
    } catch (err) {
        error(res, err);
          next(err);
    }
};

exports.searchEventsValidator = validate([
    query('eventname').notEmpty().withMessage("eventname is required param!"),
    query('datestart').notEmpty().withMessage("datestart is required param!"),
    query('dateend').notEmpty().withMessage("dateend is required param!")
]);

exports.searchEvents = async (req, res, next) => {
    try {
        const events = await EventModel.find({ 
            eventName: { $regex: new RegExp(req.query.eventname, 'i') }, 
            eventStartDate: { $gte: req.query.datestart }, 
            eventEndDate: { $lte: req.query.dateend }, 
        });
        if (events.length) res.json(events);
        else res.status(200).send(`No matching events found!`);        
    } catch (err) {
        error(res, err);
        next(err);
    }
}

exports.insertEventValidator = validate([
    body('eventName').notEmpty().withMessage("eventName is required!")
        .custom(async (eventName) => {
            const event = await EventModel.findOne({ eventName });            
            if (event) throw new Error('Event Name already in use!');            
        }),
    body('eventType').notEmpty().withMessage("eventType is required!"),
    check('eventStartDate').notEmpty().withMessage("eventStartDate is required!")
        .not()
        .custom((eventStartDate, { req }) => {
            const startDate = moment(eventStartDate, moment.ISO_8601, true);
            const endDate = moment(req.body.eventEndDate);
            if (!startDate.isValid()) {
                throw new Error(`eventStartDate is not valid!`);
            } else if (startDate.diff(endDate) > 0) {
                throw new Error(`Start date should be earlier than end date!`);
            }
        }),
    check('eventEndDate').notEmpty().withMessage("eventEndDate is required!")
        .not()
        .custom((eventEndDate) => {
            if (!moment(eventEndDate, moment.ISO_8601, true).isValid()) throw new Error(`eventEndDate is not valid!`);
        })
]);
  
exports.insertEvent = async (req, res) => {
    try {
        const event = new EventModel(req.body);
        await event.save();
        res.status(201).send('Event successfully created.');
    } catch (err) {
        error(res, err);
        next(err);
    }
};

exports.updateEventValidator = validate([
    body('eventId').notEmpty().withMessage("eventId is required!"),
    check('eventName').notEmpty().withMessage("eventName is required!")
        .custom(async (eventName, { req }) => {
            const event = await EventModel.findOne({ eventName, _id: { $ne: req.body.eventId } });  
            console.log(event);          
            if (event) throw new Error('Event Name already in use!');            
        }),
    body('eventType').notEmpty().withMessage("eventType is required!"),
    check('eventStartDate').notEmpty().withMessage("eventStartDate is required!")
        .not()
        .custom((eventStartDate) => {
            const startDate = moment(eventStartDate, moment.ISO_8601, true);
            const endDate = moment(req.body.eventEndDate);
            if (!startDate.isValid()) {
                throw new Error(`eventStartDate is not valid!`);
            } else if (startDate.diff(endDate) > 0) {
                throw new Error(`Start date should be earlier than end date!`);
            }
        }),
    check('eventEndDate').notEmpty().withMessage("eventEndDate is required!")
        .not()
        .custom((eventEndDate) => {
            if (!moment(eventEndDate, moment.ISO_8601, true).isValid()) throw new Error(`eventEndDate is not valid!`);
        })
]);
  
exports.updateEvent = async (req, res) => {
    try {
        await EventModel.findOneAndUpdate({ _id: req.body.eventId }, req.body);
        res.status(200).send('Event successfully updated.');
    } catch (err) {
        error(res, err);
        next(err);
    }
};

exports.deleteEventValidator = validate([
    body('eventId').notEmpty().withMessage("eventId is required!"),
    check('eventId').custom(async (eventId) => {
        if (mongoose.Types.ObjectId.isValid(eventId)) {
            const event = await EventModel.findById( eventId );
            if (!event) throw new Error(`Event does not exist!`);            
        } else {
            throw new Error('Parameter has invalid Event Id!');
        }
    })
]);

exports.deleteEvent = async (req, res) => {
    try {
        await EventModel.findByIdAndDelete({ _id: req.body.eventId });
        res.status(200).send('Event successfully deleted.');
    } catch (err) {
        error(res, err);
        next(err);
    }
};