import express from 'express';
import HttpErrors from 'http-errors';

import listingRepository from '../repositories/listing.repository.js';
import explorerRepository from '../repositories/explorer.repository.js';

import { guardAuthorizationJWT } from '../middlewares/authorization.jwt.js';

const router = express.Router();

router.get('/:explorerUUID/listings', guardAuthorizationJWT, getAllListingsByExplorerUUID);



async function getAllListingsByExplorerUUID(req, res, next) {
    try {

        let options = {
            limit: 100,
            skip: 0
        };
        options = { ...options, ...assignEmbedOptions(req.query.embed) };



        const explorerUUID = req.params.explorerUUID;
        let filter = {};

        const explorer = await explorerRepository.retrieveOne(explorerUUID);
        if (!explorer) {
            throw HttpErrors.NotFound('Explorer not found');
        }

        if (req.auth.uuid !== explorerUUID) {
            throw HttpErrors.Forbidden('You are not allowed to access these listings');
        }

        if (req.query.type) {

            switch (req.query.type) {
                case 'selling':
                   filter = {'seller' : explorer._id};
                    break;
                    
                case 'sold':
                    filter = {'buyer' : {$exists : true}, 'seller' : explorer._id};
                    break;
                case 'bought':
                    filter = {'buyer' : explorer._id};
                    break;
                case 'both':
                    filter = {'$or' : [ {'buyer' : explorer._id}, {'seller' : explorer._id} ] };
                    break;
                case '':
                    break;
                default:
                    return next(HttpErrors.BadRequest(`Invalid type filter: ${req.query.type}`));
            }

        }

        

        let [listings, totalDocuments] = await listingRepository.retrieveByCriteria(filter, options);

        if (!listings || listings.length === 0) {
            return res.status(204).end();
        }

       listings = listings.map(listing => {
              listing = listing.toObject({ getters: false, virtuals: false });
              listing = listingRepository.transform(listing,options);
              
              // Add role field when type is 'both' to help client distinguish
              if (req.query.type === 'both') {
                  if (listing.seller && listing.seller.href && listing.seller.href.includes(explorerUUID)) {
                      listing.role = 'seller';
                  } else if (listing.buyer && listing.buyer.href && listing.buyer.href.includes(explorerUUID)) {
                      listing.role = 'buyer';
                  }
              }
              
              return listing;
       });


       res.status(200).json({ listings });

    } catch (err) {
        return next(err);
    }
}

function assignEmbedOptions(reqEmbeds) {
    let options = {};

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

    return options;
}

export default router;