# PDX911.wtf

A close to real-time map displaying Portland area 911 dispatch calls.

Data is sourced from City of Portland's public 911 dispatch feed and replicated locally every 5 minutes.

View it live at [PDX911.wtf](https://pdx911.wtf)

## Overview

The application consists of three main components:

1. Data collection system that pulls from Portland's public 911 feed
2. Database storing call information
3. Interactive web map displaying the calls

## Structure

```
pdx911.wtf/
├── src/ # Source files for Astro site
│ ├── components/
│ │ └── Map/ # Map component files
│ │ ├── config.js # Map configuration
│ │ ├── dataLoader.js # Data loading/processing
│ │ ├── index.js # Main map initialization
│ │ ├── mapControls.js # Map control functionality
│ │ ├── ui.js # UI components
│ │ └── utils.js # Utility functions
│ └── pages/
│ └── index.astro # Main page
│
├── public/
│ ├── api/
│ │ └── calls/
│ │ └── index.php # API endpoint
│ ├── assets/
│ │ ├── css/
│ │ ├── fonts/
│ │ └── img/
│ └── util/
│ ├── feed-fetcher/ # Feed processing system
│ └── logs/ # Log directory
│
├── db-config.php # database access credentials (place 1 level above public web root)
├── db-structure.sql # SQL to build DB table
└── README.md
```

## Features

### Interactive Map

- Displays 50 most recent calls
- Color-coded markers by agency type
- Click markers for call details
- Mobile-responsive design
- Pagination for viewing older calls

### Data Display

- Agency responding
- Call type
- Approximate location (cross streets)
- Relative time ("3 minutes ago")
- List view of all displayed calls

### Agencies Displayed

- Portland Police
- Portland Fire (mostly fire alarm calls here)
- Multnomah County Sheriff (no longer included in source data)
- Medical Response (no longer included in source data)

## Technical Details

### Built With

- [Astro](https://astro.build)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/)
- JavaScript
- PHP
- MySQL/MariaDB

### Data Flow

1. Cron job runs every 5 minutes
2. Fetches XML feed from Portland Maps
3. Processes and stores in database
4. Front end fetches from database via API
5. Displays on map and in list view

## Feed Fetcher

The feed processing component runs every 5 minutes to update the database. See [Feed Fetcher README](util/feed-fetcher/README.md) for details.

### System Status

Available at `/util/feed-fetcher/`

- Monitors data freshness
- Tracks call volume
- Reports processing errors
- Maintains processing logs

## Development

### Prerequisites

- PHP 7.4+
- MySQL/MariaDB
- Node.js 16+
- Mapbox API key

### Setup

1. Clone repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create database and import schema
4. Copy example configs and update:
5. cp pdx911-db-config.example.php pdx911-db-config.php

6.Create .env file:
`PUBLIC_MAPBOX_TOKEN="your_token_here"`

Development Server
`npm run dev`

Build
`npm run build`

Deployment

1. Build the site:
`npm run build`
2. Upload contents of dist/ to web root
3. Import database structure from db-structure.sql
4. Populate db-config.php with database access credentials and place 1 level above public web root
5. Set up feed fetcher cron job:
`*/5 * * * * /usr/bin/php /path/to/feed-fetcher/index.php`
OR via http
`*/5 * * * * /usr/bin/curl --silent --compressed https://pdx911.wtf/util/feed-fetcher/`

License
MIT License

Acknowledgments

- Data provided by [City of Portland](https://www.portland.gov/open-data-statistics-and-maps)- Design and Development by [DROPKICK](https://dropkickdesign.com)
