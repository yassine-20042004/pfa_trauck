const BASE_URL = 'http://localhost:5198/api/v1';

// DOM Elements
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// View Switching Logic
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        document.getElementById('pageTitle').innerText = item.innerText.trim() + " Management";
        const targetViewId = item.getAttribute('data-target') + '-view';
        document.querySelectorAll('.view-section').forEach(view => {
            if (view.id === targetViewId) {
                view.style.display = view.classList.contains('rp-view') ? 'flex' : 'grid';
            } else {
                view.style.display = 'none';
            }
        });
        loadDataForView(item.getAttribute('data-target'));
    });
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.view-section').forEach(v => v.style.display = 'none');
    document.getElementById('drivers-view').style.display = 'grid';
    loadDataForView('drivers');
});

// Data Loading Router
function loadDataForView(view) {
    switch(view) {
        case 'drivers':      fetchDrivers();      break;
        case 'vehicles':     fetchVehicles();     break;
        case 'trips':        fetchTrips();        break;
        case 'loadplans':    fetchLoadPlans();    break;
        case 'incidents':    fetchIncidents();    break;
        case 'routeplanner': initRoutePlanner();  break;
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

// ===================== ROUTE PLANNER (Leaflet Map) =====================

const NODE_COORDS = {
    CAS: { lat: 33.5731, lng: -7.5898, name: 'Casablanca',  type: 'warehouse'    },
    RAB: { lat: 34.0209, lng: -6.8416, name: 'Rabat',       type: 'delivery'     },
    FES: { lat: 34.0181, lng: -5.0078, name: 'Fes',         type: 'delivery'     },
    MAR: { lat: 31.6295, lng: -7.9811, name: 'Marrakech',   type: 'delivery'     },
    AGA: { lat: 30.4278, lng: -9.5981, name: 'Agadir',      type: 'delivery'     },
    TAN: { lat: 35.7595, lng: -5.8340, name: 'Tanger',      type: 'delivery'     },
    MKN: { lat: 33.8935, lng: -5.5473, name: 'Meknes',      type: 'intermediate' },
    KEN: { lat: 34.2610, lng: -6.5802, name: 'Kenitra',     type: 'intermediate' },
};

const ROAD_EDGES = [
    { from:'CAS', to:'RAB',  dist:87,  dur:70  },
    { from:'CAS', to:'MAR',  dist:238, dur:150 },
    { from:'RAB', to:'KEN',  dist:47,  dur:35  },
    { from:'RAB', to:'MKN',  dist:138, dur:100 },
    { from:'KEN', to:'TAN',  dist:198, dur:140 },
    { from:'MKN', to:'FES',  dist:60,  dur:45  },
    { from:'MKN', to:'TAN',  dist:220, dur:160 },
    { from:'MAR', to:'AGA',  dist:253, dur:180 },
    { from:'MAR', to:'MKN',  dist:323, dur:230 },
    { from:'FES', to:'TAN',  dist:328, dur:240 },
];

let currentMetric = 'Distance';
let allNodes      = {};
let routeMap      = null;
let mapMarkers    = {};
let pathLine      = null;

function setMetric(m) {
    currentMetric = m;
    document.getElementById('metricDistance').classList.toggle('active', m === 'Distance');
    document.getElementById('metricDuration').classList.toggle('active', m === 'Duration');
}

async function initRoutePlanner() {
    try {
        const res = await fetch(`${BASE_URL}/routeplanner/nodes`);
        if (!res.ok) throw new Error();
        allNodes = await res.json();

        document.getElementById('graphNodeCount').textContent =
            `${Object.keys(allNodes).length} noeuds`;

        ['routeFrom','routeTo'].forEach(selId => {
            const sel = document.getElementById(selId);
            sel.innerHTML = '';
            Object.entries(allNodes).forEach(([id, name]) => {
                sel.innerHTML += `<option value="${id}">${name} (${id})</option>`;
            });
        });
        document.getElementById('routeFrom').value = 'CAS';
        document.getElementById('routeTo').value   = 'FES';

        buildMap();
    } catch {
        showToast('Impossible de charger le reseau. API en ligne ?', true);
    }
}

function buildMap() {
    if (routeMap) { routeMap.invalidateSize(); return; }

    routeMap = L.map('routeMap', { zoomControl: true, attributionControl: false })
                .setView([32.5, -6.5], 6);

    // Dark map tile — professional look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd', maxZoom: 19
    }).addTo(routeMap);

    // Draw road network edges
    ROAD_EDGES.forEach(e => {
        const a = NODE_COORDS[e.from], b = NODE_COORDS[e.to];
        if (!a || !b) return;

        L.polyline([[a.lat, a.lng],[b.lat, b.lng]], {
            color: 'rgba(255,255,255,0.18)', weight: 2, dashArray: '5 7'
        }).addTo(routeMap);

        // Distance label at midpoint
        const mid = [(a.lat + b.lat) / 2, (a.lng + b.lng) / 2];
        L.marker(mid, {
            icon: L.divIcon({
                className: '',
                html: `<div class="map-edge-label">${e.dist}km</div>`,
                iconAnchor: [20, 8]
            }),
            interactive: false
        }).addTo(routeMap);
    });

    // Draw city markers
    Object.entries(NODE_COORDS).forEach(([id, node]) => {
        const m = L.marker([node.lat, node.lng], { icon: makeIcon(node.type, false) })
                    .addTo(routeMap);
        m.bindPopup(`
            <div class="map-popup">
                <strong>${node.name}</strong>
                <span class="popup-badge">${typeLabel(node.type)}</span>
                <small>${node.lat.toFixed(4)} N, ${Math.abs(node.lng).toFixed(4)} W</small>
            </div>
        `);
        mapMarkers[id] = m;
    });
}

function typeLabel(t) {
    return { warehouse:'Entrepot', delivery:'Livraison', intermediate:'Transit' }[t] || t;
}

function makeIcon(type, highlighted) {
    const palette = {
        warehouse:    { base:'#f59e0b', glow:'#fcd34d' },
        delivery:     { base:'#6366f1', glow:'#a78bfa' },
        intermediate: { base:'#64748b', glow:'#94a3b8' },
    };
    const c    = palette[type] || palette.intermediate;
    const col  = highlighted ? c.glow : c.base;
    const size = highlighted ? 24 : 16;
    const ring = highlighted ? `box-shadow:0 0 0 5px ${col}44,0 0 20px ${col}77;` : '';
    return L.divIcon({
        className: '',
        html: `<div style="width:${size}px;height:${size}px;background:${col};border:2.5px solid rgba(255,255,255,0.9);border-radius:50%;${ring}transition:all 0.3s;"></div>`,
        iconSize:   [size, size],
        iconAnchor: [size/2, size/2],
    });
}

function highlightPath(pathIds) {
    Object.entries(NODE_COORDS).forEach(([id, node]) => {
        mapMarkers[id]?.setIcon(makeIcon(node.type, false));
    });
    if (pathLine) { routeMap.removeLayer(pathLine); pathLine = null; }
    if (!pathIds || pathIds.length === 0) return;

    pathIds.forEach(id => {
        if (NODE_COORDS[id]) mapMarkers[id]?.setIcon(makeIcon(NODE_COORDS[id].type, true));
    });

    const pts = pathIds.map(id => [NODE_COORDS[id].lat, NODE_COORDS[id].lng]);
    pathLine = L.polyline(pts, {
        color: '#a78bfa', weight: 5, opacity: 0.95,
        dashArray: '14 8', className: 'path-animated'
    }).addTo(routeMap);
    routeMap.fitBounds(pathLine.getBounds(), { padding: [60, 60] });
}

async function runDijkstra() {
    const from = document.getElementById('routeFrom').value;
    const to   = document.getElementById('routeTo').value;
    const btn  = document.getElementById('runDijkstraBtn');

    if (!from || !to) { showToast('Selectionne source et destination.', true); return; }
    if (from === to)  { showToast('Source et destination identiques !', true); return; }

    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Calcul...';
    btn.disabled  = true;

    document.getElementById('allDeliveriesTable').style.display = 'none';
    document.getElementById('routeResultTable').style.display   = 'none';
    document.getElementById('rp-table-section').style.display   = 'none';

    try {
        const res  = await fetch(`${BASE_URL}/routeplanner/shortest-path?from=${from}&to=${to}&metric=${currentMetric}`);
        if (!res.ok) throw new Error((await res.json())?.message || 'Erreur API');
        const data = await res.json();

        highlightPath(data.pathIds);

        // Stats bar
        document.getElementById('routeStatsBar').classList.remove('hidden');
        document.getElementById('resDistance').textContent = `${data.totalDistanceKm} km`;
        document.getElementById('resDuration').textContent = `${data.totalDurationMinutes} min`;
        document.getElementById('resSteps').textContent    = `${data.pathNames.length} etapes`;

        document.getElementById('resPath').innerHTML = data.pathNames.map((n, i) =>
            `<span class="path-chip">${n}</span>${i < data.pathNames.length-1 ? '<i class="fa-solid fa-chevron-right path-arrow"></i>' : ''}`
        ).join('');

        // Step-by-step table
        document.getElementById('routeResultTable').style.display = 'table';
        document.getElementById('rp-table-section').style.display = 'block';
        document.getElementById('rp-table-title').innerHTML = '<i class="fa-solid fa-route"></i> Chemin optimal';

        document.getElementById('routeResultTableBody').innerHTML = data.pathNames.map((name, i) => {
            const isFirst = i === 0;
            const isLast  = i === data.pathNames.length - 1;
            const badge   = isFirst
                ? '<span class="badge-warning">Entrepot</span>'
                : isLast ? '<span class="badge-purple">Destination</span>'
                : '<span class="badge-transit">Transit</span>';
            return `<tr ${isLast ? 'class="row-highlight"' : ''}>
                <td><span class="step-badge">${i+1}</span></td>
                <td><strong>${name}</strong></td>
                <td>${badge}</td>
                <td>${isLast ? `<strong>${data.totalDistanceKm} km</strong>` : (isFirst ? '0 km' : '...')}</td>
                <td>${isLast ? `<strong>${data.totalDurationMinutes} min</strong>` : (isFirst ? '0 min' : '...')}</td>
            </tr>`;
        }).join('');

        showToast(`${data.totalDistanceKm} km - ${data.totalDurationMinutes} min - ${data.pathNames.length} etapes`);
    } catch (err) {
        showToast(err.message || 'Erreur lors du calcul', true);
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-route"></i> Calculer';
        btn.disabled  = false;
    }
}

async function loadAllDeliveries() {
    const from = document.getElementById('routeFrom').value || 'CAS';
    document.getElementById('routeResultTable').style.display   = 'none';
    document.getElementById('routeStatsBar').classList.add('hidden');
    highlightPath([]);

    try {
        const res  = await fetch(`${BASE_URL}/routeplanner/all-delivery-paths?warehouseId=${from}&metric=${currentMetric}`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        document.getElementById('allDeliveriesTable').style.display = 'table';
        document.getElementById('rp-table-section').style.display   = 'block';
        document.getElementById('rp-table-title').innerHTML =
            `<i class="fa-solid fa-list-check"></i> Livraisons depuis ${allNodes[from] || from}`;

        document.getElementById('allDeliveriesBody').innerHTML = data.deliveries.map((d, i) => `
            <tr onclick="highlightPath(${JSON.stringify(d.pathIds || [])})" class="clickable-row" title="Voir sur la carte">
                <td><span class="step-badge">${i+1}</span></td>
                <td><strong>${d.destinationName}</strong></td>
                <td><span class="badge-success">${d.totalDistanceKm} km</span></td>
                <td>${d.totalDurationMinutes} min</td>
                <td class="path-text">${d.pathNames.join(' > ')}</td>
            </tr>
        `).join('');

        showToast(`${data.deliveries.length} routes calculees - cliquer une ligne pour voir sur la carte`);
    } catch {
        showToast('Erreur de chargement', true);
    }
}
