import Exploration from "../models/exploration.model.js";
import dayjs from "dayjs";
import allyRepository from "./ally.repository.js";
import explorerRepository from "./explorer.repository.js";

class ExplorationRepository {

    async create(exploration) {
        const query = await Exploration.create(exploration);

        this.#handlePopulateOption(query);

        return query;
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
    transformBdExploration(exploration, explorer, ally) {
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

    //Prend la réponse brute d'un 'ally' du serveur andromia.science et le modifie pour le post en DB
    transformBdAlly(ally) {

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

    //Modifie les champ de l'explorateur pour accepter les addition de l'exploration
    transformBdExplorer(exploration, explorer) {
        explorer.location = exploration.to;

        if (!exploration.vault) {
            return explorer;
        }

        explorer.vault.inox += exploration.vault.inox;

        //Pour chaque nouveau éléments
        exploration.vault.elements.forEach(e => {
            //trouve s'il existe déjà dans la liste de l'explorateur
            let explorerElementIndex = explorer.vault.elements.findIndex(eE => eE.element === e.element);
            if (explorerElementIndex !== -1) {
                //Si oui augment la quantité
                explorer.vault.elements[explorerElementIndex].quantity += e.quantity;
            } else {
                //Sinon ajoute l'élément à sa liste
                explorer.vault.elements.push(e);
            }
        });
        
        return explorer;
    }

    transform(exploration, options = {}) {
        //Si on affiche le Href de la référence ou si on transforme l'object populated
        const explorer = exploration.explorer;
        const ally = exploration.ally;
        
        exploration.explorer = { href : `${process.env.BASE_URL}/explorers/${explorer.uuid}`};

        //Il est possible qu'il n'y est aucun allié relier a l'exploration
        if (ally) {
            exploration.ally = { href : `${process.env.BASE_URL}/allies/${ally.uuid}`};

            if (options.ally) {
                exploration.ally = allyRepository.transform(ally);
            }
        }
        
        if (options.explorer) {
            exploration.explorer = explorerRepository.transform(explorer);
        }

        exploration.href = `${process.env.BASE_URL}/explorations/${exploration.uuid}`;

        exploration.explorationDate = dayjs(exploration.explorationDate).format('YYYY-MM-DD');        

        delete exploration._id;
        delete exploration.__v;
        delete exploration.uuid;

        return exploration;
    }

    //Fonction privé pour géré les populate de retrieve queries
    #handlePopulateOption(query, options = {}) {        
        if (options.ally) {
            query.populate('ally');
        } else {
            query.populate('ally', 'uuid');
        }

        if (options.explorer) {
            query.populate('explorer');
        } else {
            query.populate('explorer', 'uuid');
        }
        return query;
    } 
}

export default new ExplorationRepository();