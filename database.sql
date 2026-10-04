-- ============================================================
-- LaundryKu — Sistem Informasi Pemesanan Laundry
-- MySQL / MariaDB
-- Dipakai oleh api/index.php (PHP + PDO)
-- ============================================================

-- ---------- Master data ----------

CREATE TABLE IF NOT EXISTS pelanggan (
    id_pelanggan VARCHAR(36) PRIMARY KEY,
    nama         VARCHAR(100) NOT NULL,
    no_hp        VARCHAR(30),
    alamat       TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS kurir (
    id_kurir     VARCHAR(36) PRIMARY KEY,
    nama         VARCHAR(100) NOT NULL,
    no_hp        VARCHAR(30),
    kendaraan    VARCHAR(60),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS layanan (
    id_layanan   VARCHAR(36) PRIMARY KEY,
    nama_layanan VARCHAR(100) NOT NULL,
    harga_per_kg DECIMAL(12,2) NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Transaksi laundry ----------

CREATE TABLE IF NOT EXISTS transaksi (
    id_transaksi  VARCHAR(36) PRIMARY KEY,
    id_pelanggan  VARCHAR(36) NOT NULL,
    id_kurir      VARCHAR(36) NULL,
    nama_kurir    VARCHAR(100) NULL,
    tanggal_masuk DATETIME NOT NULL,
    estimasi_selesai DATETIME NULL,
    tanggal_selesai   DATETIME NULL,
    total_bayar   DECIMAL(12,2) NOT NULL DEFAULT 0,
    metode_ambil  VARCHAR(50) NULL,
    status        VARCHAR(50) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX fk_transaksi_pelanggan_idx (id_pelanggan),
    INDEX fk_transaksi_kurir_idx (id_kurir),
    CONSTRAINT fk_transaksi_pelanggan FOREIGN KEY (id_pelanggan)
        REFERENCES pelanggan(id_pelanggan) ON DELETE CASCADE,
    CONSTRAINT fk_transaksi_kurir FOREIGN KEY (id_kurir)
        REFERENCES kurir(id_kurir) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS detail_layanan (
    id_detail    INT AUTO_INCREMENT PRIMARY KEY,
    id_transaksi VARCHAR(36) NOT NULL,
    id_layanan   VARCHAR(36) NOT NULL,
    berat_kg     DECIMAL(8,3) NULL,
    subtotal     DECIMAL(12,2) NULL,
    INDEX fk_detail_transaksi_idx (id_transaksi),
    INDEX fk_detail_layanan_idx (id_layanan),
    CONSTRAINT fk_detail_transaksi FOREIGN KEY (id_transaksi)
        REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
    CONSTRAINT fk_detail_layanan FOREIGN KEY (id_layanan)
        REFERENCES layanan(id_layanan) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Pesanan (ringkasan untuk Antioch Order) ----------
-- Menyimpan kedua tahap pengiriman secara terpisah:
--   jemput_* = tahap 1 (pelanggan -> outlet)
--   antar_*  = tahap 2 (outlet -> pelanggan)

CREATE TABLE IF NOT EXISTS pesanan (
    id                 VARCHAR(36) PRIMARY KEY,
    id_transaksi       VARCHAR(36) NULL,
    id_pelanggan       VARCHAR(36) NOT NULL,
    nama_pelanggan     VARCHAR(100) NOT NULL,
    no_hp              VARCHAR(30),
    alamat             TEXT,
    id_layanan         VARCHAR(36) NOT NULL,
    nama_layanan       VARCHAR(100) NOT NULL,
    berat_kg           DECIMAL(8,3) NOT NULL,
    harga_per_kg       DECIMAL(12,2) NOT NULL,
    total              DECIMAL(12,2) NOT NULL,
    catatan            TEXT,
    tanggal_pesanan    DATE NOT NULL,
    status_laundry     VARCHAR(40) NOT NULL,
    status_bayar       VARCHAR(30) NOT NULL,
    metode_bayar       VARCHAR(60) NULL,
    tanggal_bayar      DATE NULL,
    jemput_aktif       TINYINT(1) NOT NULL DEFAULT 1,
    jemput_status      VARCHAR(40) NOT NULL DEFAULT 'Menunggu Kurir',
    antar_aktif        TINYINT(1) NOT NULL DEFAULT 1,
    antar_status       VARCHAR(40) NOT NULL DEFAULT 'Menunggu Kurir',
    id_kurir           VARCHAR(36) NULL,
    nama_kurir         VARCHAR(100) NULL,
    tanggal_jemput     DATE NULL,
    jam_jemput         TIME NULL,
    tanggal_antar      DATE NULL,
    jam_antar          TIME NULL,
    jumlah_ubah_jadwal INT NOT NULL DEFAULT 0,
    dibatalkan         TINYINT(1) NOT NULL DEFAULT 0,
    alasan_batal       VARCHAR(255) NULL,
    batal_at           DATETIME NULL,
    dibuat_at          DATETIME NULL,
    INDEX fk_pesanan_pelanggan_idx (id_pelanggan),
    INDEX fk_pesanan_kurir_idx (id_kurir),
    CONSTRAINT fk_pesanan_pelanggan FOREIGN KEY (id_pelanggan)
        REFERENCES pelanggan(id_pelanggan) ON DELETE CASCADE,
    CONSTRAINT fk_pesanan_kurir FOREIGN KEY (id_kurir)
        REFERENCES kurir(id_kurir) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Data contoh ----------

INSERT IGNORE INTO layanan (id_layanan, nama_layanan, harga_per_kg) VALUES
    ('svc-cuci-kering',   'Cuci Kering',   10000),
    ('svc-cuci-setrika',  'Cuci Setrika',  12000),
    ('svc-setrika',       'Setrika',        8000),
    ('svc-express',       'Express',       18000);