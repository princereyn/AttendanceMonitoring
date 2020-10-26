const MemberModel = require('../models/memberModel');
const moment = require('moment');
const mongoose = require('mongoose');
const { body, param, check, query, validationResult } = require('express-validator');
const { validate, error } = require('../common/validate.js');

exports.getAllMembers = async (req, res) => {
    const members = await MemberModel.find({});
    res.send(members);
};

exports.getByMemberIdValidator = validate([
    check('id').custom(async (memberId) => {
        if (mongoose.Types.ObjectId.isValid(memberId)) {
            const member = await MemberModel.findById(memberId);
            if (!member) throw new Error('Member does not exist!');            
        } else {
            throw new Error('Parameter has invalid Member Id!');
        }
    })
]);

exports.getByMemberId = async (req, res) => {    
    const member = await MemberModel.findById(req.params.id);
    res.send(member);
};

exports.insertMemberValidator = validate([
    body('name').notEmpty().withMessage("name is required!")
        .custom(async (name) => {
            const member = await MemberModel.findOne({ name });            
            if (member) throw new Error('Name already in use!');            
        }),
    body('status').notEmpty().withMessage("status is required!"),
    check('joinedDate').not().optional().custom((joinedDate) => {
        if (!moment(joinedDate, moment.ISO_8601, true).isValid()) throw new Error(`joinedDate is not valid!`);
    })
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
    body('memberId').notEmpty().withMessage("memberId is required!"),
    body('name').notEmpty().withMessage("name is required!"),
    body('status').notEmpty().withMessage("status is required!"),
    check('joinedDate').not().optional().custom((joinedDate) => {
        if (!moment(joinedDate, moment.ISO_8601, true).isValid()) throw new Error(`joinedDate is not valid!`);        
    })
]);

exports.updateMember = async (req, res) => {
    try {
        await MemberModel.findOneAndUpdate({ _id: req.body.memberId }, req.body);
        res.status(200).send('Member successfully updated.');
    } catch (err) {
        error(res, err);
        next(err);
    }
};

exports.deleteMemberValidator = validate([
    body('memberId').notEmpty().withMessage("memberId is required!"),
    check('memberId').custom(async (memberId) => {
        if (mongoose.Types.ObjectId.isValid(memberId)) {
            const member = await MemberModel.findById( memberId );
            if (!member) throw new Error(`Member does not exist!`);            
        } else {
            throw new Error('Parameter has invalid Member Id!');
        }
    })
]);

exports.deleteMember = async (req, res, next) => {
    try {  
      await MemberModel.findByIdAndDelete({ _id: req.body.memberId });
      res.status(200).send('Member successfully deleted.');
    } catch (err) {
        error(res, err);
        next(err);
    }
};

exports.searchMembersValidator = validate([
    query('name').notEmpty().withMessage("name is required param!"),
    query('status').notEmpty().withMessage("status is required param!")    
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
}
  