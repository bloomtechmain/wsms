import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Plus, Save, Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { Customer, Bill } from '../types';
import BillModal from '../components/BillModal';

interface ReadingFormData {
  customer_id: number | '';
  reading_month: string;
  previous_reading: number;
  current_reading: string;
}

interface BillPreview {
  units: number;
  amount: number;
}

const Readings = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [formData, setFormData] = useState<ReadingFormData>({
    customer_id: '',
    reading_month: new Date().toISOString().slice(0, 7), // YYYY-MM
    previous_reading: 0,
    current_reading: ''
  });

  const [billPreview, setBillPreview] = useState<BillPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchLatestReading(selectedCustomer.id);
      setFormData(prev => ({ ...prev, customer_id: selectedCustomer.id }));
    }
  }, [selectedCustomer]);

  useEffect(() => {
    calculatePreview();
  }, [formData.current_reading, formData.previous_reading]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestReading = async (customerId: number) => {
    try {
      // Fetch readings for this customer
      const response = await api.get(`/readings?customer_id=${customerId}`);
      const readings = response.data;
      
      if (readings && readings.length > 0) {
        // Readings are ordered by date DESC in backend
        const latest = readings[0];
        setFormData(prev => ({
          ...prev,
          previous_reading: latest.current_reading
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          previous_reading: 0
        }));
      }
    } catch (error) {
      console.error('Error fetching latest reading:', error);
    }
  };

  const calculatePreview = async () => {
    if (!formData.current_reading) {
      setBillPreview(null);
      return;
    }

    const current = Number(formData.current_reading);
    const previous = Number(formData.previous_reading);
    const units = current - previous;

    if (units < 0) {
      setBillPreview(null);
      return;
    }

    // Rough frontend estimation or could call a "calculate-only" endpoint
    // For now, we'll just show units. 
    // Ideally, we should fetch tariff rates or have a calculate endpoint.
    // Let's implement a simple estimation based on common logic or just show units
    
    setBillPreview({
      units,
      amount: 0 // We will let the backend handle the exact amount or implement estimation if needed
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    setGeneratedBill(null);

    try {
      const response = await api.post('/readings', {
        ...formData,
        current_reading: Number(formData.current_reading)
      });

      setSuccess('Reading added and bill generated successfully!');
      
      // Handle the generated bill from response
      // Expecting response.data to be { reading: ..., bill: ... }
      if (response.data && response.data.bill) {
        setGeneratedBill(response.data.bill);
        setIsBillModalOpen(true);
      }
      
      // Reset form but keep customer selected for convenience? Or reset all?
      // Let's reset the current reading part
      setFormData(prev => ({
        ...prev,
        current_reading: '',
        previous_reading: Number(formData.current_reading) // Update previous to what we just submitted
      }));
      setBillPreview(null);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error adding reading');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customer_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.meter_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Meter Readings</h1>
      
      <BillModal 
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        bill={generatedBill}
        customer={selectedCustomer}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Selection Panel */}
        <div className={`lg:col-span-1 space-y-4 ${selectedCustomer ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl border border-white/20 p-4 h-[calc(100vh-12rem)] flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-4">Select Customer</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-300" />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {loading ? (
                <div className="text-center text-blue-200 py-4">Loading...</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center text-blue-200 py-4">No customers found</div>
              ) : (
                filteredCustomers.map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedCustomer?.id === customer.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'hover:bg-white/10 text-blue-100'
                    }`}
                  >
                    <div className="font-medium">{customer.full_name}</div>
                    <div className="text-xs opacity-80 flex justify-between mt-1">
                      <span>{customer.customer_code}</span>
                      <span>Meter: {customer.meter_number}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Reading Entry Form */}
        <div className={`lg:col-span-2 ${!selectedCustomer ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl border border-white/20 p-6">
            {!selectedCustomer ? (
              <div className="h-64 flex flex-col items-center justify-center text-blue-200">
                <Search className="h-12 w-12 mb-4 opacity-50" />
                <p>Select a customer to enter reading</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 gap-4">
                  <div className="flex items-start gap-3">
                    <button 
                      type="button" 
                      onClick={() => setSelectedCustomer(null)}
                      className="lg:hidden p-1 bg-white/10 rounded-lg text-blue-200 hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedCustomer.full_name}</h2>
                      <p className="text-blue-200 text-sm">
                        Code: {selectedCustomer.customer_code} | Meter: {selectedCustomer.meter_number}
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right pl-10 md:pl-0">
                     <p className="text-xs text-blue-300 uppercase tracking-wider">Group</p>
                     <p className="text-white font-medium">{selectedCustomer.group?.group_name || 'N/A'}</p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-4 rounded-xl flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/20 border border-green-500/50 text-green-100 p-4 rounded-xl flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {success}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">Billing Month</label>
                    <input
                      type="month"
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.reading_month}
                      onChange={(e) => setFormData({...formData, reading_month: e.target.value})}
                    />
                  </div>

                  <div>
                     {/* Placeholder for alignment */}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">Previous Reading</label>
                    <input
                      type="number"
                      readOnly
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white/50 cursor-not-allowed"
                      value={formData.previous_reading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">Current Reading</label>
                    <input
                      type="number"
                      required
                      min={formData.previous_reading}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.current_reading}
                      onChange={(e) => setFormData({...formData, current_reading: e.target.value})}
                    />
                  </div>
                </div>

                {/* Live Calculation Preview */}
                {billPreview && (
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4 mt-6">
                    <div className="flex items-center mb-2">
                      <Calculator className="h-5 w-5 text-blue-300 mr-2" />
                      <h3 className="text-blue-100 font-semibold">Bill Estimation</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-300">Units Consumed</p>
                        <p className="text-2xl font-bold text-white">{billPreview.units}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-300">Estimated Amount</p>
                         {/* We can fetch this from backend later, for now just show 'Calculated on Submit' or similar if we don't have rates locally */}
                        <p className="text-2xl font-bold text-white">Calculated on Submit</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {submitting ? 'Processing...' : 'Submit Reading & Generate Bill'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Readings;
