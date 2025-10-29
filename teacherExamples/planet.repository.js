import dayjs from 'dayjs';
import Planet from '../models/planet.model.js';

const ZERO_KELVIN = -273.15;

class PlanetRepository {
  retrieveAll() {
    return Planet.find();
  }

  retrieveByCriteria(criteria) {
    return Planet.find(criteria);
  }

  retrieveByUUID(planetUUID, options) {
    const retrieveQuery = Planet.findOne({ uuid: planetUUID });
    if(options.explorations) {
      retrieveQuery.populate('explorations');
    }
    return retrieveQuery;
  }

  create(planet) {
    return Planet.create(planet);
  }

  update(planetUUID, planet) {
      return Planet.findOneAndUpdate(
        { uuid:planetUUID }, 
        { $set: Object.assign(planet) }, 
        { runValidators: true, new: true }
      );
  }

  transform(planet, transformOptions = {}) {
    if (transformOptions) {
      if (transformOptions.unit === 'c') {
        planet.temperature += ZERO_KELVIN;
        planet.temperature = parseFloat(planet.temperature.toFixed(2));
      }
    }

    planet.discoveryDate = dayjs(planet.discoveryDate).format('YYYY-MM-DD');

    planet.lightspeed = `${planet.position.x.toString(16)}@${planet.position.y.toString(16)}#${planet.position.z.toString(16)}`;

    //Ajouter de nouvelles transformations
    planet.href = `${process.env.BASE_URL}/planets/${planet.uuid}`;

    delete planet._id;
    delete planet.__v;
    delete planet.uuid;

    return planet;
  }
}

export default new PlanetRepository();
