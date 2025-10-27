import Ally from '../models/ally.model.js';
import dayjs from 'dayjs';


class AllyRepository {
    retrieveByCriteria(criteria) {
        return Ally.find(criteria);
    }
}

export default new AllyRepository();