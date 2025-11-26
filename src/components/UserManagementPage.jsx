import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/services/api';

const Modal = React.memo(({ show, onClose, title, children }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" role="dialog" aria-modal="true">
      <div className="bg-[#1e1e1e] border border-[#333333] rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
          <Button
            onClick={onClose}
            className="h-8 w-8 p-0 bg-transparent hover:bg-[#333333] text-gray-400"
          >
            <i className="fas fa-times"></i>
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
});

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const itemsPerPage = 10;

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [editFormErrors, setEditFormErrors] = useState({ firstName: '', lastName: '', email: '', password: '' });

  const validateEmail = (value) => {
    if (!value) return 'Email is required';
    const hasDomain = value.endsWith('@agritech.gov');
    if (!hasDomain) return 'Email must end with @agritech.gov';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    const hasMinLength = value.length >= 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
    if (!hasMinLength) return 'Password must be at least 8 characters';
    if (!hasUpper) return 'Password must include at least 1 uppercase letter';
    if (!hasNumber) return 'Password must include at least 1 number';
    if (!hasSpecial) return 'Password must include at least 1 special character';
    return '';
  };

  const isFormValid = newUser.firstName.trim() && newUser.lastName.trim() &&
    validateEmail(newUser.email) === '' && validatePassword(newUser.password) === '';

  const isEditFormValid = editingUser && editingUser.firstName?.trim() && editingUser.lastName?.trim() &&
    validateEmail(editingUser.email || '') === '' &&
    // Password optional on edit; only validate if provided
    ((editingUser.newPassword || '').length === 0 || validatePassword(editingUser.newPassword) === '');

  // Fetch users from Supabase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, password, role, is_active, created_at, last_login')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedUsers = (data || []).map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email,
        password: user.password || '',
        role: user.role === 'admin' ? 'Admin' : 'MAO Staff',
        roleValue: user.role,
        status: user.is_active ? 'Active' : 'Inactive',
        avatar: `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase() || (user.email?.charAt(0) || 'U').toUpperCase(),
        createdAt: user.created_at,
        lastLogin: user.last_login
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users from Supabase:', error);
      setError('Failed to load users from Supabase.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(
        paginatedUsers
          .filter(user => user.role !== 'Admin')   // ← exclude admins
          .map(user => user.id)
      );
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleAddUser = async () => {
    try {
      setLoading(true);
      // Final guard validation before submit
      const emailError = validateEmail(newUser.email);
      const passwordError = validatePassword(newUser.password);
      const updatedErrors = {
        ...formErrors,
        email: emailError,
        password: passwordError,
        firstName: newUser.firstName.trim() ? '' : 'First name is required',
        lastName: newUser.lastName.trim() ? '' : 'Last name is required',
      };
      setFormErrors(updatedErrors);
      if (updatedErrors.firstName || updatedErrors.lastName || emailError || passwordError) {
        setLoading(false);
        return;
      }
      const { error } = await supabase
        .from('users')
        .insert([
          {
            first_name: newUser.firstName,
            last_name: newUser.lastName,
            email: newUser.email,
            password: newUser.password,
            role: newUser.role,
            is_active: true
          }
        ]);

      if (error) throw error;

      await fetchUsers();
      setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'user' });
      setFormErrors({ firstName: '', lastName: '', email: '', password: '' });
      setShowPassword(false);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding user to Supabase:', error);
      setError('Failed to add user.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      firstName: user.firstName || user.name.split(' ')[0] || '',
      lastName: user.lastName || user.name.split(' ').slice(1).join(' ') || '',
      newPassword: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      // Compute updates; keep current password if newPassword is blank
      const updates = {
        first_name: editingUser.firstName,
        last_name: editingUser.lastName,
        email: editingUser.email,
        role: editingUser.roleValue || (editingUser.role === 'Admin' ? 'admin' : 'user')
      };
      if ((editingUser.newPassword || '').length > 0) {
        updates.password = editingUser.newPassword;
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', editingUser.id);

      if (error) throw error;

      await fetchUsers();
      setShowEditModal(false);
      setEditingUser(null);
      setEditFormErrors({ firstName: '', lastName: '', email: '', password: '' });
      setShowEditPassword(false);
    } catch (error) {
      console.error('Error updating user in Supabase:', error);
      setError('Failed to update user.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('users')
        .delete()
        .in('id', selectedUsers);

      if (error) throw error;

      await fetchUsers();
    } catch (error) {
      console.error('Error deleting users from Supabase:', error);
      setError('Failed to delete selected users.');
    } finally {
      setSelectedUsers([]);
      setShowDeleteModal(false);
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const newIsActive = !(user?.status === 'Active');

      const { error } = await supabase
        .from('users')
        .update({ is_active: newIsActive })
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
    } catch (error) {
      console.error('Error toggling status in Supabase:', error);
      setError('Failed to toggle status.');
    }
  };

  

  if (loading && users.length === 0) {
    return (
    <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-300">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-[#1e1e1e] border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white text-xl">User Management</CardTitle>
            {error && (
              <p className="text-yellow-400 text-sm mt-1">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                {error}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={fetchUsers}
              className="bg-blue-600 hover:bg-blue-700 text-white !rounded-button"
              disabled={loading}
            >
              <i className="fas fa-sync-alt mr-2"></i> Refresh
            </Button>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white !rounded-button whitespace-nowrap"
            >
              <i className="fas fa-plus mr-2"></i> Add New User
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-8 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#252525] border border-[#333333] rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-[#252525] border border-[#333333] rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="MAO Staff">MAO Staff</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#252525] border border-[#333333] rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-4 p-3 bg-[#252525] rounded-md border border-[#333333]">
              <span className="text-gray-300">{selectedUsers.length} selected</span>
              <Button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white !rounded-button"
                size="sm"
              >
                <i className="fas fa-trash mr-2"></i> Delete Selected
              </Button>
              <Button
                onClick={() => {
                  selectedUsers.forEach(userId => handleToggleStatus(userId));
                  setSelectedUsers([]);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white !rounded-button"
                size="sm"
              >
                <i className="fas fa-toggle-on mr-2"></i> Toggle Status
              </Button>
            </div>
          )}

          {/* Note: Checkboxes and bulk actions are hidden for Admin users */}

          {/* Users Table */}
          <div className="rounded-md border border-[#333333] overflow-hidden">
            <Table>
              <TableHeader className="bg-[#252525]">
                <TableRow>
                  <TableHead className="text-gray-300 w-[50px]">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === paginatedUsers.filter(u => u.role !== 'Admin').length &&
                        paginatedUsers.filter(u => u.role !== 'Admin').length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                    />
                  </TableHead>
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Password</TableHead>
                  <TableHead className="text-gray-300">Role</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="border-t border-[#333333] hover:bg-[#252525]">
                    {/* Hide checkbox for Admin users */}
                    <TableCell className={`${user.role === 'Admin' ? 'invisible opacity-0' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                        disabled={user.role === 'Admin'}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className={`text-white ${user.role === 'Admin' ? 'bg-red-600' : 'bg-green-600'}`}>
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-200">{user.name}</div>
                          {user.lastLogin && (
                            <div className="text-xs text-gray-500">
                              Last login: {new Date(user.lastLogin).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400">{user.email}</TableCell>
                    <TableCell className="text-gray-400 font-mono">{user.password}</TableCell>
                    <TableCell>
                      <Badge className={user.role === 'Admin' ? 
                        'bg-red-900/50 text-red-300 hover:bg-red-900/70' : 
                        'bg-green-900/50 text-green-300 hover:bg-green-900/70'
                      }>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={user.status === 'Active' ? 
                        'bg-green-900/50 text-green-300 hover:bg-green-900/70' : 
                        'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'
                      }>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleEditUser(user)}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border-[#444444] bg-transparent hover:bg-[#333333] text-gray-300 !rounded-button"
                        >
                          <i className="fas fa-edit text-xs"></i>
                        </Button>
                        {/* Hide toggle status button for Admin users */}
                        <Button
                          onClick={() => handleToggleStatus(user.id)}
                          variant="outline"
                          size="sm"
                          className={`h-8 w-8 p-0 border-[#444444] bg-transparent hover:bg-[#333333] text-gray-300 !rounded-button ${user.role === 'Admin' ? 'invisible opacity-0' : ''}`}
                          disabled={user.role === 'Admin'}
                        >
                          <i className={`fas ${user.status === 'Active' ? 'fa-toggle-on' : 'fa-toggle-off'} text-xs`}></i>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-gray-400 text-sm">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} user records
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="border-[#444444] bg-transparent hover:bg-[#333333] text-gray-300 disabled:opacity-50 !rounded-button"
              >
                <i className="fas fa-chevron-left"></i>
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    className={page === currentPage ? 
                      "bg-green-600 hover:bg-green-700 text-white !rounded-button" :
                      "border-[#444444] bg-transparent hover:bg-[#333333] text-gray-300 !rounded-button"
                    }
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="border-[#444444] bg-transparent hover:bg-[#333333] text-gray-300 disabled:opacity-50 !rounded-button"
              >
                <i className="fas fa-chevron-right"></i>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title="Add New User">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">First Name</label>
            <input
              type="text"
              value={newUser.firstName}
              onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
              autoFocus
              className="w-full px-3 py-2 bg-[#252525] border border-[#333333] rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            {formErrors.firstName && (
              <p className="text-red-400 text-xs mt-1">{formErrors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Last Name</label>
            <input
              type="text"
              value={newUser.lastName}
              onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
              className="w-full px-3 py-2 bg-[#252525] border border-[#333333] rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            {formErrors.lastName && (
              <p className="text-red-400 text-xs mt-1">{formErrors.lastName}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => {
                const value = e.target.value;
                setNewUser({...newUser, email: value});
                setFormErrors({ ...formErrors, email: validateEmail(value) });
              }}
              className="w-full px-3 py-2 bg-[#252525] border border-[#333333] rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            {formErrors.email && (
              <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newUser.password}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewUser({...newUser, password: value});
                  setFormErrors({ ...formErrors, password: validatePassword(value) });
                }}
                className="w-full pr-10 px-3 py-2 bg-[#252525] border border-[#333333] rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {formErrors.password && (
              <p className="text-red-400 text-xs mt-1">{formErrors.password}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              className="w-full px-3 py-2 bg-[#252525] border border-[#333333] rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="user">MAO Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => setShowAddModal(false)}
              variant="outline"
              className="border-[#444444] bg-transparent hover:bg-[#333333] text-gray-300 !rounded-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              className="bg-green-600 hover:bg-green-700 text-white !rounded-button"
              disabled={loading || !isFormValid}
            >
              {loading ? 'Adding...' : 'Add User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User">
        {editingUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                value={editingUser.firstName}
                onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                className="w-full px-3 py-2 bg-[#252525] border border-[#333333] rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                value={editingUser.lastName}
                onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                className="w-full px-3 py-2 bg-[#252525] border border-[#333333] rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditingUser({ ...editingUser, email: value });
                  setEditFormErrors({ ...editFormErrors, email: validateEmail(value) });
                }}
                className="w-full px-3 py-2 bg-[#252525] border border-[#333333] rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              {editFormErrors.email && (
                <p className="text-red-400 text-xs mt-1">{editFormErrors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showEditPassword ? 'text' : 'password'}
                  value={editingUser.newPassword || ''}
                  placeholder="Leave blank to keep current password"
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditingUser({ ...editingUser, newPassword: value });
                    setEditFormErrors({ ...editFormErrors, password: value ? validatePassword(value) : '' });
                  }}
                  className="w-full pr-10 px-3 py-2 bg-[#252525] border border-[#333333] rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-200"
                  aria-label={showEditPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fas ${showEditPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {editFormErrors.password && (
                <p className="text-red-400 text-xs mt-1">{editFormErrors.password}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Role</label>
              <select
                value={editingUser.roleValue || (editingUser.role === 'Admin' ? 'admin' : 'user')}
                onChange={(e) => setEditingUser({
                  ...editingUser, 
                  roleValue: e.target.value,
                  role: e.target.value === 'admin' ? 'Admin' : 'MAO Staff'
                })}
                className="w-full px-3 py-2 bg-[#252525] border border-[#333333] rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="user">MAO Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="outline"
                className="border-[#444444] bg-transparent hover:bg-[#333333] text-gray-300 !rounded-button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                className="bg-green-600 hover:bg-green-700 text-white !rounded-button"
                disabled={loading || !isEditFormValid}
              >
                {loading ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Deletion">
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete {selectedUsers.length} selected user(s)? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="outline"
              className="border-[#444444] bg-transparent hover:bg-[#333333] text-gray-300 !rounded-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteSelected}
              className="bg-red-600 hover:bg-red-700 text-white !rounded-button"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;