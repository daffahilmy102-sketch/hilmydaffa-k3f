// server/app.ts
import express from "express";

// server/db.ts
import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var db = null;
function getDbPaths() {
  const isVercel = Boolean(
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV
  );
  const dataDir = isVercel ? "/tmp" : path.resolve(process.cwd(), "data");
  const dbPath = path.resolve(dataDir, "minalestari.sqlite");
  const seedPath = path.resolve(process.cwd(), "data", "minalestari.sqlite");
  return { isVercel, dataDir, dbPath, seedPath };
}
async function loadWasmBinary() {
  const candidates = [
    path.resolve(process.cwd(), "node_modules/sql.js/dist/sql-wasm.wasm"),
    path.resolve(process.cwd(), "public/sql-wasm.wasm"),
    path.resolve(__dirname, "sql-wasm.wasm"),
    path.resolve(__dirname, "../node_modules/sql.js/dist/sql-wasm.wasm")
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p);
      }
    } catch {
    }
  }
  try {
    const res = await fetch("https://sql.js.org/dist/sql-wasm.wasm");
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
  } catch (err) {
    console.warn("Could not fetch sql-wasm.wasm from CDN:", err);
  }
  return void 0;
}
async function getDb() {
  if (db) return db;
  const { isVercel, dataDir, dbPath, seedPath } = getDbPaths();
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (err) {
      console.warn("Warning: Could not create data directory:", err);
    }
  }
  if (isVercel && !fs.existsSync(dbPath) && fs.existsSync(seedPath)) {
    try {
      fs.copyFileSync(seedPath, dbPath);
      console.log("Copied seeded SQLite database to /tmp/minalestari.sqlite");
    } catch (err) {
      console.warn("Could not copy seeded database to /tmp:", err);
    }
  }
  const wasmBinary = await loadWasmBinary();
  const SQL = await initSqlJs(wasmBinary ? { wasmBinary } : {});
  if (fs.existsSync(dbPath)) {
    try {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
      console.log("Loaded existing persistent SQLite database from", dbPath);
    } catch (err) {
      console.error("Error reading database file, creating fresh database:", err);
      db = new SQL.Database();
    }
  } else {
    console.log("Initializing new persistent SQLite database at", dbPath);
    db = new SQL.Database();
  }
  initTables(db);
  persistDb();
  return db;
}
function persistDb() {
  if (!db) return;
  try {
    const { dbPath } = getDbPaths();
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error("Failed to persist database to disk:", err);
  }
}
function initTables(database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      ship_type TEXT NOT NULL,
      dwt REAL NOT NULL,
      capacity_teus INTEGER DEFAULT 0,
      year_built INTEGER NOT NULL,
      flag TEXT DEFAULT 'Indonesia',
      captain_name TEXT NOT NULL,
      status TEXT DEFAULT 'Aktif Berlayar',
      location TEXT DEFAULT 'Tanjung Priok',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      province TEXT NOT NULL,
      draft_depth REAL NOT NULL,
      dock_type TEXT NOT NULL,
      contact_person TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tariffs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      commodity_name TEXT NOT NULL,
      unit TEXT NOT NULL,
      base_rate REAL NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      spal_number TEXT UNIQUE NOT NULL,
      date TEXT NOT NULL,
      customer_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      ship_id INTEGER NOT NULL,
      ship_name TEXT NOT NULL,
      origin_port_id INTEGER NOT NULL,
      origin_port_name TEXT NOT NULL,
      dest_port_id INTEGER NOT NULL,
      dest_port_name TEXT NOT NULL,
      tariff_id INTEGER NOT NULL,
      commodity_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      freight_rate REAL NOT NULL,
      total_freight REAL NOT NULL,
      insurance_fee REAL DEFAULT 0,
      grand_total REAL NOT NULL,
      status TEXT DEFAULT 'Menunggu Muat',
      payment_status TEXT DEFAULT 'Belum Lunas',
      etd TEXT NOT NULL,
      eta TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (ship_id) REFERENCES ships(id),
      FOREIGN KEY (origin_port_id) REFERENCES ports(id),
      FOREIGN KEY (dest_port_id) REFERENCES ports(id),
      FOREIGN KEY (tariff_id) REFERENCES tariffs(id)
    );
  `);
  const usersRes = database.exec("SELECT COUNT(*) as cnt FROM users");
  const userCount = usersRes[0]?.values[0]?.[0];
  if (userCount === 0) {
    database.run(`
      INSERT INTO users (username, email, password, name, role) VALUES
      ('admin', 'admin@minalestari.com', 'admin123', 'Hilmy (Administrator)', 'Super Admin'),
      ('ops', 'ops@minalestari.com', 'ops123', 'Budi Santoso', 'Manajer Operasional'),
      ('finance', 'finance@minalestari.com', 'finance123', 'Siti Rahmawati', 'Staf Keuangan');
    `);
  }
  const shipsRes = database.exec("SELECT COUNT(*) as cnt FROM ships");
  const shipCount = shipsRes[0]?.values[0]?.[0];
  if (shipCount === 0) {
    database.run(`
      INSERT INTO ships (code, name, ship_type, dwt, capacity_teus, year_built, flag, captain_name, status, location) VALUES
      ('ML-K01', 'KM MINA LESTARI 01', 'Kontainer', 12500, 750, 2019, 'Indonesia', 'Capt. Aris Nugroho', 'Aktif Berlayar', 'Laut Jawa Menuju Surabaya'),
      ('ML-K02', 'KM MINA LESTARI 02', 'Curah Kering', 28000, 0, 2017, 'Indonesia', 'Capt. Hendra Gunawan', 'Sandar Bongkar Muat', 'Tanjung Priok, Jakarta'),
      ('ML-K03', 'KM MINA BAHARI 08', 'Tanker CPO', 18500, 0, 2021, 'Indonesia', 'Capt. Dedi Suwandi', 'Aktif Berlayar', 'Selat Makassar Menuju Balikpapan'),
      ('ML-TB01', 'TB LESTARI JAYA & BG 300', 'Tongkang & Tugboat', 8500, 320, 2020, 'Indonesia', 'Capt. Joko Wahyudi', 'Standby di Pelabuhan', 'Pelabuhan Belawan, Medan'),
      ('ML-PR01', 'KM MINA NUSANTARA', 'Kargo Perintis', 5500, 180, 2022, 'Indonesia', 'Capt. Faisal Basri', 'Docking / Perawatan', 'Galangan Dok Surabaya');
    `);
  }
  const portsRes = database.exec("SELECT COUNT(*) as cnt FROM ports");
  const portCount = portsRes[0]?.values[0]?.[0];
  if (portCount === 0) {
    database.run(`
      INSERT INTO ports (code, name, city, province, draft_depth, dock_type, contact_person) VALUES
      ('IDTPP', 'Pelabuhan Tanjung Priok', 'Jakarta Utara', 'DKI Jakarta', 14.5, 'Terminal Peti Kemas & Kargo Umum', 'Bpk. Herman (0811-9283-111)'),
      ('IDTPS', 'Pelabuhan Tanjung Perak', 'Surabaya', 'Jawa Timur', 12.0, 'Multipurpose & Peti Kemas', 'Ibu Maya (0812-3456-222)'),
      ('IDBLW', 'Pelabuhan Belawan', 'Medan', 'Sumatera Utara', 11.5, 'Curah Kering & Cair', 'Bpk. Darwin (0813-8899-333)'),
      ('IDMAK', 'Pelabuhan Soekarno-Hatta Makassar', 'Makassar', 'Sulawesi Selatan', 13.0, 'Hub Hubungan Timur Indonesia', 'Bpk. Syamsul (0821-4455-444)'),
      ('IDBPN', 'Pelabuhan Semayang Balikpapan', 'Balikpapan', 'Kalimantan Timur', 10.5, 'Kargo Curah & Logistik IKN', 'Ibu Ratna (0852-7711-555)');
    `);
  }
  const custRes = database.exec("SELECT COUNT(*) as cnt FROM customers");
  const custCount = custRes[0]?.values[0]?.[0];
  if (custCount === 0) {
    database.run(`
      INSERT INTO customers (code, name, category, phone, email, address) VALUES
      ('CUST-001', 'PT Samudera Logistik Nusantara', 'Distributor Ekspedisi', '021-5582910', 'ops@samuderalogistik.co.id', 'Jl. Maritim Raya No. 45, Tanjung Priok, Jakarta'),
      ('CUST-002', 'CV Sumber Pangan Sejahtera', 'Hasil Bumi & Pertanian', '031-7788991', 'logistik@sumberpangan.com', 'Kawasan Industri Rungkut Kav. 12, Surabaya'),
      ('CUST-003', 'PT Sawit Makmur Abadi', 'Agroindustri & CPO', '061-4567890', 'shipping@sawitmakmur.id', 'Jl. Putri Hijau No. 88, Medan'),
      ('CUST-004', 'PT Mega Konstruksi Baja', 'Bahan Bangunan & Industri', '0411-876543', 'supply@megakonstruksi.com', 'Jl. Perintis Kemerdekaan KM 9, Makassar');
    `);
  }
  const tariffRes = database.exec("SELECT COUNT(*) as cnt FROM tariffs");
  const tariffCount = tariffRes[0]?.values[0]?.[0];
  if (tariffCount === 0) {
    database.run(`
      INSERT INTO tariffs (code, commodity_name, unit, base_rate, notes) VALUES
      ('TRF-CT20', 'Kontainer FCL 20ft Standar', 'Kontainer', 6500000, 'Tarif antar pulau rute reguler Jawa - Luar Jawa'),
      ('TRF-CT40', 'Kontainer FCL 40ft High Cube', 'Kontainer', 11500000, 'Termasuk asuransi peti kemas dasar'),
      ('TRF-CPO01', 'Minyak Kelapa Sawit (CPO) Curah', 'Ton', 420000, 'Minimum muatan 3,000 Ton dengan kapal tanker'),
      ('TRF-CRH01', 'Semen & Bahan Bangunan Curah', 'Ton', 310000, 'Handling hopper dan conveyor dermaga'),
      ('TRF-AGR01', 'Komoditas Pangan / Hasil Laut Beku', 'Ton', 780000, 'Memerlukan unit plug-in reefer kontainer');
    `);
  }
  const shipmRes = database.exec("SELECT COUNT(*) as cnt FROM shipments");
  const shipmCount = shipmRes[0]?.values[0]?.[0];
  if (shipmCount === 0) {
    database.run(`
      INSERT INTO shipments (
        spal_number, date, customer_id, customer_name, ship_id, ship_name,
        origin_port_id, origin_port_name, dest_port_id, dest_port_name,
        tariff_id, commodity_name, quantity, unit, freight_rate,
        total_freight, insurance_fee, grand_total, status, payment_status,
        etd, eta, notes
      ) VALUES
      (
        'SPAL/ML/2026/08/001', '2026-08-25', 1, 'PT Samudera Logistik Nusantara', 1, 'KM MINA LESTARI 01',
        1, 'Pelabuhan Tanjung Priok', 2, 'Pelabuhan Tanjung Perak',
        1, 'Kontainer FCL 20ft Standar', 120, 'Kontainer', 6500000,
        780000000, 15000000, 795000000, 'Selesai Bongkar Muat', 'Lunas',
        '2026-08-26', '2026-08-29', 'Muatan penuh barang konsumsi dan manufaktur'
      ),
      (
        'SPAL/ML/2026/09/002', '2026-09-02', 3, 'PT Sawit Makmur Abadi', 3, 'KM MINA BAHARI 08',
        3, 'Pelabuhan Belawan', 5, 'Pelabuhan Semayang Balikpapan',
        3, 'Minyak Kelapa Sawit (CPO) Curah', 4500, 'Ton', 420000,
        1890000000, 35000000, 1925000000, 'Dalam Pelayaran', 'Uang Muka 50%',
        '2026-09-04', '2026-09-12', 'Pemeriksaan surveyor tangki muatan OK, sertifikat mutu lengkap'
      ),
      (
        'SPAL/ML/2026/09/003', '2026-09-05', 4, 'PT Mega Konstruksi Baja', 2, 'KM MINA LESTARI 02',
        2, 'Pelabuhan Tanjung Perak', 4, 'Pelabuhan Soekarno-Hatta Makassar',
        4, 'Semen & Bahan Bangunan Curah', 6200, 'Ton', 310000,
        1922000000, 28000000, 1950000000, 'Dalam Pelayaran', 'Belum Lunas',
        '2026-09-06', '2026-09-11', 'Muatan pasokan proyek konstruksi infrastruktur'
      ),
      (
        'SPAL/ML/2026/09/004', '2026-09-08', 2, 'CV Sumber Pangan Sejahtera', 4, 'TB LESTARI JAYA & BG 300',
        1, 'Pelabuhan Tanjung Priok', 4, 'Pelabuhan Soekarno-Hatta Makassar',
        2, 'Kontainer FCL 40ft High Cube', 40, 'Kontainer', 11500000,
        460000000, 10000000, 470000000, 'Menunggu Muat', 'Uang Muka 50%',
        '2026-09-10', '2026-09-16', 'Proses stuffing peti kemas di terminal priok'
      );
    `);
  }
}
async function query(sql, params = []) {
  const database = await getDb();
  const stmt = database.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}
async function run(sql, params = []) {
  const database = await getDb();
  database.run(sql, params);
  persistDb();
  const res = database.exec("SELECT last_insert_rowid() as id, changes() as changes");
  const lastId = res[0]?.values[0]?.[0] || 0;
  const changes = res[0]?.values[0]?.[1] || 0;
  return { lastInsertRowid: lastId, changes };
}

// server/app.ts
var app = express();
app.use(express.json());
app.use((req, res, next) => {
  const matched = req.headers["x-matched-path"] || req.headers["x-vercel-original-path"];
  if (matched && matched.startsWith("/api")) {
    req.url = matched;
  }
  next();
});
var dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await getDb();
      dbInitialized = true;
    } catch (err) {
      console.error("Failed to initialize database on request:", err);
    }
  }
  next();
});
var router = express.Router();
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "MINA LESTARI - Bisnis Angkutan Laut",
    owner: "HILMY DAPVFOA",
    database: "Real SQLite Persistent Database (Server-side)",
    time: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.get("/db/status", async (req, res) => {
  try {
    const [usersCnt] = await query("SELECT COUNT(*) as count FROM users");
    const [shipsCnt] = await query("SELECT COUNT(*) as count FROM ships");
    const [portsCnt] = await query("SELECT COUNT(*) as count FROM ports");
    const [customersCnt] = await query("SELECT COUNT(*) as count FROM customers");
    const [tariffsCnt] = await query("SELECT COUNT(*) as count FROM tariffs");
    const [shipmentsCnt] = await query("SELECT COUNT(*) as count FROM shipments");
    res.json({
      type: "Real SQLite Persistent Database",
      storage: "Server Disk (data/minalestari.sqlite)",
      isSingleSourceOfTruth: true,
      counts: {
        users: usersCnt?.count || 0,
        ships: shipsCnt?.count || 0,
        ports: portsCnt?.count || 0,
        customers: customersCnt?.count || 0,
        tariffs: tariffsCnt?.count || 0,
        shipments: shipmentsCnt?.count || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/auth/me", (req, res) => {
  res.json({ user: null });
});
router.post("/auth/logout", (req, res) => {
  res.json({ success: true, message: "Berhasil keluar." });
});
router.post("/auth/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: "Username/Email dan Password wajib diisi." });
    }
    const term = usernameOrEmail.trim();
    const altTerm = term.includes(".co.id") ? term.replace(".co.id", ".com") : term.replace(".com", ".co.id");
    const rows = await query(
      "SELECT id, username, email, name, role, password FROM users WHERE username = ? OR email = ? OR email = ?",
      [term, term, altTerm]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Pengguna tidak ditemukan di database." });
    }
    const user = rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: "Kata sandi tidak sesuai." });
    }
    const { password: _, ...userData } = user;
    res.json({
      success: true,
      user: userData,
      message: "Login berhasil sebagai " + userData.name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/master/ships", async (req, res) => {
  try {
    const ships = await query("SELECT * FROM ships ORDER BY id DESC");
    res.json(ships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/master/ships", async (req, res) => {
  try {
    const { code, name, ship_type, dwt, capacity_teus, year_built, flag, captain_name, status, location } = req.body;
    if (!code || !name || !ship_type || !dwt || !captain_name) {
      return res.status(400).json({ error: "Kode, nama kapal, tipe, DWT, dan nahkoda wajib diisi." });
    }
    const result = await run(
      `INSERT INTO ships (code, name, ship_type, dwt, capacity_teus, year_built, flag, captain_name, status, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        name,
        ship_type,
        Number(dwt),
        Number(capacity_teus || 0),
        Number(year_built || (/* @__PURE__ */ new Date()).getFullYear()),
        flag || "Indonesia",
        captain_name,
        status || "Aktif Berlayar",
        location || "Pelabuhan Utama"
      ]
    );
    res.status(201).json({ id: result.lastInsertRowid, message: "Kapal berhasil didaftarkan." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/master/ships/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { code, name, ship_type, dwt, capacity_teus, year_built, flag, captain_name, status, location } = req.body;
    await run(
      `UPDATE ships SET code = ?, name = ?, ship_type = ?, dwt = ?, capacity_teus = ?,
       year_built = ?, flag = ?, captain_name = ?, status = ?, location = ? WHERE id = ?`,
      [
        code,
        name,
        ship_type,
        Number(dwt),
        Number(capacity_teus || 0),
        Number(year_built),
        flag,
        captain_name,
        status,
        location,
        id
      ]
    );
    res.json({ success: true, message: "Data kapal berhasil diperbarui." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete("/master/ships/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const shipments = await query("SELECT id FROM shipments WHERE ship_id = ?", [id]);
    if (shipments.length > 0) {
      return res.status(400).json({ error: "Kapal tidak dapat dihapus karena tercatat dalam transaksi pengiriman." });
    }
    await run("DELETE FROM ships WHERE id = ?", [id]);
    res.json({ success: true, message: "Data kapal berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/master/ports", async (req, res) => {
  try {
    const ports = await query("SELECT * FROM ports ORDER BY id ASC");
    res.json(ports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/master/ports", async (req, res) => {
  try {
    const { code, name, city, province, draft_depth, dock_type, contact_person } = req.body;
    if (!code || !name || !city || !province) {
      return res.status(400).json({ error: "Kode, nama pelabuhan, kota, dan provinsi wajib diisi." });
    }
    const result = await run(
      `INSERT INTO ports (code, name, city, province, draft_depth, dock_type, contact_person)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, name, city, province, Number(draft_depth || 10), dock_type || "Kargo Umum", contact_person || "-"]
    );
    res.status(201).json({ id: result.lastInsertRowid, message: "Pelabuhan berhasil ditambahkan." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/master/ports/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { code, name, city, province, draft_depth, dock_type, contact_person } = req.body;
    await run(
      `UPDATE ports SET code = ?, name = ?, city = ?, province = ?, draft_depth = ?,
       dock_type = ?, contact_person = ? WHERE id = ?`,
      [code, name, city, province, Number(draft_depth), dock_type, contact_person, id]
    );
    res.json({ success: true, message: "Data pelabuhan berhasil diperbarui." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete("/master/ports/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const used = await query("SELECT id FROM shipments WHERE origin_port_id = ? OR dest_port_id = ?", [id, id]);
    if (used.length > 0) {
      return res.status(400).json({ error: "Pelabuhan ini sedang digunakan dalam transaksi aktif." });
    }
    await run("DELETE FROM ports WHERE id = ?", [id]);
    res.json({ success: true, message: "Data pelabuhan berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/master/customers", async (req, res) => {
  try {
    const customers = await query("SELECT * FROM customers ORDER BY id DESC");
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/master/customers", async (req, res) => {
  try {
    const { code, name, category, phone, email, address } = req.body;
    if (!code || !name || !phone) {
      return res.status(400).json({ error: "Kode, nama pelanggan, dan kontak telepon wajib diisi." });
    }
    const result = await run(
      `INSERT INTO customers (code, name, category, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)`,
      [code, name, category || "Distributor Ekspedisi", phone, email || "-", address || "-"]
    );
    res.status(201).json({ id: result.lastInsertRowid, message: "Data mitra pelanggan berhasil ditambahkan." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/master/customers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { code, name, category, phone, email, address } = req.body;
    await run(
      `UPDATE customers SET code = ?, name = ?, category = ?, phone = ?, email = ?, address = ? WHERE id = ?`,
      [code, name, category, phone, email, address, id]
    );
    res.json({ success: true, message: "Data mitra pelanggan berhasil diperbarui." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete("/master/customers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const used = await query("SELECT id FROM shipments WHERE customer_id = ?", [id]);
    if (used.length > 0) {
      return res.status(400).json({ error: "Pelanggan memiliki riwayat transaksi surat muatan." });
    }
    await run("DELETE FROM customers WHERE id = ?", [id]);
    res.json({ success: true, message: "Data pelanggan berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/master/tariffs", async (req, res) => {
  try {
    const tariffs = await query("SELECT * FROM tariffs ORDER BY id ASC");
    res.json(tariffs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/master/tariffs", async (req, res) => {
  try {
    const { code, commodity_name, unit, base_rate, notes } = req.body;
    if (!code || !commodity_name || !unit || !base_rate) {
      return res.status(400).json({ error: "Kode, nama komoditas, satuan, dan tarif dasar wajib diisi." });
    }
    const result = await run(
      `INSERT INTO tariffs (code, commodity_name, unit, base_rate, notes) VALUES (?, ?, ?, ?, ?)`,
      [code, commodity_name, unit, Number(base_rate), notes || ""]
    );
    res.status(201).json({ id: result.lastInsertRowid, message: "Tarif komoditas berhasil ditambahkan." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/master/tariffs/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { code, commodity_name, unit, base_rate, notes } = req.body;
    await run(
      `UPDATE tariffs SET code = ?, commodity_name = ?, unit = ?, base_rate = ?, notes = ? WHERE id = ?`,
      [code, commodity_name, unit, Number(base_rate), notes, id]
    );
    res.json({ success: true, message: "Tarif komoditas berhasil diperbarui." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete("/master/tariffs/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const used = await query("SELECT id FROM shipments WHERE tariff_id = ?", [id]);
    if (used.length > 0) {
      return res.status(400).json({ error: "Tarif ini sudah digunakan dalam data transaksi muatan." });
    }
    await run("DELETE FROM tariffs WHERE id = ?", [id]);
    res.json({ success: true, message: "Tarif berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var handleGetShipments = async (req, res) => {
  try {
    const { status, ship_id, search } = req.query;
    let sql = "SELECT * FROM shipments WHERE 1=1";
    const params = [];
    if (status && status !== "ALL") {
      sql += " AND status = ?";
      params.push(status);
    }
    if (ship_id && ship_id !== "ALL") {
      sql += " AND ship_id = ?";
      params.push(Number(ship_id));
    }
    if (search) {
      sql += " AND (spal_number LIKE ? OR customer_name LIKE ? OR ship_name LIKE ? OR commodity_name LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    sql += " ORDER BY id DESC";
    const shipments = await query(sql, params);
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
var handlePostShipments = async (req, res) => {
  try {
    const {
      spal_number,
      date,
      customer_id,
      customer_name,
      ship_id,
      ship_name,
      origin_port_id,
      origin_port_name,
      dest_port_id,
      dest_port_name,
      tariff_id,
      commodity_name,
      quantity,
      unit,
      freight_rate,
      insurance_fee,
      status,
      payment_status,
      etd,
      eta,
      notes
    } = req.body;
    if (!spal_number || !customer_id || !ship_id || !origin_port_id || !dest_port_id || !quantity) {
      return res.status(400).json({ error: "Lengkapi semua field mandatori transaksi pengiriman." });
    }
    const qty = Number(quantity);
    const rate = Number(freight_rate);
    const ins = Number(insurance_fee || 0);
    const totalFreight = qty * rate;
    const grandTotal = totalFreight + ins;
    const result = await run(
      `INSERT INTO shipments (
        spal_number, date, customer_id, customer_name, ship_id, ship_name,
        origin_port_id, origin_port_name, dest_port_id, dest_port_name,
        tariff_id, commodity_name, quantity, unit, freight_rate,
        total_freight, insurance_fee, grand_total, status, payment_status,
        etd, eta, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        spal_number,
        date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        Number(customer_id),
        customer_name,
        Number(ship_id),
        ship_name,
        Number(origin_port_id),
        origin_port_name,
        Number(dest_port_id),
        dest_port_name,
        Number(tariff_id),
        commodity_name,
        qty,
        unit,
        rate,
        totalFreight,
        ins,
        grandTotal,
        status || "Menunggu Muat",
        payment_status || "Belum Lunas",
        etd,
        eta,
        notes || ""
      ]
    );
    if (status === "Dalam Pelayaran") {
      await run(`UPDATE ships SET status = 'Aktif Berlayar', location = ? WHERE id = ?`, [
        `Rute ${origin_port_name} -> ${dest_port_name}`,
        Number(ship_id)
      ]);
    }
    res.status(201).json({ id: result.lastInsertRowid, message: "Surat Perjanjian Angkutan Laut (SPAL) berhasil diterbitkan." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
var handlePutShipments = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      spal_number,
      date,
      customer_id,
      customer_name,
      ship_id,
      ship_name,
      origin_port_id,
      origin_port_name,
      dest_port_id,
      dest_port_name,
      tariff_id,
      commodity_name,
      quantity,
      unit,
      freight_rate,
      insurance_fee,
      status,
      payment_status,
      etd,
      eta,
      notes
    } = req.body;
    const qty = Number(quantity);
    const rate = Number(freight_rate);
    const ins = Number(insurance_fee || 0);
    const totalFreight = qty * rate;
    const grandTotal = totalFreight + ins;
    await run(
      `UPDATE shipments SET
        spal_number = ?, date = ?, customer_id = ?, customer_name = ?, ship_id = ?, ship_name = ?,
        origin_port_id = ?, origin_port_name = ?, dest_port_id = ?, dest_port_name = ?,
        tariff_id = ?, commodity_name = ?, quantity = ?, unit = ?, freight_rate = ?,
        total_freight = ?, insurance_fee = ?, grand_total = ?, status = ?, payment_status = ?,
        etd = ?, eta = ?, notes = ?
       WHERE id = ?`,
      [
        spal_number,
        date,
        Number(customer_id),
        customer_name,
        Number(ship_id),
        ship_name,
        Number(origin_port_id),
        origin_port_name,
        Number(dest_port_id),
        dest_port_name,
        Number(tariff_id),
        commodity_name,
        qty,
        unit,
        rate,
        totalFreight,
        ins,
        grandTotal,
        status,
        payment_status,
        etd,
        eta,
        notes,
        id
      ]
    );
    res.json({ success: true, message: "Transaksi pengiriman berhasil diperbarui." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
var handlePatchStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, payment_status } = req.body;
    if (status && payment_status) {
      await run("UPDATE shipments SET status = ?, payment_status = ? WHERE id = ?", [status, payment_status, id]);
    } else if (status) {
      await run("UPDATE shipments SET status = ? WHERE id = ?", [status, id]);
    } else if (payment_status) {
      await run("UPDATE shipments SET payment_status = ? WHERE id = ?", [payment_status, id]);
    }
    res.json({ success: true, message: "Status transaksi berhasil diupdate." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
var handleDeleteShipments = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await run("DELETE FROM shipments WHERE id = ?", [id]);
    res.json({ success: true, message: "Data transaksi SPAL berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
router.get("/transactions", handleGetShipments);
router.get("/shipments", handleGetShipments);
router.post("/transactions", handlePostShipments);
router.post("/shipments", handlePostShipments);
router.put("/transactions/:id", handlePutShipments);
router.put("/shipments/:id", handlePutShipments);
router.patch("/transactions/:id/status", handlePatchStatus);
router.patch("/shipments/:id/status", handlePatchStatus);
router.delete("/transactions/:id", handleDeleteShipments);
router.delete("/shipments/:id", handleDeleteShipments);
router.get("/reports/overview", async (req, res) => {
  try {
    const { startDate, endDate, shipId } = req.query;
    let dateFilter = "";
    const params = [];
    if (startDate && endDate) {
      dateFilter += " AND date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }
    if (shipId && shipId !== "ALL") {
      dateFilter += " AND ship_id = ?";
      params.push(Number(shipId));
    }
    const summaryRows = await query(
      `SELECT
        COUNT(*) as total_shipments,
        COALESCE(SUM(grand_total), 0) as total_revenue,
        COALESCE(SUM(total_freight), 0) as total_freight_only,
        COALESCE(SUM(quantity), 0) as total_volume_shipped
       FROM shipments WHERE 1=1 ${dateFilter}`,
      params
    );
    const statusDist = await query(
      `SELECT status, COUNT(*) as count, COALESCE(SUM(grand_total), 0) as total_amount
       FROM shipments WHERE 1=1 ${dateFilter} GROUP BY status`,
      params
    );
    const shipBreakdown = await query(
      `SELECT ship_name, COUNT(*) as total_trips, COALESCE(SUM(grand_total), 0) as ship_revenue, COALESCE(SUM(quantity), 0) as ship_volume
       FROM shipments WHERE 1=1 ${dateFilter} GROUP BY ship_id, ship_name ORDER BY ship_revenue DESC`,
      params
    );
    const routeBreakdown = await query(
      `SELECT origin_port_name, dest_port_name, COUNT(*) as trips, COALESCE(SUM(grand_total), 0) as route_revenue
       FROM shipments WHERE 1=1 ${dateFilter} GROUP BY origin_port_id, dest_port_id ORDER BY route_revenue DESC LIMIT 8`,
      params
    );
    const customerBreakdown = await query(
      `SELECT customer_name, COUNT(*) as orders, COALESCE(SUM(grand_total), 0) as total_spent
       FROM shipments WHERE 1=1 ${dateFilter} GROUP BY customer_id, customer_name ORDER BY total_spent DESC LIMIT 5`,
      params
    );
    res.json({
      summary: summaryRows[0] || { total_shipments: 0, total_revenue: 0, total_volume_shipped: 0 },
      statusDist,
      shipBreakdown,
      routeBreakdown,
      customerBreakdown
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use("/api", router);
app.use(router);
var app_default = app;

// api/index.ts
var index_default = app_default;
export {
  index_default as default
};
