import HttpError from 'http-errors';

export function handlePageURLParam(req, res, next) {

    if(parseInt(req.query.page, 10) <= 0) {
        throw HttpError.BadRequest('La page demandée doit être supérieure à 0');
    } 

    next();
}