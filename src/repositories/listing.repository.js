import dayjs from 'dayjs';
import Listing from '../models/listing.model.js';
import alliesRepository from './ally.repository.js';
import explorerRepository from './explorer.repository.js';
import HttpErrors from 'http-errors';



class ListingRepository {

    async retrieveByUUID(uuid) {
        const query = Listing.findOne({ uuid });
        this.#handlePopulateOption(query);
        return await query;
    }


    async create(allyUUID, explorerUUID, inox) {
        let ally = await alliesRepository.retrieveByUUID(allyUUID);

        if (!ally) {
            throw HttpErrors.NotFound('Ally not found');
        }

        const isDuplicate = await Listing.findOne({ ally: ally._id });
        if (isDuplicate) {
            throw HttpErrors.Conflict('This ally is already listed for sale');
        }

        let explorer = await explorerRepository.retrieveOne(explorerUUID);

        if (!explorer) {
            throw HttpErrors.NotFound('Explorer not found');
        }

        const listing = await Listing.create({
            ally: ally._id,
            seller: explorer._id,
            inox: inox
        });

        return listing;
    }

    retrieveByCriteria(filter, options) {
        const limit = options.limit;
        const skip = options.skip;

        const retrieveQuery = Listing
            .find(filter)
            .limit(limit)
            .skip(skip)
            .sort({'createdAt': 'desc'})
        const countQuery = Listing.countDocuments(filter);

        this.#handlePopulateOption(retrieveQuery, options);

        return Promise.all([retrieveQuery, countQuery]);

    }

    transform(listing, options = {}) {
        const buyer = listing.buyer;
        const seller = listing.seller;
        const ally = listing.ally;

        //Il est possible qu'il n'y est aucun buyer relier au listing
        if (buyer) {
            listing.buyer = { href: `${process.env.BASE_URL}/explorers/${buyer.uuid}` };

            if (options.buyer) {
                listing.buyer = explorerRepository.transform(buyer);
            }
        }

        if (seller) {
            listing.seller = { href: `${process.env.BASE_URL}/explorers/${seller.uuid}` };
            if (options.seller) {
                listing.seller = explorerRepository.transform(seller);
            }
        }

        if (ally) {
            listing.ally = { href: `${process.env.BASE_URL}/allies/${ally.uuid}` };
            if (options.ally) {
                listing.ally = alliesRepository.transform(ally);
            }
        }

        listing.href = `${process.env.BASE_URL}/listings/${listing.uuid}`;

        if (listing.completedAt) {
            listing.completedAt = dayjs(listing.completedAt).format('YYYY-MM-DD');
        }
        listing.createdAt = dayjs(listing.createdAt).format('YYYY-MM-DD');

        delete listing._id;
        delete listing.__v;
        delete listing.uuid;

        return listing;
    }

    //Fonction privé pour géré les populate de retrieve queries
    #handlePopulateOption(query, options = {}) {        
        if (options.seller) {
            query.populate('seller');
        } else {
            query.populate('seller', 'uuid');
        }

        if (options.buyer) {
            query.populate('buyer');
        } else {
            query.populate('buyer', 'uuid');
        }

        if (options.ally) {
            query.populate('ally');
        } else {
            query.populate('ally', 'uuid');
        }
        return query;
    } 
}

export default new ListingRepository();