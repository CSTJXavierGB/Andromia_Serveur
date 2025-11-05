import mongoose from 'mongoose';
import crypto from 'crypto';

const explorationSchema = mongoose.Schema(
    {
        uuid: { type: String, required: true, unique: true, default: () => crypto.randomUUID() },
        explorationDate: { type: Date, required: true },
        from: { type: String },
        to: { type: String },
        vault: {
            inox: { type: Number, default: 0 },
            elements: [
                {
                    quantity: { type: Number, default: 0, min: 0 },
                    element: { type: String, default: '' },
                    _id: false
                }
            ]
        },
        ally: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ally',
            required: false //Un exploration peu retrouner aucun ally
        },
        explorer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Explorer',
            required: true
        }
    },
    {
        collection: 'explorations',
        strict: 'throw',
        timestamps: true
    }
);

const Exploration = mongoose.model('Exploration', explorationSchema);

export default Exploration;