import mongoose from 'mongoose';
import crypto from 'crypto';

const explorerSchema = mongoose.Schema(
    {
        uuid: { type: String, required: true, unique: true, default: () => crypto.randomUUID() },
        username : { type: String, required: true, unique: true  },
        password : { type: String, required: true  },
        vault: {
            inox : { type: Number, default: 0  },
            elements : [
                {
                    quantity: { type: Number, default: 0, min: 0 },
                    element : { type: String, default: "" }
                }
            ]
            
        },
        location : { type: String  },
        // explorations : { type: Array, default: [] }
    },
    {
        collection: 'explorers',
        strict: 'throw',
        timestamps: true,
        id: false
    }
);

explorerSchema.virtual('allies', {
    ref: 'Ally',
    localField: '_id',
    foreignField: 'explorer',
    justOne: false
})
// TODO : add explorations virtual when Exploration model is created
// explorerSchema.virtual('explorations', {
//     ref: 'Exploration',
//     localField: '_id',
//     foreignField: 'explorer',
//     justOne: false
// })

const Explorer = mongoose.model('Explorer', explorerSchema);

export { Explorer };