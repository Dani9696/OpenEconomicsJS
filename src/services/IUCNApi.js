import { Species } from '../components/Species.js';
import { displayResults } from '../components/helpers.js';
let currentBatch = 0;

// Step 1: Load the list of available regions for species
async function loadRegions(token) {
  const response = await fetch(`http://apiv3.iucnredlist.org/api/v3/region/list?token=${token}`);
  const data = await response.json();
  return data.results;
}

// Step 2: Select a random region from the list
function selectRandomRegion(regions) {
  const randomIndex = Math.floor(Math.random() * regions.length);
  return regions[randomIndex];
}

// Step 3: Load the list of all species in the selected region (first page)
async function loadSpecies(region, token) {
  const response = await fetch(`http://apiv3.iucnredlist.org/api/v3/species/page/0?region=${region}&token=${token}`);
  const data = await response.json();
  return data.result;
}

function mapSpeciesData(speciesData) {
  return speciesData.map(species => {
    const { taxonid, scientific_name, category, class_name } = species;
    return new Species(taxonid, scientific_name, category, class_name );
  });
}

// Step 5: Filter and fetch conservation measures for Critically Endangered species
function filterCriticalEndangeredSpecies(species){
  return species.filter(s => s.category === 'CR')
}

async function fetchConservationMeasures(species, token) {
  const batchSize = 10; // Number of requests to send in each batch
  const measures = [];
  const batch = species.slice(currentBatch, currentBatch + batchSize);
  currentBatch += batchSize;
  const requests = batch.map(async s => {
    try {
      const response = await fetch(
        `http://apiv3.iucnredlist.org/api/v3/measures/species/id/${encodeURIComponent(
          s.taxonid
        )}?token=${token}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch conservation measures for species ${s.name}`);
      }
      const measuresData = await response.json();
      return measuresData;
    } catch (error) {
      console.error(error);
      return { result: [] }; // Return empty result to continue processing other species
    }
  });
  const responses = await Promise.all(requests);
  console.log(responses);
  for (let j = 0; j < batch.length; j++) {
    const speciesItem = batch[j];
    const measuresData = responses[j].result;
    speciesItem.measures = measuresData.map(measure => measure.title).join(' ');
    measures.push(speciesItem);
  }

  displayResults(measures, 'criticallyEndangeredList')
  let mammalsMeasures = filterMammals(measures);
  displayResults(mammalsMeasures, 'mammalList');
}

// Step 6: Filter the results for the mammal class
function filterMammals(species) {
  return species.filter(s => s.classname === 'MAMMALIA');
}

export { loadRegions, loadSpecies, selectRandomRegion, filterCriticalEndangeredSpecies, fetchConservationMeasures, mapSpeciesData };
