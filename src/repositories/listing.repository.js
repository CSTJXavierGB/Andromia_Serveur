import Listing from '../models/listing.model.js';
import alliesRepository from './ally.repository.js';
import explorerRepository from './explorer.repository.js';
import HttpErrors from 'http-errors';



class ListingRepository {


    async create(allyUUID, explorerUUID, inox) {
        


            let ally = await alliesRepository.retrieveByUUID(allyUUID);

            if (!ally) {
                throw HttpErrors.NotFound('Ally not found');
            }

            const isDuplicate = await Listing.findOne({ ally: ally._id});
            if (isDuplicate) {
                throw HttpErrors.Conflict('This ally is already listed for sale');
            }



            let explorer = await explorerRepository.retrieveOne(explorerUUID);

            if (!explorer) {
                throw HttpErrors.NotFound('Explorer not found');
            }



            if (!ally.explorer) {
                throw HttpErrors.BadRequest('Ally is not linked to any explorer');
            }

            if (!ally.explorer._id.equals(explorer._id)) {
                throw HttpErrors.Forbidden('You do not own this ally');
            }

            const listing = await Listing.create({
                seller: explorer._id,
                ally: ally._id,
                inox: inox
            });

            await this.#handlePopulateOption(listing);
            return listing;
       
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