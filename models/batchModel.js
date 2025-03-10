import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  batch_id: {
    type: String,
    required: true,
    unique: true, 
  },
  created_at: {
    type: Date,
    default: Date.now, 
  },
  expiration_date: {
    type: Date, 
  },
  totalPayrollAmount: { type: Number, default: 0 }
});
batchSchema.virtual('isExpired').get(function () {
    return Date.now() > this.expiration_date;
  });

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;
