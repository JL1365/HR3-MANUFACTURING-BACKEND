import mongoose from 'mongoose';

const lastFetchedSchema = new mongoose.Schema({
  lastFetchedDate: {
    type: String,
    required: true,
  },
});

const LastFetched = mongoose.model('LastFetched', lastFetchedSchema);

export default LastFetched;
