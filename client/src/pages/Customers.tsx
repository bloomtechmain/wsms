import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Customer } from '../types';
import { Plus, Search } from 'lucide-react';
import AddCustomerModal from '../components/AddCustomerModal';

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  const handleCustomerAdded = () => {
    fetchCustomers();
  };

  const filteredCustomers = customers.filter(customer => 
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customer_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.meter_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-500 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-blue-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </button>
      </div>

      <AddCustomerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onCustomerAdded={handleCustomerAdded}
      />

      <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="relative rounded-xl shadow-sm max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-blue-300 group-focus-within:text-white transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 sm:text-sm border border-white/20 rounded-xl bg-white/5 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white/20 transition-all py-2"
              placeholder="Search by name, code or meter number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Meter #</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Group</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Address</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-blue-200">Loading...</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-blue-200">No customers found</td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{customer.customer_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">
                      <Link to={`/customers/${customer.id}`} className="hover:text-white hover:underline">
                        {customer.full_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{customer.meter_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{customer.group?.group_name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{customer.address || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-400 hover:text-blue-300">Edit</button>
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

export default Customers;
