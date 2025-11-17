import Ally from '../models/ally.model.js';
import explorerRepository from './explorer.repository.js';


class AllyRepository {
    retrieveAll(options = {}) {
        const retrieveQuery = Ally.find();

        this.#handlePopulateOption(retrieveQuery, options);

        return retrieveQuery;
    }

    retrieveByCriteria(criteria, options = {}) {
        const retrieveQuery = Ally.find(criteria);

        this.#handlePopulateOption(retrieveQuery, options);

        return retrieveQuery;
    }

    

    retrieveByUUID(uuid, options = {}) {
        const retrieveQuery = Ally.findOne({ uuid });

        this.#handlePopulateOption(retrieveQuery, options);

        return retrieveQuery;
    }

    async create(ally, explorer = "", options = {}) {
        if (explorer) {
            // Route passes the full explorer object, extract its _id
            ally.explorer = explorer._id;
        }
        const newAlly = await Ally.create(ally);

        // Populate explorer if it requested so transform can access the UUID
        this.#handlePopulateOption(newAlly, options);

        return newAlly;
    }

    update(allyUUID, ally) {
        const updateQuery = Ally.findOneAndUpdate(
            { uuid: allyUUID }, 
            { $set: Object.assign(ally) }, 
            { runValidators: true, new: true }
        );

        this.#handlePopulateOption(updateQuery);

        return updateQuery;
    }    

    transform(ally, options = {}) {
        const explorer = ally.explorer;

        ally.href = `${process.env.BASE_URL}/allies/${ally.uuid}`;

        // Possible qu'un allié n'ai pas d'explorateur assigné
        if (explorer) {
            ally.explorer = { href : `${process.env.BASE_URL}/explorers/${explorer.uuid}`};

            if (options.explorer) {
                ally.explorer = explorerRepository.transform(explorer);
            }
        }

        delete ally.uuid;
        delete ally._id;
        delete ally.__v;

        return ally;
    }

    //Fonction privé pour géré les populate de retrieve queries
    #handlePopulateOption(query, options = {}) {
        if (options.explorer) {
            query.populate('explorer')
        } else {
            query.populate('explorer', 'uuid')
        }
        return query;
    }
}

export default new AllyRepository();