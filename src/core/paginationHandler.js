import paginate from 'express-paginate';
import { PAGE_LINKS_NUMBER } from './constants.js';

//Retourne un object qui contient les champs _metadata et _links
function generateMetaDataLinks(totalDocuments, page, skip, limit, req) {
    const totalPages = Math.ceil(totalDocuments / limit);
    const pageLinksFunction = paginate.getArrayPages(req);
    let pageLinks = pageLinksFunction(PAGE_LINKS_NUMBER, totalPages, page);
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

    let _links = ['prev', 'self', 'next'];

    if (page === 1) {
      _links = _links.slice(1); // Remove 'prev'
      pageLinks = pageLinks.slice(1); // Remove first page link
    }

    if (page === totalPages) {
      _links = _links.slice(0, _links.length - 1); // Remove 'next'
      pageLinks = pageLinks.slice(0, pageLinks.length - 1); // Remove last page link
    }

    _links.forEach((link, index) => {
      if (pageLinks[index]) {
        response._links[link] = `${process.env.BASE_URL}${pageLinks[index].url}`;
      }
    });

    return response;
}

export { generateMetaDataLinks };