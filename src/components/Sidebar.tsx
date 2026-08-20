import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  Store,
  Users,
  FileText,
  Star,
  Shield,
  KeyRound,
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  onOpenChangePassword: () => void;
}

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const iconStyle = {
  width: '16px',
  height: '16px',
  display: 'inline',
  marginRight: '6px',
};

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  onOpenChangePassword,
}) => {
  const menuItems: MenuItem[] =
    role === 'admin'
      ? [
          {
            path: '/admin/dashboard',
            label: 'Admin Dashboard',
            icon: <LayoutDashboard style={iconStyle} />,
          },
          {
            path: '/admin/stores',
            label: 'Store Management',
            icon: <Store style={iconStyle} />,
          },
          {
            path: '/admin/users',
            label: 'User Directory',
            icon: <Users style={iconStyle} />,
          },
          {
            path: '/admin/ratings',
            label: 'Rating Logs & Reports',
            icon: <FileText style={iconStyle} />,
          },
        ]
      : role === 'store_owner'
        ? [
            {
              path: '/owner/dashboard',
              label: 'Store Overview',
              icon: <LayoutDashboard style={iconStyle} />,
            },
            {
              path: '/owner/ratings',
              label: 'Customer Reviews',
              icon: <Star style={iconStyle} />,
            },
          ]
        : [
            {
              path: '/user/stores',
              label: 'Browse Stores',
              icon: <Store style={iconStyle} />,
            },
          ];

  return (
    <div
      style={{
        width: '230px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #ddd',
        padding: '15px 10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      <div>
        <div
          style={{
            padding: '0 8px 10px',
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#777',
            textTransform: 'uppercase',
            borderBottom: '1px solid #eee',
            marginBottom: '10px',
          }}
        >
          Navigation Menu
        </div>

        <div
          className="list-group"
          style={{ marginBottom: '15px' }}
        >
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `list-group-item ${isActive ? 'active' : ''}`
              }
              style={{
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                cursor: 'pointer',
                borderRadius: '3px',
                marginBottom: '3px',
                textDecoration: 'none',
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div
        className="panel panel-default"
        style={{
          marginBottom: 0,
          fontSize: '12px',
        }}
      >
        <div
          className="panel-heading"
          style={{
            padding: '8px 10px',
            fontWeight: 'bold',
            fontSize: '11px',
          }}
        >
          <Shield
            style={{
              width: '13px',
              height: '13px',
              display: 'inline',
              marginRight: '4px',
              color: '#337ab7',
            }}
          />
          Account Security
        </div>

        <div
          className="panel-body"
          style={{ padding: '10px' }}
        >
          <button
            type="button"
            onClick={onOpenChangePassword}
            className="btn btn-default btn-xs btn-block"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            <KeyRound
              style={{
                width: '13px',
                height: '13px',
                color: '#f0ad4e',
              }}
            />
            <span>Update Password</span>
          </button>
        </div>
      </div>
    </div>
  );
};