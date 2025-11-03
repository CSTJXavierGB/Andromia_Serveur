import { Ally } from '../models/ally.model.js';
import { Explorer } from '../models/explorer.model.js';


class AllyRepository {
    retrieveAll() {
        return Ally.find().populate('explorer' , 'uuid');
    }

    

    retrieveByUUID(uuid, options ) {
        let ally =  Ally.findOne({ uuid });

        if (options && options.explorer) {
            ally = ally.populate('explorer', 'uuid username');
        }
        else {
            ally = ally.populate('explorer' , 'uuid');
        }
        return ally;
    }

    async create(ally, options = {}) {
        if (options.explorer) {
            // Route passes the full explorer object, extract its _id
            ally.explorer = options.explorer._id;
        }
        const newAlly = await Ally.create(ally);

        // Populate explorer if it exists so transform can access the UUID
        if (newAlly.explorer) {
            await newAlly.populate('explorer', 'uuid');
        }

        return newAlly;
    }

    transform(ally, options) {
        ally.href = `${process.env.BASE_URL}/allies/${ally.uuid}`;

        if (ally.explorer) {
            ally.explorer.href = `${process.env.BASE_URL}/explorers/${ally.explorer.uuid}`;
            delete ally.explorer.uuid;
            delete ally.explorer._id;
        }

        delete ally.uuid;
        delete ally._id;
        delete ally.__v;

        return ally;
    }
}

export default new AllyRepository();