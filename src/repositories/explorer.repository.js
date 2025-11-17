import { Explorer } from '../models/explorer.model.js';
import jwt from 'jsonwebtoken';
import parseDuration from 'parse-duration';

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

    update(explorerUUID, explorer) {
        const updateQuery = Explorer.findOneAndUpdate(
            { uuid: explorerUUID }, 
            { $set: Object.assign(explorer) }, 
            { runValidators: true, new: true }
        );

        this.#handlePopulateOption(updateQuery);

        return updateQuery;
    }

    async updateMany(update, filter = {}) {
        const updateQuery = await Explorer.updateMany(
            filter,
            update,
            { runValidators: true, new: true }
        );

        return updateQuery;
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


    retrieveAll(options) {
        const retrieveQuery = Explorer.find();
        
        this.#handlePopulateOption(retrieveQuery, options);

        return retrieveQuery;
    }

    retrieveOne(uuid, options) {
        const retrieveQuery = Explorer.findOne({ uuid });

        this.#handlePopulateOption(retrieveQuery, options);

        return retrieveQuery;
    }

    retrieveByCredentials(username) {
        return Explorer.findOne({ username });
    }

    generateJWT(uuid) {
        const access = jwt.sign(
            {uuid: uuid},
            process.env.JWT_TOKEN_SECRET,
            {
                expiresIn : process.env.JWT_TOKEN_LIFE,
                issuer : process.env.BASE_URL
            });
        const refresh = jwt.sign(
            {uuid:uuid},
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn : process.env.JWT_REFRESH_LIFE,
                issuer : process.env.BASE_URL
            }
        );
        const expiresIn = parseDuration(process.env.JWT_TOKEN_LIFE)
        return {access,refresh, expiresIn};
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

    //Fonction privé pour géré les populate de retrieve queries
    #handlePopulateOption(query, options = {}) {        
        if (options.allies) {
            query.populate('allies');
        } else {
            query.populate('allies', 'uuid');
        }
        if (options.explorations) {
            query.populate('explorations');
        } else {
            query.populate('explorations', 'uuid');
        }

        return query;
    } 
}

export default new ExplorerRepository();
