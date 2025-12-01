import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { Ticket, TicketStatus, ActivityLogEntry, Severity, UserRole, Device, DeviceStatus, Customer, CustomerStatus, ServicePlan, Employee, Invoice, InvoiceStatus, Maintenance, MaintenanceStatus, KBArticle, TicketType, EmployeeAuditLogEntry, RadiusSession, RadiusLog, SyslogMessage, EmployeeStatus } from './types';
import { MOCK_TICKETS, MOCK_DEVICES, MOCK_CUSTOMERS, MOCK_EMPLOYEES, MOCK_INVOICES, MOCK_MAINTENANCE, MOCK_KB, MOCK_SERVICE_PLANS, MOCK_RADIUS_SESSIONS, MOCK_RADIUS_LOGS, MOCK_SYSLOGS } from './constants';
import Dashboard from './components/Dashboard';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import DeviceInventory from './components/DeviceInventory';
import DeviceDetail from './components/DeviceDetail';
import CustomerManagement from './components/CustomerManagement';
import CustomerDetail from './components/CustomerDetail';
import BillingList from './components/BillingList';
import MaintenanceSchedule from './components/MaintenanceSchedule';
import Reports from './components/Reports';
import Settings from './components/Settings';
import KnowledgeBase from './components/KnowledgeBase';
import ServicePlanManager from './components/ServicePlanManager';
import EmployeeManagement from './components/EmployeeManagement';
import EmployeeDetail from './components/EmployeeDetail';
import RadiusManagement from './components/RadiusManagement';
import SyslogViewer from './components/SyslogViewer';
import LoginScreen from './components/LoginScreen';
import NotificationToast, { Notification } from './components/NotificationToast';
import NotificationPanel from './components/NotificationPanel';
import GlobalSearch from './components/GlobalSearch';
import AIAssistant from './components/AIAssistant';
import { LayoutDashboard, Ticket as TicketIcon, Server, Users, FileText, Settings as SettingsIcon, LogOut, Menu, Bell, Book, Briefcase, Activity, Shield, Terminal } from 'lucide-react';

const App: React.FC = () => {
  // Router Hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.NOC);
  const [currentUserName, setCurrentUserName] = useState('');

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Data State
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [maintenance, setMaintenance] = useState<Maintenance[]>(MOCK_MAINTENANCE);
  const [kbArticles, setKbArticles] = useState<KBArticle[]>(MOCK_KB);
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>(MOCK_SERVICE_PLANS);
  const [radiusSessions, setRadiusSessions] = useState<RadiusSession[]>(MOCK_RADIUS_SESSIONS);
  const [radiusLogs, setRadiusLogs] = useState<RadiusLog[]>(MOCK_RADIUS_LOGS);
  const [syslogs, setSyslogs] = useState<SyslogMessage[]>(MOCK_SYSLOGS);

  // Notification State
  const [notification, setNotification] = useState<Notification | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // --- Handlers ---

  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const newNotif: Notification = { id: Date.now().toString(), type, title, message };
    setNotification(newNotif);
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleLogin = (role: UserRole, username: string) => {
    setCurrentUserRole(role);
    setCurrentUserName(username);
    setIsLoggedIn(true);
    addNotification('success', 'Welcome Back', `Logged in as ${username} (${role})`);
    navigate('/');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/login');
    setNotification(null);
  };

  // Ticket Handlers
  const handleCreateTicket = (data: any) => {
    const newTicket: Ticket = {
      id: `ISP-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*1000)}`,
      created_at: new Date().toISOString(),
      status: TicketStatus.OPEN,
      ...data,
      activityLog: [{
        id: `log-${Date.now()}`,
        action: 'Ticket Created',
        description: 'Ticket created manually via dashboard.',
        timestamp: new Date().toISOString(),
        user: currentUserName
      }]
    };
    setTickets([newTicket, ...tickets]);
    addNotification('success', 'Ticket Created', `Ticket ${newTicket.id} has been created.`);
  };

  const handleUpdateTicketStatus = (id: string, newStatus: TicketStatus) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        const logEntry: ActivityLogEntry = {
          id: `log-${Date.now()}`,
          action: 'Status Update',
          description: `Status changed to ${newStatus}`,
          timestamp: new Date().toISOString(),
          user: currentUserName
        };
        return { ...t, status: newStatus, activityLog: [logEntry, ...(t.activityLog || [])] };
      }
      return t;
    }));
  };

  const handleUpdateTicket = (id: string, data: Partial<Ticket>) => {
      setTickets(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };

  // Device Handlers
  const handleAddDevice = (deviceData: any) => {
      const newDevice: Device = {
          id: `DEV-${Date.now()}`,
          status: DeviceStatus.PENDING,
          last_updated: new Date().toISOString(),
          installed_by: currentUserName,
          ...deviceData
      };
      setDevices([...devices, newDevice]);
      addNotification('success', 'Device Added', `${newDevice.name} added to inventory.`);
  };

  const handleUpdateDevice = (id: string, data: any) => {
      setDevices(prev => prev.map(d => d.id === id ? { ...d, ...data, last_updated: new Date().toISOString() } : d));
      addNotification('success', 'Device Updated', 'Device configuration saved.');
  };

  const handleValidateDevice = (id: string) => {
      setDevices(prev => prev.map(d => d.id === id ? { ...d, status: DeviceStatus.ACTIVE, validated_by: currentUserName } : d));
      addNotification('success', 'Device Activated', 'Device validated and active.');
  };

  // Customer Handlers
  const handleAddCustomer = (data: any) => {
      const newCustomer: Customer = {
          id: `CID-${Math.floor(100000 + Math.random() * 900000)}`,
          registered_at: new Date().toISOString(),
          status: CustomerStatus.LEAD,
          sales_agent: currentUserName,
          last_updated: new Date().toISOString(),
          ...data
      };
      setCustomers([...customers, newCustomer]);
      addNotification('success', 'Lead Registered', `Customer ${newCustomer.name} added.`);
  };

  const handleUpdateCustomer = (id: string, data: any) => {
      const oldCustomer = customers.find(c => c.id === id);
      
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data, last_updated: new Date().toISOString() } : c));
      addNotification('success', 'Customer Updated', 'Changes saved successfully.');

      // SIMULATE RADIUS CoA (Change of Authorization) on Plan Change
      if (oldCustomer && (data.package_name || data.service_plan_id)) {
          const oldPlan = oldCustomer.package_name;
          const newPlan = data.package_name || oldCustomer.package_name;
          
          if (oldPlan !== newPlan) {
              const session = radiusSessions.find(s => s.customer_id === id);
              if (session) {
                  setTimeout(() => {
                      addNotification('info', 'Radius CoA Triggered', `Speed limit update sent to NAS for user ${oldCustomer.pppoe_username || 'unknown'} (Plan: ${newPlan}).`);
                  }, 1000);
              }
          }
      }
  };

  const handleVerifyCustomer = (id: string, data: any) => {
      handleUpdateCustomer(id, { ...data, status: CustomerStatus.VERIFIED });
  };

  const handleProvisionCustomer = (id: string, data: any) => {
      handleUpdateCustomer(id, { ...data, status: CustomerStatus.ACTIVE });
      addNotification('success', 'Service Activated', 'Customer is now active.');
  };

  const handleTerminateCustomer = (id: string, reason: string, date: string, createTicket: boolean) => {
      handleUpdateCustomer(id, { 
          status: CustomerStatus.TERMINATED, 
          termination_date: date, 
          termination_reason: reason 
      });
      
      if (createTicket) {
          const customer = customers.find(c => c.id === id);
          handleCreateTicket({
              title: `Device Retrieval - ${customer?.name}`,
              type: TicketType.INFRASTRUCTURE,
              severity: Severity.MINOR,
              location: customer?.address || 'Unknown',
              description: `Retrieve CPE due to termination. Reason: ${reason}`,
              link_id: id,
              device_id: devices.find(d => d.customer_id === id)?.id
          });
      }
      addNotification('warning', 'Customer Terminated', 'Subscription ended.');
  };

  // Invoice Handlers
  const handleCreateInvoice = (data: any) => {
      const newInvoice: Invoice = {
          id: `INV-${new Date().toISOString().slice(0,7).replace('-','')}-${Math.floor(Math.random()*1000)}`,
          ...data
      };
      setInvoices([newInvoice, ...invoices]);
      addNotification('success', 'Invoice Generated', `Invoice ${newInvoice.id} created.`);
  };

  const handleUpdateInvoiceStatus = (id: string, status: InvoiceStatus) => {
      setInvoices(prev => prev.map(i => i.id === id ? { ...i, status, payment_date: status === InvoiceStatus.PAID ? new Date().toISOString() : undefined } : i));
  };

  // Maintenance Handlers
  const handleAddMaintenance = (data: any) => {
      const newMaint: Maintenance = {
          id: `MT-${Date.now()}`,
          created_by: currentUserName,
          ...data
      };
      setMaintenance([...maintenance, newMaint]);
      addNotification('info', 'Maintenance Scheduled', 'Notification sent to affected users.');
  };

  const handleUpdateMaintenanceStatus = (id: string, status: MaintenanceStatus) => {
      setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  // Employee Handlers
  const handleAddEmployee = (data: any) => {
      const newEmp: Employee = {
          id: `EMP-${Math.floor(Math.random() * 10000)}`,
          auditLog: [],
          ...data
      };
      setEmployees([...employees, newEmp]);
      addNotification('success', 'Employee Added', 'New staff member registered.');
  };

  const handleUpdateEmployee = (id: string, data: any) => {
      setEmployees(prev => prev.map(e => {
          if (e.id === id) {
              const changedField = Object.keys(data).find(k => data[k] !== (e as any)[k]) || 'details';
              const log: EmployeeAuditLogEntry = {
                  id: `audit-${Date.now()}`,
                  field: changedField,
                  old_value: String((e as any)[changedField] || ''),
                  new_value: String(data[changedField] || ''),
                  changed_by: currentUserName,
                  timestamp: new Date().toISOString()
              };
              return { ...e, ...data, auditLog: [log, ...(e.auditLog || [])] };
          }
          return e;
      }));
      addNotification('success', 'Profile Updated', 'Employee record updated.');
  };

  // Service Plan Handlers
  const handleAddPlan = (data: any) => {
      const newPlan: ServicePlan = {
          id: `PLAN-${Date.now()}`,
          ...data
      };
      setServicePlans([...servicePlans, newPlan]);
      addNotification('success', 'Plan Created', 'New service plan available.');
  };

  // Radius Handlers
  const handleKickSession = (sessionId: string) => {
      setRadiusSessions(prev => prev.filter(s => s.id !== sessionId));
      addNotification('warning', 'Session Terminated', 'User disconnected from network.');
  };

  // Settings Handler
  const handleSaveSettings = (section: string, data: any) => {
      console.log(`Saved settings for ${section}`, data);
      addNotification('success', 'Settings Saved', 'System configuration updated.');
  };

  // --- Navigation Helpers (Using Router) ---
  const navigateToTicket = (ticket: Ticket) => navigate(`/tickets/${ticket.id}`);
  const navigateToDevice = (deviceId: string) => {
      // Check if ID is a valid device ID or simple search string
      const device = devices.find(d => d.id === deviceId);
      if (device) {
          navigate(`/devices/${device.id}`);
      } else {
          // If searching, go to inventory with query param (mocked via state passing for now)
          navigate('/devices', { state: { filter: deviceId } });
      }
  };
  const navigateToCustomer = (customerOrId: string | Customer) => {
      const id = typeof customerOrId === 'string' ? customerOrId : customerOrId.id;
      navigate(`/customers/${id}`);
  };
  const navigateToEmployee = (employee: Employee) => navigate(`/employees/${employee.id}`);

  // --- Route Wrappers for Detail Views ---
  
  const TicketDetailRoute = () => {
    const { id } = useParams();
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return <Navigate to="/tickets" />;
    return (
        <TicketDetail 
            ticket={ticket} 
            employees={employees}
            devices={devices}
            tickets={tickets}
            kbArticles={kbArticles}
            onBack={() => navigate('/tickets')}
            onUpdateStatus={handleUpdateTicketStatus}
            onUpdateTicket={handleUpdateTicket}
            onNavigateToDevice={navigateToDevice}
            onNavigateToCustomer={navigateToCustomer}
            onNavigateToInvoice={() => navigate('/billing')}
            onNavigateToMaintenance={() => navigate('/maintenance')}
        />
    );
  };

  const CustomerDetailRoute = () => {
    const { id } = useParams();
    const customer = customers.find(c => c.id === id);
    if (!customer) return <Navigate to="/customers" />;
    return (
        <CustomerDetail 
            customer={customer}
            userRole={currentUserRole}
            servicePlans={servicePlans}
            invoices={invoices}
            devices={devices}
            tickets={tickets}
            onBack={() => navigate('/customers')}
            onUpdateCustomer={handleUpdateCustomer}
            onCreateTicket={handleCreateTicket}
            onAddDevice={handleAddDevice}
            onTerminateCustomer={handleTerminateCustomer}
            onKickSession={handleKickSession}
        />
    );
  };

  const DeviceDetailRoute = () => {
    const { id } = useParams();
    const device = devices.find(d => d.id === id);
    if (!device) return <Navigate to="/devices" />;
    return (
        <DeviceDetail 
            device={device}
            allDevices={devices}
            tickets={tickets}
            customers={customers}
            invoices={invoices}
            maintenance={maintenance}
            userRole={currentUserRole}
            onBack={() => navigate('/devices')}
            onUpdateDevice={handleUpdateDevice}
            onNavigateToTicket={navigateToTicket}
            onNavigateToDevice={navigateToDevice}
            onCreateTicket={handleCreateTicket}
        />
    );
  };

  const EmployeeDetailRoute = () => {
    const { id } = useParams();
    const employee = employees.find(e => e.id === id);
    if (!employee) return <Navigate to="/employees" />;
    return (
        <EmployeeDetail 
            employee={employee}
            userRole={currentUserRole}
            onBack={() => navigate('/employees')}
            onUpdateEmployee={handleUpdateEmployee}
        />
    );
  };

  const DeviceInventoryRoute = () => {
      // Handle passing filter state via navigation
      const { state } = useLocation();
      const filter = state && (state as any).filter ? (state as any).filter : '';
      
      return (
        <DeviceInventory
            devices={devices}
            userRole={currentUserRole}
            customers={customers} 
            onAddDevice={handleAddDevice}
            onUpdateDevice={handleUpdateDevice}
            onValidateDevice={handleValidateDevice}
            onSelectDevice={(d) => navigateToDevice(d.id)}
            preSetFilter={filter}
            tickets={tickets}
            radiusSessions={radiusSessions}
            onNavigateToCustomer={navigateToCustomer}
            onKickSession={handleKickSession}
        />
      );
  };

  // --- Sidebar Menu Item ---
  const MenuItem = ({ path, label, icon, roles }: { path: string, label: string, icon: React.ReactNode, roles?: UserRole[] }) => {
      if (roles && !roles.includes(currentUserRole) && currentUserRole !== UserRole.MANAGER) return null;
      const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
      
      return (
        <button 
            onClick={() => { navigate(path); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
      );
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
        
        {/* Global Notifications */}
        <NotificationToast notification={notification} onClose={() => setNotification(null)} />
        <NotificationPanel 
            isOpen={isNotificationPanelOpen} 
            onClose={() => setIsNotificationPanelOpen(false)} 
            notifications={notifications} 
            onClear={() => setNotifications([])}
        />
        
        {/* AI Assistant */}
        <AIAssistant tickets={tickets} customers={customers} devices={devices} />

        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-slate-900 text-white transition-all duration-300 flex flex-col fixed md:relative z-20 h-full overflow-hidden`}>
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Activity size={20} className="text-white" />
                </div>
                <h1 className="font-bold text-xl tracking-tight">ISP Manager</h1>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase px-3 mb-2 mt-2">Operations</p>
                <MenuItem path="/" label="Dashboard" icon={<LayoutDashboard size={20} />} />
                <MenuItem path="/tickets" label="Helpdesk & Tickets" icon={<TicketIcon size={20} />} />
                <MenuItem path="/customers" label="Customers" icon={<Users size={20} />} />
                
                <p className="text-xs font-bold text-slate-500 uppercase px-3 mb-2 mt-6">Network & Assets</p>
                <MenuItem path="/devices" label="Inventory & Map" icon={<Server size={20} />} />
                <MenuItem path="/maintenance" label="Maintenance" icon={<SettingsIcon size={20} />} />
                <MenuItem path="/radius" label="AAA / Radius" icon={<Shield size={20} />} roles={[UserRole.NOC, UserRole.NETWORK]} />
                <MenuItem path="/syslog" label="Syslogs" icon={<Terminal size={20} />} roles={[UserRole.NOC, UserRole.NETWORK]} />

                <p className="text-xs font-bold text-slate-500 uppercase px-3 mb-2 mt-6">Admin & Billing</p>
                <MenuItem path="/billing" label="Billing" icon={<FileText size={20} />} roles={[UserRole.FINANCE, UserRole.MANAGER, UserRole.SALES]} />
                <MenuItem path="/employees" label="Staff (HRIS)" icon={<Briefcase size={20} />} roles={[UserRole.HRD, UserRole.MANAGER]} />
                <MenuItem path="/reports" label="Reports" icon={<FileText size={20} />} />
                <MenuItem path="/kb" label="Knowledge Base" icon={<Book size={20} />} />
                <MenuItem path="/plans" label="Service Plans" icon={<Activity size={20} />} roles={[UserRole.PRODUCT_MANAGER, UserRole.MANAGER]} />
                <MenuItem path="/settings" label="Settings" icon={<SettingsIcon size={20} />} roles={[UserRole.MANAGER]} />
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                        {currentUserName.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{currentUserName}</p>
                        <p className="text-xs text-slate-400 truncate">{currentUserRole}</p>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-slate-400 hover:text-white w-full px-2 py-2 rounded transition"
                >
                    <LogOut size={16} /> <span className="text-sm">Sign Out</span>
                </button>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden h-full">
            {/* Topbar */}
            <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
                <div className="flex items-center gap-4 flex-1">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:text-slate-800">
                        <Menu size={24} />
                    </button>
                    <GlobalSearch 
                        tickets={tickets} 
                        customers={customers} 
                        devices={devices}
                        onNavigateToTicket={navigateToTicket}
                        onNavigateToCustomer={navigateToCustomer}
                        onNavigateToDevice={navigateToDevice}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition"
                        onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                    </button>
                </div>
            </header>

            {/* View Area - Router Switch */}
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                <Routes>
                    <Route path="/" element={
                        <Dashboard 
                            tickets={tickets} 
                            customers={customers} 
                            devices={devices} 
                            invoices={invoices}
                            servicePlans={servicePlans}
                            maintenance={maintenance}
                            userRole={currentUserRole}
                            onCreateTicket={handleCreateTicket}
                            onNavigateToTicket={navigateToTicket}
                            onViewAllTickets={() => navigate('/tickets')}
                            onNavigateToCustomer={navigateToCustomer}
                            onValidateDevice={(d) => navigateToDevice(d.id)}
                            onAddCustomer={() => navigate('/customers')}
                        />
                    } />
                    
                    <Route path="/tickets" element={
                        <TicketList 
                            tickets={tickets} 
                            onSelectTicket={navigateToTicket} 
                            onCreateTicket={handleCreateTicket}
                            invoices={invoices}
                            maintenance={maintenance}
                        />
                    } />
                    <Route path="/tickets/:id" element={<TicketDetailRoute />} />

                    <Route path="/customers" element={
                        <CustomerManagement 
                            customers={customers}
                            userRole={currentUserRole}
                            servicePlans={servicePlans}
                            onAddCustomer={handleAddCustomer}
                            onVerifyCustomer={handleVerifyCustomer}
                            onProvisionCustomer={handleProvisionCustomer}
                            onSelectCustomer={navigateToCustomer}
                        />
                    } />
                    <Route path="/customers/:id" element={<CustomerDetailRoute />} />

                    <Route path="/devices" element={<DeviceInventoryRoute />} />
                    <Route path="/devices/:id" element={<DeviceDetailRoute />} />

                    <Route path="/maintenance" element={
                        <MaintenanceSchedule 
                            maintenanceList={maintenance}
                            userRole={currentUserRole}
                            onAddMaintenance={handleAddMaintenance}
                            onUpdateStatus={handleUpdateMaintenanceStatus}
                            onNavigateToDevice={navigateToDevice}
                        />
                    } />

                    <Route path="/radius" element={
                        <RadiusManagement 
                            sessions={radiusSessions}
                            logs={radiusLogs}
                            customers={customers}
                            userRole={currentUserRole}
                            onKickSession={handleKickSession}
                            onNavigateToCustomer={navigateToCustomer}
                        />
                    } />

                    <Route path="/syslog" element={
                        <SyslogViewer initialLogs={syslogs} />
                    } />

                    <Route path="/billing" element={
                        <BillingList 
                            invoices={invoices}
                            customers={customers}
                            userRole={currentUserRole}
                            onUpdateStatus={handleUpdateInvoiceStatus}
                            onCreateInvoice={handleCreateInvoice}
                        />
                    } />

                    <Route path="/employees" element={
                        <EmployeeManagement 
                            employees={employees}
                            userRole={currentUserRole}
                            onAddEmployee={handleAddEmployee}
                            onUpdateEmployee={handleUpdateEmployee}
                            onSelectEmployee={navigateToEmployee}
                        />
                    } />
                    <Route path="/employees/:id" element={<EmployeeDetailRoute />} />

                    <Route path="/reports" element={
                        <Reports 
                            tickets={tickets}
                            customers={customers}
                            invoices={invoices}
                        />
                    } />

                    <Route path="/kb" element={
                        <KnowledgeBase articles={kbArticles} />
                    } />

                    <Route path="/plans" element={
                        <ServicePlanManager 
                            plans={servicePlans} 
                            userRole={currentUserRole} 
                            onAddPlan={handleAddPlan}
                        />
                    } />

                    <Route path="/settings" element={
                        <Settings onSave={handleSaveSettings} />
                    } />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </main>
    </div>
  );
};

export default App;