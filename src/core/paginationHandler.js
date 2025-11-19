import paginate from 'express-paginate';
import { PAGE_LINKS_NUMBER } from './constants.js';

//Retourne un object qui contient les champs _metadata et _links
function generateMetaDataLinks(totalDocuments, page, skip, limit, req) {
    const totalPages = Math.ceil(totalDocuments / limit);
    
    let response = {};

    response._metadata = {
      hasNextPage: page < totalPages,
      page: page,
      limit: limit,
      skip: skip,
      totalPages: totalPages,
      totalDocuments: totalDocuments,
    };
    response._links = {};

    // Build pagination links
    if (page > 1) {
      response._links.prev = `${process.env.BASE_URL}${req.path}?page=${page - 1}&limit=${limit}`;
    }
    
    response._links.self = `${process.env.BASE_URL}${req.path}?page=${page}&limit=${limit}`;
    
    if (page < totalPages) {
      response._links.next = `${process.env.BASE_URL}${req.path}?page=${page + 1}&limit=${limit}`;
    }

    return response;
}

export { generateMetaDataLinks };