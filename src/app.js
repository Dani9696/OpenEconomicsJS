import { loadRegions, loadSpecies, selectRandomRegion, filterCriticalEndangeredSpecies, fetchConservationMeasures, mapSpeciesData } from './services/IUCNApi.js';
import { updateProgressList } from './components/helpers.js';

let token = '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee';

// Main function to orchestrate the app
async function runApplication() {
  try {
    // Step 1: Load the list of available regions for species
    updateProgressList('Loading the list of regions...');
    const regions = await loadRegions(token);
    console.log(regions);
    updateProgressList('Loaded the regions.');

    // Step 2: Select a random region from the list
    updateProgressList('Selecting a random region...');
    const randomRegion = selectRandomRegion(regions);
    console.log(randomRegion);
    updateProgressList(`Selected region: ${randomRegion.identifier} - ${randomRegion.name}`);

    // Step 3: Load the list of all species in the selected region (first page)
    updateProgressList(`Loading first page of species for region: ${randomRegion.name}...`);
    const speciesData = await loadSpecies(randomRegion.identifier, token);
    console.log(speciesData);
    updateProgressList(`Loaded ${speciesData.length} species for region: ${randomRegion.name}.`);

    // Step 4: Create a model for "Species" and map the results
    const species = mapSpeciesData(speciesData);
    console.log(species);

    // Step 5: Filter conservation measures for Critically Endangered species
    updateProgressList('Filtering critical endangered species...');
    const criticallyEndangeredSpecies = filterCriticalEndangeredSpecies(species);

    // Step 5: Fetch conservation measures for Critically Endangered species
    updateProgressList(`Fetching conservation measures for the first 10 out of ${criticallyEndangeredSpecies.length} critical endangered species...`);
    const measuresPromise = fetchConservationMeasures(criticallyEndangeredSpecies, token);

    // Wait for Step 5 to complete
    const measures = await measuresPromise;

    const loadMore = document.getElementById('loadMore');

    loadMore.addEventListener('click', async () => {
      loadMore.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      await fetchConservationMeasures(criticallyEndangeredSpecies, token);
      loadMore.innerHTML = 'Load More';
    });


  } catch (error) {
    console.error('An error occurred:', error);
  }
}

export { runApplication };
