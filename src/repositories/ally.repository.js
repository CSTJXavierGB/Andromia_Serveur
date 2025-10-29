import Ally from '../models/ally.model.js';
import dayjs from 'dayjs';


class AllyRepository {
    retrieveByCriteria(criteria) {
        return Ally.find(criteria);
    }

    create(ally) {
        return Ally.create(ally);
    }
}

export default new AllyRepository();