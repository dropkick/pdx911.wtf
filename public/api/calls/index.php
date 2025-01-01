<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');


// Allow CORS if needed
header('Access-Control-Allow-Origin: *');

// Get offset from query string
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

try {
    require_once('../../db-config.php'); // Adjust path as needed
    
    // Connect to database
    $db = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
        or throw new Exception("Database connection failed: " . mysqli_connect_error());

    // Get calls with offset
    $query = "SELECT * FROM 911_calls ORDER BY call_updated DESC LIMIT 50 OFFSET ?";
    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, 'i', $offset);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    // Build GeoJSON
    $features = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $features[] = [
            'type' => 'Feature',
            'geometry' => [
                'type' => 'Point',
                'coordinates' => [
                    floatval($row['longitude']),
                    floatval($row['latitude'])
                ]
            ],
            'properties' => [
                'label' => $row['call_category'],
                'address' => $row['call_text_address'],
                'agency' => $row['agency'],
                'timestamp' => strtotime($row['call_updated']),
                'friendly_timestamp' => date('M j g:i A', strtotime($row['call_updated']))
            ]
        ];
    }

    $geojson = [
        'type' => 'FeatureCollection',
        'features' => $features
    ];

    echo json_encode($geojson);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch calls',
        'message' => $e->getMessage()
    ]);
}

mysqli_close($db);