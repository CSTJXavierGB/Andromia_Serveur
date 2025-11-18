import dayjs from 'dayjs';
import Listing from '../models/listing.model.js';
import allyRepository from './ally.repository.js';
import explorerRepository from './explorer.repository.js';

class ListingRepository {
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

        listing.seller = { href: `${process.env.BASE_URL}/explorers/${seller.uuid}` };
        if (options.seller) {
            listing.seller = explorerRepository.transform(seller);
        }

        listing.ally = { href: `${process.env.BASE_URL}/allies/${ally.uuid}` };
        if (options.ally) {
            listing.ally = allyRepository.transform(ally);
        }

        listing.href = `${process.env.BASE_URL}/listings/${listing.uuid}`;

        listing.completedAt = dayjs(listing.completedAt).format('YYYY-MM-DD');
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