// Helper function to print/display the results
function displayResults(species, targetId) {
  const targetElement = document.getElementById(targetId);
  let table;
  let tableBody;

  if(targetElement.querySelector('table') == null){
    targetElement.innerHTML = '';
    
    table = document.createElement('table');
    table.classList.add('table');
  
    // Create table headings
    const tableHead = document.createElement('thead');
    tableHead.classList.add('thead-dark');
    const headingRow = document.createElement('tr');
    const speciesNameHeading = document.createElement('th');
    speciesNameHeading.textContent = 'Species';
    speciesNameHeading.setAttribute('scope', 'col');
    const categoryHeading = document.createElement('th');
    categoryHeading.textContent = 'Category';
    categoryHeading.setAttribute('scope', 'col');
    const measuresHeading = document.createElement('th');
    measuresHeading.textContent = 'Conservation Measures';
    measuresHeading.setAttribute('scope', 'col');
    const classnameHeading = document.createElement('th');
    classnameHeading.textContent = 'Class Name';
    classnameHeading.setAttribute('scope', 'col');
  
    headingRow.appendChild(speciesNameHeading);
    headingRow.appendChild(categoryHeading);
    headingRow.appendChild(measuresHeading);
    headingRow.appendChild(classnameHeading);
    tableHead.appendChild(headingRow);
    table.appendChild(tableHead);
    // Create table body
    tableBody = document.createElement('tbody');
  }else{
    table = targetElement.querySelector('table');
    tableBody = targetElement.querySelector('tbody');
  }


  species.forEach(s => {
    const row = document.createElement('tr');
    const speciesNameCell = document.createElement('td');
    const categoryCell = document.createElement('td');
    const measuresCell = document.createElement('td');
    const classNameCell = document.createElement('td');

    speciesNameCell.textContent = s.name;
    categoryCell.textContent = s.category;
    measuresCell.textContent = s.measures;
    classNameCell.textContent = s.classname;

    row.appendChild(speciesNameCell);
    row.appendChild(categoryCell);
    row.appendChild(measuresCell);
    row.appendChild(classNameCell);

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  targetElement.appendChild(table);

  document.getElementById('loadMore').style.display = 'inline-block';
}

// Helper function to update the progress list
function updateProgressList(message) {
  const progressList = document.getElementById('progressList');

  const li = document.createElement('li');
  li.textContent = message;
  progressList.appendChild(li);
}


export { displayResults, updateProgressList };
