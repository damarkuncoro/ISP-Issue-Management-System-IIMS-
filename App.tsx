
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Ticket as TicketIcon, Settings as SettingsIcon, Bell, Search, User, Menu, X, ChevronDown, Server, Users, DollarSign, Briefcase, CreditCard, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import NotificationToast, { Notification } from './components/NotificationToast';
import DeviceInventory from './components/DeviceInventory';
import CustomerManagement from './components/CustomerManagement';
import CustomerDetail from './components/CustomerDetail';
import ServicePlanManager from './components/ServicePlanManager';
import EmployeeManagement from './components/EmployeeManagement';
import EmployeeDetail from './components/EmployeeDetail';
import Settings from './components/Settings'; 
import BillingList from './components/BillingList'; 
import LoginScreen from './components/LoginScreen';
import { MOCK_TICKETS, MOCK_DEVICES, MOCK_CUSTOMERS, MOCK_SERVICE_PLANS, MOCK_EMPLOYEES, MOCK_INVOICES } from './constants';
import { Ticket, TicketStatus, ActivityLogEntry, Severity, UserRole, Device, DeviceStatus, Customer, CustomerStatus, ServicePlan, Employee, Invoice, InvoiceStatus } from './types';
import { generateTicketSummary } from './services/geminiService';

enum View {
  DASHBOARD = 'dashboard',
  TICKETS = 'tickets',
  DEVICES = 'devices',
  CUSTOMERS = 'customers',
  SERVICE_PLANS = 'service_plans',
  EMPLOYEES = 'employees',
  BILLING = 'billing', 
  DETAIL_TICKET = 'detail_ticket',
  DETAIL_CUSTOMER = 'detail_customer',
  DETAIL_EMPLOYEE = 'detail_employee',
  SETTINGS = 'settings'
}

const App: React.FC = () => {
  // --- AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionUser, setSessionUser] = useState<{name: string, role: UserRole} | null>(null);

  // --- APP STATE ---
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>(MOCK_SERVICE_PLANS);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES); 
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deviceToValidate, setDeviceToValidate] = useState<Device | null>(null);
  
  const [aiSummary, setAiSummary] = useState<string>('');
  
  // Notification State
  const [notification, setNotification] = useState<Notification | null>(null);

  // Derived role from session, but allow override for DEMO purposes in sidebar
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.NOC);

  useEffect(() => {
    // Generate AI Summary on mount (only once logged in ideally, but simple check here)
    if (isAuthenticated) {
        const fetchSummary = async () => {
            const summary = await generateTicketSummary(tickets);
            setAiSummary(summary);
        };
        fetchSummary();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({
      id: Date.now().toString(),
      title,
      message,
      type
    });
  };

  const handleLogin = (role: UserRole, username: string) => {
      setIsAuthenticated(true);
      setSessionUser({ name: username, role: role });
      setCurrentUserRole(role);
      showNotification('Welcome Back', `Logged in as ${username} (${role})`, 'success');
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setSessionUser(null);
      setCurrentView(View.DASHBOARD);
  };

  // --- TICKET HANDLERS ---

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setCurrentView(View.DETAIL_TICKET);
  };

  const handleUpdateStatus = (id: string, newStatus: TicketStatus) => {
    const timestamp = new Date().toISOString();
    let newLogs: ActivityLogEntry[] = [{
        id: `log-${Date.now()}`,
        action: 'Status Update',
        description: `Status changed to ${newStatus}`,
        timestamp: timestamp,
        user: currentUserRole
    }];

    // Simulate External Notification on RESOLVED for Critical/Major tickets
    const ticket = tickets.find(t => t.id === id);
    if (ticket && newStatus === TicketStatus.RESOLVED && (ticket.severity === Severity.CRITICAL || ticket.severity === Severity.MAJOR)) {
        showNotification(
            'Recovery Alert Sent', 
            `Resolution notification sent via WhatsApp to Management for ticket ${id}`, 
            'success'
        );
        newLogs.unshift({
            id: `log-alert-${Date.now()}`,
            action: 'Automated Alert',
            description: `Sent [RECOVERY] WhatsApp message to NOC_Manager_Group (${ticket.severity} Issue Resolved)`,
            timestamp: new Date(Date.now() + 1000).toISOString(), // slight delay
            user: 'System Bot'
        });
    }

    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          status: newStatus,
          activityLog: [...newLogs, ...(t.activityLog || [])]
        };
      }
      return t;
    }));

    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket(prev => prev ? ({ 
        ...prev, 
        status: newStatus,
        activityLog: [...newLogs, ...(prev.activityLog || [])]
      }) : null);
    }
  };

  const handleCreateTicket = (ticketData: any) => {
    const newId = `ISP-20251128-${String(tickets.length + 1).padStart(3, '0')}`;
    const timestamp = new Date().toISOString();
    
    let initialLogs: ActivityLogEntry[] = [{
        id: `log-${Date.now()}`,
        action: 'Ticket Created',
        description: 'Ticket created manually via portal',
        timestamp: timestamp,
        user: currentUserRole
    }];

    // Simulate Critical Alert Logic
    if (ticketData.severity === Severity.CRITICAL) {
        // Trigger UI Notification
        showNotification(
            'Critical Alert Broadcasted', 
            'High severity issue detected. WhatsApp and Email blasts have been sent to the On-Call team.', 
            'warning'
        );

        // Add System Log for the simulated alert
        initialLogs.unshift({
            id: `log-alert-${Date.now()}`,
            action: 'Automated Escalation',
            description: `Sent [CRITICAL] WhatsApp Alert to NOC_L3_OnCall (0812-XXXX-XXXX) & Email to manager@isp.com`,
            timestamp: new Date(Date.now() + 500).toISOString(), // slight delay in log
            user: 'System Bot'
        });
    } else {
        showNotification('Ticket Created', `Ticket ${newId} has been successfully created.`, 'success');
    }

    const newTicket: Ticket = {
        id: newId,
        created_at: timestamp,
        status: TicketStatus.OPEN,
        activityLog: initialLogs,
        ...ticketData
    };
    setTickets([newTicket, ...tickets]);
  };

  // --- DEVICE HANDLERS ---

  const handleAddDevice = (deviceData: any) => {
    const isValidationRequired = currentUserRole === UserRole.FIELD;
    const initialStatus = isValidationRequired ? DeviceStatus.PENDING : DeviceStatus.ACTIVE;
    
    // Auto-generate a dummy ID if not provided (mock)
    const newId = `${deviceData.type.substring(0,2).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;

    const newDevice: Device = {
        id: newId,
        status: initialStatus,
        last_updated: new Date().toISOString(),
        installed_by: currentUserRole,
        validated_by: isValidationRequired ? undefined : currentUserRole,
        ...deviceData
    };

    setDevices([newDevice, ...devices]);

    if (isValidationRequired) {
        showNotification('Device Submitted', 'Device registered successfully. Pending validation by Network Engineer.', 'info');
    } else {
        showNotification('Device Registered', 'Device added to Active Inventory.', 'success');
    }
  };

  const handleUpdateDevice = (id: string, data: any) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, ...data, last_updated: new Date().toISOString() } : d));
    showNotification('Device Updated', 'Network configuration updated successfully.', 'success');
  };

  const handleValidateDevice = (id: string) => {
    setDevices(prev => prev.map(d => {
        if (d.id === id) {
            return {
                ...d,
                status: DeviceStatus.ACTIVE,
                validated_by: currentUserRole,
                last_updated: new Date().toISOString()
            };
        }
        return d;
    }));
    showNotification('Device Validated', `Device ${id} is now Active and monitored.`, 'success');
  };

  const handleDashboardValidateDevice = (device: Device) => {
      // Navigate to Devices view
      setCurrentView(View.DEVICES);
  };

  // --- CUSTOMER HANDLERS ---

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView(View.DETAIL_CUSTOMER);
  };

  const handleDashboardCustomerSelect = (customer: Customer) => {
      setSelectedCustomer(customer);
      setCurrentView(View.DETAIL_CUSTOMER); 
  };

  const handleAddCustomer = (customerData: any) => {
      const newId = `CID-25${Math.floor(Math.random() * 9000) + 1000}`;
      const newCustomer: Customer = {
          id: newId,
          ...customerData,
          status: CustomerStatus.LEAD,
          sales_agent: currentUserRole,
          registered_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
      };
      setCustomers([newCustomer, ...customers]);
      showNotification('Customer Lead Added', `Lead ${customerData.name} registered. Ready for CS verification.`, 'success');
  };

  const handleVerifyCustomer = (id: string, data: any) => {
     setCustomers(prev => prev.map(c => {
         if (c.id === id) {
             return { ...c, ...data, status: CustomerStatus.VERIFIED, last_updated: new Date().toISOString() };
         }
         return c;
     }));
     showNotification('Verification Complete', 'Customer documents verified. Ready for Provisioning.', 'success');
  };

  const handleProvisionCustomer = (id: string, data: any) => {
    setCustomers(prev => prev.map(c => {
        if (c.id === id) {
            return { ...c, ...data, status: CustomerStatus.ACTIVE, last_updated: new Date().toISOString() };
        }
        return c;
    }));
    showNotification('Service Activated', 'Customer internet service is now live.', 'success');
  };

  const handleUpdateCustomer = (id: string, data: any) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data, last_updated: new Date().toISOString() } : c));
    
    if (selectedCustomer && selectedCustomer.id === id) {
      setSelectedCustomer({ ...selectedCustomer, ...data, last_updated: new Date().toISOString() });
    }
    
    showNotification('Customer Updated', 'Customer data updated successfully.', 'success');
  };

  // --- SERVICE PLAN HANDLERS ---
  
  const handleAddServicePlan = (planData: any) => {
     const newId = `PLAN-${planData.category.substring(0,3).toUpperCase()}-${planData.speed_mbps}`;
     const newPlan: ServicePlan = {
        id: newId,
        ...planData
     };
     setServicePlans([...servicePlans, newPlan]);
     showNotification('Plan Published', `Service Plan ${newPlan.name} is now available.`, 'success');
  };

  // --- EMPLOYEE HANDLERS ---

  const handleAddEmployee = (empData: any) => {
     const newId = `EMP-${Math.floor(Math.random() * 8000) + 2000}`;
     const newEmp: Employee = {
         id: newId,
         ...empData
     };
     setEmployees([...employees, newEmp]);
     showNotification('Employee Added', `New employee ${newEmp.full_name} registered to system.`, 'success');
  };

  const handleUpdateEmployee = (id: string, data: any) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    
    if (selectedEmployee && selectedEmployee.id === id) {
        setSelectedEmployee({ ...selectedEmployee, ...data });
    }
    
    showNotification('Employee Updated', 'Employee record has been updated successfully.', 'success');
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setCurrentView(View.DETAIL_EMPLOYEE);
  };

  // --- INVOICE HANDLERS ---
  const handleInvoiceStatusUpdate = (id: string, status: InvoiceStatus) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status, payment_date: status === InvoiceStatus.PAID ? new Date().toISOString().split('T')[0] : undefined } : inv));
    showNotification('Payment Recorded', `Invoice ${id} marked as Paid.`, 'success');
  };


  // --- SETTINGS HANDLER ---
  const handleSaveSettings = (section: string, data: any) => {
      console.log(`Saving ${section} config:`, data);
      showNotification('Settings Saved', `System ${section} configuration updated successfully.`, 'success');
  };


  // --- UI COMPONENTS ---

  if (!isAuthenticated) {
      return (
        <>
            <NotificationToast notification={notification} onClose={() => setNotification(null)} />
            <LoginScreen onLogin={handleLogin} />
        </>
      );
  }

  const NavItem = ({ view, icon, label }: { view: View, icon: React.ReactNode, label: string }) => (
    <button 
      onClick={() => { setCurrentView(view); setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        currentView === view || (view === View.TICKETS && currentView === View.DETAIL_TICKET) || (view === View.CUSTOMERS && currentView === View.DETAIL_CUSTOMER) || (view === View.EMPLOYEES && currentView === View.DETAIL_EMPLOYEE)
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  const canManagePlans = currentUserRole === UserRole.PRODUCT_MANAGER || currentUserRole === UserRole.MANAGER;
  const canManageEmployees = currentUserRole === UserRole.HRD || currentUserRole === UserRole.MANAGER;
  const canViewBilling = currentUserRole === UserRole.FINANCE || currentUserRole === UserRole.MANAGER || currentUserRole === UserRole.SALES;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Global Notification Toast */}
      <NotificationToast 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">I</div>
                <h1 className="text-xl font-bold tracking-tight">ISP Issue<span className="text-blue-500">Manager</span></h1>
             </div>
             <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
               <X size={24} />
             </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-2">
            <NavItem view={View.DASHBOARD} icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavItem view={View.TICKETS} icon={<TicketIcon size={20} />} label="Issue Tickets" />
            <NavItem view={View.DEVICES} icon={<Server size={20} />} label="Inventory / Assets" />
            <NavItem view={View.CUSTOMERS} icon={<Users size={20} />} label="Customers" />
            {canViewBilling && (
                <NavItem view={View.BILLING} icon={<CreditCard size={20} />} label="Billing & Invoices" />
            )}
            {canManagePlans && (
                <NavItem view={View.SERVICE_PLANS} icon={<DollarSign size={20} />} label="Service Plans" />
            )}
            {canManageEmployees && (
                <NavItem view={View.EMPLOYEES} icon={<Briefcase size={20} />} label="Employees / HR" />
            )}
            <NavItem view={View.SETTINGS} icon={<SettingsIcon size={20} />} label="Settings" />
          </nav>

          {/* User Profile / Role Switcher */}
          <div className="p-4 border-t border-slate-800 bg-slate-900">
             
             {/* Demo Role Switcher */}
             <div className="flex flex-col gap-2 mb-4 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                <label className="text-[10px] text-slate-400 uppercase font-bold px-1 flex items-center gap-1">
                    Demo View As
                </label>
                <div className="relative">
                    <select 
                        className="w-full bg-slate-900 text-white text-xs rounded px-2 py-2 border border-slate-600 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        value={currentUserRole}
                        onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
                    >
                        {Object.values(UserRole).map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
             </div>
             
             <div className="flex items-center gap-3 px-1">
               <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg">
                 {sessionUser?.name.charAt(0)}
               </div>
               <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-bold text-white truncate">{sessionUser?.name}</p>
                 <p className="text-[10px] text-blue-400 truncate">{sessionUser?.role}</p>
               </div>
               <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition" title="Logout">
                   <LogOut size={16} />
               </button>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-800">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800">
              {currentView === View.DASHBOARD && `${currentUserRole} Dashboard`}
              {(currentView === View.TICKETS || currentView === View.DETAIL_TICKET) && 'Ticket Management'}
              {currentView === View.DEVICES && 'Device Inventory & Assets'}
              {(currentView === View.CUSTOMERS || currentView === View.DETAIL_CUSTOMER) && 'Customer Relationship & Provisioning'}
              {currentView === View.BILLING && 'Finance & Billing Overview'}
              {currentView === View.SERVICE_PLANS && 'Product & Service Plans'}
              {(currentView === View.EMPLOYEES || currentView === View.DETAIL_EMPLOYEE) && 'HR Information System'}
              {currentView === View.SETTINGS && 'System Settings'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             {/* AI Summary Banner (Desktop) */}
            {aiSummary && currentView === View.DASHBOARD && (
                <div className="hidden lg:flex items-center bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-xs text-blue-800 max-w-lg truncate">
                    <span className="font-bold mr-2">AI Summary:</span> {aiSummary}
                </div>
            )}
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
           <div className="max-w-7xl mx-auto">
              {currentView === View.DASHBOARD && (
                <Dashboard 
                    tickets={tickets} 
                    customers={customers}
                    devices={devices}
                    userRole={currentUserRole}
                    onCreateTicket={handleCreateTicket}
                    onNavigateToTicket={handleTicketSelect}
                    onViewAllTickets={() => setCurrentView(View.TICKETS)}
                    onNavigateToCustomer={handleDashboardCustomerSelect}
                    onValidateDevice={handleDashboardValidateDevice}
                />
              )}
              {currentView === View.TICKETS && (
                <TicketList 
                    tickets={tickets} 
                    onSelectTicket={handleTicketSelect} 
                    onCreateTicket={handleCreateTicket}
                />
              )}
              {currentView === View.DEVICES && (
                <DeviceInventory
                    devices={devices}
                    userRole={currentUserRole}
                    onAddDevice={handleAddDevice}
                    onUpdateDevice={handleUpdateDevice}
                    onValidateDevice={handleValidateDevice}
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
                   onSelectCustomer={handleCustomerSelect}
                />
              )}
              {currentView === View.BILLING && (
                <BillingList
                    invoices={invoices}
                    customers={customers}
                    userRole={currentUserRole}
                    onUpdateStatus={handleInvoiceStatusUpdate}
                />
              )}
              {currentView === View.SERVICE_PLANS && (
                <ServicePlanManager
                    plans={servicePlans}
                    userRole={currentUserRole}
                    onAddPlan={handleAddServicePlan}
                />
              )}
              {currentView === View.EMPLOYEES && (
                <EmployeeManagement
                    employees={employees}
                    userRole={currentUserRole}
                    onAddEmployee={handleAddEmployee}
                    onUpdateEmployee={handleUpdateEmployee}
                    onSelectEmployee={handleEmployeeSelect}
                />
              )}
              {currentView === View.DETAIL_TICKET && selectedTicket && (
                <TicketDetail 
                  ticket={selectedTicket} 
                  onBack={() => setCurrentView(View.TICKETS)}
                  onUpdateStatus={handleUpdateStatus}
                />
              )}
              {currentView === View.DETAIL_CUSTOMER && selectedCustomer && (
                <CustomerDetail
                    customer={selectedCustomer}
                    userRole={currentUserRole}
                    servicePlans={servicePlans}
                    invoices={invoices}
                    onBack={() => setCurrentView(View.CUSTOMERS)}
                    onUpdateCustomer={handleUpdateCustomer}
                />
              )}
              {currentView === View.DETAIL_EMPLOYEE && selectedEmployee && (
                <EmployeeDetail
                    employee={selectedEmployee}
                    userRole={currentUserRole}
                    onUpdateEmployee={handleUpdateEmployee}
                    onBack={() => setCurrentView(View.EMPLOYEES)}
                />
              )}
              {currentView === View.SETTINGS && (
                <Settings onSave={handleSaveSettings} />
              )}
           </div>
        </main>
      </div>
    </div>
  );
};

export default App;
