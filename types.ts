import React from 'react';

export enum TicketStatus {
  OPEN = 'Open',
  INVESTIGATING = 'Investigating',
  ASSIGNED = 'Assigned',
  FIXING = 'Fixing',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed'
}

export enum TicketType {
  NETWORK = 'Network',
  DEVICE = 'Device',
  CUSTOMER = 'Customer',
  INFRASTRUCTURE = 'Infrastructure',
  SECURITY = 'Security',
  BILLING = 'Billing' // Added explicit Billing type
}

export enum Severity {
  CRITICAL = 'Critical',
  MAJOR = 'Major',
  MINOR = 'Minor'
}

export enum UserRole {
  NOC = 'NOC Engineer',
  FIELD = 'Field Technician',
  NETWORK = 'Network Engineer',
  HELPDESK = 'Helpdesk',
  MANAGER = 'Manager',
  INVENTORY_ADMIN = 'Inventory Admin',
  SALES = 'Sales / Marketing',
  CS = 'Customer Service',
  PROVISIONING = 'Provisioning Team',
  PRODUCT_MANAGER = 'Product Manager',
  HRD = 'HRD / Human Resources',
  FINANCE = 'Finance / Billing'
}

export interface ActivityLogEntry {
  id: string;
  action: string; // e.g., 'Status Change', 'Ticket Created'
  description: string;
  timestamp: string; // ISO String
  user: string; // e.g., 'System', 'NOC Engineer'
}

export interface Ticket {
  id: string;
  title: string;
  type: TicketType;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  impact_users: number;
  severity: Severity;
  sla_deadline: string; // ISO String
  created_at: string; // ISO String
  link_id?: string; // Generic link (usually Customer ID)
  device_id?: string;
  related_invoice_id?: string; // Relation to Invoice
  related_maintenance_id?: string; // Relation to Maintenance Schedule
  status: TicketStatus;
  description?: string;
  logs?: string;
  assignee?: string;
  aiAnalysis?: string;
  activityLog?: ActivityLogEntry[];
}

export interface StatMetric {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean; // true = good (green), false = bad (red)
  icon: React.ReactNode;
}

// --- DEVICE TYPES ---

export enum DeviceStatus {
  PENDING = 'Pending Validation', // Input by Field Tech
  ACTIVE = 'Active',             // Approved/Input by Network Eng
  MAINTENANCE = 'Maintenance',
  RETIRED = 'Retired'
}

export enum DeviceType {
  ROUTER = 'Router',
  SWITCH = 'Switch',
  OLT = 'OLT',
  ONU = 'ONU',
  SERVER = 'Server',
  FIREWALL = 'Firewall'
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  model: string;
  ip_address: string;
  mac_address: string;
  serial_number: string;
  location: string;
  coordinates?: { // Added coordinates for Topology Map
    lat: number;
    lng: number;
  };
  status: DeviceStatus;
  last_updated: string;
  installed_by?: string;
  validated_by?: string;
  installation_photo?: string; // Mock URL or Base64
  customer_id?: string; // Relation to Customer
  uplink_device_id?: string; // Relation to Parent Device (Topology) e.g., ONU connects to OLT
}

// --- CUSTOMER TYPES ---

export enum CustomerStatus {
  LEAD = 'Lead / Draft',       // Input by Sales
  VERIFIED = 'Verified',       // Checked by CS/Admin
  ACTIVE = 'Active',           // Activated by Provisioning
  SUSPENDED = 'Suspended',     // Billing Issue
  TERMINATED = 'Terminated'
}

export interface Customer {
  id: string; // CID-xxxx
  name: string;
  email: string;
  phone: string;
  address: string;
  coordinates?: { lat: number, lng: number };
  package_name: string; // Legacy string
  service_plan_id?: string; // Relational Link to ServicePlan
  status: CustomerStatus;
  registered_at: string;
  
  // Admin / Verification Data
  identity_number?: string; // (NIK/KTP)
  contract_doc?: boolean;
  
  // Technical / Provisioning Data
  pppoe_username?: string;
  ip_address?: string; // Static or CGNAT
  vlan_id?: number;
  onu_mac?: string;
  olt_port?: string;
  
  // Termination Data
  termination_date?: string;
  termination_reason?: string;

  sales_agent?: string;
  last_updated: string;
}

// --- SERVICE PLAN TYPES ---

export interface ServicePlan {
  id: string;
  name: string;
  speed_mbps: number;
  price: number;
  sla_percentage: number;
  fup_quota_gb?: number; // 0 or undefined means Unlimited
  category: 'Residential' | 'SME' | 'Corporate' | 'Dedicated';
  description: string;
  active: boolean;
}

// --- EMPLOYEE TYPES ---

export enum EmployeeStatus {
  ACTIVE = 'Active',
  ON_LEAVE = 'On Leave',
  TERMINATED = 'Terminated'
}

export interface EmployeeAuditLogEntry {
  id: string;
  field: string;
  old_value: string;
  new_value: string;
  changed_by: string; // Role or Name
  timestamp: string;
}

export interface Employee {
  id: string; // EMP-xxxx
  full_name: string;
  email: string;
  phone: string;
  position: string; // Job Title
  department: string;
  role: UserRole; // Linked System Role
  status: EmployeeStatus;
  join_date: string;
  reports_to?: string; // ID of the manager (another Employee)
  auditLog?: EmployeeAuditLogEntry[];
}

// --- INVOICE TYPES ---

export enum InvoiceStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
  OVERDUE = 'Overdue',
  CANCELLED = 'Cancelled'
}

export interface Invoice {
  id: string; // INV-YYYYMM-xxxx
  customer_id: string;
  amount: number;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  payment_date?: string;
  items: { description: string, amount: number }[];
}

// --- MAINTENANCE TYPES ---

export enum MaintenanceStatus {
  SCHEDULED = 'Scheduled',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface Maintenance {
  id: string; // MT-YYYYMM-xxx
  title: string;
  description: string;
  start_time: string; // ISO String
  end_time: string; // ISO String
  affected_area: string;
  affected_devices: string[]; // List of Device IDs
  status: MaintenanceStatus;
  type: 'Hardware Upgrade' | 'Software Patch' | 'Fiber Relocation' | 'Emergency';
  created_by: string;
}

// --- KNOWLEDGE BASE TYPES ---

export interface KBArticle {
  id: string;
  title: string;
  category: 'SOP' | 'Troubleshooting' | 'Policy' | 'Scripting';
  content: string;
  author: string;
  last_updated: string;
  tags: string[];
  views: number;
}