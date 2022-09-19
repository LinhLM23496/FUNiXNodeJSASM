const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const workSchema = new Schema({
    start: { type: String, required: true }, 
    end: { type: String, required: true }, 
    date: { type: String, required: true }, 
    workTime: { type: String, required: true }, 
    overTime: { type: String, required: false }, 
    totalWorkTime: { type: String, required: true }, 
    position: { type: String, required: true }, 
    leaveTime: { type: String, required: true }, 
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
});

module.exports = mongoose.model('Work', workSchema);