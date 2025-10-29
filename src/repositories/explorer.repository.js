import { Explorer } from '../models/explorer.model.js';

class ExplorerRepository {
    create(explorer) {
        return Explorer.create(explorer);
    }

    retrieveAll() {
        return Explorer.find().populate('allies');
    }

    retrieveOne(uuid) {
        return Explorer.findOne({ uuid }).populate('allies');
    }

    transform(explorer) {
        explorer.href = `${process.env.BASE_URL}/explorers/${explorer.uuid}`;        

        delete explorer.uuid;
        delete explorer._id;
        delete explorer.__v;

        return explorer;
    }

}

export default new ExplorerRepository();
