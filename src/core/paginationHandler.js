import paginate from 'express-paginate';
import HttpErrors from 'http-errors';

import { PAGE_LINKS_NUMBER } from './constants.js';

//Retourne un object qui contient les champs _metadata et _links
function generateMetaDataLinks(totalDocuments, page, skip, limit, req) {
  if (!page) {
    throw HttpErrors.BadRequest("Option de la page (skip ou/et currentpage) est/sont manquante(s)")
  }
  page = parseInt(page, 10);
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

  // Build links by finding the correct page in pageLinks, or use first/last as fallback
  const pagesToLink = {
    prev: page > 1 ? page - 1 : null,
    self: page,
    next: page < totalPages ? page + 1 : null
  };

  Object.entries(pagesToLink).forEach(([linkType, pageNum]) => {
    if (pageNum !== null) {
      let pageLink = pageLinks.find(pl => pl.number === pageNum);

      // Fallback: if page not in pageLinks window, reconstruct URL
      if (!pageLink && pageLinks.length > 0) {
        const firstLink = pageLinks[0];
        const urlParams = new URLSearchParams(firstLink.url.split('?')[1]);
        urlParams.set('page', pageNum);
        response._links[linkType] = `${process.env.BASE_URL}${req.baseUrl}?${urlParams.toString()}`;
      } else if (pageLink) {
        response._links[linkType] = `${process.env.BASE_URL}${pageLink.url}`;
      }
    }
  });

  return response;
}

export { generateMetaDataLinks };