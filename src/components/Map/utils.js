// src/components/Map/utils.js

// Time constants
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = 86400;
const TWO_HOURS_IN_SECONDS = 7200;

/**
 * Formats a timestamp into a human-readable relative time
 * @param {Date} timeStamp - The timestamp to format
 * @returns {string} Formatted time string
 */
export function timeSince(timeStamp) {
    if (!(timeStamp instanceof Date)) {
        throw new Error('timeSince requires a Date object');
    }

    const now = new Date();
    const secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;

    // Less than a minute
    if (secondsPast < SECONDS_IN_MINUTE) {
        return `${parseInt(secondsPast)}s ago`;
    }

    // Less than an hour
    if (secondsPast < SECONDS_IN_HOUR) {
        return `${parseInt(secondsPast / SECONDS_IN_MINUTE)}m ago`;
    }

    // Less than two hours (show hours and minutes)
    if (secondsPast <= TWO_HOURS_IN_SECONDS) {
        const hours = parseInt(secondsPast / SECONDS_IN_HOUR);
        const minutes = parseInt((secondsPast - (hours * SECONDS_IN_HOUR)) / SECONDS_IN_MINUTE);
        return `${hours}h ${minutes}m ago`;
    }

    // Less than a day (show only hours)
    if (secondsPast <= SECONDS_IN_DAY) {
        return `${parseInt(secondsPast / SECONDS_IN_HOUR)}h ago`;
    }

    // More than a day (show date)
    return formatDate(timeStamp, now);
}

/**
 * Formats a date object into a date string
 * @param {Date} timeStamp - The date to format
 * @param {Date} now - The current date for year comparison
 * @returns {string} Formatted date string
 */
function formatDate(timeStamp, now) {
    const day = timeStamp.getDate();
    const month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].trim();
    const year = timeStamp.getFullYear() === now.getFullYear() 
        ? '' 
        : ` ${timeStamp.getFullYear()}`;
    
    return `${day} ${month}${year}`;
}

/**
 * Creates a CSS class name from an agency name
 * @param {string} agency - The agency name
 * @returns {string} Formatted class name
 */
export function createAgencyClass(agency) {
    if (typeof agency !== 'string') {
        throw new Error('Agency name must be a string');
    }

    return `agency-${agency.toLowerCase().replace(/\s+/g, '-')}`;
}