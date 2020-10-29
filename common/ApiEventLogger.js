const EventEmitter = require('events');
const fs = require('fs');
const moment = require('moment');

class ApiEventLogger extends EventEmitter {
    logMe = () => {
        console.log('log me log me, say that you log me');
    };

    logApiEvents = ({ req, res }) => {
        const fileName = `AttendanceMonitoringLogs-${moment().format('YYYY-MM-DD')}.txt`;
        //console.log(res);     
        fs.appendFile(
            fileName,
            `\n\n === ${moment().format('hh:mm A')} : Method: ${req.method} | Status: ${res.statusCode} | URL: ${req.protocol}://${req.get('Host')}${req.originalUrl} } | Query Params: ${JSON.stringify(req.query)} | Body: ${JSON.stringify(req.body)} ===`,
            () => {
                console.log('Log added.');
            }
        );
      };
}

module.exports = ApiEventLogger;
