import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import { Bill } from '../types';
import BillModal from '../components/BillModal';
import { useAuth } from '../context/AuthContext';

const Bills = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'Admin';

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await api.get('/bills');
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (billId: number, currentStatus: string) => {
    if (!isAdmin) return;
    
    const newStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID';
    try {
      await api.patch(`/bills/${billId}/status`, { status: newStatus });
      
      // Update local state
      setBills(bills.map(bill => 
        bill.id === billId ? { ...bill, status: newStatus } : bill
      ));
    } catch (error) {
      console.error('Error updating bill status:', error);
      alert('Failed to update bill status');
    }
  };

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const filteredBills = bills.filter(bill => 
    bill.customer?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Bills</h1>
      </div>

      {selectedBill && selectedBill.customer && (
        <BillModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          bill={selectedBill}
          customer={selectedBill.customer} 
        />
      )}

      <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="relative rounded-xl shadow-sm max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-blue-300 group-focus-within:text-white transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 sm:text-sm border border-white/20 rounded-xl bg-white/5 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white/20 transition-all py-2"
              placeholder="Search by customer name or bill ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Bill ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Units</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Arrears</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Status</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-blue-200">Loading...</td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-blue-200">No bills found</td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">#{bill.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{bill.customer?.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">
                      {new Date(bill.bill_month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{bill.units}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-300 font-medium">
                      {Number(bill.arrears) > 0 ? `$${Number(bill.arrears).toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">${Number(bill.total_amount).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">
                      <button
                        onClick={() => handleUpdateStatus(bill.id, bill.status)}
                        disabled={!isAdmin}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          bill.status === 'PAID' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        } ${isAdmin ? 'cursor-pointer hover:bg-opacity-80' : 'cursor-default'}`}
                        title={isAdmin ? "Click to toggle status" : "Only Admin can change status"}
                      >
                        {bill.status === 'PAID' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {bill.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewBill(bill)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <FileText className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bills;
