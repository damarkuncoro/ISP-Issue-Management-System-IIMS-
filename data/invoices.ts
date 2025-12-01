
export const invoicesData = [
  {
    "id": "INV-202511-001",
    "customer_id": "CID-250001",
    "amount": 3850000,
    "issue_date": "2025-11-01",
    "due_date": "2025-11-15",
    "status": "Paid",
    "payment_date": "2025-11-10",
    "items": [
      { "description": "Dedicated Internet 100 Mbps (Nov 2025)", "amount": 3500000 },
      { "description": "Public IP Rental (x5)", "amount": 350000 }
    ]
  },
  {
    "id": "INV-202511-045",
    "customer_id": "CID-250045",
    "amount": 385000,
    "issue_date": "2025-11-01",
    "due_date": "2025-11-20",
    "status": "Unpaid",
    "items": [
      { "description": "Home Fiber 50 Mbps (Nov 2025)", "amount": 350000 },
      { "description": "Tax (10%)", "amount": 35000 }
    ]
  },
  {
    "id": "INV-202510-045",
    "customer_id": "CID-250045",
    "amount": 385000,
    "issue_date": "2025-10-01",
    "due_date": "2025-10-20",
    "status": "Paid",
    "payment_date": "2025-10-18",
    "items": [
      { "description": "Home Fiber 50 Mbps (Oct 2025)", "amount": 350000 },
      { "description": "Tax (10%)", "amount": 35000 }
    ]
  },
  {
    "id": "INV-202510-001",
    "customer_id": "CID-250001",
    "amount": 3850000,
    "issue_date": "2025-10-01",
    "due_date": "2025-10-15",
    "status": "Paid",
    "payment_date": "2025-10-05",
    "items": [
      { "description": "Dedicated Internet 100 Mbps (Oct 2025)", "amount": 3500000 },
      { "description": "Public IP Rental (x5)", "amount": 350000 }
    ]
  },
  {
    "id": "INV-202511-999",
    "customer_id": "CID-250046",
    "amount": 825000,
    "issue_date": "2025-11-01",
    "due_date": "2025-11-10",
    "status": "Overdue",
    "items": [
      { "description": "SME 100 Mbps (Nov 2025)", "amount": 750000 },
      { "description": "Tax (10%)", "amount": 75000 }
    ]
  },
  // --- ROBINSON POP INVOICES ---
  {
    "id": "INV-ROB-001",
    "customer_id": "CUST-ROB-001",
    "amount": 2000000,
    "issue_date": "2025-11-01",
    "due_date": "2025-11-15",
    "status": "Paid",
    "payment_date": "2025-11-03",
    "items": [
      { "description": "Corporate 15 Mbps (Nov 2025)", "amount": 2000000 }
    ]
  },
  {
    "id": "INV-ROB-002",
    "customer_id": "CUST-ROB-002",
    "amount": 8500000,
    "issue_date": "2025-11-01",
    "due_date": "2025-11-15",
    "status": "Unpaid",
    "items": [
      { "description": "IX 150MB / IIX 120MB (Nov 2025)", "amount": 8500000 }
    ]
  }
];
