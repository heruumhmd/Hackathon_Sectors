# 🇮🇩 RASI — Report Analisis Saham Indonesia
### *Terminal Intelijen Pasar Modal Terpadu untuk Saham Bursa Efek Indonesia (IDX)*

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45.2-C5F74F?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.7.5-black?style=for-the-badge)](https://www.better-auth.com/)
[![Sectors API v2](https://img.shields.io/badge/Sectors_API-v2_Certified-emerald?style=for-the-badge)](https://sectors.app/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_/_3.5_Flash-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![Automated Tests](https://img.shields.io/badge/Test_Suites-36_Suites_Passed-brightgreen?style=for-the-badge&logo=node.js)](https://nodejs.org/)

---

## 📌 Problem Statement & Ringkasan Eksekutif

> **"RASI (Report Analisis Saham Indonesia) adalah Financial Intelligence Terminal bertenaga Sectors Financial API dan Google Gemini yang mentransformasi data mentah bursa menjadi ruang riset terpadu 4 tahap: membongkar pergerakan dana pintar (bandarmologi), mendeteksi anomali transaksi insider, mengidentifikasi katalis berita tersembunyi (Sleeping Giant), dan menyusun rencana mitigasi risiko transaksi yang terukur sebelum investor ritel mengambil keputusan."**

Di Bursa Efek Indonesia (BEI), investor ritel sering kali berada di posisi yang paling dirugikan. Asimetri informasi, maraknya fenomena *pom-pom* saham di media sosial, jebakan *fake breakout*, serta aksi distribusi terselubung oleh pemegang saham pengendali (*insider*) kerap menimbulkan kerugian fatal. Sementara itu, data intelijen pasar berkualitas institusi selama ini mahal, terfragmentasi, dan rumit untuk dianalisis.

**RASI hadir untuk meratakan arena bermain:**
1. **Objektif & Berbasis Data Nyata:** Menghubungkan 10+ kapabilitas endpoint Sectors Financial API tanpa spekulasi bias.
2. **Aturan Bukti Deterministik (Deterministic Evidence Rules):** 10 aturan matematis ketat (R01–R10) untuk memvalidasi divergensi harga, volume, sentimen berita, dan arus asing.
3. **Kepatuhan Struktur Pasar BEI:** Memperhitungkan fraksi harga resmi BEI (*tick size*), biaya beli/jual bursa riil, *slippage*, dan jam sesi perdagangan bursa (WIB) dengan kalender BEI 2026.
4. **Hemat Kuota & Tangguh Produksi (Quota Shield):** Caching cerdas multi-tier (LRU + PostgreSQL + Distributed Lease Locks) dengan perlindungan anggaran kredit API atomik (500 kredit) untuk keandalan maksimal tanpa pemborosan.

---

## 📑 Daftar Isi

- [Problem Statement & Ringkasan Eksekutif](#-problem-statement--ringkasan-eksekutif)
- [Pilar Utama Intelijen Finansial (4 Pillars)](#-pilar-utama-intelijen-finansial-4-pillars)
- [Mesin Aturan Bukti Deterministik (Rules R01 - R10)](#-mesin-aturan-bukti-deterministik-rules-r01---r10)
- [Mesin Manajemen Risiko & Kalkulator Posisi](#-mesin-manajemen-risiko--kalkulator-posisi)
- [Alur Riset Terpadu 4 Tahap (Research Journey)](#-alur-riset-terpadu-4-tahap-research-journey)
- [Tur Fitur & Peta Rute Aplikasi](#-tur-fitur--peta-rute-aplikasi)
- [Integrasi Sectors Financial API](#-integrasi-sectors-financial-api)
- [Arsitektur Sistem & Rekayasa Keandalan](#-arsitektur-sistem--rekayasa-keandalan)
- [Skema Database & Entitas Drizzle ORM](#-skema-database--entitas-drizzle-orm)
- [Variabel Lingkungan (Environment Variables)](#-variabel-lingkungan-environment-variables)
- [Panduan Instalasi & Menjalankan Lokal](#-panduan-instalasi--menjalankan-lokal)
- [Pengujian & Verifikasi Kualitas Kode](#-pengujian--verifikasi-kualitas-kode)
- [Panduan Deployment Produksi](#-panduan-deployment-produksi)
- [Struktur Direktori Repositori](#-struktur-direktori-repositori)
- [Kepatuhan Regulasi & Disclaimer Finansial](#-kepatuhan-regulasi--disclaimer-finansial)

---

## 🧠 Pilar Utama Intelijen Finansial (4 Pillars)

RASI mengevaluasi setiap emiten melalui empat sudut pandang intelijen pasar komplementer:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   SKOR RISIKO KOMPOSIT RASI (0 - 100)                  │
├─────────────────┬───────────────────┬──────────────────┬───────────────┤
│  FUNDAMENTAL    │   BANDARMOLOGY    │ AI DIVERGENCE    │    INSIDER    │
│     (25%)       │      (35%)        │     (25%)        │     (15%)     │
│   Valuasi P/E   │ Konsentrasi Broker│ Sentimen Berita  │ Steep Discount│
│    P/B Laba     │  CR3/CR5 & Asing  │  Sleeping Giant  │ Insider Buy   │
│   Kas Operasi   │   Harga Rata-Rata │ Delayed Sell-off │  Divestment   │
└─────────────────┴───────────────────┴──────────────────┴───────────────┘
```

### 1. Skor Risiko Komposit & Deteksi Lonjakan Volume (*Volume Spike*)
- **Skor Risiko Terpadu (0–100):** Dihitung secara berbobot: **Fundamental (25%)**, **Bandarmologi/Broker (35%)**, **Divergensi Katalis (25%)**, dan **Aktivitas Orang Dalam/Insider (15%)**.
- **Prinsip Kejujuran Data (*Strict Data Integrity*):** Skor komposit **hanya dihitung** jika keempat pilar memiliki data yang valid dan lengkap. Jika ada pilar yang tidak memiliki data memadai, sistem tidak berasumsi netral (tidak mengarang angka), melainkan mengembalikan status `INSUFFICIENT_DATA` secara transparan dengan rincian pilar yang hilang.
- **Deteksi Lonjakan Volume (RVol):** Menghitung rasio volume perdagangan harian terhadap rata-rata pergerakan 20 hari bursa (SMA-20, minimal 21 observasi harga valid). Lonjakan volume $\ge 2.0\times$ ditandai sebagai indikasi breakout atau aksi distribusi besar.

### 2. Radar Bandarmologi & Arus Dana Pintar (*Big Money Flow*)
- **Rasio Konsentrasi Broker (CR3 & CR5):** Mengukur persentase penguasaan nilai transaksi oleh 3 broker teratas (CR3) dan 5 broker teratas (CR5) dari data *broker summary* harian.
- **Klasifikasi Aksi Bandar:** Mengidentifikasi secara deterministik:
  - `BIG_ACCUMULATION` — Konsentrasi beli broker institusi sangat tinggi dibanding penjual.
  - `NORMAL_ACCUMULATION` — Akumulasi teratur terdeteksi.
  - `NEUTRAL` — Transaksi berimbang antara pembeli dan penjual.
  - `BIG_DISTRIBUTION` — Pelepasan masif oleh broker dominan ke pasar ritel.
- **Arus Dana Investor Asing (*Verified Foreign Flow*):** Menghitung nilai bersih arus dana asing (*Foreign Flow Net Inflow/Outflow*) menggunakan nilai transaksi riil investor asing (`f_bval` dan `f_sval`), bukan sekadar mengandalkan kode broker asing.
- **Rata-rata Harga Beli Broker (*Broker Average Cost*):** Menghitung estimasi rata-rata harga beli dari broker-broker pengendali akumulasi, membantu pengguna memahami harga modal *market maker*.
- **Identifikasi Tipe Broker:** Pengelompokan broker IDX dengan badge visual: **Institusi**, **Asing**, dan **Ritel** (YP, XC, PD, CC, NI, dsb.).

### 3. Radar Katalis Berita & AI Divergence (*Sleeping Giant Detector*)
- **Ekstraksi Sentimen Terstruktur Gemini AI:** Berita pasar real-time dievaluasi dengan Google Gemini ke dalam skor dampak kuantitatif (-100 hingga +100) serta klasifikasi katalis (Laba/Kinerja Finansial, Akuisisi/Ekspansi, Kontrak Baru, Dividen Jumbo, Masalah Hukum/Utang).
- **Deteksi Anomali "Sleeping Giant":** Saham dengan skor katalis berita sangat positif ($\ge +40$), namun harga pasarnya di bursa belum merespons naik atau masih berada dalam fase konsolidasi (*unpriced catalyst*).
- **Deteksi "Delayed Sell-off Hazard":** Saham dengan sentimen berita negatif berat ($\le -40$), namun harga pasar belum mengalami koreksi penuh, mengindikasikan potensi risiko penurunan susulan (*delayed dump*).

### 4. Deteksi Transaksi Orang Dalam (*Insider Movement Anomaly*)
- **Pemantauan Keterbukaan Informasi BEI/KSEI:** Melacak pelaporan perubahan kepemilikan saham oleh jajaran direksi, komisaris, dan pemegang saham pengendali (PSP) di atas 5%.
- **Deteksi Anomali Kritis:**
  - 🚨 **Steep Discount Dump:** Penjualan saham oleh orang dalam pada harga diskon ekstrem di bawah harga pasar reguler.
  - 💎 **Aggressive Insider Buy:** Pembelian saham dalam jumlah masif oleh jajaran manajemen di pasar reguler saat harga terkoreksi.
  - ⚠️ **Massive Divestment:** Pelepasan kepemilikan bernilai jumbo (nominal > Rp 10 Miliar atau persentase perubahan kepemilikan > 1%).

---

## ⚖️ Mesin Aturan Bukti Deterministik (Rules R01 - R10)

Untuk menjamin evaluasi yang objektif dan konsisten, RASI menerapkan mesin evaluasi aturan berbasis bukti (*Deterministic Evidence Rules Engine v2*):

| Rule ID | Nama Aturan | Logika & Ambang Batas (*Threshold*) | Evaluasi Status | Arah Bukti |
| :---: | :--- | :--- | :---: | :---: |
| **R01** | **Divergensi Harga vs Arus Asing (5 Sesi)** | Return harga 5 sesi bursa berlawanan arah dengan arah arus dana asing bersih (Net Foreign Flow 5 Sesi). Contoh: harga naik tapi asing net sell, atau harga turun tapi asing akumulasi masif. | `EVALUATED_TRUE` / `FALSE` | `CONFLICTING` / `ALIGNED` |
| **R02** | **Divergensi Berita vs Arus Asing** | Sentimen berita (BULLISH/BEARISH) bertolak belakang dengan arah akumulasi/distribusi dana asing. | `EVALUATED_TRUE` / `FALSE` | `CONFLICTING` / `ALIGNED` |
| **R03** | **Divergensi Berita vs Respon Harga Sesi ke-1** | Sentimen berita terarah bertentangan dengan pergerakan harga pada sesi perdagangan pertama pasca-publikasi berita. | `EVALUATED_TRUE` / `FALSE` | `CONFLICTING` / `ALIGNED` |
| **R04** | **Lonjakan Volume Transaksi** | Relative Volume harian $\ge 2.0\times$ dibanding rata-rata 20 sesi bursa (SMA-20, min. 21 observasi). | `EVALUATED_TRUE` / `FALSE` | `SUPPORTING` |
| **R05** | **Pertumbuhan Kuat vs Harga Tertinggal** | Pertumbuhan pendapatan dan laba bersih YoY $\ge 15\%$, namun pergerakan return 20 sesi tertinggal relatif terhadap IHSG ($< 0\%$). | `EVALUATED_TRUE` / `FALSE` | `CONFLICTING` |
| **R06** | **Perangkap Nilai (*Value Trap*)** | Valuasi P/E atau P/B berada pada posisi diskon relatif terhadap peers industri, namun pertumbuhan laba atau pendapatan mengalami tren kontraksi/negatif. | `EVALUATED_TRUE` / `FALSE` | `CONFLICTING` |
| **R07** | **Kualitas Laba vs Arus Kas Operasi** | Laba bersih tercatat positif ($> 0$), namun arus kas operasi kuartalan negatif ($< 0$). *(Dikecualikan untuk emiten sektor keuangan/perbankan)*. | `EVALUATED_TRUE` / `FALSE` | `CONFLICTING` |
| **R08** | **Publikasi Keterbukaan Pemegang Saham** | Ditemukan publikasi filing transaksi pemegang saham pengendali, direksi, atau komisaris yang perlu diperiksa. | `EVALUATED_TRUE` / `FALSE` | `SUPPORTING` |
| **R09** | **Aksi Korporasi Mendatang** | Emiten memiliki jadwal aksi korporasi resmi (Dividen, RUPS, Rights Issue, Stock Split) dalam 30 hari kalender ke depan. | `EVALUATED_TRUE` / `FALSE` | `SUPPORTING` |
| **R10** | **Suspensi Perbandingan Harga Historis** | Jendela harga melintasi aksi korporasi (Stock Split, Reverse Split, Rights Issue) yang mempengaruhi kontinuitas harga sebelum penyesuaian. | `EVALUATED_TRUE` / `FALSE` | `NEUTRAL` |

---

## 🎯 Mesin Manajemen Risiko & Kalkulator Posisi

RASI tidak sekadar memberikan analisis, melainkan mendampingi investor menyusun rencana transaksi terukur yang patuh terhadap aturan resmi Bursa Efek Indonesia:

### 1. Kepatuhan Fraksi Harga BEI (*IDX Tick Size Engine*)
Sistem secara otomatis menyesuaikan setiap level harga ke fraksi harga resmi bursa:
- Harga **< Rp 200**: Fraksi Rp 1
- Harga **Rp 200 – < Rp 500**: Fraksi Rp 2
- Harga **Rp 500 – < Rp 2.000**: Fraksi Rp 5
- Harga **Rp 2.000 – < Rp 5.000**: Fraksi Rp 10
- Harga **$\ge$ Rp 5.000**: Fraksi Rp 25

### 2. Biaya Transaksi & Struktur Resiko Riil
- **Biaya Beli (*Buy Fee*):** Default `0.15%` ($0.0015$)
- **Biaya Jual (*Sell Fee*):** Default `0.25%` ($0.0025$)
- **Harga Modal Riil (*Cost Basis*):** $C = \text{Entry} \times (1 + \text{BuyFee})$
- **Level Stop Loss Berbasis ATR:** Menggunakan Average True Range untuk mengukur volatilitas:
  $$\text{SL} = \text{floorToTick}(\text{Entry} - 1.5 \times \text{ATR}, \text{Tick})$$
- **Break-Even Price (BEP):** Harga jual minimum agar modal kembali setelah memperhitungkan biaya beli, biaya jual, dan asumsi *slippage*:
  $$\text{BEP} = \text{ceilToTick}\left(\frac{C}{1 - \text{SellFee}} + \text{Slippage}, \text{Tick}\right)$$
- **Target Take Profit Bertingkat (TP1 & TP2):** Dihitung terhadap *Net Risk per Share* ($R$):
  - $\text{TP1} = \text{ceilToTick}\left(\frac{C + 1.25 \times R}{1 - \text{SellFee}}, \text{Tick}\right)$ *(Realized RRR $\approx 1.25$)*
  - $\text{TP2} = \text{ceilToTick}\left(\frac{C + 2.00 \times R}{1 - \text{SellFee}}, \text{Tick}\right)$ *(Realized RRR $\approx 2.00$)*

### 3. Kalkulator Ukuran Posisi (*Position Sizing Calculator*)
- Pengguna memasukkan total modal portofolio dan batas toleransi risiko (contoh: 1% atau 2% dari modal).
- Sistem menghitung alokasi lot presisi:
  - Total Lot maksimal yang boleh dibeli
  - Lot alokasi untuk penjualan bertahap di TP1 (50%) dan TP2 (50%)
  - Total kebutuhan modal nominal (IDR)
  - Risiko nominal maksimal jika tersentuh Stop Loss

### 4. Pelacakan Realisasi Hasil (*Signal Outcomes Tracker*)
- Melacak efektivitas sinyal pada horizon **1 Sesi**, **3 Sesi**, dan **5 Sesi** perdagangan bursa.
- Menggunakan kalender resmi BEI 2026 (`idx-calendar-2026.json`), mengenali jam perdagangan Sesi 1 (09:00–12:00 / Jumat 09:00–11:30) dan Sesi 2 (13:30–15:49 / Jumat 14:00–15:49 WIB), serta mengabaikan hari libur bursa/cuti bersama dalam penghitungan target maturasi sinyal.

---

## 🗺️ Alur Riset Terpadu 4 Tahap (Research Journey)

Pada halaman **Discover** (`/discover`), pengguna dipandu melalui *Research Journey Stepper* yang terstruktur:

```text
┌────────────────┐      ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│   TAHAP 1      │      │   TAHAP 2      │      │   TAHAP 3      │      │   TAHAP 4      │
│ Sinyal & Risiko│ ───► │Akumulasi Broker│ ───► │  Radar Pasar   │ ───► │   Asisten AI   │
│ Market Metrics │      │ Bandarmology   │      │ Sleeping Giant │      │ Sintesis Multi-│
│ Lonjakan Volume│      │ Foreign Flow   │      │ Insider BEI    │      │ Pilar & Resiko │
└────────────────┘      └────────────────┘      └────────────────┘      └────────────────┘
```

1. **Tahap 1 — Sinyal & Risiko:** Memeriksa Market Metrics Bar, Skor Risiko Komposit 4 Pilar, status valuasi fundamental P/E dan P/B, serta anomali lonjakan volume perdagangan harian.
2. **Tahap 2 — Akumulasi Broker:** Memeriksa tabel Top 5 Pembeli vs Penjual, rasio konsentrasi CR3/CR5, pergerakan dana asing murni, dan rata-rata harga beli bandar.
3. **Tahap 3 — Radar Pasar:** Membuka anomali katalis berita dari Gemini AI, memeriksa status *Sleeping Giant*, dan mendeteksi anomali pelaporan transaksi orang dalam BEI.
4. **Tahap 4 — Asisten AI:** Membuka percakapan interaktif dengan Asisten Gemini untuk mensintesis temuan riset, meminta saran mitigasi risiko, dan menetapkan parameter Stop Loss / Take Profit ke dalam Watchlist.

---

## 🌐 Tur Fitur & Peta Rute Aplikasi

| Rute URL | Nama Halaman | Fungsi & Kapabilitas Utama |
| :--- | :--- | :--- |
| `/` | **Beranda (Landing)** | Hero pencarian saham cepat, ringkasan indeks pasar modal, statistik intelijen harian, dan ringkasan fitur utama. |
| `/discover` | **Ruang Riset Terpadu** | Stepper alur riset 4 tahap terintegrasi dengan pencarian ticker otomatis dan panel intelijen lengkap. |
| `/saham/[ticker]` | **Terminal Riset Saham** | Halaman detail komprehensif: Grafik TradingView, Laporan Keuangan Kuartalan, Rasio Valuasi Fundamental, Pemegang Saham & PSP, Segmen Pendapatan Bisnis, Bandarmologi CR3/CR5, Arus Asing, Transaksi Insider, Berita Terkini, dan Komparasi Industri. |
| `/radar` | **Radar Anomali Pasar** | Dasbor pemantau anomali pasar: Radar Berita AI Gemini, Sleeping Giant Detector, Deteksi Transaksi Insider (Steep Discount Dump / Insider Buy), dan Lonjakan Volume Breakout. |
| `/screener` | **Penyaring Saham** | Penyaring saham dengan filter multi-kriteria (Sektor, Market Cap, P/E, P/B, Dividend Yield, Laba YoY, Aturan R01-R07), 7 Preset Riset kurasi, Simpan Preset, dan Ekspor CSV aman anti-formula injection. |
| `/bandingkan` | **Komparasi Multi-Emiten** | Membandingkan hingga 4 saham sekaligus secara berdampingan: Valuasi, Pertumbuhan, Profitabilitas, Rasio Utang, Skor Risiko, dan Arus Dana Asing. |
| `/broker` | **Penelusuran Aktivitas Broker** | Penjelajah aktivitas broker IDX: filter berdasarkan kode broker (CC, YP, PD, RX, dsb.), pemetaan transaksi dominan, volume, nilai transaksi bersih, dan saham favorit broker. |
| `/asisten` | **Asisten Gemini Terpadu** | Antarmuka obrolan penuh dengan Google Gemini yang di-grounding dengan data real-time Sectors API, riwayat percakapan per user, dan generator kartu rencana risiko transaksi. |
| `/watchlist` | **Daftar Pantauan Pribadi** | Manajemen portofolio pantauan dengan target harga beli/jual, catatan tesis investasi, prioritas (*High*, *Medium*, *Low*), dan status (*Watching*, *Accumulating*, *Sleeping Giant*, *Bought*). |
| `/riwayat` | **Riwayat & Snapshot Riset** | Menyimpan snapshot analisis riset pasar, catatan tesis, kondisi pembatalan (*invalidation triggers*), dan perbandingan perubahan metrik (*snapshot diff*). |
| `/belajar` | **Pusat Edukasi Pasar Modal** | Panduan edukasi interaktif: kamus istilah bursa IDX, panduan bandarmologi, interpretasi rasio fundamental, indikator teknikal, dan metodologi manajemen risiko. |
| `/pengaturan` | **Pengaturan Sistem** | Konfigurasi akun, preferensi tema (Mode Terang / Gelap), status kuota API cache, dan pemantauan anggaran kredit. |
| `/masuk` | **Autentikasi Pengguna** | Autentikasi modern berbasis Google OAuth via Better Auth dengan sesi aman tersimpan di database PostgreSQL. |

### API Route Handlers

- `GET /api/health` — Endpoint pemantauan kesehatan aplikasi, latensi koneksi PostgreSQL, status cache, dan uptime server.
- `GET /api/stocks/search?q={query}` — Endpoint pencarian ticker saham dan nama perusahaan BEI secara instan.
- `GET /api/assistant` & `POST /api/assistant` — Endpoint integrasi percakapan AI Gemini dengan injeksi konteks pasar dan validasi skema Zod.
- `ALL /api/auth/[...all]` — Route handler Better Auth untuk siklus hidup autentikasi Google OAuth.

---

## 🔌 Integrasi Sectors Financial API

RASI memanfaatkan lebih dari 10 kapabilitas endpoint dari **Sectors Financial API v2**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SECTORS FINANCIAL API v2 SUITE                        │
├──────────────────────────────┬──────────────────────────────────────────────┤
│ Kapabilitas Endpoint         │ Pemanfaatan di Aplikasi RASI                 │
├──────────────────────────────┼──────────────────────────────────────────────┤
│ company_report (Valuation)   │ P/E, P/B historis, harga penutupan & selisih │
│ company_report (Ownership)   │ Pemegang saham utama, public free float      │
│ daily_price                  │ Harga OHLCV harian & kalkulasi SMA-20 volume │
│ broker_summary               │ Konsentrasi Top 3 & Top 5, Net Foreign Flow  │
│ brokers_registry             │ Database master broker IDX (nama, tipe, asal)│
│ market_news                  │ Berita pasar IDX real-time untuk analisis AI │
│ filings                      │ Keterbukaan informasi kepemilikan orang dalam│
│ shareholders_composition     │ Komposisi investor (Individu, Korporasi, Reksadana)
│ financials_quarterly         │ Laba bersih, pendapatan, arus kas operasional│
│ company_segments             │ Rincian segmen bisnis & pendapatan emiten    │
│ companies_screener           │ Data universe saham seluruh emiten BEI       │
└──────────────────────────────┴──────────────────────────────────────────────┘
```

Setiap pemanggilan API melalui layer `requestSectorsShared` yang mengelola otomatis:
- Penambahan otorisasi API Key
- Penanganan status batas kuota (*Rate Limit / HTTP 429*)
- Format respons terstandardisasi dalam `DataEnvelope<T>` (`ready`, `partial`, `empty`, `error`)
- Pencatatan penggunaan kredit ke sistem manajemen anggaran

---

## 🏛️ Arsitektur Sistem & Rekayasa Keandalan

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ARSITEKTUR TERMINAL RASI                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                  Browser Klien
                                        │
                                        ▼
                         Next.js 16 App Router UI
                 (Server Components & Client Interactivity)
                                        │
                                        ▼
                     Server Actions & Route Handlers
                       (app/actions.ts, app/api/*)
                                        │
                                        ▼
                        Lapisan Kontrak & Validasi
                       (Zod Contracts: lib/contracts/*)
                                        │
                   ┌────────────────────┴────────────────────┐
                   ▼                                         ▼
           Better Auth Session                      Fitur Layanan Bisnis
          (lib/server/session.ts)                (lib/server/services/*)
                   │                                         │
                   └────────────────────┬────────────────────┘
                                        │
                                        ▼
                        Quota Shield & Cache Manager
                     (lib/server/cache.ts & budget.ts)
                         │                      │
             (In-Memory LRU Cache)      (Distributed Lease)
                         │                      │
                         ▼                      ▼
          PostgreSQL Database              Sectors API v2 Transport
          • api_cache (JSONB)             • 500 Credit Protection
          • quota_buckets                 • Automatic Retries
          • cache_leases                  • Envelope Unwrapping
          • request_keys (Idempotency)                  │
                                                        ▼
                                               Google Gemini AI
                                            (Structured Fallback)
```

### 1. Quota Shield: Multi-Tier Caching Cerdas
Untuk melindungi kuota API Sectors dan menjaga kecepatan aplikasi di bawah 100ms:
- **Tier 1 — In-Memory LRU Cache:** Menyimpan respons yang sering diakses di memori server untuk akses sub-milidetik.
- **Tier 2 — PostgreSQL `api_cache`:** Penyimpanan persisten berbasis database lengkap dengan waktu kedaluwarsa (`expires_at`) yang terisolasi per kunci cache.
- **Distributed Lease Locks (`cache_leases`):** Mengunci request yang sedang berjalan agar serverless instances ganda tidak memanggil endpoint upstream yang sama secara bersamaan (*thundering herd protection*).

### 2. Perlindungan Anggaran Kredit API (500 Credit Protection)
Sistem dilengkapi tabel `api_budgets` dan `api_usage` yang menerapkan pola reservasi dua fase:
1. **RESERVED:** Mengunci kredit sebelum panggilan API dilakukan.
2. **COMMITTED:** Mencatat kredit yang benar-benar terpakai setelah API merespons sukses.
3. **RELEASED / FAILED:** Mengembalikan reservasi jika pemanggilan gagal atau dibatalkan.
Jika batas anggaran 500 kredit tercapai, sistem secara otomatis beralih ke cache lokal atau snapshot mandiri tanpa menyebabkan aplikasi crash.

### 3. Perlindungan Idempotensi (*Idempotency Dedup*)
Operasi mutasi data sensitif (seperti penyimpanan snapshot atau perubahan watchlist) dilindungi oleh tabel `request_keys` berbasis `(user_id, operation, request_key)`, menjamin tidak akan terjadi duplikasi data saat koneksi terputus dan pengguna menekan tombol berulang kali.

### 4. Zero-Hallucination AI Grounding
Asisten AI Gemini di-grounding secara ketat hanya menggunakan data aktual dari Sectors API yang dikirimkan melalui sistem prompt terstruktur. Jika API Gemini sedang mengalami gangguan atau kuota AI habis, sistem otomatis beralih (*graceful fallback*) ke mesin aturan sentimen deterministik berbasis kata kunci pasar modal Indonesia dengan label transparan `RULE_BASED`.

### 5. Perlindungan Injeksi Formula CSV (*Formula Injection Defense*)
Fungsi ekspor data screener ke file CSV diproteksi oleh fungsi sanitasi `sanitizeCsvCell()`. Sel yang diawali karakter berbahaya (`=`, `+`, `-`, `@`) atau karakter kontrol otomatis di-escape dengan tanda kutip tunggal (`'`) untuk mencegah eksekusi kode berbahaya saat file CSV dibuka di Microsoft Excel atau Google Sheets.

---

## 🗄️ Skema Database & Entitas Drizzle ORM

Proyek menggunakan PostgreSQL dengan **Drizzle ORM** yang mencakup 17 tabel terstruktur:

| Kategori | Tabel Database | Deskripsi & Tujuan |
| :--- | :--- | :--- |
| **Autentikasi** | `user` | Data profil pengguna terdaftar via Google OAuth. |
| | `session` | Manajemen token sesi aktif dengan masa berlaku. |
| | `account` | Kredensial akun provider OAuth Google. |
| | `verification` | Token verifikasi autentikasi. |
| **Quota Shield** | `api_cache` | Cache persisten data API Sectors dalam format JSONB. |
| | `cache_leases` | Kunci sewa terdistribusi untuk mencegah request berulang. |
| | `quota_buckets` | Pembatas laju request atomik per subjek dan menit/hari WIB. |
| | `api_budgets` | Pelacak batas anggaran 500 kredit API kampanye hackathon. |
| | `api_usage` | Log audit pemakaian kredit API Sectors per request ID. |
| | `request_keys` | Deduplikasi idempotensi request mutasi per pengguna. |
| **Riset & Pasar** | `watchlist` | Daftar pantauan saham pribadi dengan target harga & status. |
| | `analysis_snapshots`| Snapshot analisis pasar publik tervalidasi skema Zod. |
| | `analysis_history` | Riwayat penelusuran analisis pribadi per pengguna. |
| | `research_snapshots`| Snapshot riset terperinci untuk analisis lanjutan. |
| | `research_notes` | Catatan tesis riset dan pemicu invalidasi pengguna. |
| | `saved_screens` | Filter screener khusus yang disimpan oleh pengguna. |
| **Sinyal & Hasil** | `signal_outcomes` | Evaluasi hasil sinyal pada horizon 1, 3, dan 5 sesi bursa. |
| | `signal_contexts` | Konteks asal mula sinyal dan parameter risiko awal. |
| | `signal_analysis_runs`| Log pengujian dan evaluasi historis sinyal bursa. |
| **Asisten AI** | `conversations` | Data thread percakapan pengguna dengan Asisten Gemini. |
| | `conversation_messages`| Pesan percakapan, sumber analisis, dan usulan aksi risiko. |

---

## 📦 Variabel Lingkungan (Environment Variables)

Salin `env.example` ke `.env.local` dan lengkapi nilai konfigurasi:

```bash
cp env.example .env.local
```

### Tabel Referensi Konfigurasi

| Variabel | Wajib Prod | Default / Contoh | Deskripsi |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Ya** | `postgresql://user:pass@localhost:5432/rasi` | URL koneksi utama PostgreSQL. |
| `DATABASE_MIGRATION_URL`| Tidak | *Sama dengan DATABASE_URL* | URL khusus untuk koneksi migrasi DDL. |
| `SECTORS_API_KEY` | **Ya** | `cde1971d...` | Kunci API resmi dari [sectors.app/api](https://sectors.app/api). |
| `GEMINI_API_KEY` | Opsional | `AIzaSy...` | Kunci API Google Gemini dari [AI Studio](https://aistudio.google.com/). *(Jika kosong, otomatis fallback ke rule-based)* |
| `GEMINI_MODEL` | Tidak | `gemini-3.5-flash-lite` | Model Gemini yang digunakan (alternatif: `gemini-2.5-flash`). |
| `BETTER_AUTH_SECRET` | **Ya** | `min-32-karakter-acak-rahasia-produksi` | Kunci rahasia sesi Better Auth (minimal 32 karakter). |
| `BETTER_AUTH_URL` | **Ya** | `http://localhost:3000` / `https://rasi.domain.com` | URL root aplikasi untuk callback Google OAuth. |
| `GOOGLE_CLIENT_ID` | Opsional | `...apps.googleusercontent.com` | Client ID Google OAuth dari Google Cloud Console. |
| `GOOGLE_CLIENT_SECRET` | Opsional | `GOCSPX-...` | Client Secret Google OAuth. |
| `SECTORS_DAILY_CREDIT_BUDGET`| Tidak | `0` *(unlimited / sesuai limit)* | Batas kredit harian Sectors API. |
| `GEMINI_DAILY_REQUEST_BUDGET`| Tidak | `0` | Batas request harian Gemini API. |
| `RASI_ANALYSIS_ENABLED` | Tidak | `true` | Mengaktifkan modul analisis pasar. |
| `RASI_ASSISTANT_ENABLED`| Tidak | `true` | Mengaktifkan fitur percakapan Asisten AI. |
| `SIGNAL_ANALYSIS_ENABLED`| Tidak | `false` | Mengaktifkan evaluasi sinyal intraday lanjutan. |
| `INTRADAY_PROVIDER` | Tidak | `yahoo` | Provider feed intraday grafik 5-menit. |

> **Validasi Lingkungan:** Jalankan pemeriksaan otomatis variabel lingkungan Anda kapan saja:
> ```bash
> node scripts/check-env.mjs
> ```

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### Prasyarat Sistem
- **Node.js** $\ge 22.6.0$
- **pnpm** $\ge 10.0.0$ *(direkomendasikan)* atau `npm`
- **PostgreSQL** $\ge 15.0$

### 1. Kloning Repositori
```bash
git clone https://github.com/heruu-1/Hackathon_Sectors.git
cd Hackathon_Sectors
```

### 2. Instal Dependensi
```bash
pnpm install
```

### 3. Konfigurasi Variabel Lingkungan
```bash
cp env.example .env.local
```
Edit file `.env.local` dan masukkan `DATABASE_URL`, `SECTORS_API_KEY`, dan kredensial lainnya.

### 4. Setup & Migrasi Database
Jalankan migrasi mandiri terstruktur yang aman dan idempoten:

```bash
# 1. Jalankan migrasi schema inti RASI v2
node scripts/migrate.mjs

# 2. Jalankan migrasi modul Market Intelligence
node scripts/migrate-market-intelligence.mjs

# 3. Jalankan migrasi modul Signal Analysis
node scripts/migrate-signal-analysis.mjs

# 4. Verifikasi kesiapan koneksi dan tabel database
node scripts/verify-db.mjs

# 5. Isi data seeder awal snapshot emiten (BBCA, TLKM, ASII, BBRI)
pnpm db:seed
```

### 5. Jalankan Development Server
```bash
pnpm dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🧪 Pengujian & Verifikasi Kualitas Kode

RASI mengutamakan keandalan tinggi dengan rangkaian pengujian komprehensif yang mencakup 36 berkas test suite mandiri:

```bash
# 1. Menjalankan seluruh test suites unit otomatis (36 berkas test)
pnpm test

# 2. Memeriksa tipe data TypeScript
pnpm typecheck

# 3. Memeriksa kualitas kode dengan ESLint
pnpm lint

# 4. Memeriksa konsistensi format Prettier
pnpm format:check

# 5. Membangun aplikasi produksi
pnpm build

# 6. Menguji ketersediaan seluruh rute frontend & API (Status HTTP 200)
node scripts/verify-all-routes.mjs
```

### Ruang Lingkup Pengujian Unit:
- **`tests/evidence-rules.test.mjs`** — Verifikasi logika 10 aturan deterministik R01–R10.
- **`tests/scoring.test.mjs` & `tests/indicators.test.mjs`** — Verifikasi pembobotan skor komposit 4 pilar dan penanganan `INSUFFICIENT_DATA`.
- **`tests/trade-risk.test.mjs`** — Verifikasi fraksi harga BEI, pembulatan tick, dan kalkulasi risiko stop-loss/take-profit.
- **`tests/trading-sessions.test.mjs`** — Verifikasi kalender BEI 2026, jam sesi perdagangan WIB, dan libur bursa.
- **`tests/cache.test.mjs` & `tests/budget.test.mjs`** — Pengujian Quota Shield, lease locks, dan reservasi anggaran kredit.
- **`tests/screener-presets.test.mjs`** — Verifikasi formula injection defense pada ekspor CSV.
- **`tests/isolation.test.mjs`** — Menjamin isolasi data antar pengguna pada watchlist, notes, dan riwayat.
- **`tests/contracts.test.mjs` & `tests/env.test.mjs`** — Validasi skema Zod dan sanitasi variabel lingkungan.

---

## 🏗️ Panduan Deployment Produksi

Aplikasi siap di-deploy secara instan ke platform seperti **Vercel**, **Railway**, atau server VPS mandiri:

### Langkah Deploy ke Vercel:
1. **Konfigurasi Database Cloud:** Gunakan penyedia database PostgreSQL cloud seperti **Supabase**, **Neon**, atau **Aiven**.
2. **Jalankan Skrip Migrasi:** Jalankan `node scripts/migrate.mjs`, `node scripts/migrate-market-intelligence.mjs`, dan `node scripts/migrate-signal-analysis.mjs` menggunakan `DATABASE_URL` cloud Anda.
3. **Impor Proyek ke Vercel:** Hubungkan repositori GitHub Anda ke dashboard Vercel.
4. **Isi Environment Variables:** Masukkan seluruh variabel produksi:
   - `DATABASE_URL` (Gunakan pooled connection jika menggunakan Neon/Supabase)
   - `SECTORS_API_KEY`
   - `GEMINI_API_KEY`
   - `BETTER_AUTH_SECRET` (Generate 32 karakter acak unik)
   - `BETTER_AUTH_URL` (Domain resmi Anda, misal: `https://rasi.vercel.app`)
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` (Tambahkan URI redirect di Google Console: `https://<domain>/api/auth/callback/google`)
5. **Deploy:** Vercel akan menjalankan `pnpm build` secara otomatis.
6. **Verifikasi:** Buka `https://<domain>/api/health` untuk memastikan aplikasi sehat dan database terhubung (`status: ok`).

---

## 📁 Struktur Direktori Repositori

```text
Hackathon_Sectors/
├── app/                              # Next.js 16 App Router
│   ├── actions.ts                    # Server Actions (Watchlist, Notes, Screens)
│   ├── api/                          # Route Handlers
│   │   ├── assistant/route.ts        # Endpoint obrolan AI Gemini
│   │   ├── auth/[...all]/route.ts    # Route handler Better Auth
│   │   ├── health/route.ts           # Endpoint health check
│   │   └── stocks/search/route.ts    # Endpoint pencarian saham
│   ├── asisten/page.tsx              # Halaman Asisten AI penuh
│   ├── bandingkan/page.tsx           # Halaman Komparasi Multi-Emiten
│   ├── belajar/page.tsx              # Halaman Pusat Edukasi Pasar Modal
│   ├── broker/page.tsx               # Halaman Penelusuran Broker IDX
│   ├── discover/page.tsx             # Halaman Ruang Riset Terpadu 4 Tahap
│   ├── masuk/page.tsx                # Halaman Login Google OAuth
│   ├── pengaturan/page.tsx           # Halaman Pengaturan & Status Kuota
│   ├── radar/page.tsx                # Halaman Radar Anomali Pasar
│   ├── riwayat/page.tsx              # Halaman Riwayat & Snapshots Riset
│   ├── saham/[ticker]/page.tsx       # Halaman Detail Terminal Saham
│   ├── screener/page.tsx             # Halaman Penyaring Saham Cerdas
│   ├── watchlist/page.tsx            # Halaman Pantauan Saham Pribadi
│   ├── layout.tsx                    # Root Layout & Theme Provider
│   └── page.tsx                      # Halaman Beranda Utama
├── components/                       # Komponen Antarmuka Pengguna (UI)
│   ├── BrokerAccumulationTable.tsx   # Tabel Top 5 Pembeli/Penjual & CR3/CR5
│   ├── BrokerActivityExplorer.tsx    # Penjelajah transaksi broker IDX
│   ├── DiscoverUnifiedExperience.tsx # Pengalaman riset 4 tahap terpadu
│   ├── MarketMetricsBar.tsx          # Bar metrik pasar & skor risiko
│   ├── RadarEvidenceCases.tsx        # Kartu visual 10 aturan bukti deterministik
│   ├── ResearchJourneyStepper.tsx    # Indikator tahapan riset interaktif
│   ├── ScreenerFilterDialog.tsx      # Modal filter screener & ekspor CSV
│   ├── SignalEvaluationPanel.tsx     # Panel evaluasi sinyal & kalkulator posisi
│   ├── StockChart.tsx                # Grafik pergerakan harga saham
│   ├── StockDetail.tsx               # Rincian fundamental, segmen, pemegang saham
│   ├── TradingViewChart.tsx          # Widget grafik interaktif TradingView
│   └── ui/                           # Komponen UI atomik (Button, Dialog, Menu)
├── db/                               # Konfigurasi Database & ORM
│   ├── index.ts                      # Koneksi PostgreSQL Client
│   └── schema.ts                     # Definisi 17 tabel Drizzle ORM
├── domain/                           # Modul Logika Bisnis & Finansial Murni
│   ├── bandarmology.ts               # Kalkulasi CR3/CR5, rata-rata harga broker
│   ├── broker-activity.ts            # Agregasi aktivitas broker
│   ├── business-exposure.ts          # Analisis paparan segmen bisnis
│   ├── divergence.ts                 # Logika divergensi Sleeping Giant & sell-off
│   ├── evidence-rules.ts             # Mesin 10 aturan bukti deterministik (R01-R10)
│   ├── flows.ts                      # Analisis arus dana asing murni
│   ├── fundamentals.ts               # Evaluasi rasio valuasi P/E & P/B
│   ├── insider.ts                    # Deteksi transaksi diskon & pembelian orang dalam
│   ├── market-overview.ts            # Ringkasan pasar modal BEI
│   ├── scoring.ts                    # Perhitungan Skor Risiko Komposit 4 Pilar
│   ├── screener-presets.ts           # 7 preset screener & sanitasi CSV
│   ├── trade-risk.ts                 # Kalkulator ukuran posisi & fraksi harga BEI
│   ├── trading-sessions.ts           # Kalender bursa BEI 2026 & jam sesi WIB
│   └── universe.ts                   # Pengelolaan universe emiten BEI
├── drizzle/                          # Berkas Migrasi SQL Aditif
│   ├── 0002_rasi_v2_clean.sql        # Migrasi skema utama RASI v2
│   ├── 0003_market_intelligence.sql  # Migrasi tabel Market Intelligence
│   └── 0004_signal_analysis.sql      # Migrasi tabel Signal Analysis
├── lib/                              # Layanan Infrastruktur & Server
│   ├── auth.ts                       # Konfigurasi Better Auth Google Provider
│   ├── contracts/                    # Skema validasi Zod untuk kontrak data
│   │   ├── analysis.ts               # Kontrak indikator & skor komposit
│   │   ├── assistant.ts              # Kontrak pesan obrolan asisten
│   │   ├── market.ts                 # Kontrak data Sectors API & envelope
│   │   └── signal-analysis.ts        # Kontrak sinyal, proyeksi, rencana risiko
│   ├── data/                         # Data statis bursa
│   │   └── idx-calendar-2026.json    # Kalender hari libur resmi BEI 2026
│   └── server/                       # Modul server-only
│       ├── budget.ts                 # Manajemen anggaran 500 kredit API
│       ├── cache.ts                  # Multi-tier caching Quota Shield
│       ├── env.ts                    # Validasi ketat variabel lingkungan
│       ├── idempotency.ts            # Pencegahan eksekusi duplikat request
│       ├── quota.ts                  # Rate limiting atomik PostgreSQL
│       ├── providers/                # Adapter eksternal (Sectors, Gemini, Yahoo)
│       ├── repositories/             # Akses database Drizzle per entitas
│       └── services/                 # Layanan orkestrasi bisnis
├── scripts/                          # Skrip Utilitas & Pemeliharaan
│   ├── check-env.mjs                 # Memeriksa kelayakan file .env.local
│   ├── migrate.mjs                   # Menjalankan migrasi skema utama
│   ├── migrate-market-intelligence.mjs # Migrasi tabel market intelligence
│   ├── migrate-signal-analysis.mjs   # Migrasi tabel evaluasi sinyal
│   ├── seed.mjs                      # Seeder data snapshot awal emiten
│   ├── verify-db.mjs                 # Memeriksa koneksi & tabel database
│   └── verify-all-routes.mjs         # Memverifikasi seluruh rute HTTP 200
├── tests/                            # 36 Berkas Uji Unit Otomatis (Node.js Test Runner)
├── package.json                      # Konfigurasi dependensi dan skrip proyek
└── README.md                         # Dokumentasi komprehensif proyek
```

---

## ⚖️ Kepatuhan Regulasi & Disclaimer Finansial

> **PENTING — PENAFIAN HUKUM & INVESTASI:**  
> 1. **Bukan Penasihat Finansial Berlisensi:** RASI (Report Analisis Saham Indonesia) adalah perangkat lunak independen untuk keperluan riset informasi, edukasi, dan intelijen data pasar. RASI **bukan merupakan penasihat investasi, broker-dealer, atau manajer investasi berlisensi Otoritas Jasa Keuangan (OJK)**.
> 2. **Bukan Ajakan Transaksi:** Segala analisis, skor risiko, sinyal bandarmologi, output AI, dan kartu rencana manajemen risiko yang disajikan di aplikasi ini **bukan merupakan rekomendasi beli/jual atau ajakan untuk melakukan transaksi efek tertentu**.
> 3. **Risiko Pasar Modal:** Berinvestasi di pasar saham memiliki risiko kerugian modal. Kinerja masa lalu tidak menjamin hasil di masa depan. Pengguna bertanggung jawab penuh atas setiap keputusan investasi mandiri (*Do Your Own Research - DYOR*).

---

## 📄 Lisensi & Kontribusi

Didistribusikan di bawah lisensi resmi **Sectors Hackathon Indonesia 2026**.  
Hak Cipta © 2026 **Tim RASI (Report Analisis Saham Indonesia)**. Seluruh hak cipta dilindungi undang-undang.

---

<div align="center">
  <sub>Dibangun dengan dedikasi untuk transparansi pasar modal Indonesia yang lebih objektif, adil, dan inklusif bagi seluruh investor ritel.</sub>
</div>
