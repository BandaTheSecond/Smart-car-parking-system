const API_URL = 'http://localhost:3000';

let carParks = [];
let selectedCarParkId = null;

async function fetchCarParks() {
    const res = await fetch(`${API_URL}/carParks`);
    carParks = await res.json();
    return carParks;
}

async function fetchHistory() {
    const res = await fetch(`${API_URL}/history`);
    return res.json();
}

async function updateSpot(carParkId, spotId, data) {
    const carPark = carParks.find(cp => cp.id === carParkId);
    if (!carPark) return;
    const spotIndex = carPark.spots.findIndex(s => s.id === spotId);
    if (spotIndex === -1) return;
    carPark.spots[spotIndex] = { ...carPark.spots[spotIndex], ...data };
    await fetch(`${API_URL}/carParks/${carParkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spots: carPark.spots })
    });
}

async function addHistory(entry) {
    await fetch(`${API_URL}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    });
}

function renderAllCarParks() {
    const container = document.getElementById('car-parks-container');
    container.innerHTML = '';
    carParks.forEach(carPark => {
        const card = document.createElement('div');
        card.className = 'car-park-card';

        const title = document.createElement('h3');
        title.textContent = carPark.name;
        card.appendChild(title);

        const lot = document.createElement('div');
        lot.className = 'parking-lot';
        lot.setAttribute('data-car-park-id', carPark.id);

        carPark.spots.forEach(spot => {
            const div = document.createElement('div');
            div.className = `spot ${spot.occupied ? 'occupied' : 'free'}`;
            div.innerHTML = `
                <strong>Spot ${spot.id}</strong><br>
                ${spot.occupied ? spot.car : 'Free'}<br>
                <span class="spot-price">Ksh ${spot.price}</span>
            `;
            div.onclick = async () => {
                if (spot.occupied) {
                    if (confirm(`Remove car ${spot.car} from spot ${spot.id} at ${carPark.name}?`)) {
                        await updateSpot(carPark.id, spot.id, { occupied: false, car: null });
                        await addHistory({
                            carParkId: carPark.id,
                            carParkName: carPark.name,
                            spotId: spot.id,
                            car: spot.car,
                            price: spot.price,
                            time: new Date().toLocaleString(),
                            action: 'Left'
                        });
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

function renderCarParkSelect() {
    // For the park form
    const select = document.getElementById('car-park-select');
    select.innerHTML = '';
    carParks.forEach(park => {
        const option = document.createElement('option');
        option.value = park.id;
        option.textContent = park.name;
        select.appendChild(option);
    });
    selectedCarParkId = parseInt(select.value);
    select.onchange = () => {
        selectedCarParkId = parseInt(select.value);
    };
}

async function renderHistory() {
    const allHistory = await fetchHistory();
    const list = document.getElementById('history-list');
    list.innerHTML = '';
    allHistory.slice(-15).reverse().forEach(entry => {
        const priceInfo = entry.price ? `, Ksh ${entry.price}` : '';
        const li = document.createElement('li');
        li.textContent = `[${entry.time}] Car ${entry.car} ${entry.action} Spot ${entry.spotId} (${entry.carParkName}${priceInfo})`;
        list.appendChild(li);
    });
}

document.getElementById('park-form').onsubmit = async (e) => {
    e.preventDefault();
    const carNumber = document.getElementById('car-number').value.trim();
    const select = document.getElementById('car-park-select');
    const carParkId = parseInt(select.value);

    if (!carNumber) return;
    const carPark = carParks.find(cp => cp.id === carParkId);
    if (!carPark) return;
    const freeSpot = carPark.spots.find(s => !s.occupied);
    if (!freeSpot) {
        alert('No free spots in ' + carPark.name + '!');
        return;
    }
    await updateSpot(carPark.id, freeSpot.id, { occupied: true, car: carNumber });
    await addHistory({
        carParkId: carPark.id,
        carParkName: carPark.name,
        spotId: freeSpot.id,
        car: carNumber,
        price: freeSpot.price,
        time: new Date().toLocaleString(),
        action: 'Parked'
    });
    document.getElementById('car-number').value = '';
    await fetchCarParks();
    renderAllCarParks();
    renderHistory();
    renderCarParkSelect();
};

// Initial load
(async function init() {
    await fetchCarParks();
    renderAllCarParks();
    renderCarParkSelect();
    renderHistory();
})();