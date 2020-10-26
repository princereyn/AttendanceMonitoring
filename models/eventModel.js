const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    eventName: {
      type: String,
      required: true
    },
    eventType: {
      type: String,
      required: true
    },
    eventStartDate: {
      type: Date,
      required: true
    },
    eventEndDate: {
      type: Date,
      required: true
    },
    attendances: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' }]
});

eventSchema.virtual('eventId').get(function() {
  return this._id;
});

const EventModel = mongoose.model('Event', eventSchema);

module.exports = EventModel;
