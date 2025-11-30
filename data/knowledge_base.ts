
import { KBArticle } from '../types';

export const kbData: KBArticle[] = [
  {
    id: "KB-001",
    title: "SOP: Provisioning ONU ZTE F609 via OLT CLI",
    category: "SOP",
    content: "1. Login to OLT via Telnet/SSH.\n2. Enter config mode.\n3. Register ONU serial number: 'interface gpon-olt_1/2/1' then 'onu 1 type ZTE-F609 sn ZTEGC0FFEE'.\n4. Configure T-CONT and GEM Port.\n5. Bind service profile.\n6. Verify status using 'show gpon onu state'.",
    author: "Andi Network",
    last_updated: "2024-12-01",
    tags: ["ZTE", "Provisioning", "CLI", "OLT"],
    views: 125
  },
  {
    id: "KB-002",
    title: "Troubleshooting: Customer High Latency (Game Lag)",
    category: "Troubleshooting",
    content: "Step 1: Check optical power (Rx). Must be between -18dBm and -24dBm.\nStep 2: Check for packet loss on the Lastmile switch.\nStep 3: Verify if customer is using WiFi 2.4GHz in a crowded area. Suggest 5GHz.\nStep 4: Check bandwidth usage saturation via MRTG.",
    author: "NOC L2",
    last_updated: "2025-01-15",
    tags: ["Latency", "Gaming", "WiFi", "Troubleshooting"],
    views: 89
  },
  {
    id: "KB-003",
    title: "Script: MikroTik Auto-Backup to Email",
    category: "Scripting",
    content: "/system scheduler add name=backup-email interval=24h on-event=\"/system backup save name=email-backup; /tool e-mail send to=backup@isp.com file=email-backup.backup subject=Backup\"",
    author: "Sysadmin",
    last_updated: "2023-11-20",
    tags: ["MikroTik", "Script", "Backup", "Automation"],
    views: 210
  },
  {
    id: "KB-004",
    title: "Policy: Handling Abusive Customers (SOP)",
    category: "Policy",
    content: "1. Remain calm and do not raise your voice.\n2. Acknowledge the frustration ('Saya mengerti kekecewaan Bapak/Ibu').\n3. Do not promise unrealistic fix times.\n4. If customer uses profanity, give 2 warnings before terminating the call.\n5. Log the interaction in the ticket as 'Difficult Interaction'.",
    author: "HR Manager",
    last_updated: "2024-05-10",
    tags: ["Soft Skill", "CS", "SOP"],
    views: 340
  },
  {
    id: "KB-005",
    title: "Guide: Interpreting OTDR Traces",
    category: "SOP",
    content: "Events:\n- Reflective Event (Spike): Connectors or Mechanical Splices.\n- Non-Reflective Event (Drop): Fusion Splices or Macro Bends.\n- End of Fiber: High reflection followed by noise.\n\nCalculation:\nLoss (dB) / Distance (km) = Attenuation (dB/km). Standard is 0.22 dB/km for 1550nm.",
    author: "Senior Field Tech",
    last_updated: "2025-02-01",
    tags: ["Fiber Optic", "OTDR", "Field"],
    views: 56
  },
  {
    id: "KB-006",
    title: "Education: Understanding CPE (Customer Premises Equipment)",
    category: "Policy",
    content: "DEFINITION:\nCPE (Customer Premises Equipment) is any hardware located at the customer's home/office.\n\nCOMMON DEVICE TYPES:\n1. ONU/ONT (Modem Fiber): Converts light signal to digital (e.g., ZTE F609, Huawei HG8245).\n2. WiFi Router: Broadcasts wireless signal (e.g., TP-Link, Tenda).\n3. STB (Set Top Box): For IPTV services.\n\nOWNERSHIP MODELS:\n- Rental/Lended: Property of ISP. Must be retrieved upon termination.\n- Owned: Purchased by customer. Customer responsibility if broken.\n\nHANDLING:\n- Always record SN and MAC address in the Inventory module.\n- Use Bridge Mode for Corporate clients to allow them to use their own routers.",
    author: "Training Dept",
    last_updated: "2025-11-28",
    tags: ["CPE", "Hardware", "Basic Knowledge", "Onboarding"],
    views: 12
  }
];
