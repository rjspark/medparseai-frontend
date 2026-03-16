import React, { useEffect, useState } from "react";
import { reportsAPI } from "../api";
import {
  Search, FileText, Calendar, Building2, Eye,
  Activity, TrendingUp, AlertTriangle, Users,
} from "lucide-react";
import "./History.css";

const History = () => {
  const [reports, setReports]       = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await reportsAPI.getAll();
      setReports(res.data.reports || []);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = reports.filter(r =>
    (r.patient_name||"").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.lab_name||"").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgAccuracy = reports.length
    ? (reports.reduce((s,r) => s+(r.accuracy||0), 0) / reports.length).toFixed(1)
    : 0;

  const totalAbnormal = reports.reduce((s,r) => {
    const params = r.parameters || {};
    return s + Object.values(params).filter(p => p.status !== "normal").length;
  }, 0);

  const statusColor = s => s==="high"?"#dc2626":s==="low"?"#d97706":"#059669";
  const statusBg    = s => s==="high"?"rgba(220,38,38,0.12)":s==="low"?"rgba(217,119,6,0.12)":"rgba(5,150,105,0.12)";
  const statusBorder= s => s==="high"?"rgba(220,38,38,0.35)":s==="low"?"rgba(217,119,6,0.35)":"rgba(5,150,105,0.35)";

  /* ── Detail view ── */
  if (selected) {
    const params = selected.parameters || {};
    const abnormals = Object.values(params).filter(p => p.status !== "normal");
    return (
      <div className="history-container fade-in">
        <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"28px" }}>
          <button onClick={() => setSelected(null)}
            style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.14)", color:"#cbd5e1", borderRadius:"10px", padding:"9px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:"7px", fontSize:"14px", fontWeight:500 }}>
            ← Back to History
          </button>
          <h2 style={{ color:"#ffffff", fontSize:"20px", fontWeight:800 }}>Report Detail</h2>
        </div>

        <div style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"16px", padding:"24px", marginBottom:"20px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"20px" }}>
            {[
              { label:"Patient",    value: selected.patient_name || "Unknown" },
              { label:"Lab",        value: selected.lab_name     || "Unknown" },
              { label:"Date",       value: new Date(selected.created_at).toLocaleDateString("en-IN") },
              { label:"Parameters", value: Object.keys(params).length },
              { label:"Abnormal",   value: abnormals.length, danger: abnormals.length > 0 },
              { label:"Accuracy",   value: (selected.accuracy||0)+"%" },
            ].map(item => (
              <div key={item.label}>
                <p style={{ fontSize:"11px", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"5px" }}>{item.label}</p>
                <p style={{ fontSize:"18px", fontWeight:800, color:item.danger?"#f87171":"#ffffff" }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {Object.keys(params).length > 0 ? (
          <div className="history-table-card">
            <div className="table-header"><h3>Extracted Parameters ({Object.keys(params).length})</h3></div>
            <div className="table-wrapper">
              <table className="history-table">
                <thead>
                  <tr><th>Parameter</th><th>Value</th><th>Unit</th><th>Reference Range</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {Object.entries(params).map(([k,p]) => (
                    <tr key={k}>
                      <td style={{ fontWeight:600, color:"#f1f5f9" }}>{k.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</td>
                      <td style={{ fontWeight:800, fontSize:"15px", color:statusColor(p.status) }}>{p.value}</td>
                      <td style={{ color:"#94a3b8" }}>{p.unit||"—"}</td>
                      <td style={{ color:"#94a3b8" }}>{p.reference_range||"—"}</td>
                      <td>
                        <span style={{ background:statusBg(p.status), border:`1px solid ${statusBorder(p.status)}`, color:statusColor(p.status), padding:"3px 12px", borderRadius:"100px", fontSize:"11px", fontWeight:700 }}>
                          {p.status==="high"?"↑ HIGH":p.status==="low"?"↓ LOW":"✓ Normal"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p style={{ color:"#64748b", textAlign:"center", padding:"40px" }}>No parameter data available.</p>
        )}
      </div>
    );
  }

  return (
    <div className="history-container fade-in">
      {/* Header */}
      <div className="history-header">
        <h1 className="history-title">Report History</h1>
        <p className="history-subtitle">All your parsed blood reports stored securely in the cloud</p>
      </div>

      {/* Stats */}
      <div className="history-stats">
        <div className="stat-card-history">
          <div className="stat-icon-history"><FileText size={22}/></div>
          <div>
            <p className="stat-label-history">Total Reports</p>
            <p className="stat-value-history">{reports.length}</p>
          </div>
        </div>
        <div className="stat-card-history">
          <div className="stat-icon-history green"><TrendingUp size={22}/></div>
          <div>
            <p className="stat-label-history">Avg Accuracy</p>
            <p className="stat-value-history">{avgAccuracy}%</p>
          </div>
        </div>
        <div className="stat-card-history">
          <div className="stat-icon-history orange"><AlertTriangle size={22}/></div>
          <div>
            <p className="stat-label-history">Abnormal Values</p>
            <p className="stat-value-history">{totalAbnormal}</p>
          </div>
        </div>
        <div className="stat-card-history">
          <div className="stat-icon-history purple"><Users size={22}/></div>
          <div>
            <p className="stat-label-history">Patients</p>
            <p className="stat-value-history">{new Set(reports.map(r=>r.patient_name).filter(Boolean)).size || reports.length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="history-controls">
        <div className="search-box">
          <Search size={17} className="search-icon"/>
          <input
            className="search-input"
            type="text"
            placeholder="Search by patient name or lab…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"70px", color:"#64748b" }}>
          <div style={{ width:"36px", height:"36px", border:"3px solid rgba(59,130,246,0.25)", borderTop:"3px solid #3b82f6", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
          <p>Loading reports…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="no-results">
          <FileText size={52}/>
          <h3>{reports.length === 0 ? "No reports yet" : "No results found"}</h3>
          <p>{reports.length === 0 ? "Upload a blood report to get started." : "Try a different search term."}</p>
        </div>
      ) : (
        <div className="history-table-card">
          <div className="table-header">
            <h3>Reports ({filtered.length})</h3>
          </div>
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Lab</th>
                  <th>Date</th>
                  <th>Parameters</th>
                  <th>Accuracy</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const params = r.parameters || {};
                  const abnCount = Object.values(params).filter(p=>p.status!=="normal").length;
                  const acc = r.accuracy || 0;
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="patient-cell">
                          <div className="patient-avatar">
                            {(r.patient_name||"?")[0].toUpperCase()}
                          </div>
                          <span>{r.patient_name || "Unknown"}</span>
                        </div>
                      </td>
                      <td>
                        <div className="lab-cell">
                          <Building2 size={14}/>
                          <span>{r.lab_name || "Unknown"}</span>
                        </div>
                      </td>
                      <td>
                        <div className="date-cell">
                          <Calendar size={14}/>
                          <span>{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
                        </div>
                      </td>
                      <td>
                        <span className="parameters-count">{Object.keys(params).length} found</span>
                        {abnCount > 0 && (
                          <span style={{ marginLeft:"8px", background:"rgba(220,38,38,0.15)", color:"#f87171", border:"1px solid rgba(220,38,38,0.3)", padding:"2px 8px", borderRadius:"100px", fontSize:"11px", fontWeight:700 }}>
                            {abnCount} abnormal
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          <div style={{ height:"5px", width:"60px", background:"rgba(255,255,255,0.1)", borderRadius:"3px", overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${acc}%`, background:acc>=90?"#34d399":acc>=70?"#fbbf24":"#f87171", borderRadius:"3px" }}/>
                          </div>
                          <span className="accuracy-value">{acc}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons-history">
                          <button className="action-btn-history view" onClick={() => setSelected(r)} title="View">
                            <Eye size={15}/>
                          </button>
                        </div>
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
  );
};

export default History;
