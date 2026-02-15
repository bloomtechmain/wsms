
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Customer, MeterReading, Bill } from '../types';
import { ArrowLeft, User, MapPin, Phone, Hash, FileText, Activity, Edit2, X, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CustomerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<MeterReading | null>(null);
  const [newReadingValue, setNewReadingValue] = useState<string>('');
  const [updateError, setUpdateError] = useState('');

  const fetchData = async () => {
    try {
      const [customerRes, readingsRes, billsRes] = await Promise.all([
        api.get(`/customers/${id}`),
        api.get(`/readings?customer_id=${id}`),
        api.get(`/bills?customer_id=${id}`)
      ]);

      setCustomer(customerRes.data);
      setReadings(readingsRes.data);
      setBills(billsRes.data);
    } catch (err) {
      console.error('Error fetching customer data:', err);
      setError('Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleEditClick = (reading: MeterReading) => {
    setEditingReading(reading);
    setNewReadingValue(reading.current_reading.toString());
    setUpdateError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateReading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReading) return;

    try {
      await api.put(`/readings/${editingReading.id}`, { 
        current_reading: Number(newReadingValue) 
      });
      setIsEditModalOpen(false);
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error('Error updating reading:', err);
      setUpdateError(err.response?.data?.message || 'Failed to update reading');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="text-center text-white mt-10">
        <p className="text-xl mb-4">{error || 'Customer not found'}</p>
        <button 
          onClick={() => navigate('/customers')}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/customers')}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-white">Customer Profile</h1>
      </div>

      {/* Main Info Card */}
      <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl border border-white/20 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <User className="h-8 w-8 text-blue-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{customer.full_name}</h2>
              <p className="text-blue-200 text-sm">Code: {customer.customer_code}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-blue-100">
                  <MapPin className="h-4 w-4 mr-2 opacity-70" />
                  <span>{customer.address || 'No address provided'}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center text-blue-100">
                    <Phone className="h-4 w-4 mr-2 opacity-70" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-blue-100">
                  <Hash className="h-4 w-4 mr-2 opacity-70" />
                  <span>Meter: {customer.meter_number}</span>
                </div>
                {customer.account_number && (
                  <div className="flex items-center text-blue-100">
                    <FileText className="h-4 w-4 mr-2 opacity-70" />
                    <span>Account: {customer.account_number}</span>
                  </div>
                )}
                <div className="flex items-center text-blue-100">
                  <span className="font-semibold mr-2 text-sm uppercase tracking-wide opacity-70">Group:</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/30 border border-blue-400/30 text-sm">
                    {customer.group?.group_name || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
             <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-sm text-blue-300">Total Bills</p>
                <p className="text-2xl font-bold text-white">{bills.length}</p>
             </div>
             <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-sm text-blue-300">Last Reading</p>
                <p className="text-lg font-bold text-white">
                  {readings.length > 0 ? readings[0].current_reading : 'N/A'}
                </p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meter Readings History */}
        <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-300" />
              Reading History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-blue-200 uppercase">Month</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-blue-200 uppercase">Previous</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-blue-200 uppercase">Current</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-blue-200 uppercase">Usage</th>
                  {user?.role?.name === 'Admin' && (
                    <th className="px-4 py-2 text-left text-xs font-medium text-blue-200 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {readings.length === 0 ? (
                   <tr>
                    <td colSpan={user?.role?.name === 'Admin' ? 5 : 4} className="px-4 py-4 text-center text-blue-200 text-sm">No readings recorded</td>
                  </tr>
                ) : (
                  readings.map((reading, index) => (
                    <tr key={reading.id}>
                      <td className="px-4 py-2 text-sm text-white">{reading.reading_month}</td>
                      <td className="px-4 py-2 text-sm text-blue-100">{reading.previous_reading}</td>
                      <td className="px-4 py-2 text-sm text-blue-100">{reading.current_reading}</td>
                      <td className="px-4 py-2 text-sm text-blue-100">
                        {reading.units_consumed ?? (reading.current_reading - reading.previous_reading)}
                      </td>
                      {user?.role?.name === 'Admin' && (
                        <td className="px-4 py-2 text-sm text-blue-100">
                          {index === 0 && (
                            <button 
                              onClick={() => handleEditClick(reading)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit latest reading"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-300" />
              Billing History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-blue-200 uppercase">Month</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-blue-200 uppercase">Units</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-blue-200 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-blue-200 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {bills.length === 0 ? (
                   <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-blue-200 text-sm">No bills generated</td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id}>
                      <td className="px-4 py-2 text-sm text-white">{bill.bill_month}</td>
                      <td className="px-4 py-2 text-sm text-blue-100">{bill.units}</td>
                      <td className="px-4 py-2 text-sm text-blue-100 font-mono">${bill.total_amount}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          bill.status === 'PAID' ? 'bg-green-500/20 text-green-300' :
                          bill.status === 'PARTIAL' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {bill.status || 'UNPAID'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Reading Modal */}
      {isEditModalOpen && editingReading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1a2332] border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Edit Reading</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateReading} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Month</label>
                <input 
                  type="text" 
                  value={editingReading.reading_month} 
                  disabled 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white opacity-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Previous Reading</label>
                <input 
                  type="number" 
                  value={editingReading.previous_reading} 
                  disabled 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white opacity-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Current Reading</label>
                <input 
                  type="number" 
                  value={newReadingValue} 
                  onChange={(e) => setNewReadingValue(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  min={editingReading.previous_reading}
                />
              </div>

              {updateError && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                  {updateError}
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
