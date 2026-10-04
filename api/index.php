<?php
/**
 * LaundryKu — REST API sederhana (PHP + MySQL).
 *
 * Menjamur:
 *   GET  ?action=list_orders            -> array pesanan (JSON)
 *   POST ?action=sync_orders            -> menyimpan array pesanan dari frontend
 *
 * Memakai koneksi PDO yang sama dengan koneksi.php.
 * Bila database tidak tersedia, API mengembalikan error dan frontend
 * otomatis memakai localStorage sebagai sumber data.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../koneksi.php';

function respond(bool $ok, $data = null, string $error = '', int $code = 200): void
{
    http_response_code($code);
    echo json_encode(
        ['ok' => $ok, 'data' => $data, 'error' => $error],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

/** Siapkan tabel bila belum ada (idempotent). */
function ensureSchema(PDO $pdo): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS pelanggan (
            id_pelanggan VARCHAR(36) PRIMARY KEY,
            nama         VARCHAR(100) NOT NULL,
            no_hp        VARCHAR(30),
            alamat       TEXT,
            created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS kurir (
            id_kurir     VARCHAR(36) PRIMARY KEY,
            nama         VARCHAR(100) NOT NULL,
            no_hp        VARCHAR(30),
            kendaraan    VARCHAR(60),
            created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS layanan (
            id_layanan      VARCHAR(36) PRIMARY KEY,
            nama_layanan    VARCHAR(100) NOT NULL,
            harga_per_kg    DECIMAL(12,2) NOT NULL,
            created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS transaksi (
            id_transaksi     VARCHAR(36) PRIMARY KEY,
            id_pelanggan    VARCHAR(36) NOT NULL,
            id_kurir        VARCHAR(36) NULL,
            nama_kurir      VARCHAR(100) NULL,
            tanggal_masuk    DATETIME NOT NULL,
            tanggal_selesai  DATETIME NULL,
            total_bayar      DECIMAL(12,2) NOT NULL DEFAULT 0,
            metode_ambil     VARCHAR(50) NULL,
            status           VARCHAR(50) NOT NULL,
            created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_transaksi_pelanggan FOREIGN KEY (id_pelanggan)
                REFERENCES pelanggan(id_pelanggan) ON DELETE CASCADE,
            CONSTRAINT fk_transaksi_kurir FOREIGN KEY (id_kurir)
                REFERENCES kurir(id_kurir) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS detail_layanan (
            id_detail     INT AUTO_INCREMENT PRIMARY KEY,
            id_transaksi  VARCHAR(36) NOT NULL,
            id_layanan    VARCHAR(36) NOT NULL,
            berat_kg      DECIMAL(8,3) NULL,
            subtotal      DECIMAL(12,2) NULL,
            CONSTRAINT fk_detail_transaksi FOREIGN KEY (id_transaksi)
                REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
            CONSTRAINT fk_detail_layanan FOREIGN KEY (id_layanan)
                REFERENCES layanan(id_layanan) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // Kolom ringkasan untuk Antioch Order, mencakup kedua tahap pengiriman.
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS pesanan (
            id                VARCHAR(36) PRIMARY KEY,
            id_transaksi      VARCHAR(36) NULL,
            id_pelanggan      VARCHAR(36) NOT NULL,
            nama_pelanggan    VARCHAR(100) NOT NULL,
            no_hp             VARCHAR(30),
            alamat            TEXT,
            id_layanan        VARCHAR(36) NOT NULL,
            nama_layanan      VARCHAR(100) NOT NULL,
            berat_kg          DECIMAL(8,3) NOT NULL,
            harga_per_kg      DECIMAL(12,2) NOT NULL,
            total             DECIMAL(12,2) NOT NULL,
            catatan           TEXT,
            tanggal_pesanan   DATE NOT NULL,
            status_laundry    VARCHAR(40) NOT NULL,
            status_bayar      VARCHAR(30) NOT NULL,
            metode_bayar      VARCHAR(60) NULL,
            tanggal_bayar     DATE NULL,
            jemput_aktif      TINYINT(1) NOT NULL DEFAULT 1,
            jemput_status     VARCHAR(40) NOT NULL DEFAULT 'Menunggu Kurir',
            antar_aktif       TINYINT(1) NOT NULL DEFAULT 1,
            antar_status      VARCHAR(40) NOT NULL DEFAULT 'Menunggu Kurir',
            id_kurir          VARCHAR(36) NULL,
            nama_kurir        VARCHAR(100) NULL,
            tanggal_jemput    DATE NULL,
            jam_jemput        TIME NULL,
            tanggal_antar     DATE NULL,
            jam_antar         TIME NULL,
            jumlah_ubah_jadwal INT NOT NULL DEFAULT 0,
            dibatalkan         TINYINT(1) NOT NULL DEFAULT 0,
            alasan_batal      VARCHAR(255) NULL,
            batal_at          DATETIME NULL,
            dibuat_at         DATETIME NULL,
            CONSTRAINT fk_pesanan_pelanggan FOREIGN KEY (id_pelanggan)
                REFERENCES pelanggan(id_pelanggan) ON DELETE CASCADE,
            CONSTRAINT fk_pesanan_kurir FOREIGN KEY (id_kurir)
                REFERENCES kurir(id_kurir) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

/** Ubah payload frontend menjadi baris tabel. */
function rowFromOrder(array $o): array
{
    $d = $o['delivery'] ?? [];
    $pickup = $d['pickup'] ?? ['enabled' => true, 'status' => 'Menunggu Kurir'];
    $delivery = $d['delivery'] ?? ['enabled' => true, 'status' => 'Menunggu Kurir'];
    $cancelled = $o['cancelled'] ?? null;

    return [
        ':id'               => (string) ($o['id'] ?? ''),
        ':id_transaksi'     => 'TRX-' . preg_replace('/[^0-9]/', '', (string) ($o['id'] ?? '0')),
        ':id_pelanggan'     => (string) ($o['customerId'] ?? 'u-customer'),
        ':nama_pelanggan'   => (string) ($o['customerName'] ?? ''),
        ':no_hp'            => (string) ($o['customerPhone'] ?? ''),
        ':alamat'           => (string) ($o['customerAddress'] ?? ''),
        ':id_layanan'       => (string) ($o['serviceId'] ?? 'svc-cuci-kering'),
        ':nama_layanan'     => (string) ($o['serviceName'] ?? ''),
        ':berat_kg'         => (float) ($o['weightKg'] ?? 0),
        ':harga_per_kg'     => (float) ($o['pricePerKg'] ?? 0),
        ':total'            => (float) ($o['total'] ?? 0),
        ':catatan'          => rtrim((string) ($o['note'] ?? '')),
        ':tanggal_pesanan'  => (string) ($o['orderDate'] ?? date('Y-m-d')),
        ':status_laundry'   => (string) ($o['laundryStatus'] ?? 'Pesanan Dibuat'),
        ':status_bayar'     => (string) ($o['paymentStatus'] ?? 'Belum Dibayar'),
        ':metode_bayar'     => $o['paymentMethod'] ?? null,
        ':tanggal_bayar'    => $o['paymentDate'] ?? null,
        ':jemput_aktif'     => !empty($pickup['enabled']) ? 1 : 0,
        ':jemput_status'    => (string) ($pickup['status'] ?? 'Menunggu Kurir'),
        ':antar_aktif'      => !empty($delivery['enabled']) ? 1 : 0,
        ':antar_status'     => (string) ($delivery['status'] ?? 'Menunggu Kurir'),
        ':id_kurir'         => $d['courierId'] ?? null,
        ':nama_kurir'       => $d['courierName'] ?? null,
        ':tanggal_jemput'   => $d['date'] ?? null,
        ':jam_jemput'       => $d['time'] ?? null,
        ':tanggal_antar'    => $d['destDate'] ?? null,
        ':jam_antar'        => $d['destTime'] ?? null,
        ':jumlah_ubah'      => (int) ($d['rescheduleCount'] ?? 0),
        ':dibatalkan'       => $cancelled ? 1 : 0,
        ':alasan_batal'     => $cancelled['reason'] ?? null,
        ':batal_at'         => $cancelled['at'] ?? null,
    ];
}

function orderFromRow(array $r): array
{
    return [
        'id'                => $r['id'],
        'customerId'        => $r['id_pelanggan'],
        'customerName'      => $r['nama_pelanggan'],
        'customerPhone'     => $r['no_hp'],
        'customerAddress'   => $r['alamat'],
        'serviceId'         => $r['id_layanan'],
        'weightKg'          => (float) $r['berat_kg'],
        'pricePerKg'        => (float) $r['harga_per_kg'],
        'total'             => (float) $r['total'],
        'note'              => (string) ($r['catatan'] ?? ''),
        'orderDate'         => $r['tanggal_pesanan'],
        'laundryStatus'     => $r['status_laundry'],
        'paymentStatus'     => $r['status_bayar'],
        'paymentMethod'     => $r['metode_bayar'],
        'paymentDate'       => $r['tanggal_bayar'],
        'delivery'          => [
            'pickup'  => [
                'enabled' => (bool) $r['jemput_aktif'],
                'status'  => $r['jemput_status'],
            ],
            'delivery' => [
                'enabled' => (bool) $r['antar_aktif'],
                'status'  => $r['antar_status'],
            ],
            'courierId'        => $r['id_kurir'],
            'courierName'      => $r['nama_kurir'],
            'date'             => $r['tanggal_jemput'],
            'time'             => $r['jam_jemput'],
            'destDate'         => $r['tanggal_antar'],
            'destTime'         => $r['jam_antar'],
            'rescheduleCount'  => (int) $r['jumlah_ubah_jadwal'],
        ],
        'cancelled' => $r['dibatalkan']
            ? ['at' => $r['batal_at'], 'reason' => $r['alasan_batal'], 'by' => 'Pelanggan']
            : null,
    ];
}

try {
    $action = $_GET['action'] ?? '';

    if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'list_orders') {
        $stmt = $pdo->query("SELECT * FROM pesanan ORDER BY tanggal_pesanan DESC, id DESC");
        $out = array_map('orderFromRow', $stmt->fetchAll(PDO::FETCH_ASSOC));
        respond(true, $out);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'sync_orders') {
        $raw = file_get_contents('php://input');
        $body = json_decode($raw ?: '[]', true);
        $orders = $body['orders'] ?? null;
        if (!is_array($orders)) {
            respond(false, null, 'Payload orders tidak valid', 400);
        }

        // Serialisasi sinkronisasi memakai named lock MySQL supaya dua request
        // tidak saling mengunci baris yang sama (deadlock 1213 / lock wait 1205).
        $acquired = false;
        for ($i = 0; $i < 30; $i++) {
            if ((int) $pdo->query("SELECT GET_LOCK('laundryku_sync', 1)")->fetchColumn() === 1) {
                $acquired = true;
                break;
            }
            usleep(100000);
        }
        if (!$acquired) {
            respond(true, ['saved' => 0]);
        }

        $pdo->beginTransaction();

        // Pelanggan & kurir direferensikan, jadi harus ada lebih dulu.
        $stmtP = $pdo->prepare(
            'INSERT INTO pelanggan (id_pelanggan, nama, no_hp, alamat)
             VALUES (:id, :nama, :hp, :alamat)
             ON DUPLICATE KEY UPDATE nama = VALUES(nama), no_hp = VALUES(no_hp), alamat = VALUES(alamat)'
        );
        $stmtK = $pdo->prepare(
            'INSERT INTO kurir (id_kurir, nama, no_hp, kendaraan)
             VALUES (:id, :nama, :hp, :kendaraan)
             ON DUPLICATE KEY UPDATE nama = VALUES(nama), no_hp = VALUES(no_hp), kendaraan = VALUES(kendaraan)'
        );
        $stmtL = $pdo->prepare(
            'INSERT INTO layanan (id_layanan, nama_layanan, harga_per_kg)
             VALUES (:id, :nama, :harga)
             ON DUPLICATE KEY UPDATE nama_layanan = VALUES(nama_layanan), harga_per_kg = VALUES(harga_per_kg)'
        );

        $layananDefault = [
            ['svc-cuci-kering', 'Cuci Kering', 10000],
            ['svc-cuci-setrika', 'Cuci Setrika', 12000],
            ['svc-setrika', 'Setrika', 8000],
            ['svc-express', 'Express', 18000],
        ];
        foreach ($layananDefault as [$id, $nama, $harga]) {
            $stmtL->execute([':id' => $id, ':nama' => $nama, ':harga' => $harga]);
        }

        $sql = 'INSERT INTO pesanan (
                    id, id_transaksi, id_pelanggan, nama_pelanggan, no_hp, alamat,
                    id_layanan, nama_layanan, berat_kg, harga_per_kg, total, catatan,
                    tanggal_pesanan, status_laundry, status_bayar, metode_bayar, tanggal_bayar,
                    jemput_aktif, jemput_status, antar_aktif, antar_status,
                    id_kurir, nama_kurir, tanggal_jemput, jam_jemput, tanggal_antar, jam_antar,
                    jumlah_ubah_jadwal, dibatalkan, alasan_batal, batal_at, dibuat_at
                ) VALUES (
                    :id, :id_transaksi, :id_pelanggan, :nama_pelanggan, :no_hp, :alamat,
                    :id_layanan, :nama_layanan, :berat_kg, :harga_per_kg, :total, :catatan,
                    :tanggal_pesanan, :status_laundry, :status_bayar, :metode_bayar, :tanggal_bayar,
                    :jemput_aktif, :jemput_status, :antar_aktif, :antar_status,
                    :id_kurir, :nama_kurir, :tanggal_jemput, :jam_jemput, :tanggal_antar, :jam_antar,
                    :jumlah_ubah, :dibatalkan, :alasan_batal, :batal_at, NOW()
                )
                ON DUPLICATE KEY UPDATE
                    nama_pelanggan = VALUES(nama_pelanggan),
                    no_hp = VALUES(no_hp),
                    alamat = VALUES(alamat),
                    berat_kg = VALUES(berat_kg),
                    total = VALUES(total),
                    catatan = VALUES(catatan),
                    status_laundry = VALUES(status_laundry),
                    status_bayar = VALUES(status_bayar),
                    metode_bayar = VALUES(metode_bayar),
                    tanggal_bayar = VALUES(tanggal_bayar),
                    jemput_aktif = VALUES(jemput_aktif),
                    jemput_status = VALUES(jemput_status),
                    antar_aktif = VALUES(antar_aktif),
                    antar_status = VALUES(antar_status),
                    id_kurir = VALUES(id_kurir),
                    nama_kurir = VALUES(nama_kurir),
                    tanggal_jemput = VALUES(tanggal_jemput),
                    jam_jemput = VALUES(jam_jemput),
                    tanggal_antar = VALUES(tanggal_antar),
                    jam_antar = VALUES(jam_antar),
                    jumlah_ubah_jadwal = VALUES(jumlah_ubah_jadwal),
                    dibatalkan = VALUES(dibatalkan),
                    alasan_batal = VALUES(alasan_batal),
                    batal_at = VALUES(batal_at)';
        $stmt = $pdo->prepare($sql);

        $saved = 0;
        foreach ($orders as $o) {
            if (!is_array($o) || empty($o['id'])) {
                continue;
            }

            $stmtP->execute([
                ':id'     => $o['customerId'] ?? 'u-customer',
                ':nama'   => $o['customerName'] ?? '',
                ':hp'     => $o['customerPhone'] ?? '',
                ':alamat' => $o['customerAddress'] ?? '',
            ]);

            $courierId = $o['delivery']['courierId'] ?? null;
            if ($courierId) {
                $stmtK->execute([
                    ':id'   => $courierId,
                    ':nama' => $o['delivery']['courierName'] ?? 'Kurir',
                    ':hp'   => $o['delivery']['courierPhone'] ?? '',
                    ':kendaraan' => $o['delivery']['courierVehicle'] ?? '',
                ]);
            }

            $row = rowFromOrder($o);
            $stmt->execute($row);
            $saved++;
        }

        $pdo->commit();
        $pdo->query("SELECT RELEASE_LOCK('laundryku_sync')");
        respond(true, ['saved' => $saved]);
    }

    respond(false, null, 'Aksi tidak dikenal: ' . $action, 404);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    if (isset($pdo)) {
        try {
            $pdo->query("SELECT RELEASE_LOCK('laundryku_sync')");
        } catch (Throwable $ignored) {
            // lock memang tidak dipegang
        }
    }
    respond(false, null, 'Database error: ' . $e->getMessage(), 500);
}