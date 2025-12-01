
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Ticket as TicketIcon, Settings as SettingsIcon, Bell, Search, User, Menu, X, ChevronDown, Server, Users, DollarSign, Briefcase, CreditCard, LogOut, Calendar, FileText, Book, Shield, Terminal } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import NotificationToast, { Notification } from './components/NotificationToast';
import NotificationPanel from './components/NotificationPanel';
import GlobalSearch from './components/GlobalSearch';
import DeviceInventory from './components/DeviceInventory';
import DeviceDetail from './components/DeviceDetail';
import CustomerManagement from './components/CustomerManagement';
import CustomerDetail from './components/CustomerDetail';
import ServicePlanManager from './components/ServicePlanManager';
import EmployeeManagement from './components/EmployeeManagement';
import EmployeeDetail from './components/EmployeeDetail';
import Settings from './components/Settings'; 
import BillingList from './components/BillingList'; 
import LoginScreen from './components/LoginScreen';
import MaintenanceSchedule from './components/MaintenanceSchedule';
import AIAssistant from './components/AIAssistant'; 
import Reports from './components/Reports';
import KnowledgeBase from './components/KnowledgeBase';
import RadiusManagement from './components/RadiusManagement';
import SyslogViewer from './components/SyslogViewer';
import { MOCK_TICKETS, MOCK_DEVICES, MOCK_CUSTOMERS, MOCK_SERVICE_PLANS, MOCK_EMPLOYEES, MOCK_INVOICES, MOCK_MAINTENANCE, MOCK_KB, MOCK_RADIUS_SESSIONS, MOCK_RADIUS_LOGS, MOCK_SYSLOGS } from './constants';
import { Ticket, TicketStatus, ActivityLogEntry, Severity, UserRole, Device, DeviceStatus, Customer, CustomerStatus, ServicePlan, Employee, Invoice, InvoiceStatus, Maintenance, MaintenanceStatus, KBArticle, TicketType, EmployeeAuditLogEntry, RadiusSession, RadiusLog, SyslogMessage } from './types';
import { generateTicketSummary } from './services/geminiService';

enum View {
  DASHBOARD = 'dashboard',
  TICKETS = 'tickets',
  DEVICES = 'devices',
  CUSTOMERS = 'customers',
  SERVICE_PLANS = 'service_plans',
  EMPLOYEES = 'employees',
  BILLING = 'billing', 
  MAINTENANCE = 'maintenance',
  REPORTS = 'reports',
  KNOWLEDGE_BASE = 'knowledge_base',
  RADIUS = 'radius',
  SYSLOG = 'syslog', // New View
  DETAIL_TICKET = 'detail_ticket',
  DETAIL_CUSTOMER = 'detail_customer',
  DETAIL_EMPLOYEE = 'detail_employee',
  DETAIL_DEVICE = 'detail_device',
  SETTINGS = 'settings'
}

// Mapping detail views to their parent menu item for highlighting
const PARENT_VIEWS: Partial<Record<View, View>> = {
  [View.DETAIL_TICKET]: View.TICKETS,
  [View.DETAIL_CUSTOMER]: View.CUSTOMERS,
  [View.DETAIL_DEVICE]: View.DEVICES,
  [View.DETAIL_EMPLOYEE]: View.EMPLOYEES,
};

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
  const [maintenanceList, setMaintenanceList] = useState<Maintenance[]>(MOCK_MAINTENANCE);
  const [kbArticles, setKbArticles] = useState<KBArticle[]>(MOCK_KB);
  const [radiusSessions, setRadiusSessions] = useState<RadiusSession[]>(MOCK_RADIUS_SESSIONS);
  const [radiusLogs, setRadiusLogs] = useState<RadiusLog[]>(MOCK_RADIUS_LOGS);
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  
  const [deviceFilter, setDeviceFilter] = useState<string>('');
  const [invoiceFilter, setInvoiceFilter] = useState<string>('');
  const [maintenanceFilter, setMaintenanceFilter] = useState<string>('');

  const [aiSummary, setAiSummary] = useState<string>('');
  
  // Notification State
  const [notification, setNotification] = useState<Notification | null>(null);
  const [notificationHistory, setNotificationHistory] = useState<Notification[]>([]);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);

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
    const newNotif = {
      id: Date.now().toString(),
      title,
      message,
      type
    };
    setNotification(newNotif);
    setNotificationHistory(prev => [newNotif, ...prev]);
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

  // New handler for generic ticket updates (e.g., AI Analysis results)
  const handleUpdateTicket = (id: string, updates: Partial<Ticket>) => {
      setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      
      if (selectedTicket && selectedTicket.id === id) {
          setSelectedTicket(prev => prev ? { ...prev, ...updates } : null);
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
            timestamp: new Date(Date.now() + 500).toISOString(), // slight delay
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
    
    if (selectedDevice && selectedDevice.id === id) {
        setSelectedDevice(prev => prev ? { ...prev, ...data } : null);
    }

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
  
  const handleNavigateToDevice = (deviceId: string) => {
      const device = devices.find(d => d.id === deviceId);
      if (device) {
          setSelectedDevice(device);
          setCurrentView(View.DETAIL_DEVICE);
      } else {
          setDeviceFilter(deviceId); // Fallback to list filter if exact ID match fails
          setCurrentView(View.DEVICES);
      }
  };

  const handleSelectDevice = (device: Device) => {
      setSelectedDevice(device);
      setCurrentView(View.DETAIL_DEVICE);
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
  
  const handleNavigateToCustomerAdd = () => {
      setCurrentView(View.CUSTOMERS);
  }
  
  const handleNavigateToCustomer = (customerOrId: string | Customer) => {
      let customer: Customer | undefined;
      
      if (typeof customerOrId === 'string') {
          customer = customers.find(c => c.id === customerOrId);
      } else {
          customer = customerOrId;
      }

      if (customer) {
          setSelectedCustomer(customer);
          setCurrentView(View.DETAIL_CUSTOMER);
      } else {
          showNotification('Error', 'Customer not found.', 'error');
      }
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
    const originalCustomer = customers.find(c => c.id === id);
    
    // Check for Plan Change (Commercial / Radius Logic)
    if (originalCustomer && (originalCustomer.package_name !== data.package_name || originalCustomer.service_plan_id !== data.service_plan_id)) {
        const newPlan = servicePlans.find(p => p.name === data.package_name || p.id === data.service_plan_id);
        
        if (newPlan) {
            // Simulated Radius CoA
            showNotification(
                'Plan Change Detected', 
                `Initiating Radius CoA for ${originalCustomer.pppoe_username || 'user'}. New Profile: ${newPlan.name} (${newPlan.speed_mbps} Mbps).`, 
                'info'
            );
            
            // Update active session locally if exists
            setRadiusSessions(prev => prev.map(s => {
                if (s.customer_id === id) {
                    // Reset rates momentarily to simulate speed change
                    return { ...s, current_download_rate: 0, current_upload_rate: 0 }; 
                }
                return s;
            }));

            // Add System Log to Radius
            setRadiusLogs(prev => [{
                id: `coa-${Date.now()}`,
                timestamp: new Date().toISOString(),
                username: originalCustomer.pppoe_username || 'unknown',
                message: `CoA Request: Filter-Id update to ${newPlan.name}`,
                reply: 'Accept',
                nas_ip: '202.133.3.2' // Mock NAS
            }, ...prev]);
        }
    }

    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data, last_updated: new Date().toISOString() } : c));
    
    if (selectedCustomer && selectedCustomer.id === id) {
      setSelectedCustomer({ ...selectedCustomer, ...data, last_updated: new Date().toISOString() });
    }
    
    showNotification('Customer Updated', 'Customer data updated successfully.', 'success');
  };

  const handleTerminateCustomer = (id: string, reason: string, date: string, createTicket: boolean) => {
      // 1. Update Customer Status
      const timestamp = new Date().toISOString();
      const updates = {
          status: CustomerStatus.TERMINATED,
          termination_reason: reason,
          termination_date: date,
          last_updated: timestamp
      };

      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      
      // Update selected view
      if (selectedCustomer && selectedCustomer.id === id) {
          setSelectedCustomer({ ...selectedCustomer, ...updates });
      }

      showNotification('Customer Terminated', `Subscription stopped. Reason: ${reason}`, 'warning');

      // 2. Auto Create Ticket if requested
      if (createTicket) {
          const cust = customers.find(c => c.id === id);
          if (cust) {
              const ticketData = {
                  title: `Asset Retrieval: ${cust.name}`,
                  type: TicketType.INFRASTRUCTURE,
                  severity: Severity.MINOR,
                  location: cust.address,
                  impact_users: 0,
                  description: `Customer terminated service on ${date}. Reason: ${reason}.\nPlease retrieve ONU/Modem and accessories.\nContact: ${cust.phone}`,
                  sla_deadline: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), // +3 Days
                  link_id: cust.id
              };
              handleCreateTicket(ticketData);
              showNotification('Ticket Created', 'Asset retrieval ticket generated for Field Tech.', 'info');
          }
      }
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
         ...empData,
         auditLog: []
     };
     setEmployees([...employees, newEmp]);
     showNotification('Employee Added', `New employee ${newEmp.full_name} registered to system.`, 'success');
  };

  const handleUpdateEmployee = (id: string, data: any) => {
    const originalEmployee = employees.find(e => e.id === id);
    const newLogs: EmployeeAuditLogEntry[] = [];
    const timestamp = new Date().toISOString();

    if (originalEmployee) {
        // Detect Changes
        Object.keys(data).forEach(key => {
            const field = key as keyof Employee;
            // Ignore array/object deep comparison for simple version, and ignore auditLog itself
            if (field === 'auditLog') return;
            
            const oldValue = originalEmployee[field];
            const newValue = data[field];

            if (oldValue !== newValue) {
                newLogs.push({
                    id: `audit-${Date.now()}-${field}`,
                    field: field,
                    old_value: String(oldValue || 'N/A'),
                    new_value: String(newValue || 'N/A'),
                    changed_by: currentUserRole,
                    timestamp: timestamp
                });
            }
        });
    }

    const updatedData = { 
        ...data, 
        auditLog: [ ...newLogs, ...(originalEmployee?.auditLog || []) ] 
    };

    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updatedData } : e));
    
    if (selectedEmployee && selectedEmployee.id === id) {
        setSelectedEmployee({ ...selectedEmployee, ...updatedData });
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

  const handleCreateInvoice = (invoiceData: any) => {
      const newId = `INV-2025${new Date().getMonth() + 1}-${Math.floor(Math.random() * 1000)}`;
      const newInvoice: Invoice = {
          id: newId,
          ...invoiceData
      };
      setInvoices([newInvoice, ...invoices]);
      showNotification('Invoice Generated', `Invoice ${newId} created for ${formatCurrency(newInvoice.amount)}.`, 'success');
  };

  const handleNavigateToInvoice = (invoiceId: string) => {
      setInvoiceFilter(invoiceId);
      setCurrentView(View.BILLING);
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumSignificantDigits: 3 }).format(val);
  };

  // --- MAINTENANCE HANDLERS ---
  const handleAddMaintenance = (data: any) => {
      const newId = `MT-202511-${String(maintenanceList.length + 1).padStart(3, '0')}`;
      const newMaintenance: Maintenance = {
          id: newId,
          ...data,
          created_by: currentUserRole
      };
      setMaintenanceList([newMaintenance, ...maintenanceList]);
      showNotification('Schedule Created', 'Maintenance window scheduled successfully. Notification queued.', 'success');
  };

  const handleUpdateMaintenanceStatus = (id: string, status: MaintenanceStatus) => {
      setMaintenanceList(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      showNotification('Status Updated', `Maintenance ${id} marked as ${status}.`, 'info');
  };

  const handleNavigateToMaintenance = (maintenanceId: string) => {
      setMaintenanceFilter(maintenanceId);
      setCurrentView(View.MAINTENANCE);
  };

  // --- RADIUS HANDLERS ---
  const handleKickSession = (sessionId: string) => {
      const session = radiusSessions.find(s => s.id === sessionId);
      if (session) {
          setRadiusSessions(prev => prev.filter(s => s.id !== sessionId));
          showNotification('Session Terminated', `User ${session.username} has been disconnected (CoA Request Sent).`, 'warning');
      }
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

  // Helper to check if a menu item should be active
  const checkIsActive = (menuView: View) => {
      return currentView === menuView || PARENT_VIEWS[currentView] === menuView;
  };

  const NavItem = ({ view, icon, label }: { view: View, icon: React.ReactNode, label: string }) => {
    const isActive = checkIsActive(view);
    return (
        <button 
        onClick={() => { setCurrentView(view); setIsSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
            isActive
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
        >
        {icon}
        <span className="font-medium text-sm">{label}</span>
        </button>
    );
  };

  const NavGroup = ({ title, children }: { title: string, children?: React.ReactNode }) => (
      <div className="mb-4">
          <h4 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</h4>
          <div className="space-y-1">
              {children}
          </div>
      </div>
  );

  // Permission Logic
  const canManagePlans = currentUserRole === UserRole.PRODUCT_MANAGER || currentUserRole === UserRole.MANAGER;
  const canManageEmployees = currentUserRole === UserRole.HRD || currentUserRole === UserRole.MANAGER;
  const canViewBilling = currentUserRole === UserRole.FINANCE || currentUserRole === UserRole.MANAGER || currentUserRole === UserRole.SALES;
  const canViewMaintenance = currentUserRole === UserRole.NOC || currentUserRole === UserRole.MANAGER || currentUserRole === UserRole.NETWORK || currentUserRole === UserRole.CS;
  const canViewReports = currentUserRole === UserRole.MANAGER || currentUserRole === UserRole.FINANCE || currentUserRole === UserRole.NOC;
  const canViewRadius = currentUserRole === UserRole.NOC || currentUserRole === UserRole.NETWORK || currentUserRole === UserRole.MANAGER;
  const canViewSyslog = currentUserRole === UserRole.NOC || currentUserRole === UserRole.NETWORK || currentUserRole === UserRole.MANAGER;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Global Notification Toast */}
      <NotificationToast 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />

      {/* Floating Copilot */}
      <AIAssistant 
        tickets={tickets} 
        customers={customers} 
        devices={devices} 
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
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col h-full
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
          {/* Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">C</div>
                <h1 className="text-xl font-bold tracking-tight">Cakramedia <span className="text-blue-500">Manager</span></h1>
             </div>
             <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
               <X size={24} />
             </button>
          </div>

          {/* Nav - SCROLLABLE AREA */}
          <nav className="flex-1 p-4 overflow-y-auto">
            
            <NavGroup title="Operations">
                <NavItem view={View.DASHBOARD} icon={<LayoutDashboard size={18} />} label="Dashboard" />
                <NavItem view={View.TICKETS} icon={<TicketIcon size={18} />} label="Tickets & Issues" />
                {canViewMaintenance && (
                    <NavItem view={View.MAINTENANCE} icon={<Calendar size={18} />} label="Maintenance" />
                )}
            </NavGroup>

            <NavGroup title="Network & Infrastructure">
                <NavItem view={View.DEVICES} icon={<Server size={18} />} label="Inventory & Topology" />
                {canViewRadius && (
                    <NavItem view={View.RADIUS} icon={<Shield size={18} />} label="AAA / Radius" />
                )}
                {canViewSyslog && (
                    <NavItem view={View.SYSLOG} icon={<Terminal size={18} />} label="Central Syslog" />
                )}
            </NavGroup>

            <NavGroup title="Commercial">
                <NavItem view={View.CUSTOMERS} icon={<Users size={18} />} label="Customers" />
                {canViewBilling && (
                    <NavItem view={View.BILLING} icon={<CreditCard size={18} />} label="Billing & Invoices" />
                )}
                {canManagePlans && (
                    <NavItem view={View.SERVICE_PLANS} icon={<DollarSign size={18} />} label="Service Plans" />
                )}
            </NavGroup>

            <NavGroup title="Administration">
                {canViewReports && (
                    <NavItem view={View.REPORTS} icon={<FileText size={18} />} label="Reports" />
                )}
                <NavItem view={View.KNOWLEDGE_BASE} icon={<Book size={18} />} label="Knowledge Base" />
                {canManageEmployees && (
                    <NavItem view={View.EMPLOYEES} icon={<Briefcase size={18} />} label="HRIS" />
                )}
                <NavItem view={View.SETTINGS} icon={<SettingsIcon size={18} />} label="Settings" />
            </NavGroup>

          </nav>

          {/* User Profile / Role Switcher - FIXED BOTTOM */}
          <div className="p-4 border-t border-slate-800 bg-slate-900 flex-shrink-0">
             
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
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-800">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 hidden md:block">
              {currentView === View.DASHBOARD && `${currentUserRole} Dashboard`}
              {(currentView === View.TICKETS || currentView === View.DETAIL_TICKET) && 'Ticket Management'}
              {(currentView === View.DEVICES || currentView === View.DETAIL_DEVICE) && 'Inventory & Assets'}
              {(currentView === View.CUSTOMERS || currentView === View.DETAIL_CUSTOMER) && 'Customer Relationship'}
              {currentView === View.MAINTENANCE && 'Planned Maintenance'}
              {currentView === View.REPORTS && 'System Reports & Analytics'}
              {currentView === View.KNOWLEDGE_BASE && 'Technical Knowledge Base'}
              {currentView === View.RADIUS && 'AAA / Radius Server'}
              {currentView === View.SYSLOG && 'Centralized Log Management'}
              {currentView === View.BILLING && 'Finance & Billing'}
              {currentView === View.SERVICE_PLANS && 'Product & Plans'}
              {(currentView === View.EMPLOYEES || currentView === View.DETAIL_EMPLOYEE) && 'HR Information System'}
              {currentView === View.SETTINGS && 'System Settings'}
            </h2>
          </div>

          {/* GLOBAL SEARCH CENTER */}
          <div className="flex-1 px-8 flex justify-center">
             <GlobalSearch 
                tickets={tickets} 
                customers={customers} 
                devices={devices} 
                onNavigateToTicket={handleTicketSelect}
                onNavigateToCustomer={handleNavigateToCustomer}
                onNavigateToDevice={handleNavigateToDevice}
             />
          </div>

          <div className="flex items-center gap-4 relative">
             {/* AI Summary Banner (Desktop) - Hide if space is tight due to search */}
            {aiSummary && currentView === View.DASHBOARD && (
                <div className="hidden xl:flex items-center bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-xs text-blue-800 max-w-xs truncate">
                    <span className="font-bold mr-2">AI Summary:</span> {aiSummary}
                </div>
            )}
            
            {/* Notification Bell */}
            <div className="relative">
                <button 
                    onClick={() => setIsNotifPanelOpen(!isNotifPanelOpen)}
                    className={`p-2 rounded-full relative transition ${isNotifPanelOpen ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                >
                    <Bell size={20} />
                    {notificationHistory.length > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </button>
                <NotificationPanel 
                    isOpen={isNotifPanelOpen}
                    onClose={() => setIsNotifPanelOpen(false)}
                    notifications={notificationHistory}
                    onClear={() => setNotificationHistory([])}
                />
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
           <div className="max-w-7xl mx-auto h-full">
              {currentView === View.DASHBOARD && (
                <Dashboard 
                    tickets={tickets} 
                    customers={customers}
                    devices={devices}
                    invoices={invoices}
                    servicePlans={servicePlans}
                    maintenance={maintenanceList}
                    userRole={currentUserRole}
                    onCreateTicket={handleCreateTicket}
                    onNavigateToTicket={handleTicketSelect}
                    onViewAllTickets={() => setCurrentView(View.TICKETS)}
                    onNavigateToCustomer={handleDashboardCustomerSelect}
                    onValidateDevice={handleDashboardValidateDevice}
                    onAddCustomer={handleNavigateToCustomerAdd}
                />
              )}
              {currentView === View.TICKETS && (
                <TicketList 
                    tickets={tickets} 
                    onSelectTicket={handleTicketSelect} 
                    onCreateTicket={handleCreateTicket}
                    invoices={invoices}
                    maintenance={maintenanceList}
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
                    onSelectDevice={handleSelectDevice}
                    preSetFilter={deviceFilter}
                    tickets={tickets} 
                    onNavigateToCustomer={handleNavigateToCustomer}
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
              {currentView === View.RADIUS && (
                <RadiusManagement
                    sessions={radiusSessions}
                    logs={radiusLogs}
                    customers={customers}
                    userRole={currentUserRole}
                    onKickSession={handleKickSession}
                    onNavigateToCustomer={handleNavigateToCustomer}
                />
              )}
              {currentView === View.SYSLOG && (
                <SyslogViewer
                    initialLogs={MOCK_SYSLOGS}
                />
              )}
              {currentView === View.MAINTENANCE && (
                <MaintenanceSchedule
                    maintenanceList={maintenanceList}
                    userRole={currentUserRole}
                    onAddMaintenance={handleAddMaintenance}
                    onUpdateStatus={handleUpdateMaintenanceStatus}
                    highlightId={maintenanceFilter}
                    onNavigateToDevice={handleNavigateToDevice}
                />
              )}
              {currentView === View.REPORTS && (
                <Reports
                    tickets={tickets}
                    customers={customers}
                    invoices={invoices}
                />
              )}
              {currentView === View.KNOWLEDGE_BASE && (
                <KnowledgeBase
                    articles={kbArticles}
                />
              )}
              {currentView === View.BILLING && (
                <BillingList
                    invoices={invoices}
                    customers={customers}
                    userRole={currentUserRole}
                    onUpdateStatus={handleInvoiceStatusUpdate}
                    onCreateInvoice={handleCreateInvoice}
                    preSetFilter={invoiceFilter}
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
                  employees={employees} 
                  devices={devices} 
                  tickets={tickets} 
                  kbArticles={kbArticles} 
                  onBack={() => setCurrentView(View.TICKETS)}
                  onUpdateStatus={handleUpdateStatus}
                  onUpdateTicket={handleUpdateTicket}
                  onNavigateToDevice={handleNavigateToDevice}
                  onNavigateToCustomer={handleNavigateToCustomer}
                  onNavigateToInvoice={handleNavigateToInvoice}
                  onNavigateToMaintenance={handleNavigateToMaintenance}
                />
              )}
              {currentView === View.DETAIL_CUSTOMER && selectedCustomer && (
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
              {currentView === View.DETAIL_DEVICE && selectedDevice && (
                <DeviceDetail
                    device={selectedDevice}
                    allDevices={devices}
                    tickets={tickets}
                    customers={customers}
                    userRole={currentUserRole}
                    onBack={() => setCurrentView(View.DEVICES)}
                    onUpdateDevice={handleUpdateDevice}
                    onNavigateToTicket={handleTicketSelect}
                    onNavigateToDevice={handleNavigateToDevice}
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
