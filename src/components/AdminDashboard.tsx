import React, { useState, useMemo } from 'react';
import { User, Store, StoreRating, UserRole } from '../types';
import { validateUserForm, validateStoreForm } from '../validation';
import { createUser, createStore } from '../api';
import { UserDetailsModal } from './UserDetailsModal';
import {
  Users,
  Store as StoreIcon,
  Star,
  PlusCircle,
  Filter,
  Eye,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';

interface AdminDashboardProps {
  currentTab: string;
  users: User[];
  stores: Store[];
  ratings: StoreRating[];
  onAddUser: (user: User) => void;
  onAddStore: (store: Store) => void;
  onRefreshData?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentTab,
  users,
  stores,
  ratings,
  onAddUser,
  onAddStore,
  onRefreshData,
}) => {
  const [selectedUserForModal, setSelectedUserForModal] = useState<User | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Filters
  const [searchQuery_name, setSearchQuery_name] = useState('');
  const [searchQuery_email, setSearchQuery_email] = useState('');
  const [searchQuery_address, setSearchQuery_address] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Store Sorting
  const [storeSortField, setStoreSortField] = useState<'name' | 'email' | 'address' | 'rating'>('name');
  const [storeSortAsc, setStoreSortAsc] = useState(true);

  // User Sorting
  const [userSortField, setUserSortField] = useState<'name' | 'email' | 'address' | 'role'>('name');
  const [userSortAsc, setUserSortAsc] = useState(true);

  // Add User Form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [userFormErrors, setUserFormErrors] = useState<Record<string, string>>({});
  const [userFormSuccess, setUserFormSuccess] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Add Store Form state
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreEmail, setNewStoreEmail] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStoreOwnerId, setNewStoreOwnerId] = useState('');
  const [storeFormErrors, setStoreFormErrors] = useState<Record<string, string>>({});
  const [storeFormSuccess, setStoreFormSuccess] = useState('');
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  const totalUsersCount = users.length;
  const totalStoresCount = stores.length;
  const totalRatingsCount = ratings.length;

  const handleCreateUser = async (e: React.FormEvent) => {
  e.preventDefault();

  setUserFormErrors({});
  setUserFormSuccess('');

  const errors = validateUserForm({
    name: newUserName,
    email: newUserEmail,
    address: newUserAddress,
    password: newUserPassword,
  });

  if (Object.keys(errors).length > 0) {
    setUserFormErrors(errors as Record<string, string>);
    return;
  }

  setIsCreatingUser(true);

  try {
    const result = await createUser({
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      password: newUserPassword,
      address: newUserAddress.trim(),
      role: newUserRole,
    });

    if (result.success && result.user) {
      onAddUser(result.user);

      setUserFormSuccess(
        `User "${result.user.name.substring(0, 20)}..." created!`
      );

      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserAddress('');
      setNewUserRole('user');

      if (onRefreshData) {
        onRefreshData();
      }

      setTimeout(() => setUserFormSuccess(''), 3000);
    }
  } catch (err: unknown) {
    setUserFormErrors({
      general:
        err instanceof Error
          ? err.message
          : 'Failed to create user',
    });
  } finally {
    setIsCreatingUser(false);
  }
};

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoreFormErrors({});
    setStoreFormSuccess('');

    const errors = validateStoreForm({
      name: newStoreName,
      email: newStoreEmail,
      address: newStoreAddress,
    });

    if (Object.keys(errors).length > 0) {
      setStoreFormErrors(errors as Record<string, string>);
      return;
    }

    setIsCreatingStore(true);
    try {
      const result = await createStore({
        name: newStoreName.trim(),
        email: newStoreEmail.trim().toLowerCase(),
        address: newStoreAddress.trim(),
        ownerId: newStoreOwnerId || undefined,
      });

      if (result.success && result.store) {
        onAddStore(result.store);
        setStoreFormSuccess(`Store "${result.store.name.substring(0, 20)}..." created!`);
        setNewStoreName('');
        setNewStoreEmail('');
        setNewStoreAddress('');
        setNewStoreOwnerId('');
        if (onRefreshData) onRefreshData();
        setTimeout(() => setStoreFormSuccess(''), 3000);
      }
    } catch (err: unknown) {
  setStoreFormErrors({
    general:
      err instanceof Error
        ? err.message
        : 'Failed to create store',
  });
} finally {
  setIsCreatingStore(false);
}
};

  const processedStores = useMemo(() => {
    return stores
      .filter((s) => {
        const matchesName = s.name.toLowerCase().includes(searchQuery_name.toLowerCase());
        const matchesEmail = s.email.toLowerCase().includes(searchQuery_email.toLowerCase());
        const matchesAddress = s.address.toLowerCase().includes(searchQuery_address.toLowerCase());
        return matchesName && matchesEmail && matchesAddress;
      })
      .map((s) => {
        const storeRatings = ratings.filter((r) => r.storeId === s.id);
        const count = storeRatings.length;
        const sum = storeRatings.reduce((acc, curr) => acc + curr.rating, 0);
        const average = count > 0 ? Number((sum / count).toFixed(1)) : 0;
        return {
          ...s,
          averageRating: average,
          ratingCount: count,
        };
      })
      .sort((a, b) => {
        let comparison = 0;
        if (storeSortField === 'name') comparison = a.name.localeCompare(b.name);
        else if (storeSortField === 'email') comparison = a.email.localeCompare(b.email);
        else if (storeSortField === 'address') comparison = a.address.localeCompare(b.address);
        else if (storeSortField === 'rating') comparison = a.averageRating - b.averageRating;
        return storeSortAsc ? comparison : -comparison;
      });
  }, [stores, ratings, searchQuery_name, searchQuery_email, searchQuery_address, storeSortField, storeSortAsc]);

  const processedUsers = useMemo(() => {
    return users
      .filter((u) => {
        const matchesName = u.name.toLowerCase().includes(searchQuery_name.toLowerCase());
        const matchesEmail = u.email.toLowerCase().includes(searchQuery_email.toLowerCase());
        const matchesAddress = u.address.toLowerCase().includes(searchQuery_address.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesName && matchesEmail && matchesAddress && matchesRole;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (userSortField === 'name') comparison = a.name.localeCompare(b.name);
        else if (userSortField === 'email') comparison = a.email.localeCompare(b.email);
        else if (userSortField === 'address') comparison = a.address.localeCompare(b.address);
        else if (userSortField === 'role') comparison = a.role.localeCompare(b.role);
        return userSortAsc ? comparison : -comparison;
      });
  }, [users, searchQuery_name, searchQuery_email, searchQuery_address, roleFilter, userSortField, userSortAsc]);

  const toggleStoreSort = (field: 'name' | 'email' | 'address' | 'rating') => {
    if (storeSortField === field) setStoreSortAsc(!storeSortAsc);
    else {
      setStoreSortField(field);
      setStoreSortAsc(true);
    }
  };

  const toggleUserSort = (field: 'name' | 'email' | 'address' | 'role') => {
    if (userSortField === field) setUserSortAsc(!userSortAsc);
    else {
      setUserSortField(field);
      setUserSortAsc(true);
    }
  };

  const openUserDetails = (user: User) => {
    setSelectedUserForModal(user);
    setIsDetailsModalOpen(true);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 15px', backgroundColor: '#f5f5f5' }}>
      <div className="container-fluid">
        {/* Metric Summary Cards using Bootstrap 3.4 Panels */}
        <div className="row" style={{ marginBottom: '15px' }}>
          <div className="col-sm-4">
            <div className="panel panel-info text-center" style={{ marginBottom: '10px' }}>
              <div className="panel-heading" style={{ padding: '8px' }}>
                <h4 className="panel-title" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  <Users style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />
                  TOTAL REGISTERED USERS
                </h4>
              </div>
              <div className="panel-body" style={{ padding: '15px 10px' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#31708f' }}>{totalUsersCount}</div>
                <div className="text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                  Admins: {users.filter((u) => u.role === 'admin').length} | Owners: {users.filter((u) => u.role === 'store_owner').length} | Users: {users.filter((u) => u.role === 'user').length}
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-4">
            <div className="panel panel-success text-center" style={{ marginBottom: '10px' }}>
              <div className="panel-heading" style={{ padding: '8px' }}>
                <h4 className="panel-title" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  <StoreIcon style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />
                  TOTAL STORES
                </h4>
              </div>
              <div className="panel-body" style={{ padding: '15px 10px' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3c763d' }}>{totalStoresCount}</div>

              </div>
            </div>
          </div>

          <div className="col-sm-4">
            <div className="panel panel-warning text-center" style={{ marginBottom: '10px' }}>
              <div className="panel-heading" style={{ padding: '8px' }}>
                <h4 className="panel-title" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  <Star style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />
                  TOTAL SUBMITTED RATINGS
                </h4>
              </div>
              <div className="panel-body" style={{ padding: '15px 10px' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8a6d3b' }}>{totalRatingsCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Filter Form Well */}
        <div className="well well-sm" style={{ backgroundColor: '#ffffff', marginBottom: '20px' }}>
          <div className="row">
            <div className="col-sm-12" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#555' }}>
                <Filter style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px', color: '#337ab7' }} />
                Filters:
              </span>

              <input
                type="text"
                value={searchQuery_name}
                onChange={(e) => setSearchQuery_name(e.target.value)}
                placeholder="Filter by Name..."
                className="form-control input-sm"
                style={{ width: '160px', display: 'inline-block' }}
              />

              <input
                type="text"
                value={searchQuery_email}
                onChange={(e) => setSearchQuery_email(e.target.value)}
                placeholder="Filter by Email..."
                className="form-control input-sm"
                style={{ width: '160px', display: 'inline-block' }}
              />

              <input
                type="text"
                value={searchQuery_address}
                onChange={(e) => setSearchQuery_address(e.target.value)}
                placeholder="Filter by Address..."
                className="form-control input-sm"
                style={{ width: '160px', display: 'inline-block' }}
              />

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-control input-sm"
                style={{ width: '150px', display: 'inline-block' }}
              >
                <option value="all">All User Roles</option>
                <option value="admin">Admin</option>
                <option value="store_owner">Store Owner</option>
                <option value="user">Normal User</option>
              </select>

              {(searchQuery_name || searchQuery_email || searchQuery_address || roleFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery_name('');
                    setSearchQuery_email('');
                    setSearchQuery_address('');
                    setRoleFilter('all');
                  }}
                  className="btn btn-link btn-xs text-danger"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stores Section */}
        {(currentTab === 'dashboard' || currentTab === 'stores') && (
          <div className="row" style={{ marginBottom: '20px' }}>
            {/* Add Store Form Panel */}
            <div className="col-md-4">
              <div className="panel panel-default">
                <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="panel-title" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                    <PlusCircle style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px', color: '#5cb85c' }} />
                    Add New Store
                  </h3>
                  <span className="label label-success"></span>
                </div>
                <div className="panel-body" style={{ padding: '15px' }}>
                  <form onSubmit={handleCreateStore}>
                    {storeFormSuccess && (
                      <div className="alert alert-success" style={{ padding: '8px', fontSize: '12px' }}>
                        <CheckCircle style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />
                        {storeFormSuccess}
                      </div>
                    )}

                    {storeFormErrors.general && (
                      <div className="alert alert-danger" style={{ padding: '8px', fontSize: '12px' }}>
                        <AlertCircle style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />
                        {storeFormErrors.general}
                      </div>
                    )}

                    <div className={`form-group ${storeFormErrors.name ? 'has-error' : ''}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label className="control-label" style={{ fontSize: '12px' }}>
                          Store Name <span className="text-danger">*</span>
                        </label>
                        <span className="text-muted" style={{ fontSize: '10px' }}>
                          {newStoreName.length}/60 chars (Min 20)
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={newStoreName}
                        onChange={(e) => setNewStoreName(e.target.value)}
                        placeholder="e.g. Downtown Roasters Coffee LLC"
                        className="form-control input-sm"
                      />
                      {storeFormErrors.name && <span className="help-block" style={{ fontSize: '11px', margin: '2px 0 0 0' }}>{storeFormErrors.name}</span>}
                    </div>

                    <div className={`form-group ${storeFormErrors.email ? 'has-error' : ''}`}>
                      <label className="control-label" style={{ fontSize: '12px' }}>
                        Store Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={newStoreEmail}
                        onChange={(e) => setNewStoreEmail(e.target.value)}
                        placeholder="contact@storedomain.com"
                        className="form-control input-sm"
                      />
                      {storeFormErrors.email && <span className="help-block" style={{ fontSize: '11px', margin: '2px 0 0 0' }}>{storeFormErrors.email}</span>}
                    </div>

                    <div className={`form-group ${storeFormErrors.address ? 'has-error' : ''}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label className="control-label" style={{ fontSize: '12px' }}>
                          Store Address <span className="text-danger">*</span>
                        </label>
                        <span className="text-muted" style={{ fontSize: '10px' }}>
                          {newStoreAddress.length}/400 max
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        required
                        value={newStoreAddress}
                        onChange={(e) => setNewStoreAddress(e.target.value)}
                        placeholder="Street location, market area, sector..."
                        className="form-control input-sm"
                      />
                      {storeFormErrors.address && <span className="help-block" style={{ fontSize: '11px', margin: '2px 0 0 0' }}>{storeFormErrors.address}</span>}
                    </div>

                    <div className="form-group">
                      <label className="control-label" style={{ fontSize: '12px' }}>
                        Assign Store Owner (Optional)
                      </label>
                      <select
                        value={newStoreOwnerId}
                        onChange={(e) => setNewStoreOwnerId(e.target.value)}
                        className="form-control input-sm"
                      >
                        <option value="">-- No Owner Assigned Yet --</option>
                        {users
                          .filter((u) => u.role === 'store_owner')
                          .map((owner) => (
                            <option key={owner.id} value={owner.id}>
                              {owner.name} ({owner.email})
                            </option>
                          ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isCreatingStore}
                      className="btn btn-success btn-sm btn-block"
                      style={{ fontWeight: 'bold' }}
                    >
                      {isCreatingStore ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : 'ADD STORE VIA API'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Stores Table Panel */}
            <div className="col-md-8">
              <div className="panel panel-default">
                <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="panel-title" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                    <StoreIcon style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px', color: '#337ab7' }} />
                    Store Directory ({processedStores.length} Stores)
                  </h3>
                  <span className="text-muted" style={{ fontSize: '11px' }}>Click headers to sort</span>
                </div>
                <div className="table-responsive" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  <table className="table table-striped table-bordered table-hover table-condensed" style={{ marginBottom: 0, fontSize: '12px' }}>
                    <thead>
                      <tr className="active">
                        <th style={{ width: '35px' }}>#</th>
                        <th onClick={() => toggleStoreSort('name')} style={{ cursor: 'pointer' }}>
                          Name <ArrowUpDown style={{ width: '11px', height: '11px', display: 'inline' }} />
                        </th>
                        <th onClick={() => toggleStoreSort('email')} style={{ cursor: 'pointer' }}>
                          Email <ArrowUpDown style={{ width: '11px', height: '11px', display: 'inline' }} />
                        </th>
                        <th onClick={() => toggleStoreSort('address')} style={{ cursor: 'pointer' }}>
                          Address <ArrowUpDown style={{ width: '11px', height: '11px', display: 'inline' }} />
                        </th>
                        <th onClick={() => toggleStoreSort('rating')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                          Rating <ArrowUpDown style={{ width: '11px', height: '11px', display: 'inline' }} />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedStores.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-muted" style={{ padding: '20px' }}>
                            No stores match your current filters.
                          </td>
                        </tr>
                      ) : (
                        processedStores.map((store, idx) => (
                          <tr key={store.id}>
                            <td className="text-muted">{idx + 1}</td>
                            <td><strong>{store.name}</strong></td>
                            <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{store.email}</td>
                            <td style={{ maxWidth: '200px' }} title={store.address}>{store.address}</td>
                            <td className="text-center">
                              {store.ratingCount > 0 ? (
                                <span className="label label-warning" style={{ fontSize: '11px' }}>
                                  ★ {store.averageRating} / 5 ({store.ratingCount})
                                </span>
                              ) : (
                                <span className="text-muted italic" style={{ fontSize: '11px' }}>No ratings</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Section */}
        {(currentTab === 'dashboard' || currentTab === 'users') && (
          <div className="row">
            {/* Add User Form Panel */}
            <div className="col-md-4">
              <div className="panel panel-default">
                <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="panel-title" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                    <PlusCircle style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px', color: '#337ab7' }} />
                    Add New User / Admin
                  </h3>
                  <span className="label label-primary"></span>
                </div>
                <div className="panel-body" style={{ padding: '15px' }}>
                  <form onSubmit={handleCreateUser}>
                    {userFormSuccess && (
                      <div className="alert alert-success" style={{ padding: '8px', fontSize: '12px' }}>
                        <CheckCircle style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />
                        {userFormSuccess}
                      </div>
                    )}

                    {userFormErrors.general && (
                      <div className="alert alert-danger" style={{ padding: '8px', fontSize: '12px' }}>
                        <AlertCircle style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />
                        {userFormErrors.general}
                      </div>
                    )}

                    <div className={`form-group ${userFormErrors.name ? 'has-error' : ''}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label className="control-label" style={{ fontSize: '12px' }}>
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <span className="text-muted" style={{ fontSize: '10px' }}>
                          {newUserName.length}/60 chars (Min 20)
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Enter full legal name..."
                        className="form-control input-sm"
                      />
                      {userFormErrors.name && <span className="help-block" style={{ fontSize: '11px', margin: '2px 0 0 0' }}>{userFormErrors.name}</span>}
                    </div>

                    <div className={`form-group ${userFormErrors.email ? 'has-error' : ''}`}>
                      <label className="control-label" style={{ fontSize: '12px' }}>
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="form-control input-sm"
                      />
                      {userFormErrors.email && <span className="help-block" style={{ fontSize: '11px', margin: '2px 0 0 0' }}>{userFormErrors.email}</span>}
                    </div>

                    <div className={`form-group ${userFormErrors.password ? 'has-error' : ''}`}>
                      <label className="control-label" style={{ fontSize: '12px' }}>
                        Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="8-16 chars, 1 uppercase, 1 special char"
                        className="form-control input-sm"
                      />
                      {userFormErrors.password && <span className="help-block" style={{ fontSize: '11px', margin: '2px 0 0 0' }}>{userFormErrors.password}</span>}
                    </div>

                    <div className={`form-group ${userFormErrors.address ? 'has-error' : ''}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label className="control-label" style={{ fontSize: '12px' }}>
                          Address <span className="text-danger">*</span>
                        </label>
                        <span className="text-muted" style={{ fontSize: '10px' }}>
                          {newUserAddress.length}/400 max
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        required
                        value={newUserAddress}
                        onChange={(e) => setNewUserAddress(e.target.value)}
                        placeholder="Physical address..."
                        className="form-control input-sm"
                      />
                      {userFormErrors.address && <span className="help-block" style={{ fontSize: '11px', margin: '2px 0 0 0' }}>{userFormErrors.address}</span>}
                    </div>

                    <div className="form-group">
                      <label className="control-label" style={{ fontSize: '12px' }}>Role</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                        className="form-control input-sm"
                      >
                        <option value="user">User (Normal)</option>
                        <option value="admin">Admin</option>
                        <option value="store_owner">Store Owner</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isCreatingUser}
                      className="btn btn-primary btn-sm btn-block"
                      style={{ fontWeight: 'bold' }}
                    >
                      {isCreatingUser ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : 'SAVE USER VIA API'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Users Table Panel */}
            <div className="col-md-8">
              <div className="panel panel-default">
                <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="panel-title" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                    <Users style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px', color: '#337ab7' }} />
                    User Directory ({processedUsers.length} Accounts)
                  </h3>
                  <span className="text-muted" style={{ fontSize: '11px' }}>Click Details to inspect</span>
                </div>
                <div className="table-responsive" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  <table className="table table-striped table-bordered table-hover table-condensed" style={{ marginBottom: 0, fontSize: '12px' }}>
                    <thead>
                      <tr className="active">
                        <th style={{ width: '35px' }}>#</th>
                        <th onClick={() => toggleUserSort('name')} style={{ cursor: 'pointer' }}>
                          Name <ArrowUpDown style={{ width: '11px', height: '11px', display: 'inline' }} />
                        </th>
                        <th onClick={() => toggleUserSort('email')} style={{ cursor: 'pointer' }}>
                          Email <ArrowUpDown style={{ width: '11px', height: '11px', display: 'inline' }} />
                        </th>
                        <th onClick={() => toggleUserSort('address')} style={{ cursor: 'pointer' }}>
                          Address <ArrowUpDown style={{ width: '11px', height: '11px', display: 'inline' }} />
                        </th>
                        <th onClick={() => toggleUserSort('role')} style={{ cursor: 'pointer' }}>
                          Role <ArrowUpDown style={{ width: '11px', height: '11px', display: 'inline' }} />
                        </th>
                        <th style={{ textAlign: 'center', width: '70px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted" style={{ padding: '20px' }}>
                            No users match the search filters.
                          </td>
                        </tr>
                      ) : (
                        processedUsers.map((user, idx) => (
                          <tr key={user.id}>
                            <td className="text-muted">{idx + 1}</td>
                            <td><strong>{user.name}</strong></td>
                            <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{user.email}</td>
                            <td style={{ maxWidth: '180px' }} title={user.address}>{user.address}</td>
                            <td>
                              <span
                                className={`label ${
                                  user.role === 'admin'
                                    ? 'label-danger'
                                    : user.role === 'store_owner'
                                    ? 'label-warning'
                                    : 'label-info'
                                }`}
                                style={{ textTransform: 'uppercase' }}
                              >
                                {user.role === 'admin' ? 'Admin' : user.role === 'store_owner' ? 'Owner' : 'User'}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                type="button"
                                onClick={() => openUserDetails(user)}
                                className="btn btn-default btn-xs"
                                title="View User Profile Details"
                              >
                                <Eye style={{ width: '12px', height: '12px', display: 'inline', marginRight: '2px' }} />
                                Details
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
          </div>
        )}

        {/* Ratings & Reports Tab */}
        {currentTab === 'ratings' && (
          <div className="panel panel-default">
            <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="panel-title" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                <FileSpreadsheet style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px', color: '#f0ad4e' }} />
                All Rating Submissions ({ratings.length} Records)
              </h3>
              <span className="label label-info">Live Database: GET /api/ratings</span>
            </div>
            <div className="table-responsive" style={{ maxHeight: '480px', overflowY: 'auto' }}>
              <table className="table table-striped table-bordered table-hover" style={{ marginBottom: 0, fontSize: '12px' }}>
                <thead>
                  <tr className="active">
                    <th style={{ width: '35px' }}>#</th>
                    <th>Target Store</th>
                    <th>User Name</th>
                    <th>User Email</th>
                    <th style={{ textAlign: 'center' }}>Rating</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ratings.map((r, i) => {
                    const targetStore = stores.find((s) => s.id === r.storeId);
                    return (
                      <tr key={r.id}>
                        <td className="text-muted">{i + 1}</td>
                        <td><strong>{targetStore ? targetStore.name : r.storeId}</strong></td>
                        <td>{r.userName}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{r.userEmail}</td>
                        <td className="text-center">
                          <span className="label label-warning">★ {r.rating} / 5</span>
                        </td>
                        <td className="text-muted" style={{ fontSize: '11px' }}>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        user={selectedUserForModal}
        stores={stores}
        ratings={ratings}
      />
    </div>
  );
};
