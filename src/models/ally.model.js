import mongoose from 'mongoose';
import crypto from 'crypto';
import { stat } from 'fs';

const allySchema = mongoose.Schema(
    {
        uuid: { type: String, required: true, unique: true, default: () => crypto.randomUUID() },
        explorer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Explorer',
            //required: true
        },
        name: { type: String },
        asset: { type: String },
        affinity: { type: String },
        kernel : [ { type: String } ],
        stats: { 
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
        
    },
    {
        collection: 'allies',
        strict: 'throw',
        timestamps: true
    }
);

const Ally = mongoose.model('Ally', allySchema);

export default Ally;