
import { Ticket, TicketStatus, TicketType, Severity, Device, DeviceStatus, DeviceType, Customer, CustomerStatus, ServicePlan, Employee, EmployeeStatus, UserRole } from './types';

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 'ISP-20251128-001',
    title: 'Backbone Jakarta - Bandung Down',
    type: TicketType.NETWORK,
    location: 'POP Jakarta',
    coordinates: { lat: -6.2088, lng: 106.8456 },
    impact_users: 1250,
    severity: Severity.CRITICAL,
    sla_deadline: '2025-11-28T18:00:00',
    created_at: '2025-11-28T14:00:00',
    link_id: 'BB-JKT-BDG-01',
    device_id: 'CCR1036-01',
    status: TicketStatus.INVESTIGATING,
    description: 'Core router reports interface bonding down. Multiple alarms received via SNMP.',
    logs: 'ifOperStatus: down, ospfNbrState: down',
    assignee: 'NOC Team A',
    activityLog: [
      {
        id: 'log-1-2',
        action: 'Status Update',
        description: 'Status changed to Investigating',
        timestamp: '2025-11-28T14:15:00',
        user: 'NOC Engineer'
      },
      {
        id: 'log-1-1',
        action: 'Ticket Created',
        description: 'System auto-generated ticket from SNMP Trap',
        timestamp: '2025-11-28T14:00:00',
        user: 'System'
      }
    ]
  },
  {
    id: 'ISP-20251128-002',
    title: 'High Latency Area Bekasi',
    type: TicketType.NETWORK,
    location: 'ODP-BKS-044',
    coordinates: { lat: -6.2383, lng: 106.9756 },
    impact_users: 45,
    severity: Severity.MAJOR,
    sla_deadline: '2025-11-28T20:00:00',
    created_at: '2025-11-28T15:30:00',
    status: TicketStatus.OPEN,
    description: 'Users reporting lag > 150ms to local gateway.',
    activityLog: [
      {
        id: 'log-2-1',
        action: 'Ticket Created',
        description: 'Ticket created from Customer Complaint',
        timestamp: '2025-11-28T15:30:00',
        user: 'Helpdesk'
      }
    ]
  },
  {
    id: 'ISP-20251128-003',
    title: 'OLT Power Loss - Cluster A',
    type: TicketType.INFRASTRUCTURE,
    location: 'Cluster A Shelter',
    coordinates: { lat: -6.9175, lng: 107.6191 }, // Bandung
    impact_users: 300,
    severity: Severity.CRITICAL,
    sla_deadline: '2025-11-28T16:00:00',
    created_at: '2025-11-28T13:00:00',
    device_id: 'OLT-ZTE-C320',
    status: TicketStatus.FIXING,
    assignee: 'Tech Field - Budi',
    description: 'Mains power failure reported by UPS monitoring.',
    activityLog: [
      {
        id: 'log-3-3',
        action: 'Status Update',
        description: 'Status changed to Fixing',
        timestamp: '2025-11-28T13:45:00',
        user: 'Tech Field - Budi'
      },
      {
        id: 'log-3-2',
        action: 'Assignee Update',
        description: 'Assigned to Tech Field - Budi',
        timestamp: '2025-11-28T13:10:00',
        user: 'NOC Engineer'
      },
      {
        id: 'log-3-1',
        action: 'Ticket Created',
        description: 'System auto-generated ticket from UPS Alert',
        timestamp: '2025-11-28T13:00:00',
        user: 'System'
      }
    ]
  },
  {
    id: 'ISP-20251128-004',
    title: 'Customer Cannot Login PPPoE',
    type: TicketType.CUSTOMER,
    location: 'Residental Area',
    coordinates: { lat: -6.4025, lng: 106.7942 }, // Depok
    impact_users: 1,
    severity: Severity.MINOR,
    sla_deadline: '2025-11-29T10:00:00',
    created_at: '2025-11-28T09:00:00',
    status: TicketStatus.RESOLVED,
    description: 'Authentication failed due to frozen mac address session.',
    activityLog: [
      {
        id: 'log-4-3',
        action: 'Status Update',
        description: 'Status changed to Resolved',
        timestamp: '2025-11-28T09:30:00',
        user: 'Helpdesk'
      },
      {
        id: 'log-4-2',
        action: 'Status Update',
        description: 'Status changed to Fixing',
        timestamp: '2025-11-28T09:10:00',
        user: 'Helpdesk'
      },
      {
        id: 'log-4-1',
        action: 'Ticket Created',
        description: 'Ticket created manually',
        timestamp: '2025-11-28T09:00:00',
        user: 'Helpdesk'
      }
    ]
  },
  {
    id: 'ISP-20251128-005',
    title: 'DDoS Attack Detected on IP Block 103.x.x.x',
    type: TicketType.SECURITY,
    location: 'Data Center',
    coordinates: { lat: -6.1751, lng: 106.8650 }, // Central Jakarta
    impact_users: 5000,
    severity: Severity.CRITICAL,
    sla_deadline: '2025-11-28T14:30:00',
    created_at: '2025-11-28T14:00:00',
    status: TicketStatus.CLOSED,
    description: 'Volumetric attack 15Gbps detected. Mitigation scrubbers activated.',
    assignee: 'SecOps Team',
    activityLog: [
       {
        id: 'log-5-4',
        action: 'Status Update',
        description: 'Status changed to Closed',
        timestamp: '2025-11-28T15:00:00',
        user: 'SecOps Team'
      },
      {
        id: 'log-5-3',
        action: 'Status Update',
        description: 'Status changed to Resolved',
        timestamp: '2025-11-28T14:45:00',
        user: 'SecOps Team'
      },
       {
        id: 'log-5-2',
        action: 'Status Update',
        description: 'Status changed to Fixing (Mitigation)',
        timestamp: '2025-11-28T14:05:00',
        user: 'SecOps Team'
      },
      {
        id: 'log-5-1',
        action: 'Ticket Created',
        description: 'System auto-generated ticket from IDS/IPS',
        timestamp: '2025-11-28T14:00:00',
        user: 'System'
      }
    ]
  }
];

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

export const MOCK_DEVICES: Device[] = [
  {
    id: 'CCR1036-01',
    name: 'Core Router Jakarta',
    type: DeviceType.ROUTER,
    model: 'MikroTik CCR1036-8G-2S+',
    ip_address: '103.10.10.1',
    mac_address: 'E4:8D:8C:1A:2B:3C',
    serial_number: 'HE90238423',
    location: 'POP Jakarta Data Center',
    status: DeviceStatus.ACTIVE,
    last_updated: '2025-11-01T10:00:00',
    validated_by: 'Network Engineer'
  },
  {
    id: 'OLT-ZTE-C320',
    name: 'OLT Cluster A',
    type: DeviceType.OLT,
    model: 'ZTE C320',
    ip_address: '172.16.20.2',
    mac_address: 'CC:2D:E0:44:55:66',
    serial_number: 'ZTEG982342',
    location: 'Cluster A Shelter',
    status: DeviceStatus.ACTIVE,
    last_updated: '2025-11-15T09:30:00',
    validated_by: 'Network Engineer'
  },
  {
    id: 'SW-DIST-BKS',
    name: 'Switch Distribution Bekasi',
    type: DeviceType.SWITCH,
    model: 'Cisco Catalyst 2960',
    ip_address: '172.16.30.5',
    mac_address: '00:1A:2B:3C:4D:5E',
    serial_number: 'FOC12345678',
    location: 'POP Bekasi',
    status: DeviceStatus.PENDING, // Needs Validation
    last_updated: '2025-11-28T11:00:00',
    installed_by: 'Field Tech - Budi'
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'CID-250001',
    name: 'PT. Maju Mundur Tech',
    email: 'it@majumundur.com',
    phone: '0812-3333-4444',
    address: 'Jl. Sudirman Kav 50, Jakarta',
    package_name: 'Dedicated 100 Mbps',
    status: CustomerStatus.ACTIVE,
    registered_at: '2025-10-01T09:00:00',
    identity_number: '7123912389123',
    contract_doc: true,
    pppoe_username: 'majumundur_corp',
    ip_address: '103.10.10.50',
    vlan_id: 205,
    olt_port: 'OLT-01-PON-2',
    sales_agent: 'Sales - Rina',
    last_updated: '2025-10-05T14:00:00'
  },
  {
    id: 'CID-250045',
    name: 'Budi Santoso',
    email: 'budi.santoso@gmail.com',
    phone: '0856-1111-2222',
    address: 'Perum Bekasi Jaya Blok A4',
    package_name: 'Home Fiber 50 Mbps',
    status: CustomerStatus.VERIFIED,
    registered_at: '2025-11-28T10:00:00',
    identity_number: '3275000000000001',
    contract_doc: true,
    sales_agent: 'Sales - Doni',
    last_updated: '2025-11-28T11:30:00'
  },
  {
    id: 'CID-250046',
    name: 'Warung Kopi Skena',
    email: 'owner@kopiskena.id',
    phone: '0811-9999-8888',
    address: 'Jl. Kemang Raya No. 10',
    package_name: 'SME 100 Mbps',
    status: CustomerStatus.LEAD, // Just input by Sales
    registered_at: '2025-11-29T08:30:00',
    sales_agent: 'Sales - Rina',
    last_updated: '2025-11-29T08:30:00'
  }
];

export const MOCK_SERVICE_PLANS: ServicePlan[] = [
  {
    id: 'PLAN-RES-20',
    name: 'Home Fiber 20 Mbps',
    speed_mbps: 20,
    price: 250000,
    sla_percentage: 97.0,
    fup_quota_gb: 500,
    category: 'Residential',
    description: 'Best for small families and browsing.',
    active: true
  },
  {
    id: 'PLAN-RES-50',
    name: 'Home Fiber 50 Mbps',
    speed_mbps: 50,
    price: 350000,
    sla_percentage: 97.0,
    fup_quota_gb: 1200,
    category: 'Residential',
    description: 'Perfect for streaming 4K and gaming.',
    active: true
  },
  {
    id: 'PLAN-SME-100',
    name: 'SME 100 Mbps',
    speed_mbps: 100,
    price: 750000,
    sla_percentage: 98.5,
    category: 'SME',
    description: 'High speed connection for small businesses.',
    active: true
  },
  {
    id: 'PLAN-DED-100',
    name: 'Dedicated 100 Mbps',
    speed_mbps: 100,
    price: 3500000,
    sla_percentage: 99.9,
    category: 'Dedicated',
    description: '1:1 Ratio, Direct Backbone Connection, Priority Support.',
    active: true
  }
];

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-1001',
    full_name: 'Sarah Connor',
    email: 'sarah.hr@isp.com',
    phone: '0812-0000-0001',
    position: 'HR Manager',
    department: 'Human Resources',
    role: UserRole.HRD,
    status: EmployeeStatus.ACTIVE,
    join_date: '2020-01-15'
  },
  {
    id: 'EMP-2044',
    full_name: 'Budi Santoso',
    email: 'budi.field@isp.com',
    phone: '0856-1234-5678',
    position: 'Senior Field Technician',
    department: 'Operations',
    role: UserRole.FIELD,
    status: EmployeeStatus.ACTIVE,
    join_date: '2022-03-10',
    reports_to: 'EMP-3002' // Reports to Andi Network
  },
  {
    id: 'EMP-2055',
    full_name: 'Rina Sales',
    email: 'rina.sales@isp.com',
    phone: '0811-9988-7766',
    position: 'Account Executive',
    department: 'Sales & Marketing',
    role: UserRole.SALES,
    status: EmployeeStatus.ACTIVE,
    join_date: '2023-06-01'
  },
  {
    id: 'EMP-3002',
    full_name: 'Andi Network',
    email: 'andi.noc@isp.com',
    phone: '0813-5555-4444',
    position: 'NOC L2 Engineer',
    department: 'Network Operations',
    role: UserRole.NOC,
    status: EmployeeStatus.ON_LEAVE,
    join_date: '2021-11-20'
  }
];
