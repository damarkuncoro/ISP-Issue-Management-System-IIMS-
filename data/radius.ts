
import { RadiusSession, RadiusLog } from '../types';

export const radiusSessionsData: RadiusSession[] = [
  {
    id: "89123abc",
    username: "majumundur_corp",
    customer_id: "CID-250001",
    ip_address: "202.133.0.50",
    mac_address: "AA:BB:CC:11:22:33",
    nas_ip: "202.133.4.1", // Core Router
    start_time: "2025-11-20T08:00:00",
    uptime_seconds: 725400, // ~8 days
    download_total_mb: 450200,
    upload_total_mb: 120500,
    current_download_rate: 45.2,
    current_upload_rate: 12.1,
    protocol: 'PPPoE',
    status: 'Active'
  },
  {
    id: "77213xyz",
    username: "budi.santoso",
    customer_id: "CID-250045",
    ip_address: "10.20.30.45", // NAT IP
    mac_address: "ZTEGC0FFEE12",
    nas_ip: "202.133.3.2", // OLT Robinson
    start_time: "2025-11-28T12:00:00",
    uptime_seconds: 3600, // 1 hour
    download_total_mb: 150,
    upload_total_mb: 20,
    current_download_rate: 5.5,
    current_upload_rate: 0.8,
    protocol: 'PPPoE',
    status: 'Active'
  },
  {
    id: "99881qwe",
    username: "sumi.florence",
    customer_id: "CUST-ROB-001",
    ip_address: "202.133.0.162",
    mac_address: "D4:CA:6D:11:22:33",
    nas_ip: "202.133.3.2",
    start_time: "2025-11-25T10:00:00",
    uptime_seconds: 259200, // 3 days
    download_total_mb: 12000,
    upload_total_mb: 4500,
    current_download_rate: 8.2,
    current_upload_rate: 2.1,
    protocol: 'PPPoE',
    status: 'Active'
  }
];

export const radiusLogsData: RadiusLog[] = [
  {
    id: "log-r-001",
    timestamp: "2025-11-28T14:00:05",
    username: "budi.santoso",
    message: "Login OK",
    reply: "Accept",
    nas_ip: "202.133.3.2",
    mac_address: "ZTEGC0FFEE12"
  },
  {
    id: "log-r-002",
    timestamp: "2025-11-28T13:55:00",
    username: "unknown_user",
    message: "User not found",
    reply: "Reject",
    nas_ip: "202.133.3.2",
    mac_address: "AA:11:22:33:44:55"
  },
  {
    id: "log-r-003",
    timestamp: "2025-11-28T13:50:12",
    username: "majumundur_corp",
    message: "Login OK: IP Pool Exhausted, fallback to secondary",
    reply: "Accept",
    nas_ip: "202.133.4.1",
    mac_address: "AA:BB:CC:11:22:33"
  },
  {
    id: "log-r-004",
    timestamp: "2025-11-28T13:45:00",
    username: "test_user",
    message: "Wrong Password",
    reply: "Reject",
    nas_ip: "202.133.4.1",
    mac_address: "BB:CC:DD:EE:FF:00"
  },
  {
    id: "log-r-005",
    timestamp: "2025-11-28T12:00:00",
    username: "budi.santoso",
    message: "Login OK",
    reply: "Accept",
    nas_ip: "202.133.3.2",
    mac_address: "ZTEGC0FFEE12"
  }
];
