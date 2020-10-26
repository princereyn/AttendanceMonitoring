const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
    timeIn: {
      type: Date,
      required: true
    },
    timeOut: {
      type: Date,
      required: false
    },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }
});

attendanceSchema.virtual('attendanceId').get(function() {
    return this._id;
});

const AttendanceModel = mongoose.model('Attendance', attendanceSchema);

module.exports = AttendanceModel;