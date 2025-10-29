import Ally from '../models/ally.model.js';
import dayjs from 'dayjs';


class AllyRepository {
    retrieveByUUID(allyUUID) {
        return Ally.findOne({ uuid: allyUUID });
    }

    create(ally) {
        return Ally.create(ally);
    }
}

export default new AllyRepository();