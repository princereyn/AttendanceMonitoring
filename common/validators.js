const { validationResult } = require('express-validator');
const FormatError = require('../common/formatError');
const ErrorType = require('../common/errorType');
const moment = require('moment');

const validate = validations => {
    return async (req, res, next) => {
      await Promise.all(validations.map(validation => validation.run(req)));
      const errors = validationResult(req);
      if (errors.isEmpty()) return next();
      res.status(400).json(new FormatError().format(ErrorType.VALIDATION, errors.array()));
    };
};

const isDateValid = date => {
  return moment(new Date(date), moment.ISO_8601).isValid();
};

const isDateRangeValid = (value, { req }) => {
  const startDate = moment(value, moment.ISO_8601);
  const endDateValue = req.body.eventEndDate || req.query.dateend || req.body.timeOut; //TODO: Better way to identify or map the req value?
  if (endDateValue) {
    const endDate = moment(endDateValue, moment.ISO_8601);    
    return startDate.diff(endDate) < 0;
  }
  return true;
};

const error = (res, error) => {  
    console.log(error);
    res.status(500).json(new FormatError().format(ErrorType.INTERNAL, error.message));
};

const isMemberStatusValid = value => {
  const memberStatuses = ["Active", "Inactive"];
  if(memberStatuses.indexOf(value) > -1){
      return true;
  }
  return false;
}

module.exports = { validate, error, isDateValid, isDateRangeValid, isMemberStatusValid };