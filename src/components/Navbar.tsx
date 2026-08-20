import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import {
  LogOut,
  KeyRound,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenChangePassword: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onOpenChangePassword,
}) => {
  const getRoleLabelClass = (role: User['role']) => {
    if (role === 'admin') {
      return 'label-danger';
    }

    if (role === 'store_owner') {
      return 'label-warning';
    }

    return 'label-info';
  };

  const getFirstName = (name: string) => {
    return name.trim().split(/\s+/)[0];
  };

  return (
    <nav
      className="navbar navbar-inverse navbar-static-top"
      style={{
        marginBottom: 0,
        borderRadius: 0,
        borderBottom: '3px solid #337ab7',
      }}
    >
      <div className="container-fluid">
        <div className="navbar-header">
          <Link
            to="/"
            className="navbar-brand"
            style={{
              fontWeight: 'bold',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>Store Rating System</span>

            <span
              className="label label-primary"
              style={{ fontSize: '11px' }}
            >
              Built by Chetan Patil
            </span>
          </Link>
        </div>

        <div
          className="navbar-right"
          style={{ marginRight: '5px' }}
        >
          {currentUser ? (
            <div
              className="navbar-text"
              style={{
                margin: '10px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ color: '#d9edf7' }}>
                <UserIcon
                  style={{
                    display: 'inline',
                    width: '16px',
                    height: '16px',
                    verticalAlign: 'text-bottom',
                    marginRight: '4px',
                  }}
                />

                Welcome,{' '}
                <strong>
                  {getFirstName(currentUser.name)}
                </strong>

                <span
                  className={`label ${getRoleLabelClass(
                    currentUser.role
                  )}`}
                  style={{
                    marginLeft: '6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {currentUser.role.replace('_', ' ')}
                </span>
              </span>

              <button
                type="button"
                onClick={onOpenChangePassword}
                className="btn btn-default btn-xs"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Change Account Password"
              >
                <KeyRound
                  style={{
                    width: '13px',
                    height: '13px',
                    color: '#f0ad4e',
                  }}
                />

                <span>Password</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="btn btn-danger btn-xs"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 'bold',
                }}
                title="Log Out of System"
              >
                <LogOut
                  style={{
                    width: '13px',
                    height: '13px',
                  }}
                />

                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div
              className="navbar-text"
              style={{
                margin: '10px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span className="label label-default">
                Guest Mode
              </span>

              <Link
                to="/login"
                className="btn btn-primary btn-xs"
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                }}
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="btn btn-success btn-xs"
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};