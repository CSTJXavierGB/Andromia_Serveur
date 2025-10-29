import express from 'express';
import HttpErrors from 'http-errors';

import explorerRepository from '../repositories/explorer.repository.js';

import TokenController from '../controllers/token.controller.js';
const tokenController = new TokenController()

import { guardAuthorizationJWT, revokeAuthorization } from '../middlewares/authorization.jwt.js';

const router = express.Router();

router.post('/', login);
router.delete('/', guardAuthorizationJWT, revokeAuthorization, logout);

async function login(req, res, next) {
    try {

        const {username, password} = req.body;

        let explorer = await explorerRepository.login(username,password)

         const tokens = explorerRepository.generateJWT(explorer.uuid);

        explorer = explorer.toObject({getters:false, virtuals: false});
        explorer = explorerRepository.transform(explorer)

        
        res.status(201).json({explorer, tokens});


    } catch (error) {
        return next(error)
    }
}

async function logout(req, res, next) {
    try {
       await tokenController.invalidate(req.body.refreshToken)
       res.status(204).end();
    } catch(err) {
        return next(err);
    } 
}

export default router;