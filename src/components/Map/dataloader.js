// src/components/Map/dataLoader.js
import { flyToCall } from './mapControls.js';
import { createPopUp, buildLocationList } from './ui.js';
import { handleError, displayError } from './utils/errors.js';

// Marker creation
function createMarker(map, call) {
    const el = document.createElement('div');
    
    // Set marker classes based on agency and type
    const agencyClass = call.properties.agency
        .toLowerCase()
        .replace(/\s+/g, '-');
    
    el.className = `marker ${agencyClass}`;
    
    if (call.properties.label.includes('MED - MEDICAL') || 
        call.properties.label.includes('EMS ONLY')) {
        el.className += ' agency-medical';
    }

    // Create and position marker
    const marker = new mapboxgl.Marker(el)
        .setLngLat(call.geometry.coordinates)
        .addTo(map);

    // Add interaction handlers
    el.addEventListener('click', () => {
        flyToCall(map, call);
        createPopUp(map, call);
    });

    return marker;
}

// Marker management
function clearMarkers(currentMarkers) {
    if (currentMarkers.length) {
        currentMarkers.forEach(marker => marker.remove());
        currentMarkers.length = 0;  // Clear array more efficiently
    }
}

// Data loading
export async function loadCalls(map, currentMarkers, offset = 0) {
    const listings = document.getElementById('listings');
    const reloadBtn = document.getElementById('reload');
    
    try {
        // Show loading state
        listings.classList.add('loading');
        listings.innerHTML = '<p class="status">Loading calls...</p>';
        reloadBtn?.classList.add('loading');
        
        // Fetch data
        const response = await fetch(`/api/calls${offset ? `?offset=${offset}` : ''}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Update markers
        clearMarkers(currentMarkers);
        data.features.forEach(call => {
            currentMarkers.push(createMarker(map, call));
        });

        // Update UI
        buildLocationList(map, data, currentMarkers, offset);
        
    } catch (error) {
        const errorType = error.message.includes('HTTP error') ? 'API' : 'DATA';
        const handledError = handleError(error, errorType);
        displayError(listings, handledError);
    } finally {
        listings.classList.remove('loading');
        reloadBtn?.classList.remove('loading');
    }
}

export async function loadMoreCalls(map, newOffset, currentMarkers) {
    const listings = document.getElementById('listings');
    
    try {
        // Show loading state
        listings.classList.add('loading');
        listings.innerHTML = '<p class="status">Loading calls...</p>';
        
        // Fetch data
        const response = await fetch(`/api/calls?offset=${newOffset}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
                
        if (!data.features.length) {
            newOffset -= 50;
            return;
        }

        // Update markers
        clearMarkers(currentMarkers);
        data.features.forEach(call => {
            currentMarkers.push(createMarker(map, call));
        });

        // Update UI
        listings.innerHTML = '';
        buildLocationList(map, data, currentMarkers, newOffset);
        
    } catch (error) {
        const handledError = handleError(error, 'API');
        displayError(listings, handledError);
    } finally {
        listings.classList.remove('loading');
    }
}