import React from 'react';
import { Ticket, UserRole, Customer, Device, Invoice, ServicePlan, Maintenance } from '../types';
import HelpdeskDashboard from './dashboard/HelpdeskDashboard';
import ProvisioningDashboard from './dashboard/ProvisioningDashboard';
import SalesDashboard from './dashboard/SalesDashboard';
import FinanceDashboard from './dashboard/FinanceDashboard';
import NOCDashboard from './dashboard/NOCDashboard';
import FieldDashboard from './dashboard/FieldDashboard';
import NetworkDashboard from './dashboard/NetworkDashboard';
import ManagerDashboard from './dashboard/ManagerDashboard';

interface DashboardProps {
  tickets: Ticket[];
  customers: Customer[];
  devices: Device[];
  invoices: Invoice[]; 
  servicePlans: ServicePlan[];
  maintenance: Maintenance[];
  userRole?: UserRole;
  onCreateTicket: (data: any) => void;
  onNavigateToTicket: (ticket: Ticket) => void;
  onViewAllTickets: () => void;
  onNavigateToCustomer: (customer: Customer) => void;
  onValidateDevice: (device: Device) => void;
  onAddCustomer: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  tickets, 
  customers, 
  devices, 
  invoices,
  servicePlans,
  maintenance,
  userRole = UserRole.NOC, 
  onCreateTicket, 
  onNavigateToTicket, 
  onViewAllTickets,
  onNavigateToCustomer,
  onValidateDevice,
  onAddCustomer
}) => {

  // Main Render Switch - Now Delegates to Specialized Components
  switch (userRole) {
    case UserRole.FIELD:
        return (
          <FieldDashboard 
            tickets={tickets} 
            onNavigateToTicket={onNavigateToTicket} 
          />
        );
    case UserRole.NETWORK:
        return (
          <NetworkDashboard 
            tickets={tickets} 
          />
        );
    case UserRole.HELPDESK:
        return (
          <HelpdeskDashboard 
            tickets={tickets} 
            customers={customers}
            devices={devices}
            invoices={invoices}
            maintenance={maintenance}
            onCreateTicket={onCreateTicket} 
            onNavigateToTicket={onNavigateToTicket}
            onViewAllTickets={onViewAllTickets}
          />
        );
    case UserRole.PROVISIONING:
        return (
          <ProvisioningDashboard 
            customers={customers} 
            devices={devices} 
            onNavigateToCustomer={onNavigateToCustomer}
            onValidateDevice={onValidateDevice}
          />
        );
    case UserRole.MANAGER:
        return (
          <ManagerDashboard 
            tickets={tickets} 
            onNavigateToTicket={onNavigateToTicket} 
          />
        );
    case UserRole.SALES:
        return (
          <SalesDashboard 
            customers={customers} 
            servicePlans={servicePlans} 
            onAddCustomer={onAddCustomer}
          />
        );
    case UserRole.FINANCE:
        return (
          <FinanceDashboard 
             invoices={invoices}
             customers={customers}
          />
        );
    case UserRole.NOC:
    default:
        return (
          <NOCDashboard 
            tickets={tickets} 
          />
        );
  }
};

export default Dashboard;