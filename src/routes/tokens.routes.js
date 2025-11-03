import express from 'express';
import HttpErrors from 'http-errors';

import { guardRefreshTokenJWT, revokeAuthorization } from '../middlewares/authorization.jwt.js';

import explorerRepository from '../repositories/explorer.repository.js';

import TokenController from '../controllers/token.controller.js';
const tokenController = new TokenController()

const router = express.Router();

router.post('/', guardRefreshTokenJWT, revokeAuthorization  , refresh);
// router.delete('/',deleteToken)

async function refresh(req, res, next) {

    try {
        const tokens = explorerRepository.generateJWT(req.refresh.uuid)
        res.status(201).json(tokens);
    } catch (err) {
        return next(err);
    }
}

// async function deleteToken(req,res,next) {
//     try {
//         await explorerRepository.invalidateToken(req.body.token);
//         res.status(204).end();
//     } catch (err) {
//         return next(err);
//     }
// }

export default router;
