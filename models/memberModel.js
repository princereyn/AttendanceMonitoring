const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    joinedDate: {
      type: Date,
      required: false
    },
    status: {
      type: String,
      required: true
    },
    attendances: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' }]
});

memberSchema.virtual('memberId').get(function() {
    return this._id;
});
  
const MemberModel = mongoose.model('Member', memberSchema);

module.exports = MemberModel;
  