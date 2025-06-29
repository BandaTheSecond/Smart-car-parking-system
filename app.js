const API_URL = 'http://localhost:3000';

let carParks = [];//Array to store all car parks data
let selectedCarParkId = null;
//Fetch car parks from the server
async function fetchCarParks() {
    const res = await fetch(`${API_URL}/carParks`);
    carParks = await res.json();
    return carParks;
}
//Fetch car park history from the server
async function fetchHistory() {
    const res = await fetch(`${API_URL}/history`);
    return res.json();
}
//Updates a parking spot's status
async function updateSpot(carParkId, spotId, data) {
    const carPark = carParks.find(cp => cp.id === carParkId);
    if (!carPark) return;
    const spotIndex = carPark.spots.findIndex(s => s.id === spotId);
    if (spotIndex === -1) return;
    carPark.spots[spotIndex] = { ...carPark.spots[spotIndex], ...data };
    // Update the car park on the server
    await fetch(`${API_URL}/carParks/${carParkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spots: carPark.spots })
    });
}
// Send update to server to add a new entry to history
async function addHistory(entry) {
    await fetch(`${API_URL}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    });
}
//Rendering all car parks and their spots to the UI
function renderAllCarParks() {
    const container = document.getElementById('car-parks-container');
    container.innerHTML = '';//Clear previous content
    // Create a card for each car park
    carParks.forEach(carPark => {
        const card = document.createElement('div');
        card.className = 'car-park-card';
     // Add car park name
        const title = document.createElement('h3');
        title.textContent = carPark.name;
        card.appendChild(title);

     // Create container for parking spots
        const lot = document.createElement('div');
        lot.className = 'parking-lot';
        lot.setAttribute('data-car-park-id', carPark.id);
     // Create each parking spot element
        carPark.spots.forEach(spot => {
            const div = document.createElement('div');
            div.className = `spot ${spot.occupied ? 'occupied' : 'free'}`;
            div.innerHTML = `
                <strong>Spot ${spot.id}</strong><br>
                ${spot.occupied ? spot.car : 'Free'}<br>
                <span class="spot-price">Ksh ${spot.price}</span>
            `;
            // Click handler for spots
            div.onclick = async () => {
                if (spot.occupied) {
                    if (confirm(`Remove car ${spot.car} from spot ${spot.id} at ${carPark.name}?`)) {
                        // Update spot to mark as free
                        await updateSpot(carPark.id, spot.id, { occupied: false, car: null });
                         // Add history entry
                        await addHistory({
                            carParkId: carPark.id,
                            carParkName: carPark.name,
                            spotId: spot.id,
                            car: spot.car,
                            price: spot.price,
                            time: new Date().toLocaleString(),
                            action: 'Left'
                        });
                        // Refresh all data and UI
                        await fetchCarParks();
                        renderAllCarParks();
                        renderHistory();
                        renderCarParkSelect();
                    }
                }
            };
            lot.appendChild(div);
        });

        card.appendChild(lot);
        container.appendChild(card);
    });
}
//Renders the car park dropdown selector
function renderCarParkSelect() {
    // For the park form
    const select = document.getElementById('car-park-select');
    select.innerHTML = '';

    // Add an option for each car park
    carParks.forEach(park => {
        const option = document.createElement('option');
        option.value = park.id;
        option.textContent = park.name;
        select.appendChild(option);
    });
     // Set initial selected value and change handler
    selectedCarParkId = parseInt(select.value);
    select.onchange = () => {
        selectedCarParkId = parseInt(select.value);
    };
}

async function renderHistory() {
    const allHistory = await fetchHistory();
    const list = document.getElementById('history-list');
    list.innerHTML = '';
    // Show last 15 entries in reverse order (newest first)
    allHistory.slice(-15).reverse().forEach(entry => {
        const priceInfo = entry.price ? `, Ksh ${entry.price}` : '';
        const li = document.createElement('li');
        li.textContent = `[${entry.time}] Car ${entry.car} ${entry.action} Spot ${entry.spotId} (${entry.carParkName}${priceInfo})`;
        list.appendChild(li);
    });
}

// Form submission handler for parking a car
document.getElementById('park-form').onsubmit = async (e) => {
    e.preventDefault();
    const carNumber = document.getElementById('car-number').value.trim();
    const select = document.getElementById('car-park-select');
    const carParkId = parseInt(select.value);
 // Find selected car park
    if (!carNumber) return;
    const carPark = carParks.find(cp => cp.id === carParkId);
    if (!carPark) return;

    // Find first available spot
    const freeSpot = carPark.spots.find(s => !s.occupied);
    if (!freeSpot) {
        alert('Parking spots fully booked in ' + carPark.name + '!');
        return;
    }
     // Update spot to mark as occupied
    await updateSpot(carPark.id, freeSpot.id, { occupied: true, car: carNumber });
    // Add history entry
    await addHistory({
        carParkId: carPark.id,
        carParkName: carPark.name,
        spotId: freeSpot.id,
        car: carNumber,
        price: freeSpot.price,
        time: new Date().toLocaleString(),
        action: 'Parked'
    });
    // Reset form and refresh UI
    document.getElementById('car-number').value = '';
    await fetchCarParks();
    renderAllCarParks();
    renderHistory();
    renderCarParkSelect();
};

// Initial load of our page
(async function init() {
    await fetchCarParks();
    renderAllCarParks();
    renderCarParkSelect();
    renderHistory();
})();