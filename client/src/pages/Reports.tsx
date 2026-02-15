import React, { useState, useEffect } from 'react';
import { BarChart, DollarSign, Droplets, Users, FileText, Download } from 'lucide-react';
import api from '../services/api';

interface RevenueData {
  month: string;
  total_billed: string;
  total_collected: string;
  total_outstanding: string;
}

interface UsageData {
  month: string;
  total_units: string;
}

interface CustomerSummary {
  id: number;
  full_name: string;
  account_number: string;
  total_bills: string;
  total_billed_amount: string;
  total_paid_amount: string;
  current_outstanding_principal: string;
}

const Reports = () => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'usage' | 'customer'>('revenue');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [customerData, setCustomerData] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'revenue') {
        const res = await api.get('/reports/revenue');
        setRevenueData(res.data);
      } else if (activeTab === 'usage') {
        const res = await api.get('/reports/usage');
        setUsageData(res.data);
      } else if (activeTab === 'customer') {
        const res = await api.get('/reports/customer-summary');
        setCustomerData(res.data);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate and view system reports</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Export / Print
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 overflow-x-auto pb-1 print:hidden">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
            activeTab === 'revenue'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Revenue Report
        </button>
        <button
          onClick={() => setActiveTab('usage')}
          className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
            activeTab === 'usage'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Droplets className="w-4 h-4 mr-2" />
          Usage Report
        </button>
        <button
          onClick={() => setActiveTab('customer')}
          className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
            activeTab === 'customer'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Customer Summary
        </button>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-none">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading report data...</div>
        ) : (
          <div className="p-6">
            
            {/* Revenue Report */}
            {activeTab === 'revenue' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Monthly Revenue Analysis
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-semibold uppercase">
                      <tr>
                        <th className="px-6 py-3">Month</th>
                        <th className="px-6 py-3 text-right">Total Billed</th>
                        <th className="px-6 py-3 text-right">Collected</th>
                        <th className="px-6 py-3 text-right">Outstanding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {revenueData.length > 0 ? (
                        revenueData.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium">{row.month}</td>
                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                              ${Number(row.total_billed).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-right text-green-600">
                              ${Number(row.total_collected).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-right text-red-600">
                              ${Number(row.total_outstanding).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            No revenue data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Usage Report */}
            {activeTab === 'usage' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Droplets className="w-5 h-5 mr-2 text-blue-600" />
                  Monthly Water Consumption
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-semibold uppercase">
                      <tr>
                        <th className="px-6 py-3">Month</th>
                        <th className="px-6 py-3 text-right">Total Units Consumed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {usageData.length > 0 ? (
                        usageData.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium">{row.month}</td>
                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                              {Number(row.total_units).toLocaleString()} Units
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                            No usage data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Customer Summary Report */}
            {activeTab === 'customer' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Customer Financial Summary
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-semibold uppercase">
                      <tr>
                        <th className="px-6 py-3">Customer</th>
                        <th className="px-6 py-3">Account #</th>
                        <th className="px-6 py-3 text-center">Bills</th>
                        <th className="px-6 py-3 text-right">Total Billed</th>
                        <th className="px-6 py-3 text-right">Total Paid</th>
                        <th className="px-6 py-3 text-right">Current Outstanding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {customerData.length > 0 ? (
                        customerData.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{row.full_name}</td>
                            <td className="px-6 py-4 text-gray-500">{row.account_number || '-'}</td>
                            <td className="px-6 py-4 text-center">{row.total_bills}</td>
                            <td className="px-6 py-4 text-right text-gray-900">
                              ${Number(row.total_billed_amount).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-right text-green-600">
                              ${Number(row.total_paid_amount).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-right text-red-600 font-medium">
                              ${Number(row.current_outstanding_principal).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No customer data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
