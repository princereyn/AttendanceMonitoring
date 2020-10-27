const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class BaseExportService {
    constructor(fileExtension, eventName, eventStartDate){
        this.fileExtension = fileExtension;
        this.eventName = eventName;
        this.eventStartDate = eventStartDate;
    }

    getOutputFilePath(fileName){
        return `${process.cwd()}/outputs/${fileName}`; 
    }

    getFileName(){
        return `${this.eventName}_${moment(new Date()).format('MM_DD_YYYY')}.${this.fileExtension}`;
    }
}

module.exports = BaseExportService;