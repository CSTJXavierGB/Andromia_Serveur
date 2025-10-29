import Exploration from '../models/exploration.model.js';
import planetRepository from '../repositories/planet.repository.js'

class ExplorationsRepository {
    
    retrieveAll() {
        return Exploration.find();
    }

    retrieveByCriteria(filter, options) {
        const limit = options.limit;
        const skip = options.skip;

        const retrieveQuery = Exploration
            .find(filter)
            .limit(limit)
            .skip(skip)
            .sort({'explorationDate': 'desc'})
            .populate('planet', 'uuid');
        const countQuery = Exploration.countDocuments(filter);

        if(options.planet) {
            retrieveQuery.populate('planet');
        }

        return Promise.all([retrieveQuery, countQuery]);

    }

    retrieveByUUID(explorationUUID, options) {

        const retrieveQuery = Exploration.findOne({uuid: explorationUUID}).populate('planet', 'uuid');
        if(options.planet) {
            retrieveQuery.populate('planet');
        }

        return retrieveQuery;
    }

    transform(exploration, options = {}) {
        const planet = exploration.planet;

        exploration.href = `${process.env.BASE_URL}/explorations/${exploration.uuid}`;
        exploration.planet = { href : `${process.env.BASE_URL}/planets/${exploration.planet.uuid}`};
        
        if(options.planet) {
            exploration.planet = planetRepository.transform(planet);
        }

        delete exploration._id;
        delete exploration.uuid;

        return exploration;
    }

}

export default new ExplorationsRepository();