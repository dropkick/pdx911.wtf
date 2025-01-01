// src/components/Map/mapControls.js
import { mapConfig } from './config.js';  // Add .js extension
import { loadCalls } from './dataLoader.js';  // Add .js extension

// Helper functions
function clearPopups() {
    const popUps = document.getElementsByClassName('mapboxgl-popup');
    if (popUps[0]) popUps[0].remove();
}

// Map navigation
export function flyToCall(map, currentFeature) {
    map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 13
    });
}

function resetMapView(map) {
    clearPopups();
    map.flyTo({
        bearing: mapConfig.initialView.bearing,
        center: mapConfig.initialView.center,
        pitch: mapConfig.initialView.pitch,
        zoom: mapConfig.initialView.zoom
    });
}

// Control initialization
export function initializeMapControls(map) {
    const resetBtn = document.getElementById('reset');
    const reloadBtn = document.getElementById('reload');
    const listToggle = document.getElementById('list-toggle');

    // Reset view handler
    resetBtn.addEventListener('click', () => {
        resetMapView(map);
    });

    // Reload data handler
    reloadBtn.addEventListener('click', () => {
        clearPopups();
        reloadBtn.classList.add('loading');
        loadCalls(map, [], 0); // Reset to first page with fresh markers array
    });

    // Sidebar toggle handler
    listToggle.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('show');
    });
}