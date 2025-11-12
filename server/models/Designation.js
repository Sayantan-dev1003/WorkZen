const mongoose = require('mongoose');
const desigSchema = new mongoose.Schema({ name: { type: String, required: true, unique: true } }, { timestamps: true });
module.exports = mongoose.model('Designation', desigSchema);
