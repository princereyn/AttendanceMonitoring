const MemberModel = require('../models/memberModel');
const moment = require('moment');
const mongoose = require('mongoose');
const { body, param, check, query, validationResult } = require('express-validator');
const { validate, error, isDateValid, isDateRangeValid, isMemberStatusValid } = require("../common/validators.js");

exports.getAllMembers = async (req, res, next) => {
    await MemberModel.find({})
        .populate({
            path: "eventsAttendance",
            model: "Attendance",
            select: "_id timeIn timeOut",
            populate: {
                path: "event",
                model: "Event",
                select: "_id eventName",
            }
        })
        .exec(function (err, members) {              
            if (err) {
                error(res, err);
                next(err);
            }
            res.status(200).send(members);
        });
};

exports.getByMemberIdValidator = validate([
    check('id').custom(async (memberId) => {
        if (mongoose.Types.ObjectId.isValid(memberId)) {
            const member = await MemberModel.findById(memberId)
            if (!member) throw new Error('Member does not exist!');            
        } else {
            throw new Error('Parameter has invalid Member Id!');
        }
    })
]);

exports.getByMemberId = async (req, res, next) => {    
    await MemberModel.findById(req.params.id)
        .populate({
            path: "eventsAttendance",
            model: "Attendance",
            select: "_id timeIn timeOut",
            populate: {
                path: "event",
                model: "Event",
                select: "_id eventName",
            }
        })
        .exec(function (err, members) {              
            if (err) {
                error(res, err);
                next(err);
            }
            res.status(200).send(members);
        });
};

exports.searchMembersValidator = validate([
    query('name')
        .notEmpty().withMessage("name is required!"),
    query('status')
        .notEmpty().withMessage("status is required!")
        .custom(isMemberStatusValid).withMessage("status is not valid!"),
]);

exports.searchMembers = async (req, res, next) => {    
    try {
        const members = await MemberModel.find({ 
            name: { $regex: new RegExp(req.query.name, 'i') }, 
            status: { $regex: new RegExp(req.query.status, 'i') }, 
        });
        if (members.length) res.json(members); 
        else res.status(200).send(`No matching members found!`);        
    } catch (err) {
        error(res, err);
        next(err);
    }
};

exports.insertMemberValidator = validate([
    body('name')
        .notEmpty().withMessage("name is required!")
        .custom(async (name) => {
            const member = await MemberModel.findOne({ name });            
            if (member) throw new Error("Name already in use!");            
        }),
    body('status')
        .notEmpty().withMessage("status is required!")
        .custom(isMemberStatusValid).withMessage("status is not valid!"),
    body('joinedDate')
        .optional()
        .custom(isDateValid).withMessage("joinedDate is not valid!")    
]);

exports.insertMember = async (req, res, next) => {
    try {
      const member = new MemberModel(req.body);
      await member.save();
      res.status(201).send('Member successfully created.');
    } catch (err) {
        error(res, err);
        next(err);
    }
};

exports.updateMemberValidator = validate([
    check("id")
        .notEmpty().withMessage("memberId is required!")
        .custom(async (memberId) => {
            if (mongoose.Types.ObjectId.isValid(memberId)) {
                const member = await MemberModel.findById(memberId);
                if (!member) throw new Error("Member does not exist!");
            } else {
                throw new Error("Parameter has invalid Member Id!");
            }
        }),
    body('name')
        .notEmpty().withMessage("name is required!")
        .custom(async (name, { req }) => {
            const member = await MemberModel.findOne({
                name,
                _id: { $ne: req.params.id },
            });
            if (member) throw new Error("Name already existing!");
        }),
    body('status')
        .notEmpty().withMessage("status is required!")
        .custom(isMemberStatusValid).withMessage("status is not valid!"),
    body('joinedDate')
        .optional()
        .custom(isDateValid).withMessage("joinedDate is not valid!")
]);

exports.updateMember = async (req, res, next) => {
    try {
        await MemberModel.findOneAndUpdate({ _id: req.params.id }, req.body);
        res.status(200).send('Member successfully updated.');
    } catch (err) {
        error(res, err);
        next(err);
    }
};

exports.deleteMemberValidator = validate([
    check("id")
        .notEmpty().withMessage("memberId is required!")
	    .custom(async (memberId) => {
            if (mongoose.Types.ObjectId.isValid(memberId)) {
                const member = await MemberModel.findById(memberId);
                if (!member) { 
                    throw new Error(`Member does not exist!`)
                } else {
                    if (member.eventsAttendance.length > 0) {
                        throw new Error(`Cannot delete a member with events attendance!`)
                    }
                }
            } else {
                throw new Error("Parameter has invalid Member Id!");
            }
	    })
]);

exports.deleteMember = async (req, res, next) => {
    try {  
      await MemberModel.findByIdAndDelete({ _id: req.params.id });
      res.status(200).send('Member successfully deleted.');
    } catch (err) {
        error(res, err);
        next(err);
    }
};