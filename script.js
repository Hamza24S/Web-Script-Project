// script.js

// Sample incident data (initially empty)
let incidents = [];

// Function to render the incident table
function renderIncidentTable() {
    const tableBody = document.getElementById('incidentTable').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear current table rows

    incidents.forEach((incident, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${incident.id}</td>
            <td>${incident.description}</td>
            <td>${incident.status}</td>
            <td>
                <button onclick="editIncident(${index})">Edit</button>
                <button onclick="deleteIncident(${index})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Show the form to create a new incident
function showIncidentForm() {
    document.getElementById('incidentFormSection').style.display = 'block';
    document.getElementById('formTitle').textContent = 'Create New Incident';
    document.getElementById('incidentForm').reset();
    document.getElementById('formSubmitButton').textContent = 'Create Incident';
    currentEditIndex = null;
}

// Show the form to edit an existing incident
function editIncident(index) {
    const incident = incidents[index];
    document.getElementById('incidentDescription').value = incident.description;
    document.getElementById('incidentStatus').value = incident.status;
    document.getElementById('formTitle').textContent = 'Edit Incident';
    document.getElementById('formSubmitButton').textContent = 'Update Incident';
    document.getElementById('incidentFormSection').style.display = 'block';
    currentEditIndex = index;
}

// Handle form submission (Create/Update incident)
let currentEditIndex = null;

document.getElementById('incidentForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const description = document.getElementById('incidentDescription').value;
    const status = document.getElementById('incidentStatus').value;

    if (currentEditIndex === null) {
        // Create new incident
        const newIncident = {
            id: incidents.length + 1,
            description,
            status
        };
        incidents.push(newIncident);
    } else {
        // Update existing incident
        incidents[currentEditIndex] = { id: incidents[currentEditIndex].id, description, status };
    }

    renderIncidentTable();
    document.getElementById('incidentFormSection').style.display = 'none';
});

// Handle form cancel
document.getElementById('formCancelButton').addEventListener('click', function() {
    document.getElementById('incidentFormSection').style.display = 'none';
});

// Handle delete incident
function deleteIncident(index) {
    incidents.splice(index, 1);
    renderIncidentTable();
}

// Event listener for Create New Incident button
document.getElementById('createIncidentButton').addEventListener('click', showIncidentForm);

// Initial render
renderIncidentTable();
