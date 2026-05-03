const BASE_URL = 'http://localhost:5198/api/v1';

// DOM Elements
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// View Switching Logic
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update Active Nav Link
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Update Page Title
        document.getElementById('pageTitle').innerText = item.innerText.trim() + " Management";

        // Hide all views, show targeted view
        const targetViewId = item.getAttribute('data-target') + '-view';
        document.querySelectorAll('.view-section').forEach(view => {
            view.style.display = view.id === targetViewId ? 'grid' : 'none';
        });

        // Fetch data for the active view
        loadDataForView(item.getAttribute('data-target'));
    });
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Show drivers by default (first tab)
    document.getElementById('drivers-view').style.display = 'grid';
    loadDataForView('drivers');
});

// Data Loading Router
function loadDataForView(view) {
    switch(view) {
        case 'drivers': fetchDrivers(); break;
        case 'vehicles': fetchVehicles(); break;
        case 'trips': fetchTrips(); break;
        case 'loadplans': fetchLoadPlans(); break;
        case 'incidents': fetchIncidents(); break;
    }
}

// ---------------------- DRIVERS ----------------------
document.getElementById('addDriverForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        firstName: document.getElementById('driverFirstName').value,
        lastName: document.getElementById('driverLastName').value,
        licenseNumber: document.getElementById('driverLicense').value
    };
    await submitForm(`${BASE_URL}/drivers`, data, 'addDriverForm', fetchDrivers);
});

async function fetchDrivers() {
    const data = await fetchData(`${BASE_URL}/drivers`, 'driversTableBody');
    if (!data) return;
    
    const tbody = document.getElementById('driversTableBody');
    tbody.innerHTML = data.map(d => `
        <tr>
            <td class="id-cell" title="${d.id}">#${d.id.substring(0,8)}</td>
            <td>${d.firstName} ${d.lastName}</td>
            <td>${d.licenseNumber}</td>
            <td>${d.isAvailable ? '<span class="badge-success">Available</span>' : '<span class="badge-danger">Busy</span>'}</td>
        </tr>
    `).join('');
}

// ---------------------- VEHICLES ----------------------
document.getElementById('addVehicleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        make: document.getElementById('vehicleMake').value,
        model: document.getElementById('vehicleModel').value,
        licensePlate: document.getElementById('vehiclePlate').value,
        capacity: parseFloat(document.getElementById('vehicleCapacity').value)
    };
    await submitForm(`${BASE_URL}/vehicles`, data, 'addVehicleForm', fetchVehicles);
});

async function fetchVehicles() {
    const data = await fetchData(`${BASE_URL}/vehicles`, 'vehiclesTableBody');
    if (!data) return;
    
    const tbody = document.getElementById('vehiclesTableBody');
    tbody.innerHTML = data.map(v => `
        <tr>
            <td class="id-cell" title="${v.id}">#${v.id.substring(0,8)}</td>
            <td>${v.make} ${v.model}</td>
            <td>${v.licensePlate}</td>
            <td>${v.capacity} Tons</td>
        </tr>
    `).join('');
}

// ---------------------- TRIPS ----------------------
document.getElementById('addTripForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        origin: document.getElementById('tripOrigin').value,
        destination: document.getElementById('tripDestination').value,
        driverId: document.getElementById('tripDriver').value,
        vehicleId: document.getElementById('tripVehicle').value
    };
    await submitForm(`${BASE_URL}/trips`, data, 'addTripForm', fetchTrips);
});

async function fetchTrips() {
    const data = await fetchData(`${BASE_URL}/trips`, 'tripsTableBody');
    if (!data) return;
    
    const tbody = document.getElementById('tripsTableBody');
    tbody.innerHTML = data.map(t => `
        <tr>
            <td class="id-cell" title="${t.id}">#${t.id.substring(0,8)}</td>
            <td>${t.origin} <i class="fa-solid fa-arrow-right" style="margin:0 5px; opacity:0.5"></i> ${t.destination}</td>
            <td class="id-cell">#${t.driverId.substring(0,8)}</td>
            <td class="id-cell">#${t.vehicleId.substring(0,8)}</td>
            <td><span class="badge-success">${t.status}</span></td>
        </tr>
    `).join('');
}

// ---------------------- LOAD PLANS ----------------------
document.getElementById('addLoadPlanForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        tripId: document.getElementById('loadTrip').value,
        description: document.getElementById('loadDesc').value,
        totalWeight: parseFloat(document.getElementById('loadWeight').value)
    };
    await submitForm(`${BASE_URL}/loadplans`, data, 'addLoadPlanForm', fetchLoadPlans);
});

async function fetchLoadPlans() {
    const data = await fetchData(`${BASE_URL}/loadplans`, 'loadPlansTableBody');
    if (!data) return;
    
    const tbody = document.getElementById('loadPlansTableBody');
    tbody.innerHTML = data.map(l => `
        <tr>
            <td class="id-cell" title="${l.id}">#${l.id.substring(0,8)}</td>
            <td class="id-cell">#${l.tripId.substring(0,8)}</td>
            <td>${l.description}</td>
            <td>${l.totalWeight} Tons</td>
        </tr>
    `).join('');
}

// ---------------------- INCIDENTS ----------------------
document.getElementById('addIncidentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        tripId: document.getElementById('incidentTrip').value,
        description: document.getElementById('incidentDesc').value,
        severity: document.getElementById('incidentSeverity').value
    };
    await submitForm(`${BASE_URL}/incidents`, data, 'addIncidentForm', fetchIncidents);
});

async function fetchIncidents() {
    const data = await fetchData(`${BASE_URL}/incidents`, 'incidentsTableBody');
    if (!data) return;
    
    const tbody = document.getElementById('incidentsTableBody');
    tbody.innerHTML = data.map(i => {
        let badgeClass = i.severity === 'Critical' || i.severity === 'High' ? 'badge-danger' : 'badge-success';
        return `
        <tr>
            <td class="id-cell" title="${i.id}">#${i.id.substring(0,8)}</td>
            <td class="id-cell">#${i.tripId.substring(0,8)}</td>
            <td>${i.description}</td>
            <td><span class="${badgeClass}">${i.severity}</span></td>
            <td>${new Date(i.reportedAt).toLocaleString()}</td>
        </tr>
        `;
    }).join('');
}


// ---------------------- HELPERS ----------------------
async function submitForm(url, data, formId, reloadCallback) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('API Request Failed');

        document.getElementById(formId).reset();
        showToast('Successfully added record!');
        await reloadCallback();
    } catch (error) {
        console.error(error);
        showToast('Error saving data', true);
    }
}

async function fetchData(url, tableBodyId) {
    const tbody = document.getElementById(tableBodyId);
    tbody.innerHTML = '<tr><td colspan="6" class="text-center loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading...</td></tr>';
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="color: var(--text-secondary);">No records found.</td></tr>';
            return null;
        }
        return data;
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center badge-danger" style="display:table-cell">Error connecting to server.</td></tr>';
        return null;
    }
}

function showToast(message, isError = false) {
    toastMessage.textContent = message;
    toast.style.background = isError ? 'var(--danger)' : 'var(--success)';
    toast.querySelector('i').className = isError ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-circle-check';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
