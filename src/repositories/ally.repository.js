import { Ally } from '../models/ally.model.js';
import dayjs from 'dayjs';
import { Explorer } from '../models/explorer.model.js';
import explorerRepository from './explorer.repository.js';


class AllyRepository {
    retrieveByCriteria(criteria, options) {
        const retrieveQuery = Ally.find(criteria);
        if (options.explorer) {
            retrieveQuery.populate('explorer');
        }
        return retrieveQuery;
    }

    retrieveByUUID(uuid, options = {}) {
        const retrieveQuery = Ally.findOne({ uuid });
        if (options.explorer) {
            retrieveQuery.populate('explorer');
        }
        return retrieveQuery;
    }

    async create(ally, options = {}) {
        if (options.explorer) {
            const explorer = await Explorer.findOne({ uuid: options.explorer });
            if (!explorer) {
                throw new Error(`Explorer with uuid "${options.explorer}" not found`);
            }
            ally.explorer = explorer._id;
        }
        return Ally.create(ally);
    }

    transform(ally, options = {}) {
        const explorer = ally.explorer;


        ally.href = `${process.env.BASE_URL}/allies/${ally.uuid}`;
        ally.explorer = {href : `${process.env.BASE_URL}/explorers/${ally.explorer.uuid}` };

        if (options){
            if (options.explorer) {
                ally.explorer = explorerRepository.transform(explorer);
            }
        }
         
        delete ally.uuid;
        delete ally._id;
        delete ally.__v;

        return ally;
    }
}

export default new AllyRepository();