
import React, { useState } from 'react';
import { Ticket, Customer, Invoice, TicketStatus, Severity } from '../types';
import { FileText, Download, Calendar, Filter, BarChart2, PieChart, Printer } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ReportsProps {
  tickets: Ticket[];
  customers: Customer[];
  invoices: Invoice[];
}

type ReportType = 'INCIDENT_SUMMARY' | 'SLA_PERFORMANCE' | 'TECHNICIAN_KPI' | 'FINANCIAL_SUMMARY';

const Reports: React.FC<ReportsProps> = ({ tickets, customers, invoices }) => {
  const [reportType, setReportType] = useState<ReportType>('INCIDENT_SUMMARY');
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper to format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumSignificantDigits: 3 }).format(val);
  };

  // --- REPORT GENERATION LOGIC ---
  const generateData = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Filter data by date range (mock logic since mock data dates are static)
    // For demo, we just use all data but imagine filtering
    
    if (reportType === 'INCIDENT_SUMMARY') {
        const totalTickets = tickets.length;
        const critical = tickets.filter(t => t.severity === Severity.CRITICAL).length;
        const resolved = tickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length;
        const avgResolutionTime = "2h 45m"; // Mock calculation

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase">Total Incidents</p>
                        <p className="text-2xl font-bold text-slate-800">{totalTickets}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-xs text-red-600 uppercase">Critical Outages</p>
                        <p className="text-2xl font-bold text-red-800">{critical}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-600 uppercase">Resolved</p>
                        <p className="text-2xl font-bold text-green-800">{resolved}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-600 uppercase">Avg MTTR</p>
                        <p className="text-2xl font-bold text-blue-800">{avgResolutionTime}</p>
                    </div>
                </div>
                
                <table className="w-full text-sm text-left border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-600 font-medium">
                        <tr>
                            <th className="px-4 py-2 border-b">Date</th>
                            <th className="px-4 py-2 border-b">ID</th>
                            <th className="px-4 py-2 border-b">Issue</th>
                            <th className="px-4 py-2 border-b">Severity</th>
                            <th className="px-4 py-2 border-b">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(t => (
                            <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50">
                                <td className="px-4 py-2">{new Date(t.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-2 font-mono text-xs">{t.id}</td>
                                <td className="px-4 py-2">{t.title}</td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-0.5 rounded text-xs ${t.severity === Severity.CRITICAL ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{t.severity}</span>
                                </td>
                                <td className="px-4 py-2">{t.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (reportType === 'FINANCIAL_SUMMARY') {
        const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
        const paid = invoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
        const unpaid = invoices.filter(i => i.status !== 'Paid').reduce((sum, inv) => sum + inv.amount, 0);

        return (
            <div className="space-y-6">
                 <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase">Total Invoiced</p>
                        <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalInvoiced)}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-600 uppercase">Collected Revenue</p>
                        <p className="text-2xl font-bold text-green-800">{formatCurrency(paid)}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-xs text-red-600 uppercase">Outstanding / Overdue</p>
                        <p className="text-2xl font-bold text-red-800">{formatCurrency(unpaid)}</p>
                    </div>
                </div>

                <div className="h-64 bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                            { name: 'Invoiced', amount: totalInvoiced },
                            { name: 'Collected', amount: paid },
                            { name: 'Pending', amount: unpaid },
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                            <Bar dataKey="amount" fill="#3b82f6" barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    return <div className="p-10 text-center text-slate-500">Report type detailed view under construction.</div>;
  };

  const handlePrint = () => {
      setIsGenerating(true);
      setTimeout(() => {
          setIsGenerating(false);
          alert("Report downloaded as PDF (Simulation)");
      }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER & CONTROLS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>
                <p className="text-slate-500">Generate operational insights and financial summaries.</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition font-medium"
                >
                    <Printer size={18} /> Print
                </button>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                >
                    {isGenerating ? 'Generating...' : <><Download size={18} /> Export PDF</>}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Report Type</label>
                <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value as ReportType)}
                    >
                        <option value="INCIDENT_SUMMARY">Incident & Outage Summary</option>
                        <option value="FINANCIAL_SUMMARY">Revenue & Billing Report</option>
                        <option value="SLA_PERFORMANCE">SLA Compliance Report</option>
                        <option value="TECHNICIAN_KPI">Technician Productivity KPI</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="date" 
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="date" 
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>
        </div>
      </div>

      {/* REPORT PREVIEW AREA */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
          <div className="text-center mb-8 pb-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wide mb-1">
                  {reportType.replace('_', ' ')}
              </h3>
              <p className="text-slate-500 text-sm">
                  Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-slate-400 mt-1">Generated on {new Date().toLocaleString()}</p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4">
              {generateData()}
          </div>
      </div>

    </div>
  );
};

export default Reports;
