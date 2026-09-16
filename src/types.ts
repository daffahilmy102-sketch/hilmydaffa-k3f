export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
}

export type AuthUser = User;

export interface Ship {
  id: number;
  code: string;
  name: string;
  ship_type: string;
  dwt: number;
  capacity_teus: number;
  year_built: number;
  flag: string;
  captain_name: string;
  status: 'Aktif Berlayar' | 'Sandar Bongkar Muat' | 'Standby di Pelabuhan' | 'Docking / Perawatan';
  location: string;
  created_at?: string;
}

export interface Port {
  id: number;
  code: string;
  name: string;
  city: string;
  province: string;
  draft_depth: number;
  dock_type: string;
  contact_person: string;
  created_at?: string;
}

export interface Customer {
  id: number;
  code: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  created_at?: string;
}

export interface Tariff {
  id: number;
  code: string;
  commodity_name: string;
  unit: string;
  base_rate: number;
  notes?: string;
  created_at?: string;
}

export interface Shipment {
  id: number;
  spal_number: string;
  date: string;
  customer_id: number;
  customer_name: string;
  ship_id: number;
  ship_name: string;
  origin_port_id: number;
  origin_port_name: string;
  dest_port_id: number;
  dest_port_name: string;
  tariff_id: number;
  commodity_name: string;
  quantity: number;
  unit: string;
  freight_rate: number;
  total_freight: number;
  insurance_fee: number;
  grand_total: number;
  status: 'Menunggu Muat' | 'Dalam Pelayaran' | 'Tiba di Pelabuhan Tujuan' | 'Selesai Bongkar Muat' | 'Dibatalkan';
  payment_status: 'Belum Lunas' | 'Uang Muka 50%' | 'Lunas';
  etd: string;
  eta: string;
  notes?: string;
  created_at?: string;
}

export interface ReportOverview {
  summary: {
    total_shipments: number;
    total_revenue: number;
    total_freight_only: number;
    total_volume_shipped: number;
  };
  statusDist: Array<{
    status: string;
    count: number;
    total_amount: number;
  }>;
  shipBreakdown: Array<{
    ship_name: string;
    total_trips: number;
    ship_revenue: number;
    ship_volume: number;
  }>;
  routeBreakdown: Array<{
    origin_port_name: string;
    dest_port_name: string;
    trips: number;
    route_revenue: number;
  }>;
  customerBreakdown: Array<{
    customer_name: string;
    orders: number;
    total_spent: number;
  }>;
}

export interface DbStatus {
  type: string;
  storage: string;
  isSingleSourceOfTruth: boolean;
  counts: {
    users: number;
    ships: number;
    ports: number;
    customers: number;
    tariffs: number;
    shipments: number;
  };
}

export type MainView = 'dashboard' | 'master' | 'transaksi' | 'laporan';
export type MasterSubView = 'ships' | 'ports' | 'customers' | 'tariffs';
