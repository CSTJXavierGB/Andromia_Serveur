import Listing from '../models/listing.model.js';
import alliesRepository from './ally.repository.js';
import explorerRepository from './explorer.repository.js';


class ListingRepository {

    async create(allyUUID, explorerUUID, inox) {
        try {


            let ally = await alliesRepository.retrieveByUUID(allyUUID);
            let explorer = await explorerRepository.retrieveOne(explorerUUID);

            const listing = await Listing.create({
                seller: explorer._id,
                ally: ally._id,
                inox: inox
            });

            await this.#handlePopulateOption(listing);
            return listing;
        } catch (err) {
            throw new Error('Error creating listing: ' + err.message);
        }
    }

    transform(listing, options = {}) {
        listing.href = `${process.env.BASE_URL}/listings/${listing.uuid}`;
        delete listing._id;
        delete listing.__v;
        delete listing.seller._id;
        delete listing.ally._id;
        delete listing.uuid;
        delete listing.updatedAt;
        return listing;
    }

    //Fonction privé pour géré les populates
    async #handlePopulateOption(query, options = {}) {

            await query.populate('seller', 'uuid username');
            await query.populate('ally', 'uuid name');

        return query;
    }

}

export default new ListingRepository();