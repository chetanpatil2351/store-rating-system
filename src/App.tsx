import React, { useState, useEffect, useCallback } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';

import { User, Store, StoreRating } from './types';
import {
  getStoredCurrentUser,
  saveCurrentUser,
} from './storage';
import {
  fetchUsers,
  fetchStores,
  fetchRatings,
  submitRating as submitRatingApi,
  getAuthToken,
  setAuthToken,
  logoutUser,
} from './api';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthView } from './components/AuthView';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { ChangePasswordModal } from './components/ChangePasswordModal';

export default function App() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [ratings, setRatings] = useState<StoreRating[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] =
    useState(false);

  const refreshBackendData = useCallback(async (userOverride?: User | null) => {
  const activeUser =
    userOverride !== undefined
      ? userOverride
      : getStoredCurrentUser();

  const token = getAuthToken();

  if (!activeUser || !token) {
    setUsers([]);
    setStores([]);
    setRatings([]);
    return;
  }

  try {
    if (activeUser.role === 'admin') {
      const [usersRes, storesRes, ratingsRes] = await Promise.all([
        fetchUsers(),
        fetchStores(),
        fetchRatings(),
      ]);

      setUsers(usersRes.users || []);
      setStores(storesRes.stores || []);
      setRatings(ratingsRes.ratings || []);
    } else {
      const [storesRes, ratingsRes] = await Promise.all([
        fetchStores(),
        fetchRatings(),
      ]);

      setStores(storesRes.stores || []);
      setRatings(ratingsRes.ratings || []);
    }
  } catch (err: any) {
    console.error('Error fetching backend API data:', err);

    if (
      err?.message &&
      (err.message.includes('Unauthorized') ||
        err.message.includes('Forbidden'))
    ) {
      setAuthToken(null);
      saveCurrentUser(null);
      setCurrentUser(null);
    }
  }
}, []);

  const getHomeRouteForRole = (role?: string) => {
    if (role === 'admin') {
      return '/admin/dashboard';
    }

    if (role === 'store_owner') {
      return '/owner/dashboard';
    }

    if (role === 'user') {
      return '/user/stores';
    }

    return '/login';
  };

  useEffect(() => {
    const initializeApp = async () => {
      const loadedCurrent = getStoredCurrentUser();
      const token = getAuthToken();

      if (loadedCurrent && token) {
        setCurrentUser(loadedCurrent);
        await refreshBackendData(loadedCurrent);
      } else {
        setAuthToken(null);
        saveCurrentUser(null);
        setCurrentUser(null);
      }

      setIsLoadingInitial(false);
    };

    initializeApp();
  }, [refreshBackendData]);

  const handleLogin = async (user: User) => {
  saveCurrentUser(user);
  setCurrentUser(user);

  await refreshBackendData(user);

  navigate(getHomeRouteForRole(user.role));
};

  const handleRegister = (newUser: User) => {
    handleLogin(newUser);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    saveCurrentUser(null);
    setUsers([]);
    setStores([]);
    setRatings([]);
    navigate('/login');
  };

  const handleAddUser = (newUser: User) => {
    setUsers((prev) => [...prev, newUser]);
    refreshBackendData();
  };

  const handleAddStore = (newStore: Store) => {
    setStores((prev) => [...prev, newStore]);
    refreshBackendData();
  };

  const handleSubmitRating = async (
    storeId: string,
    ratingValue: number
  ) => {
    if (!currentUser) {
      return;
    }

    await submitRatingApi({
      storeId,
      rating: ratingValue,
    });

    await refreshBackendData();
  };

  const handlePasswordChanged = () => {
    refreshBackendData();
  };

  if (isLoadingInitial) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
        }}
      >
        <div
          className="text-muted"
          style={{ fontSize: '16px' }}
        >
          Loading Store Rating Portal...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        color: '#333',
      }}
    >
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenChangePassword={() =>
          setIsPasswordModalOpen(true)
        }
      />

      {!currentUser ? (
        <Routes>
          <Route
            path="/login"
            element={
              <AuthView
                onLoginSuccess={handleLogin}
                onRegisterSuccess={handleRegister}
                initialMode="login"
              />
            }
          />

          <Route
            path="/register"
            element={
              <AuthView
                onLoginSuccess={handleLogin}
                onRegisterSuccess={handleRegister}
                initialMode="register"
              />
            }
          />

          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      ) : (
        <div
          style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <Sidebar
            role={currentUser.role}
            onOpenChangePassword={() =>
              setIsPasswordModalOpen(true)
            }
          />

          <main
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Routes>
              {currentUser.role === 'admin' && (
                <>
                  <Route
                    path="/admin/dashboard"
                    element={
                      <AdminDashboard
                        currentTab="dashboard"
                        users={users}
                        stores={stores}
                        ratings={ratings}
                        onAddUser={handleAddUser}
                        onAddStore={handleAddStore}
                        onRefreshData={refreshBackendData}
                      />
                    }
                  />

                  <Route
                    path="/admin/stores"
                    element={
                      <AdminDashboard
                        currentTab="stores"
                        users={users}
                        stores={stores}
                        ratings={ratings}
                        onAddUser={handleAddUser}
                        onAddStore={handleAddStore}
                        onRefreshData={refreshBackendData}
                      />
                    }
                  />

                  <Route
                    path="/admin/users"
                    element={
                      <AdminDashboard
                        currentTab="users"
                        users={users}
                        stores={stores}
                        ratings={ratings}
                        onAddUser={handleAddUser}
                        onAddStore={handleAddStore}
                        onRefreshData={refreshBackendData}
                      />
                    }
                  />

                  <Route
                    path="/admin/ratings"
                    element={
                      <AdminDashboard
                        currentTab="ratings"
                        users={users}
                        stores={stores}
                        ratings={ratings}
                        onAddUser={handleAddUser}
                        onAddStore={handleAddStore}
                        onRefreshData={refreshBackendData}
                      />
                    }
                  />

                  <Route
                    path="/admin"
                    element={
                      <Navigate
                        to="/admin/dashboard"
                        replace
                      />
                    }
                  />
                </>
              )}

              {currentUser.role === 'user' && (
                <>
                  <Route
                    path="/user/stores"
                    element={
                      <UserDashboard
                        currentUser={currentUser}
                        stores={stores}
                        ratings={ratings}
                        onSubmitRating={handleSubmitRating}
                      />
                    }
                  />

                  <Route
                    path="/user"
                    element={
                      <Navigate
                        to="/user/stores"
                        replace
                      />
                    }
                  />
                </>
              )}

              {currentUser.role === 'store_owner' && (
                <>
                  <Route
                    path="/owner/dashboard"
                    element={
                      <OwnerDashboard
                        currentUser={currentUser}
                        stores={stores}
                        ratings={ratings}
                      />
                    }
                  />

                  <Route
                    path="/owner/ratings"
                    element={
                      <OwnerDashboard
                        currentUser={currentUser}
                        stores={stores}
                        ratings={ratings}
                      />
                    }
                  />

                  <Route
                    path="/owner"
                    element={
                      <Navigate
                        to="/owner/dashboard"
                        replace
                      />
                    }
                  />
                </>
              )}

              <Route
                path="/"
                element={
                  <Navigate
                    to={getHomeRouteForRole(currentUser.role)}
                    replace
                  />
                }
              />

              <Route
                path="/login"
                element={
                  <Navigate
                    to={getHomeRouteForRole(currentUser.role)}
                    replace
                  />
                }
              />

              <Route
                path="/register"
                element={
                  <Navigate
                    to={getHomeRouteForRole(currentUser.role)}
                    replace
                  />
                }
              />

              <Route
                path="*"
                element={
                  <Navigate
                    to={getHomeRouteForRole(currentUser.role)}
                    replace
                  />
                }
              />
            </Routes>
          </main>
        </div>
      )}

      {currentUser && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onPasswordChanged={handlePasswordChanged}
          currentEmail={currentUser.email}
        />
      )}
    </div>
  );
}