
import React, { useState, useEffect } from 'react';
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

enum View {
  DASHBOARD = 'dashboard',
  TICKETS = 'tickets',
  TICKET_DETAIL = 'ticket_detail',
  DEVICES = 'devices',
  DEVICE_DETAIL = 'device_detail',
  CUSTOMERS = 'customers',
  CUSTOMER_DETAIL = 'customer_detail',
  BILLING = 'billing',
  MAINTENANCE = 'maintenance',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  KB = 'kb',
  PLANS = 'plans',
  EMPLOYEES = 'employees',
  EMPLOYEE_DETAIL = 'employee_detail',
  RADIUS = 'radius',
  SYSLOG = 'syslog'
}

const App: React.FC = () => {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.NOC);
  const [currentUserName, setCurrentUserName] = useState('');

  // Navigation State
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Selection State for Detail Views
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deviceFilter, setDeviceFilter] = useState('');

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
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView(View.DASHBOARD);
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
                  // In a real app, this would send an API call to the Radius server
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
              // Simple audit log
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

  // --- Navigation Helpers ---
  const navigateToTicket = (ticket: Ticket) => {
      setSelectedTicket(ticket);
      setCurrentView(View.TICKET_DETAIL);
  };

  const navigateToDevice = (deviceId: string) => {
      const device = devices.find(d => d.id === deviceId || d.ip_address === deviceId || d.name === deviceId);
      if (device) {
          setSelectedDevice(device);
          setCurrentView(View.DEVICE_DETAIL);
      } else {
          // If not found, maybe switch to inventory with filter
          setDeviceFilter(deviceId);
          setCurrentView(View.DEVICES);
      }
  };

  const navigateToCustomer = (customerOrId: string | Customer) => {
      if (typeof customerOrId === 'string') {
          const cust = customers.find(c => c.id === customerOrId);
          if (cust) {
              setSelectedCustomer(cust);
              setCurrentView(View.CUSTOMER_DETAIL);
          }
      } else {
          setSelectedCustomer(customerOrId);
          setCurrentView(View.CUSTOMER_DETAIL);
      }
  };

  const navigateToEmployee = (employee: Employee) => {
      setSelectedEmployee(employee);
      setCurrentView(View.EMPLOYEE_DETAIL);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // --- Sidebar Menu ---
  const MenuItem = ({ view, label, icon, roles }: { view: View, label: string, icon: React.ReactNode, roles?: UserRole[] }) => {
      if (roles && !roles.includes(currentUserRole) && currentUserRole !== UserRole.MANAGER) return null;
      return (
        <button 
            onClick={() => { setCurrentView(view); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${currentView === view ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
      );
  };

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
        
        {/* AI Assistant - Floating */}
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
                <MenuItem view={View.DASHBOARD} label="Dashboard" icon={<LayoutDashboard size={20} />} />
                <MenuItem view={View.TICKETS} label="Helpdesk & Tickets" icon={<TicketIcon size={20} />} />
                <MenuItem view={View.CUSTOMERS} label="Customers" icon={<Users size={20} />} />
                
                <p className="text-xs font-bold text-slate-500 uppercase px-3 mb-2 mt-6">Network & Assets</p>
                <MenuItem view={View.DEVICES} label="Inventory & Map" icon={<Server size={20} />} />
                <MenuItem view={View.MAINTENANCE} label="Maintenance" icon={<SettingsIcon size={20} />} />
                <MenuItem view={View.RADIUS} label="AAA / Radius" icon={<Shield size={20} />} roles={[UserRole.NOC, UserRole.NETWORK]} />
                <MenuItem view={View.SYSLOG} label="Syslogs" icon={<Terminal size={20} />} roles={[UserRole.NOC, UserRole.NETWORK]} />

                <p className="text-xs font-bold text-slate-500 uppercase px-3 mb-2 mt-6">Admin & Billing</p>
                <MenuItem view={View.BILLING} label="Billing" icon={<FileText size={20} />} roles={[UserRole.FINANCE, UserRole.MANAGER, UserRole.SALES]} />
                <MenuItem view={View.EMPLOYEES} label="Staff (HRIS)" icon={<Briefcase size={20} />} roles={[UserRole.HRD, UserRole.MANAGER]} />
                <MenuItem view={View.REPORTS} label="Reports" icon={<FileText size={20} />} />
                <MenuItem view={View.KB} label="Knowledge Base" icon={<Book size={20} />} />
                <MenuItem view={View.PLANS} label="Service Plans" icon={<Activity size={20} />} roles={[UserRole.PRODUCT_MANAGER, UserRole.MANAGER]} />
                <MenuItem view={View.SETTINGS} label="Settings" icon={<SettingsIcon size={20} />} roles={[UserRole.MANAGER]} />
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
                    {/* Global Search Component */}
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

            {/* View Area */}
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
              {currentView === View.DASHBOARD && (
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
                    onViewAllTickets={() => setCurrentView(View.TICKETS)}
                    onNavigateToCustomer={navigateToCustomer}
                    onValidateDevice={(d) => { navigateToDevice(d.id); }} // Usually goes to detail to validate
                    onAddCustomer={() => { setCurrentView(View.CUSTOMERS); /* trigger add modal if needed via prop/state, but simple nav for now */ }}
                />
              )}
              
              {currentView === View.TICKETS && (
                <TicketList 
                    tickets={tickets} 
                    onSelectTicket={navigateToTicket} 
                    onCreateTicket={handleCreateTicket}
                    invoices={invoices}
                    maintenance={maintenance}
                />
              )}

              {currentView === View.TICKET_DETAIL && selectedTicket && (
                <TicketDetail 
                    ticket={selectedTicket} 
                    employees={employees}
                    devices={devices}
                    tickets={tickets}
                    kbArticles={kbArticles}
                    onBack={() => setCurrentView(View.TICKETS)}
                    onUpdateStatus={handleUpdateTicketStatus}
                    onUpdateTicket={handleUpdateTicket}
                    onNavigateToDevice={navigateToDevice}
                    onNavigateToCustomer={navigateToCustomer}
                    onNavigateToInvoice={(invId) => { setCurrentView(View.BILLING); /* Could add filter state here */ }}
                    onNavigateToMaintenance={(mtId) => { setCurrentView(View.MAINTENANCE); /* Could add filter state */ }}
                />
              )}

              {currentView === View.DEVICES && (
                <DeviceInventory
                    devices={devices}
                    userRole={currentUserRole}
                    customers={customers} 
                    onAddDevice={handleAddDevice}
                    onUpdateDevice={handleUpdateDevice}
                    onValidateDevice={handleValidateDevice}
                    onSelectDevice={(d) => { setSelectedDevice(d); setCurrentView(View.DEVICE_DETAIL); }}
                    preSetFilter={deviceFilter}
                    tickets={tickets}
                    radiusSessions={radiusSessions} // Pass active sessions for IPAM
                    onNavigateToCustomer={navigateToCustomer}
                />
              )}

              {currentView === View.DEVICE_DETAIL && selectedDevice && (
                  <DeviceDetail 
                      device={selectedDevice}
                      allDevices={devices}
                      tickets={tickets}
                      customers={customers}
                      invoices={invoices}
                      maintenance={maintenance}
                      userRole={currentUserRole}
                      onBack={() => setCurrentView(View.DEVICES)}
                      onUpdateDevice={handleUpdateDevice}
                      onNavigateToTicket={navigateToTicket}
                      onNavigateToDevice={navigateToDevice}
                      onCreateTicket={handleCreateTicket}
                  />
              )}

              {currentView === View.CUSTOMERS && (
                <CustomerManagement 
                    customers={customers}
                    userRole={currentUserRole}
                    servicePlans={servicePlans}
                    onAddCustomer={handleAddCustomer}
                    onVerifyCustomer={handleVerifyCustomer}
                    onProvisionCustomer={handleProvisionCustomer}
                    onSelectCustomer={navigateToCustomer}
                />
              )}

              {currentView === View.CUSTOMER_DETAIL && selectedCustomer && (
                  <CustomerDetail 
                      customer={selectedCustomer}
                      userRole={currentUserRole}
                      servicePlans={servicePlans}
                      invoices={invoices}
                      devices={devices}
                      tickets={tickets}
                      onBack={() => setCurrentView(View.CUSTOMERS)}
                      onUpdateCustomer={handleUpdateCustomer}
                      onCreateTicket={handleCreateTicket}
                      onAddDevice={handleAddDevice}
                      onTerminateCustomer={handleTerminateCustomer}
                      onKickSession={handleKickSession}
                  />
              )}

              {currentView === View.BILLING && (
                  <BillingList 
                      invoices={invoices}
                      customers={customers}
                      userRole={currentUserRole}
                      onUpdateStatus={handleUpdateInvoiceStatus}
                      onCreateInvoice={handleCreateInvoice}
                  />
              )}

              {currentView === View.MAINTENANCE && (
                  <MaintenanceSchedule 
                      maintenanceList={maintenance}
                      userRole={currentUserRole}
                      onAddMaintenance={handleAddMaintenance}
                      onUpdateStatus={handleUpdateMaintenanceStatus}
                      onNavigateToDevice={navigateToDevice}
                  />
              )}

              {currentView === View.REPORTS && (
                  <Reports 
                      tickets={tickets}
                      customers={customers}
                      invoices={invoices}
                  />
              )}

              {currentView === View.SETTINGS && (
                  <Settings onSave={handleSaveSettings} />
              )}

              {currentView === View.KB && (
                  <KnowledgeBase articles={kbArticles} />
              )}

              {currentView === View.PLANS && (
                  <ServicePlanManager 
                      plans={servicePlans} 
                      userRole={currentUserRole} 
                      onAddPlan={handleAddPlan}
                  />
              )}

              {currentView === View.EMPLOYEES && (
                  <EmployeeManagement 
                      employees={employees}
                      userRole={currentUserRole}
                      onAddEmployee={handleAddEmployee}
                      onUpdateEmployee={handleUpdateEmployee}
                      onSelectEmployee={navigateToEmployee}
                  />
              )}

              {currentView === View.EMPLOYEE_DETAIL && selectedEmployee && (
                  <EmployeeDetail 
                      employee={selectedEmployee}
                      userRole={currentUserRole}
                      onBack={() => setCurrentView(View.EMPLOYEES)}
                      onUpdateEmployee={handleUpdateEmployee}
                  />
              )}

              {currentView === View.RADIUS && (
                  <RadiusManagement 
                      sessions={radiusSessions}
                      logs={radiusLogs}
                      customers={customers}
                      userRole={currentUserRole}
                      onKickSession={handleKickSession}
                      onNavigateToCustomer={navigateToCustomer}
                  />
              )}

              {currentView === View.SYSLOG && (
                  <SyslogViewer initialLogs={syslogs} />
              )}
            </div>
        </main>
    </div>
  );
};

export default App;
