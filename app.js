let token = '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee';

// Step 1: Load the list of available regions for species
async function loadRegions() {
  const response = await fetch(`http://apiv3.iucnredlist.org/api/v3/region/list?token=${token}`);
  console.log(`http://apiv3.iucnredlist.org/api/v3/region/list?token=${token}`);
  const data = await response.json();
  return data.results;
}

// Step 2: Select a random region from the list
function selectRandomRegion(regions) {
  const randomIndex = Math.floor(Math.random() * regions.length);
  return regions[randomIndex];
}

// Step 3: Load the list of all species in the selected region (first page)
async function loadSpecies(region) {
  const response = await fetch(`http://apiv3.iucnredlist.org/api/v3/species/page/0?region=${region}&token=${token}`);
  const data = await response.json();
  return data.result;
}

// Step 4: Create a model for "Species" and map the results
class Species {
  constructor(taxonid, name, category, classname) {
    this.taxonid = taxonid;
    this.name = name;
    this.category = category;
    this.classname = classname;
    this.measures = "";
  }
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

async function fetchConservationMeasures(species) {
  const batchSize = 100; // Number of requests to send in each batch
  const delay = 10; // Delay between batches (in milliseconds)
  const measures = [];
  
  for (let i = 0; i < species.length; i += batchSize) {
    const batch = species.slice(i, i + batchSize);
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
    

    for (let j = 0; j < batch.length; j++) {
      const speciesItem = batch[j];
      const measuresData = responses[j].result;
      speciesItem.measures = measuresData.map(measure => measure.title).join(' ');
      measures.push(speciesItem);
    }

    displayResults(measures, 'criticallyEndangeredList')
    mammalsMeasures = filterMammals(measures);
    displayResults(mammalsMeasures, 'mammalList'); 

    // Introduce a delay before the next batch
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Step 6: Filter the results for the mammal class
function filterMammals(species) {
  return species.filter(s => s.classname === 'MAMMALIA');
}

// Helper function to print/display the results
function displayResults(species, targetId) {
  console.log(species);
  const targetElement = document.getElementById(targetId);
  targetElement.innerHTML = '';

  species.forEach(s => {
    const li = document.createElement('li');
    li.textContent = `Species: ${s.name} | Category: ${s.category} | Conservation Measures: ${s.measures}`;
    targetElement.appendChild(li);
  });
}

// Main function to orchestrate the app
async function runApplication() {
  try {
    // Step 1: Load the list of available regions for species
    const regions = await loadRegions();
    console.log(regions);

     // Step 2: Select a random region from the list
    const randomRegion = selectRandomRegion(regions);
    console.log(randomRegion);


    // Step 3: Load the list of all species in the selected region (first page)
    const speciesData = await loadSpecies(randomRegion.identifier);
    console.log(speciesData);

    // Step 4: Create a model for "Species" and map the results
    const species = mapSpeciesData(speciesData);
    console.log(species);

    // Step 5: Filter and fetch conservation measures for Critically Endangered species
    const criticallyEndangeredSpecies = filterCriticalEndangeredSpecies(species);

    // Step 5: Filter and fetch conservation measures for all species
    const measuresPromise = fetchConservationMeasures(criticallyEndangeredSpecies);


    // Wait Step 5 to complete
    const measures = await measuresPromise;

  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Run the application
runApplication();