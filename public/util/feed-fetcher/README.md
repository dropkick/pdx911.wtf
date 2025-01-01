# PDX911 Feed Fetcher

Part of the PDX911.wtf project, this component fetches and processes 911 dispatch calls from Portland's public feed and stores them in a database.

## Structure

```
util/
└── feed-fetcher/
├── index.php # Main processing script
├── includes/
│ ├── logging.php # Logging functionality
│ └── health.php # Health monitoring
└── logs/ # Auto-generated directory
├── feed-fetcher.log # Current processing log
├── feed-fetcher.log.* # Rotated log archives
└── feed-stats.json # Processing statistics```


## System Status Display

The system status page (`/util/feed-fetcher/`) shows the current health of the feed processing system.

### Status Indicators

* `System Status: Healthy` (green) - All systems operating normally
* `System Status: Unhealthy` (red) - Issues detected

### Monitored Conditions

#### Data Freshness
* Checks the timestamp of most recent call
* Issue triggered if no new calls in last 60 minutes
* Display: "No new calls in X minutes"

#### Call Volume
* Monitors number of calls in last hour
* Issues triggered if:
  * Less than 5 calls per hour
  * More than 100 calls per hour
* Display: "Unusual call volume: X calls in last hour"

#### Error Rates
* Monitors processing errors across last 10 runs
* Warning triggered if error rate exceeds 10%
* Display: "High error rate: X% in recent runs"

### Sample Status Messages

System Status: Healthy

System Status: Unhealthy

Issues:
• No new calls in 65 minutes
• Unusual call volume: 2 calls in last hour

Warnings:
• High error rate: 12.5% in recent runs



## Processing Statistics

Each feed processing run logs:
* Number of calls processed
* Number of errors encountered
* Processing duration in milliseconds

## Logging

Logs are maintained in the `logs` directory:
* `feed-fetcher.log` - Current processing log
* `feed-fetcher.log.[timestamp].gz` - Rotated log archives
* `feed-stats.json` - Processing statistics for last 100 runs

Logs are automatically rotated when they reach 5MB in size.

## Usage

### Web Access
Visit `/util/feed-fetcher/` to view:
* Current system status
* Latest processing results
* Recent error messages

### Cron Setup
Recommended cron configuration (every 5 minutes):
```bash
*/5 * * * * /usr/bin/php /path/to/feed-fetcher/index.php >> /path/to/feed-fetcher/logs/cron.log 2>&1


Dependencies
- PHP 7.4+
- MySQL/MariaDB
- PHP Extensions:
    - curl
    - mysqli
    - simplexml
    - dom
    - zlib (for log compression)

