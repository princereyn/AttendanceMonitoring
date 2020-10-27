const BaseExportService = require('./BaseExportService');
const excel4node = require('excel4node');
const moment = require('moment');

class ExcelExportService extends BaseExportService{
    constructor(eventName, eventStartDate){
        super('xlsx', eventName, eventStartDate);        
    }

    async export(data, res){
        try {
            const fileName = this.getFileName();

            var wb = new excel4node.Workbook();
            var ws = wb.addWorksheet('Attendees');

            //Write Data in Excel file
            ws.cell(1, 1).string('MEMBERNAME');
            ws.cell(1, 2).string('TIMEIN');
            ws.cell(1, 3).string('TIMEOUT');

            for (let i = 0; i < data.length; i += 1) {
                ws.cell(i + 2, 1).string(data[i].name);
                ws.cell(i + 2, 2).string(moment(new Date(data[i].timeIn)).format('hh:mm A'));
                ws.cell(i + 2, 3).string(data[i].timeOut ? moment(new Date(data[i].timeOut)).format('hh:mm A') : '');                
            }
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=" + fileName);
            wb.write(fileName, res);
        } catch (err) {
            console.log(`Error exporting data: ${err}`);
        }
    }
}

module.exports = ExcelExportService;