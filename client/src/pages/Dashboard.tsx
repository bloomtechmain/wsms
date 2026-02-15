import React, { useEffect, useState } from 'react';
import { Users, Droplets, DollarSign, Activity, FileText, Clock } from 'lucide-react';
import api from '../services/api';

interface DashboardStats {
  totalCustomers: string;
  totalConsumption: string;
  totalRevenue: string;
  pendingBills: string;
  recentReadings: any[];
  recentBills: any[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-white">Loading dashboard...</div>;
  }

  const statCards = [
    { name: 'Total Customers', value: stats?.totalCustomers || '0', icon: Users, color: 'bg-blue-500' },
    { name: 'Total Consumption', value: `${stats?.totalConsumption || 0} Units`, icon: Droplets, color: 'bg-green-500' },
    { name: 'Total Revenue', value: `$${stats?.totalRevenue || 0}`, icon: DollarSign, color: 'bg-yellow-500' },
    { name: 'Pending Bills', value: stats?.pendingBills || '0', icon: Activity, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="bg-white/10 backdrop-blur-lg overflow-hidden shadow-xl rounded-2xl border border-white/20 transition-transform hover:scale-105">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-xl p-3 shadow-lg ${item.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-blue-200 truncate">{item.name}</dt>
                      <dd className="text-lg font-bold text-white">{item.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Readings */}
        <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold leading-6 text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" /> Recent Readings
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap text-gray-300">
              <thead className="uppercase tracking-wider border-b border-white/10 text-xs">
                <tr>
                  <th scope="col" className="px-4 py-3">Customer</th>
                  <th scope="col" className="px-4 py-3">Units</th>
                  <th scope="col" className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentReadings.map((reading: any) => (
                  <tr key={reading.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">{reading.customer_name}</td>
                    <td className="px-4 py-3">{reading.units_consumed}</td>
                    <td className="px-4 py-3">{new Date(reading.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(!stats?.recentReadings || stats.recentReadings.length === 0) && (
                   <tr><td colSpan={3} className="px-4 py-3 text-center">No recent readings</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Bills */}
        <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold leading-6 text-white flex items-center">
              <FileText className="w-5 h-5 mr-2" /> Recent Bills
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap text-gray-300">
              <thead className="uppercase tracking-wider border-b border-white/10 text-xs">
                <tr>
                  <th scope="col" className="px-4 py-3">Customer</th>
                  <th scope="col" className="px-4 py-3">Amount</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentBills.map((bill: any) => (
                  <tr key={bill.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">{bill.customer_name}</td>
                    <td className="px-4 py-3">${Number(bill.total_amount).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bill.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                  </tr>
                ))}
                 {(!stats?.recentBills || stats.recentBills.length === 0) && (
                   <tr><td colSpan={3} className="px-4 py-3 text-center">No recent bills</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
