<?php
// in includes/logging.php
class FeedLogger {
    private $logDir;
    private $logFile;
    private $statsFile;
    private $maxLogSize;
    private $isCron;

    public function __construct($isCron) {
        $this->logDir = __DIR__ . '/../logs';  // Updated path
        $this->logFile = $this->logDir . '/feed-fetcher.log';
        $this->statsFile = $this->logDir . '/feed-stats.json';
        $this->maxLogSize = 5 * 1024 * 1024; // 5MB
        $this->isCron = $isCron;

        $this->ensureLogDirectory();
        $this->rotateLogIfNeeded();
    }

    private function ensureLogDirectory() {
        if (!file_exists($this->logDir)) {
            mkdir($this->logDir, 0755, true);
        }
    }

    private function rotateLogIfNeeded() {
        if (file_exists($this->logFile) && filesize($this->logFile) > $this->maxLogSize) {
            $archiveFile = $this->logFile . '.' . date('Y-m-d-His') . '.gz';
            file_put_contents(
                'compress.zlib://' . $archiveFile,
                file_get_contents($this->logFile)
            );
            unlink($this->logFile);
        }
    }

    public function log($message, $type = 'INFO', $context = []) {
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = empty($context) ? '' : ' ' . json_encode($context);
        $logEntry = "[$timestamp] [$type] " . strip_tags($message) . $contextStr . "\n";
        
        if ($this->isCron) {
            file_put_contents($this->logFile, $logEntry, FILE_APPEND);
        }
        
        // Always output for web view
        $this->outputMessage($this->formatMessageForDisplay($message, $type));
    }

    public function updateStats($stats) {
        $stats['timestamp'] = date('Y-m-d H:i:s');
        
        $existingStats = file_exists($this->statsFile) 
            ? json_decode(file_get_contents($this->statsFile), true) 
            : [];
        
        array_unshift($existingStats, $stats);
        $existingStats = array_slice($existingStats, 0, 100); // Keep last 100 runs
        
        file_put_contents($this->statsFile, json_encode($existingStats, JSON_PRETTY_PRINT));
    }

    public function getRecentStats($limit = 100) {
        if (!file_exists($this->statsFile)) {
            return [];
        }
        return json_decode(file_get_contents($this->statsFile), true);
    }

    private function formatMessageForDisplay($message, $type) {
        $typeClasses = [
            'INFO' => 'info',
            'SUCCESS' => 'success',
            'ERROR' => 'error',
            'WARNING' => 'warning'
        ];
        
        $class = $typeClasses[$type] ?? 'info';
        return "<span class='$class'>$message</span>";
    }

    public function outputMessage($message) {
        if ($this->isCron) {
            echo strip_tags($message) . "\n";
        } else {
            echo $message . "<br>\n";
        }
    }
}