import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const clientSchema = mongoose.Schema(
    {
        uuid: { type: String, required: true, unique: true, default: () => uuidv4() },
        username : { type: String, required: true, unique: true  },
        passwordHash : { type: String, required: true  },
        // TODO : Implement once models are defined
        vault: {
            inox : { type: Number, default: 0  },
            elements : [
                {
                    quantity: { type: Number, default: 0  },
                    element : { type: String, default: "" }
                }
            ]
            
        },
        location : { type: String  },
        allies : { type: Array, default: [] },
        // explorations : { type: Array, default: [] }
    },
    {
        collection: 'clients',
        strict: 'throw',
        timestamps: true
    }
);

const Client = mongoose.model('Client', clientSchema);

export { Client };