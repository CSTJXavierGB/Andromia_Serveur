import Exploration from "../models/exploration.model.js";

class ExplorationRepository {

    async create(exploration) {
        return Exploration.create(exploration);
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

    transform(exploration) {
        exploration.href = `${process.env.BASE_URL}/exploration/${exploration.uuid}`;
        exploration.adoptionHref = `${process.env.BASE_URL}/exploration/${exploration.uuid}/adopt`;

        delete exploration._id;
        delete exploration.__v;
        delete exploration.uuid;

        return exploration;
    }
}

export default new ExplorationRepository();