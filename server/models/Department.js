const mongoose = require('mongoose');
const deptSchema = new mongoose.Schema({ name: { type: String, required: true, unique: true } }, { timestamps: true });
module.exports = mongoose.model('Department', deptSchema);
