<?php
// koneksi.php
// Kredensial dibaca dari environment variable bila tersedia, agar tidak perlu
// menaruh password asli di dalam repository.
//   DB_HOST, DB_NAME, DB_USER, DB_PASS
$host     = getenv('DB_HOST') ?: '127.0.0.1';
$dbname   = getenv('DB_NAME') ?: 'db_laundryku';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') === false ? '' : (string) getenv('DB_PASS');

$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    // Tangani error koneksi
    die("Koneksi database gagal: " . $e->getMessage());
}
?>
