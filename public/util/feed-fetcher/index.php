<?php
$isCron = php_sapi_name() === 'cli';

// Include dependencies
require_once('../../../pdx911-db-config.php');
require_once('includes/logging.php');
require_once('includes/health.php');

// Initialize logger and establish database connection
try {
    $logger = new FeedLogger($isCron);
    $link = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
    
    if (!$link) {
        throw new Exception("Database connection failed: " . mysqli_connect_error());
    }
    
    $health = new FeedHealth($link, $logger);
} catch (Exception $e) {
    die("Initialization error: " . $e->getMessage());
}

// Output HTML header for web access
if (!$isCron) {
    echo "<!DOCTYPE html>
<html>
<head>
    <title>PDX911 Feed Fetcher Status</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 0 20px;
            line-height: 1.6;
        }
        .success { color: #2a9d8f; }
        .error { color: #e63946; }
        .info { color: #457b9d; }
        .warning { color: #ee9b00; }
        pre { 
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .health-status {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .metrics {
            background: #fff;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
        }
        .metrics ul {
            list-style: none;
            padding: 0;
        }
        .metrics li {
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
    </style>
</head>
<body>
    <h1>PDX911 Feed Fetcher</h1>";

    echo $health->getHealthStatusHtml();
    echo "<h2>Status Report</h2><pre>";
}

// Process the feed
$startTime = microtime(true);
$processed = 0;
$errors = 0;

try {
    $logger->log("Starting feed fetch", 'INFO');
    
    // Fetch feed data
    $ch = curl_init("https://www.portlandmaps.com/scripts/911incidents.cfm");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10
    ]);
    
    $data = curl_exec($ch);
    if (curl_errno($ch)) {
        throw new Exception("Feed fetch failed: " . curl_error($ch));
    }
    curl_close($ch);
    
    $logger->log("Feed fetched successfully", 'SUCCESS');
    
    // Process calls
    $calls = new SimpleXMLElement($data);
    foreach ($calls->entry as $call) {
        try {
            // Extract call data
            $call_id = substr($call->id, -13);
            $timestamp = $call->updated;
            $category = $call->category['label'] ?: "UNDESCRIBED INCIDENT";
            
            // Parse HTML content
            $d = new DOMDocument();
            @$d->loadHTML($call->content);
            $defs = $d->getElementsByTagName('dd');
            $agency = $defs->item(3)->nodeValue;
            $text_address = $defs->item(2)->nodeValue;
            
            // Get coordinates
            $ns_georss = $call->children('http://www.georss.org/georss');
            list($latitude, $longitude) = explode(" ", $ns_georss->point);
            
            // Insert/update database
            $query = "INSERT INTO 911_calls 
                        (call_id, agency, call_category, call_text_address, 
                         latitude, longitude, call_updated) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        agency = VALUES(agency),
                        call_category = VALUES(call_category),
                        call_text_address = VALUES(call_text_address),
                        latitude = VALUES(latitude),
                        longitude = VALUES(longitude),
                        call_updated = VALUES(call_updated)";
            
            $stmt = $link->prepare($query);
            $stmt->bind_param(
                'ssssdds',
                $call_id, $agency, $category, $text_address,
                $latitude, $longitude, $timestamp
            );
            
            if (!$stmt->execute()) {
                throw new Exception("Data insertion error: " . $stmt->error);
            }
            $stmt->close();
            $processed++;
            
        } catch (Exception $e) {
            $logger->log(
                "Error processing call {$call_id}: " . $e->getMessage(),
                'ERROR',
                ['call_id' => $call_id]
            );
            $errors++;
        }
    }
    
    // Log completion stats
    $duration = round((microtime(true) - $startTime) * 1000);
    $stats = [
        'processed' => $processed,
        'errors' => $errors,
        'duration_ms' => $duration
    ];
    
    $logger->updateStats($stats);
    $logger->log("Feed processing complete", 'SUCCESS', $stats);
    
    // Run health check if running as cron
    if ($isCron) {
        $healthStatus = $health->checkHealth();
        if ($healthStatus['status'] !== 'healthy') {
            $logger->log(
                "Health check detected issues",
                'WARNING',
                [
                    'issues' => $healthStatus['issues'],
                    'warnings' => $healthStatus['warnings']
                ]
            );
        }
    }
    
} catch (Exception $e) {
    $logger->log("Critical error: " . $e->getMessage(), 'ERROR');
} finally {
    mysqli_close($link);
}

// Output HTML footer for web access
if (!$isCron) {
    echo "</pre>
    <p><small>Last modified: " . date('Y-m-d H:i:s', filemtime(__FILE__)) . "</small></p>
</body>
</html>";
}