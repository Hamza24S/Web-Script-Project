
// Sample incident data (initially empty)
let incidents = [];

// Function to render the incident table
async function fetchAndRenderIncidents() {
    try {
        const response = await fetch('/incidents'); // Fetch incidents from the server
        incidents = await response.json(); // Update the local array
        renderIncidentTable(); // Re-render the table
    } catch (error) {
        console.error('Failed to fetch incidents:', error);
    }
}

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

document.getElementById('incidentForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const description = document.getElementById('incidentDescription').value;
    const status = document.getElementById('incidentStatus').value;

    try {
        if (currentEditIndex === null) {
            const response = await fetch('/incidents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, status })
            });

            if (!response.ok) {
                throw new Error('Failed to create incident');
            }
        } else {
            const incidentId = incidents[currentEditIndex].id;
            const response = await fetch(`/incidents/${incidentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, status })
            });

            if (!response.ok) {
                throw new Error('Failed to update incident');
            }
        }

        // Refresh incidents from the backend
        await fetchAndRenderIncidents();
        document.getElementById('incidentFormSection').style.display = 'none';
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('An error occurred while saving the incident.');
    }
});


// Handle form cancel
document.getElementById('formCancelButton').addEventListener('click', function() {
    document.getElementById('incidentFormSection').style.display = 'none';
});

async function deleteIncident(index) {
    const incidentId = incidents[index].id;

    try {
        const response = await fetch(`/incidents/${incidentId}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error('Failed to delete incident');
        }
        await fetchAndRenderIncidents(); // Refresh the list after deletion
    } catch (error) {
        console.error('Error deleting incident:', error);
        alert('Failed to delete the incident.');
    }
}

// Event listener for Create New Incident button
document.getElementById('createIncidentButton').addEventListener('click', showIncidentForm);

document.addEventListener('DOMContentLoaded', fetchAndRenderIncidents);

renderIncidentTable();

