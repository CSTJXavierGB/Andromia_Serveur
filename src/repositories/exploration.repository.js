import Exploration from "../models/exploration.model.js";
import dayjs from "dayjs";
import allyRepository from "./ally.repository.js";
import explorerRepository from "./explorer.repository.js";

class ExplorationRepository {

    async create(exploration) {
        return await Exploration.create(exploration);
    }

    retrieveByCriteria(criteria, options) {

        const retrieveQuery = Exploration.find(criteria);

        this.#handlePopulateOption(retrieveQuery, options);

        return retrieveQuery;

    }

    retrieveOne(uuid, options) {
        const retrieveQuery = Exploration.findOne({ uuid });

        this.#handlePopulateOption(retrieveQuery, options);

        return retrieveQuery;
    }

    //Prend la réponse brute du serveur andromia.science et le modifie pour le post en DB à partir d'un object explorateur
    transformBD(exploration, explorer, ally) {
        if (ally) {
            exploration.ally = ally._id
        }

        exploration.explorer = explorer._id;
        exploration.from = explorer.location;
        exploration.to = exploration.destination;

        delete exploration.destination;
        delete exploration.affinity;
        
        return exploration;
    }

    transform(exploration, options = {}) {
        //Si on affiche le Href de la référence ou si on transforme l'object populated
        const explorer = exploration.explorer;
        const ally = exploration.ally;
        
        exploration.explorer = { href : `${process.env.BASE_URL}/explorer/${exploration.explorer.uuid}`};
        exploration.ally = { href : `${process.env.BASE_URL}/ally/${exploration.ally.uuid}`};

        if (options.ally) {
            exploration.ally = allyRepository.transform(ally);
        }
        if (options.explorer) {
            exploration.explorer = explorerRepository.transform(explorer);
        }


        exploration.href = `${process.env.BASE_URL}/exploration/${exploration.uuid}`;
        exploration.adoptionHref = `${process.env.BASE_URL}/exploration/${exploration.uuid}/adopt`;

        exploration.explorationDate = dayjs(exploration.explorationDate).format('YYYY-MM-DD');        

        delete exploration._id;
        delete exploration.__v;
        delete exploration.uuid;

        return exploration;
    }

    //Fonction privé pour géré les populate de retrieve queries
    #handlePopulateOption(query, options = {}) {        
        if (options.ally) {
            query.populate('ally')
        } else {
            query.populate('ally', 'uuid')
        }

        if (options.explorer) {
            query.populate('explorer')
        } else {
            query.populate('explorer', 'uuid')
        }
        return query;
    } 
}

export default new ExplorationRepository();