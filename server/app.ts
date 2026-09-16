import express from 'express';
import { getDb, query, run } from './db.ts';

const app = express();

app.use(express.json());

// Normalise request path in case Vercel Serverless Function rewrote it
app.use((req, res, next) => {
  const matched = (req.headers['x-matched-path'] as string) || (req.headers['x-vercel-original-path'] as string);
  if (matched && matched.startsWith('/api')) {
    req.url = matched;
  }
  next();
});

// Auto-initialize DB on first request if not already initialized
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await getDb();
      dbInitialized = true;
    } catch (err) {
      console.error('Failed to initialize database on request:', err);
    }
  }
  next();
});

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'MINA LESTARI - Bisnis Angkutan Laut',
    owner: 'HILMY DAPVFOA',
    database: 'Real SQLite Persistent Database (Server-side)',
    time: new Date().toISOString(),
  });
});

// DB Status (Single Source of Truth verification)
router.get('/db/status', async (req, res) => {
  try {
    const [usersCnt] = await query('SELECT COUNT(*) as count FROM users');
    const [shipsCnt] = await query('SELECT COUNT(*) as count FROM ships');
    const [portsCnt] = await query('SELECT COUNT(*) as count FROM ports');
    const [customersCnt] = await query('SELECT COUNT(*) as count FROM customers');
    const [tariffsCnt] = await query('SELECT COUNT(*) as count FROM tariffs');
    const [shipmentsCnt] = await query('SELECT COUNT(*) as count FROM shipments');

    res.json({
      type: 'Real SQLite Persistent Database',
      storage: 'Server Disk (data/minalestari.sqlite)',
      isSingleSourceOfTruth: true,
      counts: {
        users: usersCnt?.count || 0,
        ships: shipsCnt?.count || 0,
        ports: portsCnt?.count || 0,
        customers: customersCnt?.count || 0,
        tariffs: tariffsCnt?.count || 0,
        shipments: shipmentsCnt?.count || 0,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Auth: Current user (Session check)
router.get('/auth/me', (req, res) => {
  res.json({ user: null });
});

// Auth: Logout
router.post('/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Berhasil keluar.' });
});

// Auth: Login
router.post('/auth/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Username/Email dan Password wajib diisi.' });
    }

    const term = usernameOrEmail.trim();
    const altTerm = term.includes('.co.id') ? term.replace('.co.id', '.com') : term.replace('.com', '.co.id');

    const rows = await query(
      'SELECT id, username, email, name, role, password FROM users WHERE username = ? OR email = ? OR email = ?',
      [term, term, altTerm]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Pengguna tidak ditemukan di database.' });
    }

    const user = rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: 'Kata sandi tidak sesuai.' });
    }

    // Return user without password
    const { password: _, ...userData } = user;
    res.json({
      success: true,
      user: userData,
      message: 'Login berhasil sebagai ' + userData.name,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Master: Ships CRUD
router.get('/master/ships', async (req, res) => {
  try {
    const ships = await query('SELECT * FROM ships ORDER BY id DESC');
    res.json(ships);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/master/ships', async (req, res) => {
  try {
    const { code, name, ship_type, dwt, capacity_teus, year_built, flag, captain_name, status, location } = req.body;
    if (!code || !name || !ship_type || !dwt || !captain_name) {
      return res.status(400).json({ error: 'Kode, nama kapal, tipe, DWT, dan nahkoda wajib diisi.' });
    }

    const result = await run(
      `INSERT INTO ships (code, name, ship_type, dwt, capacity_teus, year_built, flag, captain_name, status, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, name, ship_type, Number(dwt), Number(capacity_teus || 0),
        Number(year_built || new Date().getFullYear()), flag || 'Indonesia',
        captain_name, status || 'Aktif Berlayar', location || 'Pelabuhan Utama'
      ]
    );
    res.status(201).json({ id: result.lastInsertRowid, message: 'Kapal berhasil didaftarkan.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/master/ships/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { code, name, ship_type, dwt, capacity_teus, year_built, flag, captain_name, status, location } = req.body;

    await run(
      `UPDATE ships SET code = ?, name = ?, ship_type = ?, dwt = ?, capacity_teus = ?,
       year_built = ?, flag = ?, captain_name = ?, status = ?, location = ? WHERE id = ?`,
      [
        code, name, ship_type, Number(dwt), Number(capacity_teus || 0),
        Number(year_built), flag, captain_name, status, location, id
      ]
    );
    res.json({ success: true, message: 'Data kapal berhasil diperbarui.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/master/ships/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const shipments = await query('SELECT id FROM shipments WHERE ship_id = ?', [id]);
    if (shipments.length > 0) {
      return res.status(400).json({ error: 'Kapal tidak dapat dihapus karena tercatat dalam transaksi pengiriman.' });
    }
    await run('DELETE FROM ships WHERE id = ?', [id]);
    res.json({ success: true, message: 'Data kapal berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Master: Ports CRUD
router.get('/master/ports', async (req, res) => {
  try {
    const ports = await query('SELECT * FROM ports ORDER BY id ASC');
    res.json(ports);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/master/ports', async (req, res) => {
  try {
    const { code, name, city, province, draft_depth, dock_type, contact_person } = req.body;
    if (!code || !name || !city || !province) {
      return res.status(400).json({ error: 'Kode, nama pelabuhan, kota, dan provinsi wajib diisi.' });
    }

    const result = await run(
      `INSERT INTO ports (code, name, city, province, draft_depth, dock_type, contact_person)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, name, city, province, Number(draft_depth || 10), dock_type || 'Kargo Umum', contact_person || '-']
    );
    res.status(201).json({ id: result.lastInsertRowid, message: 'Pelabuhan berhasil ditambahkan.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/master/ports/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { code, name, city, province, draft_depth, dock_type, contact_person } = req.body;

    await run(
      `UPDATE ports SET code = ?, name = ?, city = ?, province = ?, draft_depth = ?,
       dock_type = ?, contact_person = ? WHERE id = ?`,
      [code, name, city, province, Number(draft_depth), dock_type, contact_person, id]
    );
    res.json({ success: true, message: 'Data pelabuhan berhasil diperbarui.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/master/ports/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const used = await query('SELECT id FROM shipments WHERE origin_port_id = ? OR dest_port_id = ?', [id, id]);
    if (used.length > 0) {
      return res.status(400).json({ error: 'Pelabuhan ini sedang digunakan dalam transaksi aktif.' });
    }
    await run('DELETE FROM ports WHERE id = ?', [id]);
    res.json({ success: true, message: 'Data pelabuhan berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Master: Customers CRUD
router.get('/master/customers', async (req, res) => {
  try {
    const customers = await query('SELECT * FROM customers ORDER BY id DESC');
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/master/customers', async (req, res) => {
  try {
    const { code, name, category, phone, email, address } = req.body;
    if (!code || !name || !phone) {
      return res.status(400).json({ error: 'Kode, nama pelanggan, dan kontak telepon wajib diisi.' });
    }

    const result = await run(
      `INSERT INTO customers (code, name, category, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)`,
      [code, name, category || 'Distributor Ekspedisi', phone, email || '-', address || '-']
    );
    res.status(201).json({ id: result.lastInsertRowid, message: 'Data mitra pelanggan berhasil ditambahkan.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/master/customers/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { code, name, category, phone, email, address } = req.body;

    await run(
      `UPDATE customers SET code = ?, name = ?, category = ?, phone = ?, email = ?, address = ? WHERE id = ?`,
      [code, name, category, phone, email, address, id]
    );
    res.json({ success: true, message: 'Data mitra pelanggan berhasil diperbarui.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/master/customers/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const used = await query('SELECT id FROM shipments WHERE customer_id = ?', [id]);
    if (used.length > 0) {
      return res.status(400).json({ error: 'Pelanggan memiliki riwayat transaksi surat muatan.' });
    }
    await run('DELETE FROM customers WHERE id = ?', [id]);
    res.json({ success: true, message: 'Data pelanggan berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Master: Tariffs CRUD
router.get('/master/tariffs', async (req, res) => {
  try {
    const tariffs = await query('SELECT * FROM tariffs ORDER BY id ASC');
    res.json(tariffs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/master/tariffs', async (req, res) => {
  try {
    const { code, commodity_name, unit, base_rate, notes } = req.body;
    if (!code || !commodity_name || !unit || !base_rate) {
      return res.status(400).json({ error: 'Kode, nama komoditas, satuan, dan tarif dasar wajib diisi.' });
    }

    const result = await run(
      `INSERT INTO tariffs (code, commodity_name, unit, base_rate, notes) VALUES (?, ?, ?, ?, ?)`,
      [code, commodity_name, unit, Number(base_rate), notes || '']
    );
    res.status(201).json({ id: result.lastInsertRowid, message: 'Tarif komoditas berhasil ditambahkan.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/master/tariffs/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { code, commodity_name, unit, base_rate, notes } = req.body;

    await run(
      `UPDATE tariffs SET code = ?, commodity_name = ?, unit = ?, base_rate = ?, notes = ? WHERE id = ?`,
      [code, commodity_name, unit, Number(base_rate), notes, id]
    );
    res.json({ success: true, message: 'Tarif komoditas berhasil diperbarui.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/master/tariffs/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const used = await query('SELECT id FROM shipments WHERE tariff_id = ?', [id]);
    if (used.length > 0) {
      return res.status(400).json({ error: 'Tarif ini sudah digunakan dalam data transaksi muatan.' });
    }
    await run('DELETE FROM tariffs WHERE id = ?', [id]);
    res.json({ success: true, message: 'Tarif berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Transaksi Data: Shipments / SPAL CRUD (supports both /transactions and /shipments)
const handleGetShipments = async (req: express.Request, res: express.Response) => {
  try {
    const { status, ship_id, search } = req.query;
    let sql = 'SELECT * FROM shipments WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'ALL') {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (ship_id && ship_id !== 'ALL') {
      sql += ' AND ship_id = ?';
      params.push(Number(ship_id));
    }
    if (search) {
      sql += ' AND (spal_number LIKE ? OR customer_name LIKE ? OR ship_name LIKE ? OR commodity_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY id DESC';
    const shipments = await query(sql, params);
    res.json(shipments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const handlePostShipments = async (req: express.Request, res: express.Response) => {
  try {
    const {
      spal_number, date, customer_id, customer_name, ship_id, ship_name,
      origin_port_id, origin_port_name, dest_port_id, dest_port_name,
      tariff_id, commodity_name, quantity, unit, freight_rate,
      insurance_fee, status, payment_status, etd, eta, notes
    } = req.body;

    if (!spal_number || !customer_id || !ship_id || !origin_port_id || !dest_port_id || !quantity) {
      return res.status(400).json({ error: 'Lengkapi semua field mandatori transaksi pengiriman.' });
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
        spal_number, date || new Date().toISOString().slice(0, 10),
        Number(customer_id), customer_name, Number(ship_id), ship_name,
        Number(origin_port_id), origin_port_name, Number(dest_port_id), dest_port_name,
        Number(tariff_id), commodity_name, qty, unit, rate,
        totalFreight, ins, grandTotal, status || 'Menunggu Muat', payment_status || 'Belum Lunas',
        etd, eta, notes || ''
      ]
    );

    // If status is 'Dalam Pelayaran', update the ship status as well
    if (status === 'Dalam Pelayaran') {
      await run(`UPDATE ships SET status = 'Aktif Berlayar', location = ? WHERE id = ?`, [
        `Rute ${origin_port_name} -> ${dest_port_name}`,
        Number(ship_id)
      ]);
    }

    res.status(201).json({ id: result.lastInsertRowid, message: 'Surat Perjanjian Angkutan Laut (SPAL) berhasil diterbitkan.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const handlePutShipments = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const {
      spal_number, date, customer_id, customer_name, ship_id, ship_name,
      origin_port_id, origin_port_name, dest_port_id, dest_port_name,
      tariff_id, commodity_name, quantity, unit, freight_rate,
      insurance_fee, status, payment_status, etd, eta, notes
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
        spal_number, date, Number(customer_id), customer_name, Number(ship_id), ship_name,
        Number(origin_port_id), origin_port_name, Number(dest_port_id), dest_port_name,
        Number(tariff_id), commodity_name, qty, unit, rate,
        totalFreight, ins, grandTotal, status, payment_status,
        etd, eta, notes, id
      ]
    );

    res.json({ success: true, message: 'Transaksi pengiriman berhasil diperbarui.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const handlePatchStatus = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const { status, payment_status } = req.body;

    if (status && payment_status) {
      await run('UPDATE shipments SET status = ?, payment_status = ? WHERE id = ?', [status, payment_status, id]);
    } else if (status) {
      await run('UPDATE shipments SET status = ? WHERE id = ?', [status, id]);
    } else if (payment_status) {
      await run('UPDATE shipments SET payment_status = ? WHERE id = ?', [payment_status, id]);
    }

    res.json({ success: true, message: 'Status transaksi berhasil diupdate.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const handleDeleteShipments = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    await run('DELETE FROM shipments WHERE id = ?', [id]);
    res.json({ success: true, message: 'Data transaksi SPAL berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

router.get('/transactions', handleGetShipments);
router.get('/shipments', handleGetShipments);
router.post('/transactions', handlePostShipments);
router.post('/shipments', handlePostShipments);
router.put('/transactions/:id', handlePutShipments);
router.put('/shipments/:id', handlePutShipments);
router.patch('/transactions/:id/status', handlePatchStatus);
router.patch('/shipments/:id/status', handlePatchStatus);
router.delete('/transactions/:id', handleDeleteShipments);
router.delete('/shipments/:id', handleDeleteShipments);

// Laporan (Reports) & Analytics
router.get('/reports/overview', async (req, res) => {
  try {
    const { startDate, endDate, shipId } = req.query;
    let dateFilter = '';
    const params: any[] = [];

    if (startDate && endDate) {
      dateFilter += ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    if (shipId && shipId !== 'ALL') {
      dateFilter += ' AND ship_id = ?';
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
      customerBreakdown,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mount router on both '/api' and root, ensuring routes match whether path has /api prefix or not
app.use('/api', router);
app.use(router);

export default app;
export { app };
