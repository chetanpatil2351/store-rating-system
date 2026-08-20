import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ValidationErrors } from '../types';
import { validateUserForm } from '../validation';
import { loginUser, registerUser } from '../api';
import {
  Lock,
  Mail,
  User as UserIcon,
  MapPin,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  Store,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
  onRegisterSuccess: (newUser: User) => void;
  initialMode?: 'login' | 'register';
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onRegisterSuccess,
  initialMode,
}) => {
  const location = useLocation();

  const isRegisterRoute =
    initialMode === 'register' ||
    location.pathname === '/register';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    isRegisterRoute ? 'register' : 'login'
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (
      location.pathname === '/register' ||
      initialMode === 'register'
    ) {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [location.pathname, initialMode]);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regErrors, setRegErrors] =
    useState<ValidationErrors>({});
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  const handleLoginSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError(
        'Please enter both email address and password!'
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(
        loginEmail.trim(),
        loginPassword
      );

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials.';

      setLoginError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setRegErrors({});
    setRegSuccessMessage('');

    const errors = validateUserForm({
      name: regName,
      email: regEmail,
      address: regAddress,
      password: regPassword,
    });

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        address: regAddress.trim(),
      });

      if (result.success && result.user) {
        setRegSuccessMessage(
          'Account registered successfully! Logging in...'
        );

        setTimeout(() => {
          onRegisterSuccess(result.user);
        }, 1000);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Registration failed';

      setRegErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '30px 15px',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div
        className="container"
        style={{ maxWidth: '960px' }}
      >
        <div className="row">
          <div className="col-md-5">
            <div
              className="panel panel-primary"
              style={{
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div className="panel-heading">
                <h3
                  className="panel-title"
                  style={{ fontWeight: 'bold' }}
                >
                  <Store
                    style={{
                      width: '16px',
                      height: '16px',
                      display: 'inline',
                      marginRight: '6px',
                    }}
                  />
                  Store Rating System
                </h3>
              </div>

              <div
                className="panel-body"
                style={{ fontSize: '13px' }}
              >
                <p
                  className="lead"
                  style={{
                    fontSize: '14px',
                    marginBottom: '15px',
                  }}
                >
                  Multi-Role Store Rating & Review Platform
                  built with Express.js REST APIs and React
                  Router.
                </p>

                <div
                  className="well well-sm"
                  style={{
                    backgroundColor: '#ffffff',
                    marginBottom: 0,
                  }}
                >
                  <ul
                    className="list-unstyled"
                    style={{
                      marginBottom: 0,
                      lineHeight: '24px',
                    }}
                  >
                    <li>
                      <Shield
                        style={{
                          width: '14px',
                          height: '14px',
                          display: 'inline',
                          color: '#337ab7',
                          marginRight: '5px',
                        }}
                      />
                      <strong>Role-Based Access:</strong>{' '}
                      Admin, Store Owner, and Normal User.
                    </li>

                    <li>
                      <Store
                        style={{
                          width: '14px',
                          height: '14px',
                          display: 'inline',
                          color: '#5cb85c',
                          marginRight: '5px',
                        }}
                      />
                      <strong>Store Reviews:</strong> 1 to 5
                      star rating scale.
                    </li>

                    <li>
                      <Sparkles
                        style={{
                          width: '14px',
                          height: '14px',
                          display: 'inline',
                          color: '#f0ad4e',
                          marginRight: '5px',
                        }}
                      />
                      <strong>Express + Postgres:</strong>{' '}
                      Secure RESTful API backend.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-7">
            <div
              className="panel panel-default"
              style={{
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div
                className="panel-heading"
                style={{ padding: '0 15px' }}
              >
                <ul
                  className="nav nav-tabs"
                  style={{
                    borderBottom: 'none',
                    marginBottom: '-1px',
                  }}
                >
                  <li
                    className={
                      activeTab === 'login' ? 'active' : ''
                    }
                  >
                    <Link
                      to="/login"
                      onClick={() => {
                        setActiveTab('login');
                        setLoginError('');
                      }}
                      style={{ fontWeight: 'bold' }}
                    >
                      Sign In (All Roles)
                    </Link>
                  </li>

                  <li
                    className={
                      activeTab === 'register'
                        ? 'active'
                        : ''
                    }
                  >
                    <Link
                      to="/register"
                      onClick={() => {
                        setActiveTab('register');
                        setRegErrors({});
                      }}
                      style={{ fontWeight: 'bold' }}
                    >
                      New User Sign-Up
                    </Link>
                  </li>
                </ul>
              </div>

              <div
                className="panel-body"
                style={{ padding: '25px 20px' }}
              >
                {activeTab === 'login' ? (
                  <form onSubmit={handleLoginSubmit}>
                    <div
                      style={{ marginBottom: '15px' }}
                    >
                      <h4
                        style={{
                          margin: '0 0 5px 0',
                          fontWeight: 'bold',
                        }}
                      >
                        Single Sign-In System
                      </h4>
                    </div>

                    {loginError && (
                      <div
                        className="alert alert-danger"
                        style={{
                          padding: '10px',
                          fontSize: '12px',
                        }}
                      >
                        <AlertCircle
                          style={{
                            width: '14px',
                            height: '14px',
                            display: 'inline',
                            marginRight: '6px',
                          }}
                        />
                        {loginError}
                      </div>
                    )}

                    <div className="form-group">
                      <label
                        className="control-label"
                        style={{ fontSize: '12px' }}
                      >
                        Email Address{' '}
                        <span className="text-danger">*</span>
                      </label>

                      <div className="input-group">
                        <span className="input-group-addon">
                          <Mail
                            style={{
                              width: '14px',
                              height: '14px',
                            }}
                          />
                        </span>

                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) =>
                            setLoginEmail(e.target.value)
                          }
                          placeholder="e.g. user@storerating.com"
                          className="form-control input-sm"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label
                        className="control-label"
                        style={{ fontSize: '12px' }}
                      >
                        Password{' '}
                        <span className="text-danger">*</span>
                      </label>

                      <div className="input-group">
                        <span className="input-group-addon">
                          <Lock
                            style={{
                              width: '14px',
                              height: '14px',
                            }}
                          />
                        </span>

                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) =>
                            setLoginPassword(e.target.value)
                          }
                          placeholder="Enter account password..."
                          className="form-control input-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary btn-block"
                      style={{
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      {isLoading ? (
                        <Loader2
                          style={{
                            width: '16px',
                            height: '16px',
                            animation:
                              'spin 1s linear infinite',
                          }}
                        />
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight
                            style={{
                              width: '14px',
                              height: '14px',
                            }}
                          />
                        </>
                      )}
                    </button>

                    <div
                      className="text-center"
                      style={{
                        marginTop: '15px',
                        fontSize: '12px',
                      }}
                    >
                      <span className="text-muted">
                        Don't have an account yet?{' '}
                      </span>

                      <Link
                        to="/register"
                        onClick={() =>
                          setActiveTab('register')
                        }
                      >
                        Register as a Normal User
                      </Link>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit}>
                    <div
                      style={{ marginBottom: '15px' }}
                    >
                      <h4
                        style={{
                          margin: '0 0 5px 0',
                          fontWeight: 'bold',
                        }}
                      >
                        Normal User Sign-Up
                      </h4>
                    </div>

                    {regSuccessMessage && (
                      <div
                        className="alert alert-success"
                        style={{
                          padding: '10px',
                          fontSize: '12px',
                        }}
                      >
                        <CheckCircle
                          style={{
                            width: '14px',
                            height: '14px',
                            display: 'inline',
                            marginRight: '6px',
                          }}
                        />
                        {regSuccessMessage}
                      </div>
                    )}

                    {regErrors.general && (
                      <div
                        className="alert alert-danger"
                        style={{
                          padding: '10px',
                          fontSize: '12px',
                        }}
                      >
                        <AlertCircle
                          style={{
                            width: '14px',
                            height: '14px',
                            display: 'inline',
                            marginRight: '6px',
                          }}
                        />
                        {regErrors.general}
                      </div>
                    )}

                    <div
                      className={`form-group ${
                        regErrors.name ? 'has-error' : ''
                      }`}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <label
                          className="control-label"
                          style={{ fontSize: '12px' }}
                        >
                          Full Name{' '}
                          <span className="text-danger">*</span>
                        </label>

                        <span
                          className="text-muted"
                          style={{ fontSize: '10px' }}
                        >
                          {regName.length}/60 chars (Min 20)
                        </span>
                      </div>

                      <div className="input-group">
                        <span className="input-group-addon">
                          <UserIcon
                            style={{
                              width: '14px',
                              height: '14px',
                            }}
                          />
                        </span>

                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) =>
                            setRegName(e.target.value)
                          }
                          placeholder="Enter legal full name (20 to 60 characters)..."
                          className="form-control input-sm"
                        />
                      </div>

                      {regErrors.name && (
                        <span
                          className="help-block"
                          style={{
                            fontSize: '11px',
                            margin: '4px 0 0 0',
                          }}
                        >
                          {regErrors.name}
                        </span>
                      )}
                    </div>

                    <div
                      className={`form-group ${
                        regErrors.email ? 'has-error' : ''
                      }`}
                    >
                      <label
                        className="control-label"
                        style={{ fontSize: '12px' }}
                      >
                        Email Address{' '}
                        <span className="text-danger">*</span>
                      </label>

                      <div className="input-group">
                        <span className="input-group-addon">
                          <Mail
                            style={{
                              width: '14px',
                              height: '14px',
                            }}
                          />
                        </span>

                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) =>
                            setRegEmail(e.target.value)
                          }
                          placeholder="e.g. user@gmail.com"
                          className="form-control input-sm"
                        />
                      </div>

                      {regErrors.email && (
                        <span
                          className="help-block"
                          style={{
                            fontSize: '11px',
                            margin: '4px 0 0 0',
                          }}
                        >
                          {regErrors.email}
                        </span>
                      )}
                    </div>

                    <div
                      className={`form-group ${
                        regErrors.password ? 'has-error' : ''
                      }`}
                    >
                      <label
                        className="control-label"
                        style={{ fontSize: '12px' }}
                      >
                        Password{' '}
                        <span className="text-danger">*</span>
                      </label>

                      <div className="input-group">
                        <span className="input-group-addon">
                          <Lock
                            style={{
                              width: '14px',
                              height: '14px',
                            }}
                          />
                        </span>

                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) =>
                            setRegPassword(e.target.value)
                          }
                          placeholder="8-16 chars, 1 uppercase, 1 special char"
                          className="form-control input-sm"
                        />
                      </div>

                      <p
                        className="help-block"
                        style={{
                          fontSize: '10px',
                          margin: '2px 0 0 0',
                        }}
                      >
                        * 8-16 chars, 1 uppercase letter, 1
                        special character (e.g. @, #, $, !)
                      </p>

                      {regErrors.password && (
                        <span
                          className="help-block text-danger"
                          style={{
                            fontSize: '11px',
                            margin: '2px 0 0 0',
                          }}
                        >
                          {regErrors.password}
                        </span>
                      )}
                    </div>

                    <div
                      className={`form-group ${
                        regErrors.address ? 'has-error' : ''
                      }`}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <label
                          className="control-label"
                          style={{ fontSize: '12px' }}
                        >
                          Physical Address{' '}
                          <span className="text-danger">*</span>
                        </label>

                        <span
                          className="text-muted"
                          style={{ fontSize: '10px' }}
                        >
                          {regAddress.length}/400 chars
                        </span>
                      </div>

                      <div className="input-group">
                        <span className="input-group-addon">
                          <MapPin
                            style={{
                              width: '14px',
                              height: '14px',
                            }}
                          />
                        </span>

                        <textarea
                          rows={2}
                          required
                          value={regAddress}
                          onChange={(e) =>
                            setRegAddress(e.target.value)
                          }
                          placeholder="Full residential street address, city, sector..."
                          className="form-control input-sm"
                        />
                      </div>

                      {regErrors.address && (
                        <span
                          className="help-block"
                          style={{
                            fontSize: '11px',
                            margin: '4px 0 0 0',
                          }}
                        >
                          {regErrors.address}
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-success btn-block"
                      style={{
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      {isLoading ? (
                        <Loader2
                          style={{
                            width: '16px',
                            height: '16px',
                            animation:
                              'spin 1s linear infinite',
                          }}
                        />
                      ) : (
                        <>
                          <span>Create Account</span>
                          <CheckCircle
                            style={{
                              width: '14px',
                              height: '14px',
                            }}
                          />
                        </>
                      )}
                    </button>

                    <div
                      className="text-center"
                      style={{
                        marginTop: '12px',
                        fontSize: '12px',
                      }}
                    >
                      <span className="text-muted">
                        Already have an account?{' '}
                      </span>

                      <Link
                        to="/login"
                        onClick={() => setActiveTab('login')}
                      >
                        Back to Sign In
                      </Link>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};