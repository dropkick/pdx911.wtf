<?php

class FeedHealth {
    private $db;
    private $logger;
    private $thresholds;

    public function __construct($db, $logger) {
        $this->db = $db;
        $this->logger = $logger;
        
        // Define monitoring thresholds
        $this->thresholds = [
            'data_freshness' => 3600,    // 1 hour max age
            'min_hourly_calls' => 5,     // Minimum expected calls per hour
            'max_hourly_calls' => 100,   // Maximum expected calls per hour
            'error_rate_threshold' => 10  // Maximum acceptable error percentage
        ];
    }

    public function checkHealth() {
        $issues = [];
        $warnings = [];
        $metrics = [];

        // Check data freshness
        $lastUpdate = $this->checkDataFreshness();
        if ($lastUpdate['issue']) {
            $issues[] = $lastUpdate['message'];
        }
        $metrics['last_update'] = $lastUpdate['timestamp'];

        // Check call volume
        $volume = $this->checkCallVolume();
        if ($volume['issue']) {
            $issues[] = $volume['message'];
        }
        $metrics['hourly_calls'] = $volume['count'];

        // Check error rates from recent runs
        $errorRates = $this->checkErrorRates();
        if ($errorRates['issue']) {
            $warnings[] = $errorRates['message'];
        }
        $metrics['error_rate'] = $errorRates['rate'];

        // Log health check results
        if (!empty($issues) || !empty($warnings)) {
            $this->logger->log(
                "Health check completed with issues",
                'WARNING',
                [
                    'issues' => $issues,
                    'warnings' => $warnings
                ]
            );
        }

        return [
            'status' => empty($issues) ? 'healthy' : 'unhealthy',
            'issues' => $issues,
            'warnings' => $warnings,
            'metrics' => $metrics
        ];
    }

    private function checkDataFreshness() {
        $query = "SELECT call_updated FROM 911_calls ORDER BY call_updated DESC LIMIT 1";
        $result = $this->db->query($query);
        
        if ($row = $result->fetch_assoc()) {
            $lastUpdate = strtotime($row['call_updated']);
            $timeSince = time() - $lastUpdate;
            
            return [
                'issue' => $timeSince > $this->thresholds['data_freshness'],
                'message' => "No new calls in " . floor($timeSince / 60) . " minutes",
                'timestamp' => $row['call_updated']
            ];
        }

        return [
            'issue' => true,
            'message' => "No calls found in database",
            'timestamp' => null
        ];
    }

    private function checkCallVolume() {
        $query = "SELECT COUNT(*) as count FROM 911_calls WHERE call_updated >= NOW() - INTERVAL 1 HOUR";
        $result = $this->db->query($query);
        $row = $result->fetch_assoc();
        $count = $row['count'];

        $issue = $count < $this->thresholds['min_hourly_calls'] || 
                $count > $this->thresholds['max_hourly_calls'];
        
        return [
            'issue' => $issue,
            'message' => $issue ? "Unusual call volume: {$count} calls in last hour" : "",
            'count' => $count
        ];
    }

    private function checkErrorRates() {
        $stats = $this->logger->getRecentStats(10);
        if (empty($stats)) {
            return [
                'issue' => false,
                'message' => '',
                'rate' => 0
            ];
        }

        $totalErrors = 0;
        $totalProcessed = 0;
        foreach ($stats as $run) {
            $totalErrors += $run['errors'];
            $totalProcessed += $run['processed'];
        }

        $errorRate = $totalProcessed > 0 
            ? ($totalErrors / $totalProcessed) * 100 
            : 0;

        return [
            'issue' => $errorRate > $this->thresholds['error_rate_threshold'],
            'message' => $errorRate > $this->thresholds['error_rate_threshold'] 
                ? "High error rate: " . round($errorRate, 1) . "% in recent runs"
                : "",
            'rate' => round($errorRate, 1)
        ];
    }

    public function getHealthStatusHtml() {
        $health = $this->checkHealth();
        $html = '<div class="health-status">';
        
        // Overall status
        $statusClass = $health['status'] === 'healthy' ? 'success' : 'error';
        $html .= "<h3 class='$statusClass'>System Status: " . 
                ucfirst($health['status']) . "</h3>";

        // Issues
        if (!empty($health['issues'])) {
            $html .= "<div class='error'><h4>Issues:</h4><ul>";
            foreach ($health['issues'] as $issue) {
                $html .= "<li>$issue</li>";
            }
            $html .= "</ul></div>";
        }

        // Warnings
        if (!empty($health['warnings'])) {
            $html .= "<div class='warning'><h4>Warnings:</h4><ul>";
            foreach ($health['warnings'] as $warning) {
                $html .= "<li>$warning</li>";
            }
            $html .= "</ul></div>";
        }

        $html .= "</div>";
        return $html;
    }
}