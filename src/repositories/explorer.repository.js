import { Explorer } from '../models/explorer.model.js';
import argon from 'argon2';
import HttpErrors from 'http-errors';

class ExplorerRepository {
    async create(explorer) {

        try {
            explorer.password = await argon.hash(explorer.password);
            return Explorer.create(explorer);
        } catch (err) {
            throw new Error('Error hashing password');
        }

    }

    async validatePassword(password, explorer) {
        return await argon.verify(explorer.password, password)
    }

    async login(username, password) {
        const explorer = await this.retrieveByCredentials(username);
        if (!explorer){

            throw HttpErrors.Unauthorized();

        } 

        if(!await this.validatePassword(password, explorer)){
            throw HttpErrors.Unauthorized();
        }

        return explorer;


    }


    retrieveAll() {
        return Explorer.find().populate('allies');
    }

    retrieveOne(uuid) {
        return Explorer.findOne({ uuid }).populate('allies');
    }

    retrieveByCredentials(username) {
        return Explorer.findOne({ username });
    }

    transform(explorer) {
        explorer.href = `${process.env.BASE_URL}/explorers/${explorer.uuid}`;        

        delete explorer.password;
        if (explorer.vault && explorer.vault.elements) {
            explorer.vault.elements.forEach(element => {
                delete element._id;
            });
        }
        delete explorer.uuid;
        delete explorer._id;
        delete explorer.__v;

        return explorer;
    }

}

export default new ExplorerRepository();
