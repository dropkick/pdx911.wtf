// src/components/Map/ui.js
import { timeSince, createAgencyClass } from './utils.js';
import { flyToCall } from './mapControls.js';
import { loadCalls, loadMoreCalls } from './dataLoader.js';

// UI Initialization
export function initializeUI(map) {
    const toggleButton = document.getElementById('list-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    toggleButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        sidebar.classList.add('show');
        
        if (sidebar.style.left === '0px' || getComputedStyle(sidebar).left === '0px') {
            sidebar.classList.remove('show');
        }
    });
}

// Popup Management
export function createPopUp(map, currentFeature) {
    const popUps = document.getElementsByClassName('mapboxgl-popup');
    if (popUps[0]) popUps[0].remove();

    const agencyClass = createAgencyClass(currentFeature.properties.agency);

    return new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(`
            <h3 class="${agencyClass}">${currentFeature.properties.label}</h3>
            <h4 class="location">${currentFeature.properties.address}</h4>
            <h4 class="agency ${agencyClass}">${currentFeature.properties.agency}</h4>
            <h4 class="time">${currentFeature.properties.friendly_timestamp}</h4>
        `)
        .addTo(map);
}

// List Item Creation
function createListItem(map, call, index) {
    const listing = document.createElement('div');
    listing.className = 'item';
    listing.id = `listing-${index}`;

    const link = document.createElement('a');
    link.href = '#';
    
    const recastTimestamp = new Date(call.properties.timestamp * 1000);
    
    link.innerHTML = `
        <div class="title">${call.properties.address}</div>
        <div class="label">${call.properties.label}</div>
        <div class="agency">${call.properties.agency}</div>
        <div class="time">${call.properties.friendly_timestamp} &mdash; 
            <span class="relative-time">about ${timeSince(recastTimestamp)}</span>
        </div>
    `;

    link.addEventListener('click', (e) => {
        e.preventDefault();
        flyToCall(map, call);
        createPopUp(map, call);
        highlightListItem(listing);
        hideMobileSidebar();
    });

    listing.appendChild(link);
    return listing;
}

// Pagination
function createPager(map, data, offset, currentMarkers) {
    const pager = document.createElement('div');
    pager.className = 'pager';
    
    const { firstTimestamp, lastTimestamp } = getTimeRange(data);
    
    if (offset > 0) {
        pager.innerHTML = createPagerWithRange(firstTimestamp, lastTimestamp, offset);
        setupPagerEvents(pager, map, offset, currentMarkers);
    } else {
        pager.innerHTML = createInitialPager();
        setupInitialPagerEvents(pager, map, currentMarkers);
    }
    
    return pager;
}

function setupPagerEvents(pager, map, offset, currentMarkers) {
    const newerBtn = pager.querySelector('.newer-btn');
    const olderBtn = pager.querySelector('.older-btn');

    newerBtn?.addEventListener('click', () => {
        const newOffset = offset <= 50 ? 0 : offset - 50;
        loadCalls(map, currentMarkers, newOffset);
    });

    olderBtn?.addEventListener('click', () => {
        loadMoreCalls(map, offset + 50, currentMarkers);
    });
}

// Helper Functions
function getTimeRange(data) {
    const firstCall = data.features[0].properties;
    const lastCall = data.features[data.features.length - 1].properties;
    return {
        firstTimestamp: new Date(firstCall.timestamp * 1000),
        lastTimestamp: new Date(lastCall.timestamp * 1000)
    };
}

function createPagerWithRange(firstTimestamp, lastTimestamp, offset) {
    return `
        <div class="date-range">Showing calls from ${timeSince(firstTimestamp)} to ${timeSince(lastTimestamp)}</div>
        <div class="pager-buttons">
            <button class="newer-btn" ${offset <= 50 ? 'disabled' : ''}>← Newer</button>
            <button class="older-btn">Older →</button>
        </div>
    `;
}

function createInitialPager() {
    return `
        <div class="pager-buttons">
            <button class="older-btn">Older →</button>
        </div>
    `;
}

function setupInitialPagerEvents(pager, map, currentMarkers) {
    pager.querySelector('.older-btn').addEventListener('click', () => {
        loadMoreCalls(map, 50, currentMarkers);
    });
}

function highlightListItem(listing) {
    const activeItem = document.getElementsByClassName('active')[0];
    if (activeItem) {
        activeItem.classList.remove('active');
    }
    listing.classList.add('active');
}

function hideMobileSidebar() {
    document.querySelector('.sidebar').classList.remove('show');
}

// Main List Building
export function buildLocationList(map, data, currentMarkers, offset = 0) {
    const listings = document.getElementById('listings');
    
    if (!listings.querySelector('.item')) {
        listings.innerHTML = '';
    }

    // Add top pager if not on first page
    if (offset > 0) {
        const topPager = createPager(map, data, offset, currentMarkers);
        topPager.classList.add('pager-top');
        listings.appendChild(topPager);
    }

    // Create and populate items container
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'items-container';
    data.features.forEach((call, i) => {
        itemsContainer.appendChild(createListItem(map, call, i));
    });
    listings.appendChild(itemsContainer);

    // Add bottom pager
    const bottomPager = createPager(map, data, offset, currentMarkers);
    bottomPager.classList.add('pager-bottom');
    listings.appendChild(bottomPager);

    // Scroll to top
    listings.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}