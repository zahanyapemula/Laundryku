# LaundryKu — Sistem Informasi Pemesanan Laundry

Prototype web untuk tugas **Prototyping Tools & Feedback Developer/User**.
Satu aplikasi terhubung untuk tiga role: **Pelanggan**, **Admin/Kasir**, dan **Kurir**.

## Teknologi

- React 18 + TypeScript + Vite
- Tailwind CSS v4 (design system lewat `@theme`)
- lucide-react, react-router-dom
- Backend opsional: PHP 8 + MySQL (Laragon) — `api/index.php`
- Penyimpanan cadangan: localStorage (aplikasi tetap berjalan penuh tanpa backend)

## Menjalankan

### 1. Tanpa backend (paling cepat)

```bash
npm install
npm run dev
```

Aplikasi langsung jalan dengan data lokal.

### 2. Dengan MySQL sungguhan

```bash
# a) buat database & tabel
mysql -u root -e "CREATE DATABASE IF NOT EXISTS db_laundryku CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root db_laundryku < database.sql

# b) sesuaikan kredensial database
#    koneksi.php membaca environment variable DB_HOST / DB_NAME / DB_USER / DB_PASS
#    dan jatuh ke default localhost bila belum diatur. Contoh:
#    DB_USER=root DB_PASS=rahasia php -S 127.0.0.1:5199 -t api

# c) jalankan backend PHP di terminal terpisah
php -S 127.0.0.1:5199 -t api

# d) jalankan frontend
npm run dev
```

Vite mem-proxy `/api/*` ke `127.0.0.1:5199`. Bila server PHP dimatikan, aplikasi
otomatis kembali ke localStorage tanpa error.

Perintah lain: `npm run build`, `npm run typecheck`.

## Akun Demo

Password seluruh akun demo: `laundry123`

| Role | Email | Nama |
| --- | --- | --- |
| Pelanggan | `customer@laundry.com` | Andi |
| Admin/Kasir | `admin@laundry.com` | Rina Admin |
| Kurir | `courier@laundry.com` | Budi |

Kurir tambahan: `sari@laundry.com`, `dimas@laundry.com`.

## Fitur Utama

### Pengiriman 2 tahap (dipisah)

Setiap pesanan punya dua tahap yang berdiri sendiri dan bisa diaktifkan/dinginkan:

1. **Tahap 1 — Penjemputan**: kurir mengambil laundry dari pelanggan ke outlet.
2. **Tahap 2 — Pengantaran**: laundry diantar dari outlet ke alamat pelanggan.

Masing-masing tahap punya status sendiri: `Menunggu Kurir → Kurir Ditugaskan →
Dalam Perjalanan → Selesai`, beserta jadwal tanggal/jam sendiri.

Konsekuensi otomatis di sistem:
- Penjemputan selesai → status laundry menjadi **Diproses**, tahap 2 siap dijalankan.
- Pengantaran selesai → status laundry menjadi **Selesai**, pelanggan diberi notifikasi.
- Kalau pelanggan memilih ambil sendiri, tahap yang tidak dipakai ditandai "Ambil di Outlet".

Di Dashboard Kurir, satu pesanan dapat muncul sebagai **dua tugas terpisah**.

### Popup dialog interaktif

Semua aksi penting membuka dialog, bukan hanya toast:

| Aksi | Dialog |
| --- | --- |
| Pesanan dibuat | Sukses + pilihan lanjut ke detail / dashboard |
| Pembayaran dikonfirmasi | Sukses + pilihan lacak status laundry |
| Status laundry diubah (admin) | Sukses, informsikan pelanggan sudah diberi tahu |
| Kurir ditugaskan | Sukses, tugas otomatis masuk dashboard kurir |
| Kurir mulai / selesai tugas | Info berjalan / Sukses + notifikasi pelanggan |
| Jadwal diubah | Sukses + info kurir diberi tahu |
| Pesanan dibatalkan | Konfirmasi dulu (batal) lalu sukses |

Dialog konfirmasi dipakai untuk aksi merusak (batal pesanan). Halaman daftar pesanan
juga punya dialog konfirmasi sebelum pembatalan.

### Invoice cetak

`/pelanggan/pesanan/:id/invoice` — invoice siap cetak (nomor INV otomatis, rincian
layanan, rincian biaya 2 tahap, status pembayaran). Tombol **Cetak Invoice**,
dengan `@media print` menyembunyikan navigasi agar hasil cetak bersih.

### Pembatalan & ubah jadwal

- Pelanggan bisa membatalkan pesanan selama masih **Pesanan Dibuat** (dengan alasan).
- Pelanggan bisa mengubah jadwal penjemputan maupun pengantaran; kurir terkait
  menerima notifikasi dan jumlah perubahan tercatat.
- Admin juga bisa membatalkan pesanan dari halaman detail.

### Halaman

**Pelanggan (10)** — Login, Dashboard, Form Pemesanan, Konfirmasi Pesanan, Pesanan
Berhasil, Daftar Pesanan, Detail Pesanan, Invoice, Status Laundry, Pembayaran,
Penjemputan/Pengantaran

**Admin/Kasir (3)** — Admin Dashboard, Kelola Pesanan, Detail Pesanan Admin

**Kurir (2)** — Courier Dashboard, Detail Tugas Kurir (per tahap)

Plus halaman **Profil** bersama dan halaman rangkuman **Status Laundry** /
**Pembayaran** yang dapat diakses langsung dari sidebar.

## Data Demo Utama (ORD-001)

Konsisten di semua halaman dan role:

- ID: ORD-001
- Customer: Andi · 081234567890 · Jl. Ahmad Yani No. 12, Jakarta
- Layanan: Cuci Kering · 5 kg · Rp10.000/kg
- Total: Rp50.000
- Status laundry: Diproses
- Status pembayaran: Belum Dibayar
- Pengiriman: Jemput (Selesai) → Antar (Kurir Ditugaskan), Kurir Budi

Tersedia ORD-002 (Selesai & lunas) dan ORD-003 (Pesanan Dibuat).

## Keterhubungan Antar Role

State bersama di `src/store.tsx`, dipersistenkan ke localStorage **dan** MySQL:

- Admin ubah status laundry → Customer melihatnya di Dashboard, Pesanan Saya, Status Laundry.
- Customer konfirmasi bayar → berubah di Customer **dan** Admin.
- Admin menugaskan kurir → tugas langsung muncul di Dashboard Kurir (dua tugas bila 2 tahap aktif).
- Kurir menyelesaikan penjemputan → laundry jadi Diproses, tahap 2 otomatis siap.
- Kurir menyelesaikan pengantaran → order Selesai + Customer dapat notifikasi.

## Struktur

```
api/
├─ index.php            # REST API (list_orders, sync_orders) + auto-create tabel
└─ router.php           # router untuk PHP built-in server
src/
├─ data/demoData.ts     # akun, layanan, kurir, pesanan demo
├─ store.tsx            # state global + seluruh aksi lintas role
├─ types.ts             # tipe domain (status, order, delivery 2 tahap)
├─ lib/
│  ├─ api.ts            # klien API + fallback localStorage
│  ├─ pricing.ts        # hitung harga (satu sumber kebenaran)
│  ├─ utils.ts          # format rupiah/tanggal, ID pesanan berikutnya
│  └─ usePersistedState.ts
├─ components/
│  ├─ ui.tsx            # Button, Card, Badge, Field, Table, EmptyState, StatCard
│  ├─ Status.tsx        # badge + timeline laundry & 2 tahap pengiriman
│  ├─ ActionDialog.tsx  # popup dialog interaktif
│  ├─ AppLayout.tsx     # sidebar + navbar + notifikasi + toast
│  ├─ MockMap.tsx       # peta ilustratif (SVG, tanpa API luar)
│  └─ Modal.tsx
└─ pages/
   ├─ Login.tsx, Profile.tsx
   ├─ customer/         # halaman pelanggan
   ├─ admin/            # 3 halaman admin
   └─ courier/          # 2 halaman kurir
```


gambar web 

<img width="1911" height="920" alt="image" src="https://github.com/user-attachments/assets/4e783c39-90d0-4a09-9f14-c4d96991e3bb" />
<img width="1910" height="924" alt="Screenshot 2026-10-23 021305" src="https://github.com/user-attachments/assets/e07927bf-f1e0-407c-88ca-a3b2e6470226" />

## Catatan

- Seluruh antarmuka berbahasa Indonesia.
- Harga: `berat × harga/kg + biaya penjemputan (Rp10.000) + biaya pengantaran (Rp5.000) − diskon 5.000 (≥10 kg)`.
- Untuk mengembalikan data awal, jalankan ulang `database.sql` atau hapus key
  `laundryku.state.v1` di localStorage browser.
