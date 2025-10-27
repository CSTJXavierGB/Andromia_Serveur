import mongoose from 'mongoose';
import crypto from 'crypto';

const allySchema = mongoose.Schema(
    {
        uuid: { type: String, required: true, unique: true, default: () => crypto.randomUUID() },
        name: { type: String },
        affinity: { type: String },
        kernel : [ { type: String } ],
        life: { type: Number},
        speed: {
            low: { type: Number },
            high: { type: Number },
        },
        power: {
            low: { type: Number },
            high: { type: Number },
        },
        shield: {
            low: { type: Number },
            high: { type: Number },
        }
    },
    {
        collection: 'allies',
        strict: 'throw',
        timeStamp: true
    }
);

const Ally = mongoose.model('Ally', allySchema);

export { Ally };