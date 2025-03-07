import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  batch_id: {
    type: String,
    required: true,
    unique: true,  // Ensure that each batch ID is unique
  },
  created_at: {
    type: Date,
    default: Date.now,  // Automatically set the creation time
  },
  expiration_date: {
    type: Date,  // Set expiration date for the batch ID (e.g., 15 days later)
  },
});
batchSchema.virtual('isExpired').get(function () {
    return Date.now() > this.expiration_date;  // Compare current time with expiration date
  });

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;
