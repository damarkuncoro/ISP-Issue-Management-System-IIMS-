
import React from 'react';
import { Invoice, InvoiceStatus, Customer } from '../../types';
import { DollarSign, AlertCircle, Clock, TrendingUp, CheckCircle, FileText, Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';

interface FinanceDashboardProps {
  invoices: Invoice[];
  customers: Customer[];
}

const StatCard = ({ title, value, subtext, icon, colorClass, bgClass }: { title: string, value: string, subtext: string, icon: React.ReactNode, colorClass: string, bgClass?: string }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between transition-all hover:shadow-md ${bgClass}`}>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      <p className={`text-xs mt-2 font-medium ${colorClass}`}>{subtext}</p>
    </div>
    <div className={`p-3 rounded-lg ${colorClass.replace('text-', 'bg-').replace('600', '100').replace('500', '100').replace('700', '100')} ${colorClass}`}>
      {icon}
    </div>
  </div>
);

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ invoices, customers }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumSignificantDigits: 3 }).format(val);
  };

  const paidInvoices = invoices.filter(i => i.status === InvoiceStatus.PAID);
  const unpaidInvoices = invoices.filter(i => i.status === InvoiceStatus.UNPAID);
  const overdueInvoices = invoices.filter(i => i.status === InvoiceStatus.OVERDUE);

  const totalRevenue = paidInvoices.reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutstanding = unpaidInvoices.reduce((acc, curr) => acc + curr.amount, 0);
  const totalOverdue = overdueInvoices.reduce((acc, curr) => acc + curr.amount, 0);

  // Mock Trend Data
  const revenueData = [
    { month: 'Jun', income: 15000000, expenses: 12000000 },
    { month: 'Jul', income: 18000000, expenses: 12500000 },
    { month: 'Aug', income: 22000000, expenses: 14000000 },
    { month: 'Sep', income: 25000000, expenses: 16000000 },
    { month: 'Oct', income: 32000000, expenses: 18000000 },
    { month: 'Nov', income: totalRevenue, expenses: 19500000 },
  ];

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Welcome */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h2 className="text-2xl font-bold text-slate-800">Financial Overview</h2>
             <p className="text-slate-500">Real-time insight into cash flow, revenue, and billing status.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <StatCard 
                title="Total Revenue (YTD)" 
                value={formatCurrency(totalRevenue)} 
                subtext="Paid Invoices"
                icon={<DollarSign size={24} />}
                colorClass="text-green-600"
            />
             <StatCard 
                title="Projected Income" 
                value={formatCurrency(totalOutstanding)} 
                subtext="Pending Invoices"
                icon={<Clock size={24} />}
                colorClass="text-blue-600"
            />
             <StatCard 
                title="Overdue Amount" 
                value={formatCurrency(totalOverdue)} 
                subtext="Requires Collection"
                icon={<AlertCircle size={24} />}
                colorClass="text-red-600"
                bgClass="bg-red-50/30"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Revenue vs Expense Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                 <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-green-500" /> Revenue vs Operational Cost
                </h4>
                <div className="h-80 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <Tooltip contentStyle={{ borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                            <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Overdue List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-red-50 flex items-center gap-2">
                    <AlertCircle size={18} className="text-red-600" />
                    <h4 className="font-bold text-red-800">High Priority Collections</h4>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {overdueInvoices.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {overdueInvoices.map(inv => (
                                <div key={inv.id} className="p-4 hover:bg-slate-50">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-slate-700">{getCustomerName(inv.customer_id)}</span>
                                        <span className="text-red-600 font-bold text-sm">{formatCurrency(inv.amount)}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mb-2">
                                        Due: {new Date(inv.due_date).toLocaleDateString()}
                                    </div>
                                    <button className="w-full py-1.5 text-xs font-bold text-red-700 bg-red-100 rounded hover:bg-red-200 flex items-center justify-center gap-1 transition">
                                        Send Reminder
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="p-8 text-center text-slate-500">
                            <CheckCircle size={48} className="text-green-200 mx-auto mb-2" />
                            <p>No overdue invoices!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100">
                <h4 className="font-bold text-slate-700">Recent Transactions (Income)</h4>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                            <th className="px-6 py-3">Invoice ID</th>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Date Paid</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paidInvoices.slice(0,5).map(inv => (
                             <tr key={inv.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-mono text-slate-500">{inv.id}</td>
                                <td className="px-6 py-4 font-medium text-slate-800">{getCustomerName(inv.customer_id)}</td>
                                <td className="px-6 py-4 text-slate-600">{new Date(inv.payment_date || '').toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-green-600 font-bold">{formatCurrency(inv.amount)}</td>
                                <td className="px-6 py-4">
                                     <button className="text-slate-400 hover:text-blue-600" title="Download Receipt"><Download size={16} /></button>
                                </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default FinanceDashboard;
