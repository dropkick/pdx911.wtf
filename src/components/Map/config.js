// src/components/Map/config.js

/**
 * Portland metro area coordinates
 */
const PORTLAND_COORDS = {
    // City center coordinates
    CENTER: [-122.662579, 45.504842],
    
    // Map boundaries
    BOUNDS: {
        SOUTHWEST: [-122.836728, 45.420],
        NORTHEAST: [-122.35765, 45.700]
    }
};

/**
 * Default map view settings
 */
const DEFAULT_VIEW = {
    center: PORTLAND_COORDS.CENTER,
    pitch: 54,
    bearing: 0.00,
    zoom: 11.5
};

/**
 * Main map configuration
 * @typedef {Object} MapConfig
 * @property {string} mapboxToken - Mapbox API token
 * @property {Object} initialView - Initial map view settings
 * @property {Array<Array<number>>} bounds - Map boundaries
 * @property {string} style - Mapbox style URL
 */
export const mapConfig = {
    // Mapbox configuration
    mapboxToken: import.meta.env.PUBLIC_MAPBOX_TOKEN,
    style: 'mapbox://styles/dropkick/cjtks53x85c4q1flj2cmi857z',
    
    // Map view settings
    initialView: DEFAULT_VIEW,
    bounds: [
        PORTLAND_COORDS.BOUNDS.SOUTHWEST,
        PORTLAND_COORDS.BOUNDS.NORTHEAST
    ]
};

/**
 * API configuration
 */
export const apiConfig = {
    CALLS_PER_PAGE: 50,
    UPDATE_INTERVAL: 5 * 60 * 1000, // 5 minutes in milliseconds
    ENDPOINTS: {
        CALLS: '/api/calls'
    }
};