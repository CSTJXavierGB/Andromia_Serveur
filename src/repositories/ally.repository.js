import { Ally } from '../models/ally.model.js';
import { Explorer } from '../models/explorer.model.js';


class AllyRepository {
    retrieveAll() {
        return Ally.find().populate('explorer');
    }

    retrieveByCriteria(criteria) {
        return Ally.find(criteria).populate('explorer');
    }

    retrieveByUUID(uuid) {
        return Ally.findOne({ uuid }).populate('explorer');
    }

    async create(ally, options = {}) {
        if (options.explorer) {
            // Route passes the full explorer object, extract its _id
            ally.explorer = options.explorer._id;
        }
        const newAlly = await Ally.create(ally);

        // Populate explorer if it exists so transform can access the UUID
        if (newAlly.explorer) {
            await newAlly.populate('explorer');
        }

        return newAlly;
    }

    transform(ally, options = {}) {
        ally.href = `${process.env.BASE_URL}/allies/${ally.uuid}`;

        // Always include explorer href
        if (ally.explorer) {
            if (ally.explorer.uuid) {
                // Explorer is populated
                const explorerHref = `${process.env.BASE_URL}/explorers/${ally.explorer.uuid}`;

                if (options.explorer) {
                    // Embed useful explorer data
                    // TODO : define what data to embed
                    ally.explorer = {
                        href: explorerHref,
                        username: ally.explorer.username,
                    
                    };
                } else {
                    // Only keep the href
                    ally.explorer = explorerHref;
                }
            } else {
                // Explorer is just an ObjectId, remove it
                delete ally.explorer;
            }
        }

        delete ally.uuid;
        delete ally._id;
        delete ally.__v;

        return ally;
    }
}

export default new AllyRepository();