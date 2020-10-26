const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class BaseExportService {
    constructor(fileExtension){
        this.fileExtension = fileExtension;
    }

    getOutputFilePath(fileName){
        return `${process.cwd()}/outputs/${fileName}`; 
    }

    getFileName(){
        return `${moment(new Date()).format('MM_DD_YYYY')}_${uuidv4()}.${this.fileExtension}`;
    }
}

module.exports = BaseExportService;