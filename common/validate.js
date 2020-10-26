const { validationResult } = require('express-validator');
const FormatError = require('../common/formatError');
const ErrorType = require('../common/errorType');

const validate = validations => {
    return async (req, res, next) => {
      await Promise.all(validations.map(validation => validation.run(req)));
  
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }
      
      res.status(400).json(new FormatError().format(ErrorType.VALIDATION, errors.array()));
    };
};

const error = (res, error) => {  
    console.log(error);
    res.status(500).json(new FormatError().format(ErrorType.INTERNAL, error.message));    
};

module.exports = { validate, error };