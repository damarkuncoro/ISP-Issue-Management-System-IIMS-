
import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, Lock, ArrowRight, UserCircle, Briefcase, Activity, DollarSign, Users } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: UserRole, username: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API Call
    setTimeout(() => {
        setIsLoading(false);
        // Default fallback for manual entry
        onLogin(UserRole.NOC, 'Demo User');
    }, 1000);
  };

  const QuickLoginButton = ({ role, name, icon, desc, color }: { role: UserRole, name: string, icon: React.ReactNode, desc: string, color: string }) => (
    <button 
        onClick={() => onLogin(role, name)}
        className="group flex items-center p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left w-full relative overflow-hidden"
    >
        <div className={`w-10 h-10 rounded-lg ${color} text-white flex items-center justify-center mr-3 shadow-sm group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div>
            <p className="font-bold text-slate-800 text-sm">{name}</p>
            <p className="text-xs text-slate-500">{desc}</p>
        </div>
        <ArrowRight size={16} className="absolute right-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            
            {/* Left Side: Brand & Hero */}
            <div className="md:w-1/2 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                    </svg>
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Shield size={24} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Cakramedia <span className="text-blue-500">Manager</span></h1>
                    </div>
                    <h2 className="text-4xl font-bold leading-tight mb-4">
                        Operational Excellence for Networks.
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Streamline ticketing, asset tracking, and customer provisioning in one unified platform.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-slate-500">
                    &copy; 2025 PT. Cakramedia Indocyber. Internal System.
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-slate-800">Welcome Back</h3>
                    <p className="text-slate-500">Please authenticate to access the dashboard.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Corporate Email</label>
                        <div className="relative">
                            <UserCircle size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="email" 
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                placeholder="employee@cakramedia.net.id"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="password" 
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Authenticating...' : 'Secure Login'}
                    </button>
                </form>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-400">DEMO QUICK ACCESS</span></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <QuickLoginButton 
                        role={UserRole.MANAGER} 
                        name="Sarah Connor" 
                        desc="General Manager"
                        icon={<Briefcase size={20} />} 
                        color="bg-slate-800"
                    />
                    <QuickLoginButton 
                        role={UserRole.NOC} 
                        name="Andi Network" 
                        desc="NOC Engineer"
                        icon={<Activity size={20} />} 
                        color="bg-blue-600"
                    />
                     <QuickLoginButton 
                        role={UserRole.FIELD} 
                        name="Budi Santoso" 
                        desc="Field Tech"
                        icon={<Users size={20} />} 
                        color="bg-orange-500"
                    />
                     <QuickLoginButton 
                        role={UserRole.FINANCE} 
                        name="Dewi Finance" 
                        desc="Billing Staff"
                        icon={<DollarSign size={20} />} 
                        color="bg-green-600"
                    />
                </div>
            </div>

        </div>
    </div>
  );
};

export default LoginScreen;
