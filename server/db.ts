import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

let db: Database | null = null;
const dbDir = path.resolve(process.cwd(), 'data');
const dbPath = path.resolve(dbDir, 'minalestari.sqlite');

export async function getDb(): Promise<Database> {
  if (db) return db;

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    try {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
      console.log('Loaded existing persistent SQLite database from', dbPath);
    } catch (err) {
      console.error('Error reading database file, creating fresh database:', err);
      db = new SQL.Database();
    }
  } else {
    console.log('Initializing new persistent SQLite database at', dbPath);
    db = new SQL.Database();
  }

  initTables(db);
  persistDb();
  return db;
}

export function persistDb() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('Failed to persist database to disk:', err);
  }
}

function initTables(database: Database) {
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

  // Seed default admin and demo users if not exists
  const usersRes = database.exec("SELECT COUNT(*) as cnt FROM users");
  const userCount = usersRes[0]?.values[0]?.[0] as number;
  if (userCount === 0) {
    database.run(`
      INSERT INTO users (username, email, password, name, role) VALUES
      ('admin', 'admin@minalestari.com', 'admin123', 'Hilmy (Administrator)', 'Super Admin'),
      ('ops', 'ops@minalestari.com', 'ops123', 'Budi Santoso', 'Manajer Operasional'),
      ('finance', 'finance@minalestari.com', 'finance123', 'Siti Rahmawati', 'Staf Keuangan');
    `);
  }

  // Seed default ships if empty
  const shipsRes = database.exec("SELECT COUNT(*) as cnt FROM ships");
  const shipCount = shipsRes[0]?.values[0]?.[0] as number;
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

  // Seed default ports if empty
  const portsRes = database.exec("SELECT COUNT(*) as cnt FROM ports");
  const portCount = portsRes[0]?.values[0]?.[0] as number;
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

  // Seed default customers if empty
  const custRes = database.exec("SELECT COUNT(*) as cnt FROM customers");
  const custCount = custRes[0]?.values[0]?.[0] as number;
  if (custCount === 0) {
    database.run(`
      INSERT INTO customers (code, name, category, phone, email, address) VALUES
      ('CUST-001', 'PT Samudera Logistik Nusantara', 'Distributor Ekspedisi', '021-5582910', 'ops@samuderalogistik.co.id', 'Jl. Maritim Raya No. 45, Tanjung Priok, Jakarta'),
      ('CUST-002', 'CV Sumber Pangan Sejahtera', 'Hasil Bumi & Pertanian', '031-7788991', 'logistik@sumberpangan.com', 'Kawasan Industri Rungkut Kav. 12, Surabaya'),
      ('CUST-003', 'PT Sawit Makmur Abadi', 'Agroindustri & CPO', '061-4567890', 'shipping@sawitmakmur.id', 'Jl. Putri Hijau No. 88, Medan'),
      ('CUST-004', 'PT Mega Konstruksi Baja', 'Bahan Bangunan & Industri', '0411-876543', 'supply@megakonstruksi.com', 'Jl. Perintis Kemerdekaan KM 9, Makassar');
    `);
  }

  // Seed default tariffs if empty
  const tariffRes = database.exec("SELECT COUNT(*) as cnt FROM tariffs");
  const tariffCount = tariffRes[0]?.values[0]?.[0] as number;
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

  // Seed default shipments if empty
  const shipmRes = database.exec("SELECT COUNT(*) as cnt FROM shipments");
  const shipmCount = shipmRes[0]?.values[0]?.[0] as number;
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

export async function query(sql: string, params: any[] = []): Promise<any[]> {
  const database = await getDb();
  const stmt = database.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export async function run(sql: string, params: any[] = []): Promise<{ lastInsertRowid: number; changes: number }> {
  const database = await getDb();
  database.run(sql, params);
  persistDb();

  const res = database.exec("SELECT last_insert_rowid() as id, changes() as changes");
  const lastId = (res[0]?.values[0]?.[0] as number) || 0;
  const changes = (res[0]?.values[0]?.[1] as number) || 0;
  return { lastInsertRowid: lastId, changes };
}
