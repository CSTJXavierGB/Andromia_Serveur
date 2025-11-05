import Ally from '../models/ally.model.js';


class AllyRepository {
    retrieveAll(options = {}) {
        const retrieveQuery = Ally.find();

        if (!options) {
            return retrieveQuery;
        }

        if (options.explorer) {
            retrieveQuery.populate('explorer')
        }

        return retrieveQuery;
    }

    retrieveByCriteria(criteria, options = {}) {
        const retrieveQuery = Ally.find(criteria);

        if (!options) {
            return retrieveQuery;
        }

        if (options.explorer) {
            retrieveQuery.populate('explorer')
        }

        return retrieveQuery;
    }

    retrieveByUUID(uuid, options = {}) {
        const retrieveQuery = Ally.findOne({ uuid });

        if (!options) {
            return retrieveQuery;
        }

        if (options.explorer) {
            retrieveQuery.populate('explorer')
        }

        return retrieveQuery;
    }

    async create(ally, explorer = "", options = {}) {
        if (explorer) {
            // Route passes the full explorer object, extract its _id
            ally.explorer = explorer._id;
        }
        const newAlly = await Ally.create(ally);

        // Populate explorer if it requested so transform can access the UUID
        if (options.explorer) {
            await newAlly.populate('explorer');
        }

        return newAlly;
    }

    //Prend la réponse brute d'un 'ally' du serveur andromia.science et le modifie pour le post en DB
    transformBD(ally) {

        delete ally.expireAt;
        delete ally.updatedAt;
        delete ally.createdAt;
        delete ally.href;
        delete ally.essence;
        delete ally.uuid; //BD va reassigner le uuid
        delete ally.archiveIndex;
        delete ally.books;
        delete ally.crypto;
        
        return ally;
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