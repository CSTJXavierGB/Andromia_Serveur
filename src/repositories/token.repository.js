import { RevokedToken } from '../models/token.model.js';

class TokenRepository {
    findOne(token) {
        return RevokedToken.findOne({ token });
    }

    invalidate(token) {
        return RevokedToken.create({ token });
    }

    async isRevoked(token) {
        try {
            const tokenInDB = await RevokedToken.findOne({token : token});

            if(!tokenInDB) {
                return false;
            }

            return true;

        } catch (error) {
            throw error;
        }
    }
}

export default new TokenRepository();
