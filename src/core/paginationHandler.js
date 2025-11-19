
//Retourne un object qui contient les champs _metadata et _links
function generateMetaDataLinks(totalDocuments, page, skip, limit) {
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
      _links = _links.splice(1, 2);
    }

    if (page === totalPages) {
      _links = _links.slice(0, 2);
      pageLinks = pageLinks.slice(1);
    }

    _links.forEach((link, index) => {
      response._links[link] = `${process.env.BASE_URL}${pageLinks[index].url}`;
    });

    return response;
}

export { generateMetaDataLinks };