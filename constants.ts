
import { Ticket, TicketStatus, Severity, Device, DeviceStatus, Customer, CustomerStatus, ServicePlan, Employee, EmployeeStatus, UserRole, Invoice } from './types';

import { ticketsData } from './data/tickets';
import { devicesData } from './data/devices';
import { customersData } from './data/customers';
import { servicePlansData } from './data/service_plans';
import { employeesData } from './data/employees';
import { invoicesData } from './data/invoices';

// Mapping or casting JSON data to Types
// Note: JSON strings must match the Enum string values defined in types.ts

export const MOCK_TICKETS: Ticket[] = ticketsData as unknown as Ticket[];

export const STATUS_COLORS: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'bg-red-100 text-red-800 border-red-200',
  [TicketStatus.INVESTIGATING]: 'bg-orange-100 text-orange-800 border-orange-200',
  [TicketStatus.ASSIGNED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [TicketStatus.FIXING]: 'bg-purple-100 text-purple-800 border-purple-200',
  [TicketStatus.RESOLVED]: 'bg-green-100 text-green-800 border-green-200',
  [TicketStatus.CLOSED]: 'bg-slate-200 text-slate-800 border-slate-300',
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  [Severity.CRITICAL]: 'text-red-600 font-bold',
  [Severity.MAJOR]: 'text-orange-600 font-semibold',
  [Severity.MINOR]: 'text-blue-600 font-medium',
};

export const MOCK_DEVICES: Device[] = devicesData as unknown as Device[];

export const MOCK_CUSTOMERS: Customer[] = customersData as unknown as Customer[];

export const MOCK_SERVICE_PLANS: ServicePlan[] = servicePlansData as unknown as ServicePlan[];

export const MOCK_EMPLOYEES: Employee[] = employeesData as unknown as Employee[];

export const MOCK_INVOICES: Invoice[] = invoicesData as unknown as Invoice[];
