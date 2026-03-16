import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Activity, LayoutDashboard, Upload, History, Settings,
  Bell, ChevronDown, LogOut, Cpu
} from 'lucide-react';
import AnimatedBG from './AnimatedBG';
import './Layout.css';

const Layout = ({ user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => { onLogout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload',    icon: Upload,          label: 'Upload Report' },
    { to: '/history',   icon: History,         label: 'History' },
    { to: '/settings',  icon: Settings,        label: 'Settings' },
  ];

  return (
    <div className="layout-root">
      <AnimatedBG opacity={1} />

      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">
            <Activity size={22} strokeWidth={2.5} />
          </div>
          <span className="sidebar-brand-name">MedParseAI</span>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-section-label">MAIN MENU</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => `nav-item${isActive ? ' nav-active' : ''}`}
            >
              <Icon size={18} className="nav-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-accuracy-card">
          <div className="accuracy-card-top">
            <Cpu size={16} /><span>AI Engine</span>
          </div>
          <div className="accuracy-bar-label">
            <span>OCR Accuracy</span>
            <span className="accuracy-value">98.5%</span>
          </div>
          <div className="accuracy-bar-track">
            <div className="accuracy-bar-fill" style={{ width: '98.5%' }} />
          </div>
          <p className="accuracy-sub">Avg. 50+ parameters extracted</p>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="topbar-greeting">
              Good day, <span>{user?.name?.split(' ')[1] || 'Doctor'} 👋</span>
            </h1>
            <p className="topbar-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="topbar-right">
            <button className="notif-btn">
              <Bell size={18} />
              <span className="notif-dot" />
            </button>

            <div className="user-pill-wrapper">
              <button className="user-pill" onClick={() => setShowUserMenu(v => !v)}>
                <div className="user-avatar-pill">{user?.name?.charAt(0) || 'D'}</div>
                <div className="user-pill-text">
                  <p className="user-pill-name">{user?.name || 'Doctor'}</p>
                  <p className="user-pill-role">{user?.specialization || 'Physician'}</p>
                </div>
                <ChevronDown size={15} className={`chevron ${showUserMenu ? 'open' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <p>{user?.name}</p><p>{user?.hospital}</p>
                  </div>
                  <NavLink to="/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <Settings size={15} /> Settings
                  </NavLink>
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
