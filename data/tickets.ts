
export const ticketsData = [
  {
    "id": "ISP-20251128-001",
    "title": "Backbone Jakarta - Bandung Down",
    "type": "Network",
    "location": "POP Jakarta",
    "coordinates": { "lat": -6.2088, "lng": 106.8456 },
    "impact_users": 1250,
    "severity": "Critical",
    "sla_deadline": "2025-11-28T18:00:00",
    "created_at": "2025-11-28T14:00:00",
    "link_id": "BB-JKT-BDG-01",
    "device_id": "CCR1036-01",
    "status": "Investigating",
    "description": "Core router reports interface bonding down. Multiple alarms received via SNMP.",
    "logs": "ifOperStatus: down, ospfNbrState: down",
    "assignee": "NOC Team A",
    "activityLog": [
      {
        "id": "log-1-2",
        "action": "Status Update",
        "description": "Status changed to Investigating",
        "timestamp": "2025-11-28T14:15:00",
        "user": "NOC Engineer"
      },
      {
        "id": "log-1-1",
        "action": "Ticket Created",
        "description": "System auto-generated ticket from SNMP Trap",
        "timestamp": "2025-11-28T14:00:00",
        "user": "System"
      }
    ]
  },
  {
    "id": "ISP-20251128-002",
    "title": "High Latency Area Bekasi",
    "type": "Network",
    "location": "ODP-BKS-044",
    "coordinates": { "lat": -6.2383, "lng": 106.9756 },
    "impact_users": 45,
    "severity": "Major",
    "sla_deadline": "2025-11-28T20:00:00",
    "created_at": "2025-11-28T15:30:00",
    "status": "Open",
    "description": "Users reporting lag > 150ms to local gateway.",
    "activityLog": [
      {
        "id": "log-2-1",
        "action": "Ticket Created",
        "description": "Ticket created from Customer Complaint",
        "timestamp": "2025-11-28T15:30:00",
        "user": "Helpdesk"
      }
    ]
  },
  {
    "id": "ISP-20251128-003",
    "title": "OLT Power Loss - Cluster A",
    "type": "Infrastructure",
    "location": "Cluster A Shelter",
    "coordinates": { "lat": -6.9175, "lng": 107.6191 },
    "impact_users": 300,
    "severity": "Critical",
    "sla_deadline": "2025-11-28T16:00:00",
    "created_at": "2025-11-28T13:00:00",
    "device_id": "OLT-ZTE-C320",
    "status": "Fixing",
    "assignee": "Tech Field - Budi",
    "description": "Mains power failure reported by UPS monitoring.",
    "activityLog": [
      {
        "id": "log-3-3",
        "action": "Status Update",
        "description": "Status changed to Fixing",
        "timestamp": "2025-11-28T13:45:00",
        "user": "Tech Field - Budi"
      },
      {
        "id": "log-3-2",
        "action": "Assignee Update",
        "description": "Assigned to Tech Field - Budi",
        "timestamp": "2025-11-28T13:10:00",
        "user": "NOC Engineer"
      },
      {
        "id": "log-3-1",
        "action": "Ticket Created",
        "description": "System auto-generated ticket from UPS Alert",
        "timestamp": "2025-11-28T13:00:00",
        "user": "System"
      }
    ]
  },
  {
    "id": "ISP-20251128-004",
    "title": "Customer Cannot Login PPPoE",
    "type": "Customer",
    "location": "Residental Area",
    "coordinates": { "lat": -6.4025, "lng": 106.7942 },
    "impact_users": 1,
    "severity": "Minor",
    "sla_deadline": "2025-11-29T10:00:00",
    "created_at": "2025-11-28T09:00:00",
    "status": "Resolved",
    "description": "Authentication failed due to frozen mac address session.",
    "activityLog": [
      {
        "id": "log-4-3",
        "action": "Status Update",
        "description": "Status changed to Resolved",
        "timestamp": "2025-11-28T09:30:00",
        "user": "Helpdesk"
      },
      {
        "id": "log-4-2",
        "action": "Status Update",
        "description": "Status changed to Fixing",
        "timestamp": "2025-11-28T09:10:00",
        "user": "Helpdesk"
      },
      {
        "id": "log-4-1",
        "action": "Ticket Created",
        "description": "Ticket created manually",
        "timestamp": "2025-11-28T09:00:00",
        "user": "Helpdesk"
      }
    ]
  },
  {
    "id": "ISP-20251128-005",
    "title": "DDoS Attack Detected on IP Block 103.x.x.x",
    "type": "Security",
    "location": "Data Center",
    "coordinates": { "lat": -6.1751, "lng": 106.8650 },
    "impact_users": 5000,
    "severity": "Critical",
    "sla_deadline": "2025-11-28T14:30:00",
    "created_at": "2025-11-28T14:00:00",
    "status": "Closed",
    "description": "Volumetric attack 15Gbps detected. Mitigation scrubbers activated.",
    "assignee": "SecOps Team",
    "activityLog": [
       {
        "id": "log-5-4",
        "action": "Status Update",
        "description": "Status changed to Closed",
        "timestamp": "2025-11-28T15:00:00",
        "user": "SecOps Team"
      },
      {
        "id": "log-5-3",
        "action": "Status Update",
        "description": "Status changed to Resolved",
        "timestamp": "2025-11-28T14:45:00",
        "user": "SecOps Team"
      },
       {
        "id": "log-5-2",
        "action": "Status Update",
        "description": "Status changed to Fixing (Mitigation)",
        "timestamp": "2025-11-28T14:05:00",
        "user": "SecOps Team"
      },
      {
        "id": "log-5-1",
        "action": "Ticket Created",
        "description": "System auto-generated ticket from IDS/IPS",
        "timestamp": "2025-11-28T14:00:00",
        "user": "System"
      }
    ]
  },
  // --- ROBINSON POP TICKETS (Linking to CUST-ROB-001 / DEV-ROB-001) ---
  {
    "id": "ISP-20251128-006",
    "title": "Intermittent Connection - Sumi Florence",
    "type": "Customer",
    "location": "Florence 7 No. 70",
    "coordinates": { "lat": -6.1395, "lng": 106.7930 },
    "impact_users": 1,
    "severity": "Minor",
    "sla_deadline": "2025-11-29T11:00:00",
    "created_at": "2025-11-28T09:30:00",
    "link_id": "CUST-ROB-001",
    "device_id": "DEV-ROB-001",
    "related_invoice_id": "INV-ROB-001",
    "status": "Resolved",
    "description": "Customer reporting packet loss. Checked Radio Metal 5SHPn, alignment optimized.",
    "assignee": "Field Tech - Budi",
    "activityLog": [
        {
            "id": "log-6-2",
            "action": "Ticket Resolved",
            "description": "Re-aligned antenna. Signal -55dBm stable.",
            "timestamp": "2025-11-28T11:00:00",
            "user": "Field Tech - Budi"
        }
    ]
  },
  {
    "id": "ISP-20251128-007",
    "title": "Sinarbudi Link Down",
    "type": "Device",
    "location": "Apartemen Robinson",
    "coordinates": { "lat": -6.1392, "lng": 106.7925 },
    "impact_users": 5,
    "severity": "Major",
    "sla_deadline": "2025-11-28T15:00:00",
    "created_at": "2025-11-28T10:00:00",
    "link_id": "CUST-ROB-004",
    "device_id": "DEV-ROB-004",
    "status": "Open",
    "description": "Device unreachable via ping. Power outage suspected at site.",
    "assignee": "NOC Team A"
  }
];
