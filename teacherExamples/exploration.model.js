import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const explorationSchema = mongoose.Schema(
  {
    explorationDate: { type: Date, default: Date.now, required: true},
    uuid: {type: String, unique:true, required: true, default: () => uuidv4() },
    planet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Planet',
      required: true
    },
    coord:{
      lon: Number,
      lat: Number
    },
    scans: [
      {
        element: String,
        percent: Number,
        _id: false
      }
    ],
    comment: String
  },
  {
    collection: 'explorations',
    strict: 'throw',
    id: false,
  }
);

export default mongoose.model('Exploration', explorationSchema);
