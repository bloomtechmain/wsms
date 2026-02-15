import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CustomerGroup } from '../types';
import { X } from 'lucide-react';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerAdded: () => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onCustomerAdded }) => {
 const [formData, setFormData] = useState({
    customer_code: '',
    account_number: '',
    full_name: '',
    address: '',
    phone: '',
    meter_number: '',
    group_id: '',
    is_new_group: false,
    new_group_code: '',
    new_group_name: '',
    new_group_description: ''
  });
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data);
    } catch (err) {
      console.error('Failed to fetch groups');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGroupModeToggle = () => {
    setFormData(prev => ({
      ...prev,
      is_new_group: !prev.is_new_group,
      group_id: '',
      new_group_code: '',
      new_group_name: '',
      new_group_description: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Submitting customer data:', formData); // Log form data

      const payload: any = {
        customer_code: formData.customer_code,
        account_number: formData.account_number,
        full_name: formData.full_name,
        address: formData.address,
        phone: formData.phone,
        meter_number: formData.meter_number,
        group_id: formData.group_id ? Number(formData.group_id) : null
      };

      if (formData.is_new_group) {
        payload.new_group = {
          group_code: formData.new_group_code,
          group_name: formData.new_group_name,
          description: formData.new_group_description
        };
        payload.group_id = null;
      }

      console.log('Sending payload:', payload); // Log payload

      const response = await api.post('/customers', payload);
      console.log('Customer added successfully:', response.data); // Log success

      onCustomerAdded();
      onClose();
      // Reset form
      setFormData({
        customer_code: '',
        account_number: '',
        full_name: '',
        address: '',
        phone: '',
        meter_number: '',
        group_id: '',
        is_new_group: false,
        new_group_code: '',
        new_group_name: '',
        new_group_description: ''
      });
    } catch (err: any) {
      console.error('Add customer error:', err);
      console.error('Error details:', err.response?.data); // Log detailed error
      setError(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-blue-900/90 backdrop-blur-xl border border-white/20 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl leading-6 font-bold text-white">Add New Customer</h3>
              <button onClick={onClose} className="text-blue-300 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 text-sm text-red-200 bg-red-900/50 border border-red-500/50 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-200">Customer Code</label>
                <input
                  type="text"
                  name="customer_code"
                  required
                  className="mt-1 block w-full border border-white/20 rounded-xl bg-white/10 text-white placeholder-blue-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                  value={formData.customer_code}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200">Account Number</label>
                <input
                  type="text"
                  name="account_number"
                  className="mt-1 block w-full border border-white/20 rounded-xl bg-white/10 text-white placeholder-blue-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                  value={formData.account_number}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  required
                  className="mt-1 block w-full border border-white/20 rounded-xl bg-white/10 text-white placeholder-blue-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200">Phone</label>
                <input
                  type="text"
                  name="phone"
                  className="mt-1 block w-full border border-white/20 rounded-xl bg-white/10 text-white placeholder-blue-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200">Address</label>
                <textarea
                  name="address"
                  rows={3}
                  className="mt-1 block w-full border border-white/20 rounded-xl bg-white/10 text-white placeholder-blue-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200">Meter Number</label>
                <input
                  type="text"
                  name="meter_number"
                  required
                  className="mt-1 block w-full border border-white/20 rounded-xl bg-white/10 text-white placeholder-blue-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                  value={formData.meter_number}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Group</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2">
                  <div className="flex-1">
                    {!formData.is_new_group ? (
                      <select
                        name="group_id"
                        className="block w-full border border-white/20 rounded-xl bg-white/10 text-white shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all [&>option]:text-gray-900"
                        value={formData.group_id}
                        onChange={handleChange}
                      >
                        <option value="">Select a group</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.group_name} ({group.group_code})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10 animate-fade-in-down">
                        <h4 className="text-sm font-bold text-white mb-2">New Group Details</h4>
                        <input
                          type="text"
                          name="new_group_name"
                          placeholder="Group Name"
                          required={formData.is_new_group}
                          className="block w-full border border-white/20 rounded-lg bg-white/5 text-white placeholder-blue-300/50 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                          value={formData.new_group_name}
                          onChange={handleChange}
                        />
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            name="new_group_code"
                            placeholder="Code"
                            required={formData.is_new_group}
                            className="block w-1/3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-blue-300/50 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                            value={formData.new_group_code}
                            onChange={handleChange}
                          />
                          <input
                            type="text"
                            name="new_group_description"
                            placeholder="Description (Optional)"
                            className="block w-2/3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-blue-300/50 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                            value={formData.new_group_description}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleGroupModeToggle}
                    className="flex-shrink-0 inline-flex items-center px-3 py-2 border border-white/20 shadow-sm text-sm leading-4 font-medium rounded-xl text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-blue-500 transition-all"
                    title={formData.is_new_group ? "Select existing group" : "Create new group"}
                  >
                    {formData.is_new_group ? 'Cancel' : 'New Group'}
                  </button>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-bold text-white bg-white/10 border border-white/20 rounded-xl shadow-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-blue-500 transition-all"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center px-4 py-2 text-sm font-bold text-white bg-blue-600 border border-transparent rounded-xl shadow-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-blue-500 disabled:opacity-50 transition-all hover:scale-105"
                >
                  {loading ? 'Adding...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerModal;
