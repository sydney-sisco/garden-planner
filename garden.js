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

const garden = {
    plots: [],
}

function newPlot() {
    const widthInput = document.getElementById("width");
    const heightInput = document.getElementById("height");

    const width = parseInt(widthInput.value) || 4;
    const height = parseInt(heightInput.value) || 4;

    const newPlot = {
        width: width,
        height: height,
        plants: Array.from({ length: height }, () => Array(width).fill(null))
    };

    if(!garden.plots) garden.plots = [];

    garden.plots.push(newPlot);

    createPlotGrid(newPlot, garden.plots.length - 1);

    saveGardenState();

    widthInput.value = 8;
    heightInput.value = 4;
}
addButtonEl = document.getElementById('addButton')
addButtonEl.addEventListener('click', newPlot);

// Create a plot grid in the DOM for a given plot
function createPlotGrid(plot, plotIndex) {
    const plotContainer = document.createElement('div');
    plotContainer.className = 'plot-container';
    plotContainer.dataset.plotIndex = plotIndex;

    // Set the grid-template-columns style inline based on plot width
    plotContainer.style.gridTemplateColumns = `repeat(${plot.width}, var(--size))`;

    for (let row = 0; row < plot.height; row++) {
        for (let col = 0; col < plot.width; col++) {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.ondrop = drop;
            gridItem.ondragover = allowDrop;
            gridItem.dataset.row = row;
            gridItem.dataset.col = col;

            const vegetable = plot.plants[row][col];
            if (vegetable) {
                const img = document.createElement('img');
                img.src = `media/${vegetable}.svg`;
                img.draggable = true;
                img.id = `veg-${plotIndex}-${row}-${col}`;
                img.ondragstart = drag;
                gridItem.appendChild(img);
            }

            plotContainer.appendChild(gridItem);
        }
    }
    gardenContainer.appendChild(plotContainer);
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

    const destRow = parseInt(destinationGridItem.dataset.row);
    const destCol = parseInt(destinationGridItem.dataset.col);
    const plotIndex = parseInt(destinationGridItem.closest('.plot-container').dataset.plotIndex);

    const plot = garden.plots[plotIndex];

    if (data.startsWith('catalog-')) {
        if (destinationGridItem.childElementCount === 0) {
            const plantType = data.split('-')[1];

            const img = document.createElement('img');
            img.src = `media/${plantType}.svg`;
            img.draggable = true;
            img.id = `veg-${Date.now()}`; // Unique ID for each plant instance
            img.ondragstart = drag;

            plot.plants[destRow][destCol] = plantType;
            destinationGridItem.appendChild(img);
        }
    } else {
        const originalGridItem = draggedElement.parentElement;
        const origRow = parseInt(originalGridItem.dataset.row);
        const origCol = parseInt(originalGridItem.dataset.col);
        const origPlotIndex = parseInt(originalGridItem.closest('.plot-container').dataset.plotIndex);

        const originalPlot = garden.plots[origPlotIndex];

        const tempElement = destinationGridItem.firstChild;

        destinationGridItem.appendChild(draggedElement);
        if (tempElement) {
            originalGridItem.appendChild(tempElement);
        }

        [originalPlot.plants[origRow][origCol], plot.plants[destRow][destCol]] = [plot.plants[destRow][destCol], originalPlot.plants[origRow][origCol]];
    }
    saveGardenState();
}

function trashDrop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);

    if (draggedElement) {
        const originalGridItem = draggedElement.parentElement;
        const origRow = parseInt(originalGridItem.dataset.row);
        const origCol = parseInt(originalGridItem.dataset.col);
        const plotIndex = parseInt(originalGridItem.closest('.plot-container').dataset.plotIndex);

        // Remove the item from the DOM
        originalGridItem.removeChild(draggedElement);

        // Clear the corresponding position in the plot
        garden.plots[plotIndex].plants[origRow][origCol] = null;

        // Save the updated state
        saveGardenState();
    }
}

function clearGardenGrid() {
    // delete the plots
    garden.plots = [];

    // clear the dom
    gardenContainer.innerHTML = '';

    localStorage.removeItem(LOCAL_STORAGE_KEY);
}

const LOCAL_STORAGE_KEY = 'gardenState';
// save the garden state to local storage
function saveGardenState() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(garden));
}

// load the garden state from local storage into garden variable
function loadGardenState() {
    const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedState) {
        const loadedGarden = JSON.parse(storedState);
        garden.plots = loadedGarden.plots;
    }
}

// Initialize garden state
document.addEventListener('DOMContentLoaded', () => {

    // load state from local storage
    loadGardenState();

    if (garden.plots) {
        // add plots to dom
        garden.plots.forEach((plot, index) => {
            createPlotGrid(plot, index);
        });
    }
});
