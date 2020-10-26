const AttendanceModel = require('../models/attendanceModel');
const EventModel = require('../models/eventModel');
const MemberModel = require('../models/memberModel');
const moment = require('moment');
const mongoose = require('mongoose');
const { body, param, check, query, validationResult } = require('express-validator');
const { validate, error } = require('../common/validate.js');

// exports.insertAttendanceValidator = validate([
//     body('eventName').notEmpty().withMessage("eventName is required!")
//         .custom(async (eventName) => {
//             const event = await EventModel.findOne({ eventName });            
//             if (event) throw new Error('Event Name already in use!');            
//         }),
//     body('eventType').notEmpty().withMessage("eventType is required!"),
//     check('eventStartDate').notEmpty().withMessage("eventStartDate is required!")
//         .not()
//         .custom((eventStartDate, { req }) => {
//             const startDate = moment(eventStartDate, moment.ISO_8601, true);
//             const endDate = moment(req.body.eventEndDate);
//             if (!startDate.isValid()) {
//                 throw new Error(`eventStartDate is not valid!`);
//             } else if (startDate.diff(endDate) > 0) {
//                 throw new Error(`Start date should be earlier than end date!`);
//             }
//         }),
//     check('eventEndDate').notEmpty().withMessage("eventEndDate is required!")
//         .not()
//         .custom((eventEndDate) => {
//             if (!moment(eventEndDate, moment.ISO_8601, true).isValid()) throw new Error(`eventEndDate is not valid!`);
//         })
// ]);
  
exports.insertAttendance = async (req, res) => {
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

        eventDoc.attendances.push(attendance._id);
        memberDoc.attendances.push(attendance._id);

        await attendance.save();
        await eventDoc.save();
        await memberDoc.save();

        res.status(201).send('Attendance successfully created.');
    } catch (err) {
        error(res, err);
        next(err);
    }
};

// exports.updateAttendanceValidator = validate([
//     body('eventId').notEmpty().withMessage("eventId is required!"),
//     check('eventName').notEmpty().withMessage("eventName is required!")
//         .custom(async (eventName, { req }) => {
//             const event = await EventModel.findOne({ eventName, _id: { $ne: req.body.eventId } });  
//             console.log(event);          
//             if (event) throw new Error('Event Name already in use!');            
//         }),
//     body('eventType').notEmpty().withMessage("eventType is required!"),
//     check('eventStartDate').notEmpty().withMessage("eventStartDate is required!")
//         .not()
//         .custom((eventStartDate) => {
//             const startDate = moment(eventStartDate, moment.ISO_8601, true);
//             const endDate = moment(req.body.eventEndDate);
//             if (!startDate.isValid()) {
//                 throw new Error(`eventStartDate is not valid!`);
//             } else if (startDate.diff(endDate) > 0) {
//                 throw new Error(`Start date should be earlier than end date!`);
//             }
//         }),
//     check('eventEndDate').notEmpty().withMessage("eventEndDate is required!")
//         .not()
//         .custom((eventEndDate) => {
//             if (!moment(eventEndDate, moment.ISO_8601, true).isValid()) throw new Error(`eventEndDate is not valid!`);
//         })
// ]);
  
exports.updateAttendance = async (req, res) => {
    try {
        await EventModel.findOneAndUpdate({ _id: req.body.eventId }, req.body);
        res.status(200).send('Event successfully updated.');
    } catch (err) {
        error(res, err);
        next(err);
    }
};

// exports.deleteAttendanceValidator = validate([
//     body('eventId').notEmpty().withMessage("eventId is required!"),
//     check('eventId').custom(async (eventId) => {
//         if (mongoose.Types.ObjectId.isValid(eventId)) {
//             const event = await EventModel.findById( eventId );
//             if (!event) throw new Error(`Event does not exist!`);            
//         } else {
//             throw new Error('Parameter has invalid Event Id!');
//         }
//     })
// ]);

exports.deleteAttendance = async (req, res) => {
    try {
        await EventModel.findByIdAndDelete({ _id: req.body.eventId });
        res.status(200).send('Event successfully deleted.');
    } catch (err) {
        error(res, err);
        next(err);
    }
};
