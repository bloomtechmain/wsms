import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Shield, User as UserIcon } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  description: string;
}

const Settings = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  
  // New user form state
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    password: '',
    role_id: ''
  });

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const fetchUsersAndRoles = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/roles')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error('Error fetching settings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', {
        ...newUser,
        role_id: Number(newUser.role_id)
      });
      setShowAddUser(false);
      setNewUser({ full_name: '', email: '', password: '', role_id: '' });
      fetchUsersAndRoles();
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user');
    }
  };

  // Only Admin can access this page
  // The Sidebar hides the link, but we also protect the render
  const userRole = typeof currentUser?.role === 'string' ? currentUser.role : currentUser?.role.name;
  if (userRole !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-blue-200 mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <button
          onClick={() => setShowAddUser(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* User Management Section */}
      <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            User Management
          </h2>
          <p className="text-blue-200 text-sm mt-1">Manage system users and their roles.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-blue-200">Loading...</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        (user.role as any).name === 'Admin' ? 'bg-purple-500/20 text-purple-200' : 'bg-blue-500/20 text-blue-200'
                      }`}>
                        {(user.role as any).name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">Active</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUser.full_name}
                  onChange={e => setNewUser({...newUser, full_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Role</label>
                <select
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:text-black"
                  value={newUser.role_id}
                  onChange={e => setNewUser({...newUser, role_id: e.target.value})}
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
