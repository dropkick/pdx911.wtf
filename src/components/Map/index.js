import { mapConfig } from './config.js';
import { initializeMapControls } from './mapControls.js';
import { initializeUI } from './ui.js';
import { loadCalls } from './dataLoader.js';

// Global state
let map;
let currentMarkers = [];
let callsOffset = 0;

export function initializeMap() {
    try {
        // Initialize Mapbox
        mapboxgl.accessToken = mapConfig.mapboxToken;
        
        // Create map instance
        map = new mapboxgl.Map({
            container: 'map',
            style: mapConfig.style,
            center: mapConfig.initialView.center,
            pitch: mapConfig.initialView.pitch,
            bearing: mapConfig.initialView.bearing,
            zoom: mapConfig.initialView.zoom,
            trackUserLocation: false,
            collectResourceTiming: false,
            maxBounds: mapConfig.bounds,
            trackResize: false,
            enableFreeCameraControls: false,
            attributionControl: true,
            customAttribution: 'PDX911'
        });

        // Add standard controls
        map.addControl(new mapboxgl.NavigationControl());
        map.addControl(new mapboxgl.FullscreenControl());

        // Initialize components when map is ready
        map.on('load', () => {
            initializeMapControls(map);
            initializeUI(map);
            loadCalls(map, currentMarkers, callsOffset);
        });

    } catch (error) {
        console.error('Map initialization error:', error);
        // Could add more user-friendly error handling here if needed
    }
}