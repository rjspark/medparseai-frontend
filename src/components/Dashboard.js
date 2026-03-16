import React, { useState, useEffect } from 'react';
import {
  FileText, TrendingUp, Clock, Building2,
  ArrowUpRight, Upload, History as HistoryIcon,
  Download, Settings as SettingsIcon, AlertTriangle,
  Activity, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentFromStorage, setRecentFromStorage] = useState([]);
  const [abnormals, setAbnormals] = useState([]);

  const [stats, setStats] = useState({
    totalReports: 0,
    successRate: 98.5,
    processing: 0,
    labsSupported: 15
  });

  // Load real data from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('medparse_history') || '[]');
      setRecentFromStorage(stored.slice(0, 3));
      setStats(s => ({ ...s, totalReports: stored.length }));

      // Collect abnormal values from most recent report
      if (stored.length > 0) {
        const latest = stored[0];
        const params = latest.parameters || {};
        const abn = Object.entries(params)
          .filter(([, v]) => v.status !== 'normal')
          .slice(0, 4)
          .map(([key, v]) => ({ name: key.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()), value: v.value, unit: v.unit, status: v.status, ref: v.reference_range }));
        setAbnormals(abn);
      }
    } catch {}
  }, []);

  const hardcodedReports = [
    { id:1, patient:'John Doe',    reportType:'Complete Blood Count',  lab:'Dr. Lal PathLabs', date:'15/01/2025', status:'completed', accuracy:98.7, parameters:12 },
    { id:2, patient:'Sarah Miller',reportType:'Lipid Profile',         lab:'SRL Diagnostics',  date:'14/01/2025', status:'processing',accuracy:null, parameters:null },
    { id:3, patient:'Mike Johnson',reportType:'Thyroid Function Test', lab:'Thyrocare',         date:'13/01/2025', status:'completed', accuracy:99.1, parameters:6 },
  ];

  const displayReports = recentFromStorage.length > 0
    ? recentFromStorage.map((r,i) => ({
        id: i, patient: r.patient_name || 'Patient', reportType: r.report_type || 'Blood Report',
        lab: r.lab_name || 'Lab', date: new Date(r.timestamp||Date.now()).toLocaleDateString('en-IN'),
        status:'completed', accuracy: r.accuracy, parameters: Object.keys(r.parameters||{}).length
      }))
    : hardcodedReports;

  const quickActions = [
    { icon:Upload,       label:'Upload New Report',  action:()=>navigate('/upload') },
    { icon:HistoryIcon,  label:'View History',        action:()=>navigate('/history') },
    { icon:Download,     label:'Export EHR Data',     action:()=>alert('Export functionality') },
    { icon:SettingsIcon, label:'Settings',            action:()=>navigate('/settings') },
  ];

  const supportedLabs = ['Dr. Lal PathLabs','SRL Diagnostics','Thyrocare','Metropolis','Apollo Health','Vijaya Diagnostic'];

  return (
    <div className="dashboard-container fade-in">

      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="banner-content">
          <h1 className="banner-title">Welcome to MedParseAI</h1>
          <p className="banner-subtitle">Transform your blood reports into structured EHR data with AI-powered precision</p>
        </div>
        <div className="banner-stats">
          <div className="banner-stat-item">
            <TrendingUp className="banner-stat-icon" size={18}/>
            <span className="banner-stat-value">+12%</span>
          </div>
          <div className="banner-stat-item">
            <span className="banner-stat-label">+0.3%</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper green"><FileText size={22}/></div>
          <div className="stat-content">
            <p className="stat-label">Total Reports</p>
            <h3 className="stat-value">{stats.totalReports || 247}</h3>
            <div className="stat-badge up"><ArrowUpRight size={13}/>+12%</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper blue"><TrendingUp size={22}/></div>
          <div className="stat-content">
            <p className="stat-label">Success Rate</p>
            <h3 className="stat-value">{stats.successRate}%</h3>
            <div className="stat-badge up"><ArrowUpRight size={13}/>+0.3%</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper orange"><Clock size={22}/></div>
          <div className="stat-content">
            <p className="stat-label">Processing</p>
            <h3 className="stat-value">{stats.processing || 3}</h3>
            <div className="stat-badge neutral">-2</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper purple"><Building2 size={22}/></div>
          <div className="stat-content">
            <p className="stat-label">Labs Supported</p>
            <h3 className="stat-value">{stats.labsSupported}+</h3>
            <div className="stat-badge up">+2</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="quick-actions-grid">
            {quickActions.map((a,i) => (
              <button key={i} className="quick-action-btn" onClick={a.action}>
                <a.icon size={18}/><span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Abnormal Values */}
        <div className="dashboard-card abnormal-card">
          <div className="card-header">
            <h3 className="card-title"><AlertTriangle size={16} style={{display:'inline',marginRight:6,verticalAlign:'middle'}}/>Recent Abnormal Values</h3>
          </div>
          {abnormals.length === 0 ? (
            <p className="abnormal-empty">No recent reports processed yet.<br/>Upload a report to see flagged values here.</p>
          ) : (
            <div className="abnormal-list">
              {abnormals.map((a,i) => (
                <div key={i} className="abnormal-item">
                  <div>
                    <div className="abnormal-param">{a.name}</div>
                    <div className="abnormal-ref">Ref: {a.ref} {a.unit}</div>
                  </div>
                  <div className="abnormal-val">{a.value} {a.unit} ↑</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">Recent Reports</h3>
          <button className="view-all-btn" onClick={()=>navigate('/history')}>View All →</button>
        </div>
        <div className="reports-table">
          <table>
            <thead>
              <tr>
                <th>Patient</th><th>Report Type</th><th>Lab</th>
                <th>Date</th><th>Status</th><th>Accuracy</th><th>Parameters</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayReports.map(r => (
                <tr key={r.id}>
                  <td><div className="patient-cell"><div className="patient-avatar">{r.patient.charAt(0)}</div><span>{r.patient}</span></div></td>
                  <td>{r.reportType}</td>
                  <td><div className="lab-cell"><Building2 size={14}/><span>{r.lab}</span></div></td>
                  <td>{r.date}</td>
                  <td><span className={`status-badge ${r.status}`}>{r.status}</span></td>
                  <td>{r.accuracy ? `${r.accuracy}%` : '—'}</td>
                  <td>{r.parameters || '—'}</td>
                  <td><div className="action-buttons">
                    <button className="action-btn">👁️</button>
                    <button className="action-btn">⬇️</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header"><h3 className="card-title">Supported Indian Diagnostic Labs</h3></div>
          <div className="labs-grid">
            {supportedLabs.map((lab,i) => (
              <div key={i} className="lab-item"><div className="lab-check">✓</div><span>{lab}</span></div>
            ))}
          </div>
        </div>
        <div className="dashboard-card ai-features-card">
          <div className="card-header"><h3 className="card-title">⚡ AI Processing Power</h3></div>
          <p className="ai-description">Advanced AI extracts 50+ blood parameters from any Indian diagnostic lab report with 98%+ accuracy</p>
          <div className="ai-features">
            <div className="ai-feature"><span className="ai-feature-icon">👁️</span><span>OCR Engine</span></div>
            <div className="ai-feature"><span className="ai-feature-icon">🧠</span><span>Pattern Recognition</span></div>
            <div className="ai-feature"><span className="ai-feature-icon">📊</span><span>EHR Export</span></div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
