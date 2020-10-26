class FormatError {
    format = (type, errors) => {
        return {
            result: type,
            validationMessages: errors
        };
    };
}

module.exports = FormatError;