import express from 'express';
import paginate, { hasNextPages } from 'express-paginate';
import HttpErrors from 'http-errors';

import { generateMetaDataLinks } from '../core/paginationHandler.js';
import { handlePageURLParam } from '../middlewares/page.value.middleware.js';
import { PAGINATION_PAGE_LIMIT, PAGINATION_PAGE_MAX_LIMIT, PAGE_LINKS_NUMBER } from '../core/constants.js';

import { guardAuthorizationJWT } from '../middlewares/authorization.jwt.js';

import listingRepository from '../repositories/listing.repository.js';
import explorerRepository from '../repositories/explorer.repository.js';
import allyRepository from '../repositories/ally.repository.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', handlePageURLParam, paginate.middleware(PAGINATION_PAGE_LIMIT, PAGINATION_PAGE_MAX_LIMIT), retrieveAll);
router.get('/:uuid', retrieveOne);
router.post('/allies/:allyUUID', guardAuthorizationJWT, post);
router.delete('/:uuid', guardAuthorizationJWT, deleteOne);
router.patch('/:listingUUID', guardAuthorizationJWT, buy);

async function buy(req, res, next) {
    const buySession = await mongoose.startSession();
    try {
        //---------Get info-----------
        let buyer = await explorerRepository.retrieveOne(req.auth.uuid);
        if (!buyer) {
            return next(HttpErrors.NotFound("Votre compte explorateur n'a pas été trouvé"));
        }
      
        let listing = await listingRepository.retrieveByUUID(req.params.listingUUID, {ally: true, seller: true});     
        if (!listing) {
            return next(HttpErrors.NotFound(`Vente avec le uuid "${req.params.listingUUID}" n'a pas été trouvé`));
        }
        
        //---------Vérification-----------
        if (listing.buyer) {
            return next(HttpErrors.Forbidden(`L'allié en vente à déjà été acheté.`));
        }
        if (buyer.uuid === listing.seller.uuid) {
            return next(HttpErrors.Forbidden(`Vous ne pouvez pas acheté votre propre vente.`));
        }

        //---------Fabrication des objets update-----------
        //Ils ont que les champs qui seront modifier.
        let newInox = buyer.vault.inox - listing.inox;
        if (newInox < 0) {
            return next(HttpErrors.Forbidden(`Votre balance est insuffisante, il vous manque ${newInox * -1} inox.`));
        }

        let allyUpdate = { explorer: buyer._id };
        let buyerUpdate = {
            vault : {
                inox : newInox,
                elements : buyer.vault.elements
            }
        };
        let sellerUpdate = {
            vault: {
                inox: listing.seller.vault.inox + listing.inox,
                elements : listing.seller.vault.elements
            }
        };
        let listingUpdate = {
            buyer : buyer._id,
            completedAt : Date.now()
        };

        //---------applique Update-----------
        //Si une des actions échoue, tous échoues
        buySession.startTransaction();
            let newAlly = await allyRepository.update(listing.ally.uuid, allyUpdate);
            await explorerRepository.update(buyer.uuid, buyerUpdate);
            await explorerRepository.update(listing.seller.uuid, sellerUpdate);
            await listingRepository.update(listing.uuid, listingUpdate);
        await buySession.commitTransaction();

        //---------Fait la reponse-----------
        newAlly = newAlly.toObject({ getters: false, virtuals: false });
        newAlly = allyRepository.transform(newAlly);

        res.status(200).json(newAlly);
    } catch (err) {
        next(err);
    } finally {
        buySession.endSession();
    }
}

async function retrieveOne(req, res, next) {
    try {
        let options = {};
        options = { ...options, ...assignEmbedOptions(req.query.embed) };

        const listingUUID = req.params.uuid;
        var listing = await listingRepository.retrieveByUUID(listingUUID, options);
        if (!listing) {
            throw HttpErrors.NotFound('Listing not found');
        }

        listing = listing.toObject({ getters: false, virtuals: false });
        listing = listingRepository.transform(listing, options);

        res.status(200).json({ listing });
    } catch (err) {
        return next(err);
    }
}

async function retrieveAll(req, res, next) {
    try {
        let filter = {};
        let options = {
            limit: req.query.limit,
            skip: req.skip
        };

        options = { ...options, ...assignEmbedOptions(req.query.embed) };
        //Check filters
        if (req.query.status) {
            if (req.query.status === 'completed') {
                filter = { buyer: { $exists: true } };
            } else if (req.query.status === 'available') {
                filter = { buyer: { $exists: false } };
            }
        }

        let [listings, totalDocuments] = await listingRepository.retrieveByCriteria(filter, options);

        let responseBody = generateMetaDataLinks(totalDocuments, req.query.page, req.query.skip, req.query.limit, req);
        responseBody.data = listings.map(l => {
            l = l.toObject({ getters: false, virtuals: false });
            l = listingRepository.transform(l, options);
            return l;
        });

        res.status(200).json(responseBody);
    } catch (err) {
        next(err);
    }
}

async function post(req, res, next) {
    try {
        const allyUUID = req.params.allyUUID;
        const explorerUuid = req.auth.uuid;
        const inox = req.body.inox;

    
        let listing = await listingRepository.create(allyUUID, explorerUuid, inox);

        listing = listing.toObject({ getters: false, virtuals: false });

        listing = listingRepository.transform(listing);

        if (req.query._body && req.query._body === 'false') {
            res.status(204).end();
        } else {
            res.status(201).json({ listing });
        }
    } catch (err) {
        return next(err);
    }
}


async function deleteOne(req, res, next) {
    try {

        const listing = await listingRepository.retrieveByUUID(req.params.uuid);

        // Validation que le listing existe
        if (!listing) {
            throw HttpErrors.NotFound('Listing not found');
        }
        // Validation que l'explorer connecté est le vendeur du listing
        if (listing.seller.uuid !== req.auth.uuid) {
            throw HttpErrors.Forbidden('You do not own this listing');
        }
        // Validation que le listing n'est pas déjà complété
        if (listing.buyer) {
            throw HttpErrors.Forbidden('Cannot cancel a completed listing');
        }

        await listingRepository.delete(req.params.uuid);

        res.status(204).end();

    } catch (err) {
        return next(err);
    }
}

function assignEmbedOptions(reqEmbeds) {
    let options = {};

    if (reqEmbeds) {
      if (reqEmbeds.includes("all")) {
        options.seller = true;
        options.buyer = true;
        options.ally = true;
        return options;
      }
      if (reqEmbeds.includes("seller")) {
        options.seller = true;
      }
      if (reqEmbeds.includes("buyer")) {
        options.buyer = true;
      }
      if (reqEmbeds.includes("ally")) {
        options.ally = true;
      }
    }
    return options;
}
    /*
    if (reqEmbeds) {
        switch (reqEmbeds) {
            case 'all':
                options.seller = true;
                options.buyer = true;
                options.ally = true;
                break;
            case 'seller':
                options.seller = true;
                break;
            case 'buyer':
                options.buyer = true;
                break;
            case 'ally':
                options.ally = true;
                break;
        }
    }
    */

export default router;
