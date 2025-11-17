import mongoose from 'mongoose';
import crypto from 'crypto';

const listingSchema = mongoose.Schema(
    {
        uuid: { type: String, required: true, unique: true, default: () => crypto.randomUUID() },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Explorer',
            required: true
        },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Explorer',
            required: false
        },
        ally: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ally',
            required: true
        },
        inox : { type: Number, required: true, min: 0 },
        completedAt: { type: Date , default: null },
        createdAt: { type: Date, default: Date.now, required: true }

    },
    {
        collection: 'listings',
        strict: 'throw',
        timestamps: true
    }
);

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;