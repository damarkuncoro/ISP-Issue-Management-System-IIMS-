import { Maintenance, MaintenanceStatus } from '../types';

export const maintenanceData: Maintenance[] = [
  {
    id: "MT-202511-001",
    title: "Core Router Firmware Upgrade",
    description: "Upgrading MikroTik CCR1036 to RouterOS v7.15 stable. Expected downtime 15 mins.",
    start_time: "2025-11-30T02:00:00",
    end_time: "2025-11-30T04:00:00",
    affected_area: "Jakarta Region (All Backbone)",
    affected_devices: ["CCR1036-01"],
    status: MaintenanceStatus.SCHEDULED,
    type: "Software Patch",
    created_by: "Andi Network"
  },
  {
    id: "MT-202511-002",
    title: "Fiber Relocation - Jl. Sudirman",
    description: "Relocating FO cables due to MRT construction work. Backup link will be active.",
    start_time: "2025-12-05T23:00:00",
    end_time: "2025-12-06T05:00:00",
    affected_area: "Sudirman Business District",
    affected_devices: ["OLT-ZTE-C320"],
    status: MaintenanceStatus.SCHEDULED,
    type: "Fiber Relocation",
    created_by: "Manager"
  },
  {
    id: "MT-202510-015",
    title: "UPS Battery Replacement",
    description: "Replacing aging batteries in POP Bekasi.",
    start_time: "2025-10-15T10:00:00",
    end_time: "2025-10-15T12:00:00",
    affected_area: "Bekasi",
    affected_devices: ["SW-DIST-BKS"],
    status: MaintenanceStatus.COMPLETED,
    type: "Hardware Upgrade",
    created_by: "Andi Network"
  }
];