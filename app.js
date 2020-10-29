const express = require('express');
const eventRouter = require('./routers/eventRouter');
const memberRouter = require('./routers/memberRouter');
const attendanceRouter = require('./routers/attendanceRouter');
const dotenv = require('dotenv');
const connect = require('./db');
const ApiEventLogger = require('./common/ApiEventLogger');

const app = express();

dotenv.config({ path: './config/config.env' });

connect();

const port = process.env.port || 3000;

const apiEventLogger = new ApiEventLogger();

app.use(express.json());

app.use('/api/events', eventRouter);
app.use('/api/members', memberRouter);
app.use('/api/attendance', attendanceRouter);

app.get('/', (req, res, next) => {
    res.send({
      message: 'Hello Express World!'
    });
});
  
app.listen(port, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port: ${port}`);
});

app.set('log', apiEventLogger);

apiEventLogger.on('logApiEvents', apiEventLogger.logApiEvents);
apiEventLogger.on('logMe', apiEventLogger.logMe);