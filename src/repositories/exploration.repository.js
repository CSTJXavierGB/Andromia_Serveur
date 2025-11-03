import Exploration from "../models/exploration.model";

class ExplorationRepository {
    async create(exploration, explorer) {
        
        return Exploration.create(exploration);
    }

    transform(exploration) {
        //Ajouter de nouvelles transformations
        exploration.href = `${process.env.BASE_URL}/exploration/${exploration.uuid}`;

        delete exploration._id;
        delete exploration.__v;
        delete exploration.uuid;

        return exploration;
    }
}

export default new ExplorationRepository();