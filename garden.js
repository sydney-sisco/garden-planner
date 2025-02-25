const GRID_WIDTH = 8;
const GRID_HEIGHT = 4;
const gardenContainer = document.getElementById('garden');

// List of plant for the catalog
const catalogItems = [
    { id: 'corn', src: 'media/corn.svg' },
    { id: 'potato', src: 'media/potato.svg' },
    { id: 'cabbage', src: 'media/cabbage.svg' },
    { id: 'garlic', src: 'media/garlic.svg' },
    { id: 'lettuce', src: 'media/lettuce.svg' },
    { id: 'tomato', src: 'media/tomato.svg' },
];

// populate the catalog
function createPlantCatalog(items) {
    const catalogContainer = document.getElementById('catalog');

    items.forEach(item => {
        const catalogItem = document.createElement('div');
        catalogItem.className = 'catalog-item';

        const img = document.createElement('img');
        img.src = item.src;
        img.draggable = true;
        img.id = `catalog-${item.id}`;
        img.ondragstart = drag;

        catalogItem.appendChild(img);
        catalogContainer.appendChild(catalogItem);
    });
}
createPlantCatalog(catalogItems);

// garden is stored in a 2d array
const gardenGrid = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(null));

// create the garden grid in the DOM
function createGardenGrid(width, height) {
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.ondrop = drop;
            gridItem.ondragover = allowDrop;
            gridItem.dataset.row = row;
            gridItem.dataset.col = col;

            const vegetable = gardenGrid[row][col];
            if (vegetable) {
                const img = document.createElement('img');
                img.src = `${vegetable}.svg`;
                img.draggable = true;
                img.id = `veg-${row}-${col}`;
                img.ondragstart = drag;
                gridItem.appendChild(img);
            }

            gardenContainer.appendChild(gridItem);
        }
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);

    let destinationGridItem = ev.target.tagName === 'IMG' ? ev.target.parentElement : ev.target;

    if (!destinationGridItem.classList.contains('grid-item')) return;

    const destRow = destinationGridItem.dataset.row;
    const destCol = destinationGridItem.dataset.col;

    if (data.startsWith('catalog-')) {
        if (destinationGridItem.childElementCount === 0) {
            const plantType = data.split('-')[1];

            const img = document.createElement('img');
            img.src = `media/${plantType}.svg`;
            img.draggable = true;
            img.id = `veg-${Date.now()}`; // Unique ID for each plant instance
            img.ondragstart = drag;

            gardenGrid[destRow][destCol] = plantType;
            destinationGridItem.appendChild(img);
        }
    } else {
        const originalGridItem = draggedElement.parentElement;
        const origRow = originalGridItem.dataset.row;
        const origCol = originalGridItem.dataset.col;

        const tempElement = destinationGridItem.firstChild;

        destinationGridItem.appendChild(draggedElement);
        if (tempElement) {
            originalGridItem.appendChild(tempElement);
        }

        [gardenGrid[origRow][origCol], gardenGrid[destRow][destCol]] =
            [gardenGrid[destRow][destCol], gardenGrid[origRow][origCol]];
    }
    saveGardenState();
}

function trashDrop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);

    if (draggedElement) {
        const originalGridItem = draggedElement.parentElement;
        const origRow = originalGridItem.dataset.row;
        const origCol = originalGridItem.dataset.col;

        // Remove the item from the DOM
        originalGridItem.removeChild(draggedElement);

        // Clear the corresponding grid position
        gardenGrid[origRow][origCol] = null;

        // Save the updated state
        saveGardenState();
    }
}

function clearGardenGrid() {
    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            gardenGrid[row][col] = null;
        }
    }

    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => {
        item.textContent = '';
    });

    localStorage.removeItem(LOCAL_STORAGE_KEY);
}

// Key for local storage
const LOCAL_STORAGE_KEY = 'gardenState';
// Function to save the garden state to local storage
function saveGardenState() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gardenGrid));
}
// Function to load the garden state from local storage
function loadGardenState() {
    const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedState) {
        const loadedGrid = JSON.parse(storedState);
        for (let row = 0; row < GRID_HEIGHT; row++) {
            for (let col = 0; col < GRID_WIDTH; col++) {
                gardenGrid[row][col] = loadedGrid[row][col];
                const gridItem = document.querySelector(`.grid-item[data-row='${row}'][data-col='${col}']`);
                gridItem.textContent = '';
                if (gardenGrid[row][col]) {
                    const img = document.createElement('img');
                    img.src = `media/${gardenGrid[row][col]}.svg`;
                    img.draggable = true;
                    img.id = `veg-${row}-${col}`;
                    img.ondragstart = drag;
                    gridItem.appendChild(img);
                }
            }
        }
    }
}

// Call this function on page load to initialize the garden state
document.addEventListener('DOMContentLoaded', () => {
    loadGardenState();
});

// Initialize the garden grid
createGardenGrid(GRID_WIDTH, GRID_HEIGHT);
