import React, { useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  MainView,
  MasterSubView,
  Ship,
  Port,
  Customer,
  Tariff,
  Shipment,
  ReportOverview,
} from './types';
import { LoginForm } from './components/LoginForm';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { MasterDataView } from './components/MasterDataView';
import { TransaksiView } from './components/TransaksiView';
import { LaporanView } from './components/LaporanView';

// Modals
import { ShipModal } from './components/modals/ShipModal';
import { PortModal } from './components/modals/PortModal';
import { CustomerModal } from './components/modals/CustomerModal';
import { TariffModal } from './components/modals/TariffModal';
import { TransactionModal } from './components/modals/TransactionModal';
import { PrintSpalModal } from './components/modals/PrintSpalModal';

export default function App() {
  // Authentication state - Default is null so LoginForm is displayed initially (requirement #3)
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Navigation state
  const [currentView, setCurrentView] = useState<MainView>('dashboard');
  const [masterSubView, setMasterSubView] = useState<MasterSubView>('ships');

  // Real Database Data state
  const [ships, setShips] = useState<Ship[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [report, setReport] = useState<ReportOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modals state
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [editingShip, setEditingShip] = useState<Ship | null>(null);

  const [isPortModalOpen, setIsPortModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printingShipment, setPrintingShipment] = useState<Shipment | null>(null);

  // Check auth session from server on startup (No LocalStorage)
  useEffect(() => {
    const checkServerAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.warn('Initial auth check notice:', err);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkServerAuth();
  }, []);

  // Fetch all live database records from server
  const fetchAllData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setApiError(null);
    try {
      const [shipsRes, portsRes, custRes, tariffsRes, shipmRes, reportRes] = await Promise.all([
        fetch('/api/master/ships'),
        fetch('/api/master/ports'),
        fetch('/api/master/customers'),
        fetch('/api/master/tariffs'),
        fetch('/api/shipments'),
        fetch('/api/reports/overview'),
      ]);

      if (shipsRes.ok) setShips(await shipsRes.json());
      if (portsRes.ok) setPorts(await portsRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
      if (tariffsRes.ok) setTariffs(await tariffsRes.json());
      if (shipmRes.ok) setShipments(await shipmRes.json());
      if (reportRes.ok) setReport(await reportRes.json());
    } catch (err: any) {
      setApiError(err.message || 'Gagal memuat data dari database server');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  // Auth Handlers
  const handleLoginSuccess = (loggedInUser: AuthUser) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setUser(null);
  };

  // CRUD for Ships
  const handleSaveShip = async (shipData: Partial<Ship>) => {
    const isEdit = !!editingShip;
    const url = isEdit ? `/api/master/ships/${editingShip.id}` : '/api/master/ships';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan kapal');
    }
    await fetchAllData();
  };

  const handleDeleteShip = async (id: number) => {
    const res = await fetch(`/api/master/ships/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menghapus kapal');
    }
    await fetchAllData();
  };

  // CRUD for Ports
  const handleSavePort = async (portData: Partial<Port>) => {
    const isEdit = !!editingPort;
    const url = isEdit ? `/api/master/ports/${editingPort.id}` : '/api/master/ports';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(portData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan pelabuhan');
    }
    await fetchAllData();
  };

  const handleDeletePort = async (id: number) => {
    const res = await fetch(`/api/master/ports/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menghapus pelabuhan');
    }
    await fetchAllData();
  };

  // CRUD for Customers
  const handleSaveCustomer = async (custData: Partial<Customer>) => {
    const isEdit = !!editingCustomer;
    const url = isEdit ? `/api/master/customers/${editingCustomer.id}` : '/api/master/customers';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(custData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan pelanggan');
    }
    await fetchAllData();
  };

  const handleDeleteCustomer = async (id: number) => {
    const res = await fetch(`/api/master/customers/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menghapus pelanggan');
    }
    await fetchAllData();
  };

  // CRUD for Tariffs
  const handleSaveTariff = async (tariffData: Partial<Tariff>) => {
    const isEdit = !!editingTariff;
    const url = isEdit ? `/api/master/tariffs/${editingTariff.id}` : '/api/master/tariffs';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tariffData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan tarif');
    }
    await fetchAllData();
  };

  const handleDeleteTariff = async (id: number) => {
    const res = await fetch(`/api/master/tariffs/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menghapus tarif');
    }
    await fetchAllData();
  };

  // CRUD for Shipments (SPAL)
  const handleSaveShipment = async (shipmentData: Partial<Shipment>) => {
    const isEdit = !!editingShipment;
    const url = isEdit ? `/api/shipments/${editingShipment.id}` : '/api/shipments';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipmentData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan transaksi SPAL');
    }
    await fetchAllData();
  };

  const handleDeleteShipment = async (id: number) => {
    const res = await fetch(`/api/shipments/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menghapus transaksi SPAL');
    }
    await fetchAllData();
  };

  const handleUpdateShipmentStatus = async (
    id: number,
    status: Shipment['status'],
    paymentStatus?: Shipment['payment_status']
  ) => {
    const payload: any = { status };
    if (paymentStatus) payload.payment_status = paymentStatus;

    const res = await fetch(`/api/shipments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal mengubah status muatan');
    }
    await fetchAllData();
  };

  // If user is not logged in, render the Login Screen as the default view (Requirement #3)
  if (!user) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        user={user}
        currentView={currentView}
        onNavigate={setCurrentView}
        masterSubView={masterSubView}
        onSelectMasterSubView={setMasterSubView}
        onLogout={handleLogout}
        dbRecordsCount={ships.length + ports.length + customers.length + tariffs.length + shipments.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {apiError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs sm:text-sm flex items-center justify-between">
            <span>{apiError}</span>
            <button
              onClick={fetchAllData}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* View Routing */}
        {currentView === 'dashboard' && (
          <DashboardOverview
            ships={ships}
            shipments={shipments}
            ports={ports}
            customers={customers}
            onNavigate={setCurrentView}
            onAddShipment={() => {
              setEditingShipment(null);
              setIsTxModalOpen(true);
            }}
            onAddShip={() => {
              setEditingShip(null);
              setIsShipModalOpen(true);
            }}
            onPrintSpal={(s) => {
              setPrintingShipment(s);
              setIsPrintModalOpen(true);
            }}
          />
        )}

        {currentView === 'master' && (
          <MasterDataView
            subView={masterSubView}
            onSelectSubView={setMasterSubView}
            ships={ships}
            ports={ports}
            customers={customers}
            tariffs={tariffs}
            onAddShip={() => {
              setEditingShip(null);
              setIsShipModalOpen(true);
            }}
            onEditShip={(s) => {
              setEditingShip(s);
              setIsShipModalOpen(true);
            }}
            onDeleteShip={handleDeleteShip}
            onAddPort={() => {
              setEditingPort(null);
              setIsPortModalOpen(true);
            }}
            onEditPort={(p) => {
              setEditingPort(p);
              setIsPortModalOpen(true);
            }}
            onDeletePort={handleDeletePort}
            onAddCustomer={() => {
              setEditingCustomer(null);
              setIsCustomerModalOpen(true);
            }}
            onEditCustomer={(c) => {
              setEditingCustomer(c);
              setIsCustomerModalOpen(true);
            }}
            onDeleteCustomer={handleDeleteCustomer}
            onAddTariff={() => {
              setEditingTariff(null);
              setIsTariffModalOpen(true);
            }}
            onEditTariff={(t) => {
              setEditingTariff(t);
              setIsTariffModalOpen(true);
            }}
            onDeleteTariff={handleDeleteTariff}
            onRefresh={fetchAllData}
          />
        )}

        {currentView === 'transaksi' && (
          <TransaksiView
            shipments={shipments}
            ships={ships}
            onAddShipment={() => {
              setEditingShipment(null);
              setIsTxModalOpen(true);
            }}
            onEditShipment={(s) => {
              setEditingShipment(s);
              setIsTxModalOpen(true);
            }}
            onDeleteShipment={handleDeleteShipment}
            onUpdateStatus={handleUpdateShipmentStatus}
            onPrintSpal={(s) => {
              setPrintingShipment(s);
              setIsPrintModalOpen(true);
            }}
            onRefresh={fetchAllData}
          />
        )}

        {currentView === 'laporan' && (
          <LaporanView
            report={report}
            shipments={shipments}
            ships={ships}
            onRefresh={fetchAllData}
          />
        )}
      </main>

      {/* Global Modals */}
      <ShipModal
        isOpen={isShipModalOpen}
        onClose={() => setIsShipModalOpen(false)}
        onSave={handleSaveShip}
        editingShip={editingShip}
      />

      <PortModal
        isOpen={isPortModalOpen}
        onClose={() => setIsPortModalOpen(false)}
        onSave={handleSavePort}
        editingPort={editingPort}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
        editingCustomer={editingCustomer}
      />

      <TariffModal
        isOpen={isTariffModalOpen}
        onClose={() => setIsTariffModalOpen(false)}
        onSave={handleSaveTariff}
        editingTariff={editingTariff}
      />

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveShipment}
        editingShipment={editingShipment}
        ships={ships}
        ports={ports}
        customers={customers}
        tariffs={tariffs}
      />

      <PrintSpalModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        shipment={printingShipment}
      />
    </div>
  );
}
