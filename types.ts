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
  SECURITY = 'Security'
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
  HRD = 'HRD / Human Resources'
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
  link_id?: string;
  device_id?: string;
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
  status: DeviceStatus;
  last_updated: string;
  installed_by?: string;
  validated_by?: string;
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
  package_name: string;
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
}