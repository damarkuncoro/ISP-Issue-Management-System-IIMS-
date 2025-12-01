
import { SyslogMessage, SyslogLevel } from '../types';

export const syslogsData: SyslogMessage[] = [
  {
    id: "sys-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    hostname: "CCR1036-01",
    ip_address: "202.133.4.1",
    level: SyslogLevel.INFO,
    facility: "local0",
    app_name: "interface",
    message: "ether2 link up (speed 1G, full duplex)"
  },
  {
    id: "sys-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    hostname: "OLT-ZTE-C320",
    ip_address: "202.133.3.2",
    level: SyslogLevel.WARNING,
    facility: "daemon",
    app_name: "gpon",
    message: "ONU-250045: Optical power low (-28.50 dBm)"
  },
  {
    id: "sys-3",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    hostname: "CCR1036-01",
    ip_address: "202.133.4.1",
    level: SyslogLevel.ERROR,
    facility: "auth",
    app_name: "sshd",
    message: "Failed password for root from 192.168.88.55 port 22 ssh2"
  },
  {
    id: "sys-4",
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    hostname: "SW-DIST-BKS",
    ip_address: "202.133.5.5",
    level: SyslogLevel.NOTICE,
    facility: "system",
    app_name: "stp",
    message: "RSTP topology change detected on VLAN 205"
  },
  {
    id: "sys-5",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    hostname: "CCR1036-01",
    ip_address: "202.133.4.1",
    level: SyslogLevel.INFO,
    facility: "local0",
    app_name: "bgp",
    message: "BGP peer 123.108.9.172 (IIX) established"
  },
  {
    id: "sys-6",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    hostname: "DEV-ROB-001",
    ip_address: "202.133.0.162",
    level: SyslogLevel.CRITICAL,
    facility: "system",
    app_name: "watchdog",
    message: "System rebooted because of kernel failure"
  }
];
