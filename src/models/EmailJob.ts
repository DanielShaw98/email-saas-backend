import mongoose from 'mongoose';

const emailJobSchema = new mongoose.Schema({
  recipient: String,
  subject: String,
  html: String,
  status: { type: String, default: 'pending' },
}, { timestamps: true });

const EmailJob = mongoose.model('EmailJob', emailJobSchema);
export default EmailJob;
