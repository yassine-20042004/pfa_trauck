const API_URL = 'http://localhost:5198/api/v1/drivers';

// DOM Elements
const form = document.getElementById('addDriverForm');
const submitBtn = document.getElementById('submitBtn');
const tableBody = document.getElementById('driversTableBody');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Init
document.addEventListener('DOMContentLoaded', fetchDrivers);

// Form Submit Handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get values
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const licenseNumber = document.getElementById('licenseNumber').value;
    
    // Loading state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Saving...</span>';
    submitBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstName, lastName, licenseNumber })
        });

        if (!response.ok) throw new Error('Failed to create driver');

        // Reset form & refresh
        form.reset();
        showToast('Driver added successfully!');
        await fetchDrivers();
    } catch (error) {
        console.error(error);
        showToast('Error adding driver', true);
    } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
});

// Fetch Drivers
async function fetchDrivers() {
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading...</td></tr>';
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const drivers = await response.json();
        
        if (drivers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center" style="color: var(--text-secondary);">No drivers found. Add one!</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        drivers.forEach(driver => {
            const tr = document.createElement('tr');
            
            // Format ID (first 8 chars)
            const shortId = driver.id.substring(0, 8);
            
            // Status badge
            const statusBadge = driver.isAvailable 
                ? '<span class="badge-success">Available</span>'
                : '<span class="badge-danger">Unavailable</span>';

            tr.innerHTML = `
                <td class="id-cell" title="${driver.id}">#${shortId}</td>
                <td>${driver.firstName}</td>
                <td>${driver.lastName}</td>
                <td><i class="fa-solid fa-id-card" style="color:var(--text-secondary); margin-right:5px"></i> ${driver.licenseNumber}</td>
                <td>${statusBadge}</td>
            `;
            tableBody.appendChild(tr);
        });

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center badge-danger" style="display:table-cell">Error connecting to server. Is the API running?</td></tr>';
    }
}

// Toast logic
function showToast(message, isError = false) {
    toastMessage.textContent = message;
    
    if (isError) {
        toast.style.background = 'var(--danger)';
        toast.querySelector('i').className = 'fa-solid fa-circle-xmark';
    } else {
        toast.style.background = 'var(--success)';
        toast.querySelector('i').className = 'fa-solid fa-circle-check';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
