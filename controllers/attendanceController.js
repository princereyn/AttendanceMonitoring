const AttendanceModel = require('../models/attendanceModel');
const EventModel = require('../models/eventModel');
const MemberModel = require('../models/memberModel');
const moment = require('moment');
const mongoose = require('mongoose');
const { body, param, check, query, validationResult } = require('express-validator');
const { validate, error } = require('../common/validate.js');

exports.insertAttendanceValidator = validate([
    check('memberId').notEmpty().withMessage("memberId is required!")
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
    check('eventId').notEmpty().withMessage("eventId is required!")
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
    check('timeIn').notEmpty().withMessage("timeIn is required!")
        .not()
        .custom((timeIn, { req }) => {
            const startDate = moment(new Date(timeIn));            
            if (!startDate.isValid()) {
                throw new Error(`timeIn is not valid!`);
            }          
        }),
    check('timeOut')
        .not()
        .optional()
        .custom((timeOut, { req }) => {            
            const startDate = moment(new Date(req.body.timeIn));
            const endDate = moment(new Date(timeOut));
            console.log(startDate);
            console.log(endDate);
            console.log(endDate.isValid());
            if (!endDate.isValid()) {
                throw new Error(`timeOut is not valid!`);
            } 
            if (startDate.diff(endDate) > 0) {
                throw new Error(`Time in should be earlier than time out!`);
            }
        })
]);
  
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

exports.updateAttendanceValidator = validate([
    body('attendanceId').notEmpty().withMessage("attendanceId is required!"),
    check('memberId').notEmpty().withMessage("memberId is required!")
        .custom(async (memberId) => {            
            const member = await MemberModel.findOne({ _id: memberId });            
            if (!member) { 
                throw new Error('Member not existing!');
            }
    }),
    check('eventId').notEmpty().withMessage("eventId is required!")
        .custom(async (eventId, { req }) => {
            const event = await EventModel.findOne({ _id: eventId });
            if (!event) {
                throw new Error('Event not existing!');
            }
    }),
    check('timeIn').notEmpty().withMessage("timeIn is required!")
        .not()
        .custom((timeIn, { req }) => {
            const startDate = moment(new Date(timeIn));            
            if (!startDate.isValid()) {
                throw new Error(`timeIn is not valid!`);
            }          
        }),
    check('timeOut')
        .optional()
        .custom((timeOut, { req }) => {            
            const startDate = moment(new Date(req.body.timeIn));
            const endDate = moment(new Date(timeOut));
            if (!endDate.isValid()) {
                throw new Error(`timeOut is not valid!`);
            } else if (startDate.diff(endDate) > 0) {
                throw new Error(`Time in should be earlier than time out!`);
            }
        })
]);
  
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
