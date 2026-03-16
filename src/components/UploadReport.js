import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload, FileText, Activity, Printer, ArrowLeft,
  User, AlertCircle, X, Plus, CheckCircle, Wifi,
  Layers, TrendingUp, Clock,
} from "lucide-react";
import "./UploadReport.css";

const API_BASE = process.env.REACT_APP_API_URL || "https://rjspark-medparseai-api.hf.space";

const statusColor  = (s) => s === "high" ? "#dc2626" : s === "low" ? "#d97706" : "#059669";
const statusBg     = (s) => s === "high" ? "rgba(220,38,38,0.12)" : s === "low" ? "rgba(217,119,6,0.12)" : "rgba(5,150,105,0.12)";
const statusBorder = (s) => s === "high" ? "rgba(220,38,38,0.35)" : s === "low" ? "rgba(217,119,6,0.35)" : "rgba(5,150,105,0.35)";
const formatSize   = (b) => b < 1024 ? b+" B" : b < 1024*1024 ? (b/1024).toFixed(1)+" KB" : (b/(1024*1024)).toFixed(2)+" MB";

/* ══════════════════════════════════════════
   EHR REPORT VIEW
══════════════════════════════════════════ */
const EHRReport = ({ results, patientInfo, onBack }) => {
  const reportRef = useRef(null);

  const allParams = results.reduce((acc, r) => {
    if (!r?.parameters) return acc;
    Object.entries(r.parameters).forEach(([k,v]) => { if (!acc[k]) acc[k] = v; });
    return acc;
  }, {});

  const totalParams = Object.keys(allParams).length;
  const abnormals   = Object.values(allParams).filter(p => p.status !== "normal");
  const highVals    = Object.values(allParams).filter(p => p.status === "high");
  const lowVals     = Object.values(allParams).filter(p => p.status === "low");
  const reportId    = "RPT-" + Date.now().toString(36).toUpperCase();
  const labName     = [...new Set(results.map(r => r.lab_name||r.lab).filter(Boolean))].join(", ") || "Unknown Lab";
  const accuracy    = results.length ? (results.reduce((s,r) => s+(r.accuracy||0),0)/results.length).toFixed(1) : "N/A";
  const reportDate  = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });

  const handlePrint = () => {
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head>
      <title>MedParseAI EHR – ${reportId}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1e293b;padding:32px}
        .ehr-report-card{max-width:900px;margin:0 auto}
        .ehr-print-header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #3b82f6;padding-bottom:20px;margin-bottom:24px}
        .ehr-brand{display:flex;align-items:center;gap:14px}
        .ehr-brand-icon{width:52px;height:52px;background:linear-gradient(135deg,#2563eb,#06b6d4);border-radius:14px;display:flex;align-items:center;justify-content:center;color:white;font-size:22px;font-weight:800}
        .ehr-brand-name{font-size:24px;font-weight:800;color:#0f172a;letter-spacing:-0.5px}
        .ehr-brand-sub{font-size:12px;color:#64748b;margin-top:3px}
        .ehr-print-meta{text-align:right;font-size:12.5px;color:#64748b;line-height:1.9}
        .ehr-print-meta strong{color:#1e293b}
        .patient-info-print{display:flex;gap:32px;flex-wrap:wrap;padding:16px 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:20px}
        .pi-item label{font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#94a3b8;display:block;margin-bottom:4px}
        .pi-item p{font-size:15px;font-weight:700;color:#1e293b}
        .ehr-summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
        .ehr-summary-card{border-radius:12px;padding:18px;text-align:center;border:1px solid}
        .ehr-summary-card.blue{background:#eff6ff;border-color:#bfdbfe}.ehr-summary-card.green{background:#f0fdf4;border-color:#bbf7d0}.ehr-summary-card.red{background:#fff5f5;border-color:#fecaca}.ehr-summary-card.amber{background:#fffbeb;border-color:#fde68a}
        .esc-num{font-size:32px;font-weight:800}.esc-label{font-size:12px;color:#64748b;margin-top:4px;font-weight:500}
        .blue .esc-num{color:#2563eb}.green .esc-num{color:#059669}.red .esc-num{color:#dc2626}.amber .esc-num{color:#d97706}
        .ehr-alert-box{display:flex;align-items:flex-start;gap:12px;padding:14px 18px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;margin-bottom:20px;color:#9a3412;font-size:14px}
        table{width:100%;border-collapse:collapse;margin-bottom:24px;border:1px solid #e2e8f0}
        th{background:#f8fafc;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#64748b;padding:10px 16px;border-bottom:1px solid #e2e8f0;text-align:left}
        td{padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:13.5px;color:#374151}
        .row-abnormal td{background:#fffbeb}
        .param-name{font-weight:700;color:#1e293b}
        .param-val{font-weight:800;font-size:15px}
        .chip{display:inline-flex;padding:3px 12px;border-radius:100px;font-size:11px;font-weight:700}
        .ehr-footer-note{text-align:center;font-size:11px;color:#94a3b8;padding-top:16px;border-top:1px solid #e2e8f0}
      </style>
    </head><body><div class="ehr-report-card">
      <div class="ehr-print-header">
        <div class="ehr-brand">
          <div class="ehr-brand-icon">M</div>
          <div><div class="ehr-brand-name">MedParseAI</div><div class="ehr-brand-sub">Electronic Health Record</div></div>
        </div>
        <div class="ehr-print-meta">
          <p><strong>Report ID:</strong> ${reportId}</p>
          <p><strong>Lab:</strong> ${labName}</p>
          <p><strong>Date:</strong> ${reportDate}</p>
          <p><strong>AI Accuracy:</strong> ${accuracy}%</p>
        </div>
      </div>
      ${(patientInfo.name||patientInfo.age||patientInfo.gender) ? `
      <div class="patient-info-print">
        ${patientInfo.name   ? `<div class="pi-item"><label>Patient Name</label><p>${patientInfo.name}</p></div>` : ""}
        ${patientInfo.age    ? `<div class="pi-item"><label>Age</label><p>${patientInfo.age} yrs</p></div>` : ""}
        ${patientInfo.gender ? `<div class="pi-item"><label>Gender</label><p>${patientInfo.gender}</p></div>` : ""}
        ${patientInfo.date   ? `<div class="pi-item"><label>Collection Date</label><p>${patientInfo.date}</p></div>` : ""}
        ${patientInfo.doctor ? `<div class="pi-item"><label>Referring Doctor</label><p>${patientInfo.doctor}</p></div>` : ""}
      </div>` : ""}
      <div class="ehr-summary-grid">
        <div class="ehr-summary-card blue"><div class="esc-num">${totalParams}</div><div class="esc-label">Total</div></div>
        <div class="ehr-summary-card green"><div class="esc-num">${totalParams-abnormals.length}</div><div class="esc-label">Normal</div></div>
        <div class="ehr-summary-card red"><div class="esc-num">${highVals.length}</div><div class="esc-label">High</div></div>
        <div class="ehr-summary-card amber"><div class="esc-num">${lowVals.length}</div><div class="esc-label">Low</div></div>
      </div>
      ${abnormals.length > 0 ? `<div class="ehr-alert-box">⚠ <strong>${abnormals.length} abnormal value${abnormals.length>1?"s":""} detected.</strong> Values outside normal reference range — consult your doctor.</div>` : ""}
      <table>
        <thead><tr><th>Parameter</th><th>Value</th><th>Unit</th><th>Reference Range</th><th>Status</th></tr></thead>
        <tbody>
          ${Object.entries(allParams).map(([k,p]) => `
          <tr class="${p.status!=="normal"?"row-abnormal":""}">
            <td class="param-name">${k.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</td>
            <td class="param-val" style="color:${statusColor(p.status)}">${p.value}</td>
            <td>${p.unit||"—"}</td>
            <td>${p.reference_range||"—"}</td>
            <td><span class="chip" style="background:${statusBg(p.status)};border:1px solid ${statusBorder(p.status)};color:${statusColor(p.status)}">${p.status==="high"?"↑ HIGH":p.status==="low"?"↓ LOW":"✓ Normal"}</span></td>
          </tr>`).join("")}
        </tbody>
      </table>
      <div class="ehr-footer-note">⚠ AI-generated report for informational purposes only. Always consult a qualified healthcare professional.</div>
    </div></body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  return (
    <div className="ehr-view-root fade-in">
      <div className="ehr-action-bar">
        <button className="ehr-back-btn" onClick={onBack}><ArrowLeft size={17}/> Upload Another</button>
        <button className="ehr-dl-btn primary" onClick={handlePrint}><Printer size={17}/> Download / Print PDF</button>
      </div>

      <div className="ehr-report-card" ref={reportRef}>
        <div className="ehr-print-header">
          <div className="ehr-brand">
            <div className="ehr-brand-icon"><Activity size={24} color="white"/></div>
            <div>
              <div className="ehr-brand-name">MedParseAI</div>
              <div className="ehr-brand-sub">Electronic Health Record</div>
            </div>
          </div>
          <div className="ehr-print-meta">
            <p><strong>Report ID:</strong> {reportId}</p>
            <p><strong>Lab:</strong> {labName}</p>
            <p><strong>Date:</strong> {reportDate}</p>
            <p><strong>AI Accuracy:</strong> {accuracy}%</p>
          </div>
        </div>

        {(patientInfo.name||patientInfo.age||patientInfo.gender||patientInfo.date||patientInfo.doctor) && (
          <div style={{ display:"flex", gap:"32px", flexWrap:"wrap", padding:"16px 20px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"12px", marginBottom:"24px" }}>
            {patientInfo.name   && <div><p style={{ fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.6px", color:"#94a3b8", marginBottom:"4px" }}>Patient Name</p><p style={{ fontSize:"15px", fontWeight:700, color:"#1e293b" }}>{patientInfo.name}</p></div>}
            {patientInfo.age    && <div><p style={{ fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.6px", color:"#94a3b8", marginBottom:"4px" }}>Age</p><p style={{ fontSize:"15px", fontWeight:700, color:"#1e293b" }}>{patientInfo.age} yrs</p></div>}
            {patientInfo.gender && <div><p style={{ fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.6px", color:"#94a3b8", marginBottom:"4px" }}>Gender</p><p style={{ fontSize:"15px", fontWeight:700, color:"#1e293b" }}>{patientInfo.gender}</p></div>}
            {patientInfo.date   && <div><p style={{ fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.6px", color:"#94a3b8", marginBottom:"4px" }}>Collection Date</p><p style={{ fontSize:"15px", fontWeight:700, color:"#1e293b" }}>{patientInfo.date}</p></div>}
            {patientInfo.doctor && <div><p style={{ fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.6px", color:"#94a3b8", marginBottom:"4px" }}>Referring Doctor</p><p style={{ fontSize:"15px", fontWeight:700, color:"#1e293b" }}>{patientInfo.doctor}</p></div>}
          </div>
        )}

        <div className="ehr-summary-grid">
          <div className="ehr-summary-card blue"> <div className="esc-num">{totalParams}</div><div className="esc-label">Total</div></div>
          <div className="ehr-summary-card green"><div className="esc-num">{totalParams-abnormals.length}</div><div className="esc-label">Normal</div></div>
          <div className="ehr-summary-card red">  <div className="esc-num">{highVals.length}</div><div className="esc-label">High</div></div>
          <div className="ehr-summary-card amber"> <div className="esc-num">{lowVals.length}</div><div className="esc-label">Low</div></div>
        </div>

        {abnormals.length > 0 && (
          <div className="ehr-alert-box">
            <AlertCircle size={18} style={{ flexShrink:0, marginTop:2 }}/>
            <div>
              <strong>{abnormals.length} abnormal value{abnormals.length>1?"s":""} detected.</strong>
              <p>Values outside the normal reference range — please consult your doctor.</p>
            </div>
          </div>
        )}

        <table className="ehr-param-table">
          <thead><tr><th>Parameter</th><th>Value</th><th>Unit</th><th>Reference Range</th><th>Status</th></tr></thead>
          <tbody>
            {Object.entries(allParams).map(([k,p]) => (
              <tr key={k} className={p.status!=="normal"?"row-abnormal":""}>
                <td className="param-name-cell">{k.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</td>
                <td className="param-val-cell" style={{ color:statusColor(p.status) }}>{p.value}</td>
                <td>{p.unit||"—"}</td>
                <td>{p.reference_range||"—"}</td>
                <td><span className="ehr-status-chip" style={{ background:statusBg(p.status), border:"1px solid "+statusBorder(p.status), color:statusColor(p.status) }}>{p.status==="high"?"↑ HIGH":p.status==="low"?"↓ LOW":"✓ Normal"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ehr-footer-note">⚠ AI-generated report for informational purposes only. Always consult a qualified healthcare professional.</div>
      </div>
    </div>
  );
};


/* ══════════════════════════════════════════
   MAIN UPLOAD COMPONENT
══════════════════════════════════════════ */
const STEPS = [
  "Uploading file to server…",
  "Preprocessing image…",
  "Running OCR on report…",
  "Extracting parameters…",
  "Building EHR record…",
];

const UploadReport = () => {
  const [files, setFiles]       = useState([]);
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx]   = useState(0);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [patientInfo, setPatientInfo] = useState({ name:"", age:"", gender:"", date:"", doctor:"" });
  const fileInputRef = useRef();
  const SUPPORTED    = ["application/pdf","image/jpeg","image/png","image/jpg"];

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/`, { signal: AbortSignal.timeout(8000) });
        setBackendStatus(res.ok ? "awake" : "sleeping");
      } catch { setBackendStatus("sleeping"); }
    };
    check();
  }, []);

  const addFiles = useCallback((newFiles) => {
    const valid = Array.from(newFiles).filter(f => SUPPORTED.includes(f.type) && f.size < 10*1024*1024);
    if (valid.length < Array.from(newFiles).length) setError("Some files skipped (unsupported or > 10MB).");
    setFiles(p => { const names = new Set(p.map(f=>f.name)); return [...p, ...valid.filter(f=>!names.has(f.name))]; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeFile  = name => setFiles(p => p.filter(f => f.name !== name));
  const onDragOver  = e    => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()   => setDragging(false);
  const onDrop      = e    => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); };

  const handleUpload = async () => {
    if (!files.length) return;
    const token = localStorage.getItem("medparse_token");
    if (!token) { setError("Not logged in. Please refresh and log in again."); return; }

    setLoading(true); setError(null); setProgress(0); setStepIdx(0);
    const arr = [];

    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append("file", files[i]);
      if (patientInfo.name) fd.append("patient_name", patientInfo.name);

      setStepIdx(0);
      const stepTimer = setInterval(() => setStepIdx(s => s < STEPS.length-1 ? s+1 : s), 1800);

      try {
        const res = await fetch(`${API_BASE}/api/parse`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: fd,
          signal: AbortSignal.timeout(120000),
        });
        clearInterval(stepTimer);
        setStepIdx(STEPS.length - 1);

        let data;
        try { data = await res.json(); } catch { throw new Error(`Server error ${res.status} — wait 30s and retry.`); }

        if (res.status === 401) { localStorage.removeItem("medparse_token"); throw new Error("Session expired. Please log in again."); }
        if (!res.ok || !data.success) throw new Error(data.error || `Error ${res.status}`);

        arr.push(data.data);
        setBackendStatus("awake");
      } catch(err) {
        clearInterval(stepTimer);
        setError(err.name==="TimeoutError" ? `Timeout on "${files[i].name}". Server warming up — wait 30s and retry.` : err.message);
      }
      setProgress(Math.round(((i+1)/files.length)*100));
    }

    setLoading(false);
    if (arr.length > 0) setResults(arr);
  };

  if (results) return (
    <EHRReport results={results} patientInfo={patientInfo}
      onBack={() => { setResults(null); setFiles([]); setProgress(0); setError(null); }} />
  );

  return (
    <div className="upload-root fade-in">
      <div className="upload-page-header">
        <h1 className="upload-page-title">Upload Blood Reports</h1>
        <p className="upload-page-sub">Upload one or more diagnostic lab reports and get a structured EHR</p>
      </div>

      {backendStatus === "sleeping" && (
        <div style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)", borderRadius:"10px", padding:"10px 16px", marginBottom:"16px", display:"flex", alignItems:"center", gap:"10px", color:"#fbbf24", fontSize:"13px" }}>
          <Wifi size={16}/> ⏳ Backend waking up — first upload may take 30–60 seconds.
        </div>
      )}

      <div className="upload-layout">
        <div className="upload-left">

          {/* Patient Info — uses CSS classes from UploadReport.css */}
          <div className="patient-info-card">
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px" }}>
              <User size={16} color="#38bdf8"/>
              <span className="patient-info-title" style={{ marginBottom:0 }}>Patient Information</span>
            </div>
            <div className="patient-info-grid">
              <div className="pi-field">
                <label>Patient Name</label>
                <input type="text" placeholder="Full name" value={patientInfo.name}
                  onChange={e => setPatientInfo(p=>({...p,name:e.target.value}))} />
              </div>
              <div className="pi-field">
                <label>Age</label>
                <input type="number" placeholder="Years" value={patientInfo.age}
                  onChange={e => setPatientInfo(p=>({...p,age:e.target.value}))} />
              </div>
              <div className="pi-field">
                <label>Gender</label>
                <select value={patientInfo.gender} onChange={e => setPatientInfo(p=>({...p,gender:e.target.value}))}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="pi-field">
                <label>Date of Collection</label>
                <input type="date" value={patientInfo.date}
                  onChange={e => setPatientInfo(p=>({...p,date:e.target.value}))} />
              </div>
              <div className="pi-field" style={{ gridColumn:"span 2" }}>
                <label>Referring Doctor</label>
                <input type="text" placeholder="Dr. Name (optional)" value={patientInfo.doctor}
                  onChange={e => setPatientInfo(p=>({...p,doctor:e.target.value}))} />
              </div>
            </div>
          </div>

          {/* Drop Zone */}
          <div className={`dropzone ${dragging?"dropzone-active":""}`}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            onClick={() => fileInputRef.current.click()}>
            <div className="dropzone-icon-ring"><Upload size={28}/></div>
            <p className="dropzone-title">Drag &amp; Drop Reports Here</p>
            <p className="dropzone-sub">or click to browse files</p>
            <div className="dropzone-types">
              <span>PDF</span><span>JPG</span><span>PNG</span>
              <span className="type-sep">Max 10MB · Multiple files OK</span>
            </div>
            <input type="file" multiple ref={fileInputRef} style={{ display:"none" }}
              accept=".pdf,.jpg,.jpeg,.png" onChange={e => addFiles(e.target.files)} />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="file-list">
              <div className="file-list-header">
                <span>{files.length} file{files.length>1?"s":""} selected</span>
                <button className="add-more-btn" onClick={e => { e.stopPropagation(); fileInputRef.current.click(); }}>
                  <Plus size={13}/> Add More
                </button>
              </div>
              {files.map(f => (
                <div key={f.name} className="file-row">
                  <div className="file-row-icon"><FileText size={16}/></div>
                  <div className="file-row-info">
                    <div className="file-row-name">{f.name}</div>
                    <div className="file-row-size">{formatSize(f.size)}</div>
                  </div>
                  <button className="remove-btn" onClick={() => removeFile(f.name)}><X size={14}/></button>
                </div>
              ))}
            </div>
          )}

          {error && <div className="error-banner"><AlertCircle size={16}/> {error}</div>}

          {/* Progress */}
          {loading && (
            <div style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"12px", padding:"16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"13px", color:"#94a3b8", marginBottom:"8px" }}>
                <span>{STEPS[stepIdx]}</span>
                <span>{progress}%</span>
              </div>
              <div style={{ height:"6px", background:"rgba(255,255,255,0.1)", borderRadius:"3px", overflow:"hidden" }}>
                <div style={{ height:"100%", width:Math.max(progress,4)+"%", background:"linear-gradient(90deg,#2563eb,#38bdf8)", borderRadius:"3px", transition:"width 0.3s ease" }}/>
              </div>
              <div style={{ display:"flex", gap:"6px", marginTop:"10px", justifyContent:"center" }}>
                {STEPS.map((_,i) => <span key={i} style={{ width:"8px", height:"8px", borderRadius:"50%", background:i<=stepIdx?"#38bdf8":"rgba(255,255,255,0.15)", transition:"background 0.3s" }}/>)}
              </div>
            </div>
          )}

          <button className="process-btn" disabled={loading||files.length===0} onClick={handleUpload}>
            {loading
              ? <><span className="btn-spin"/> Processing…</>
              : <><Activity size={18}/> Process &amp; Generate EHR Report <span style={{ marginLeft:"4px", fontSize:"18px" }}>›</span></>}
          </button>
        </div>

        {/* RIGHT sidebar — uses CSS classes */}
        <div className="upload-sidebar">
          <div className="info-card">
            <div className="info-card-header">
              <TrendingUp size={16} className="info-card-icon green"/>
              <h3>Processing Stats</h3>
            </div>
            <div className="stat-rows">
              <div className="stat-row"><span>Avg. Accuracy</span><strong className="green">98.5%</strong></div>
              <div className="stat-row"><span>Processing Time</span><strong className="blue">~12s</strong></div>
              <div className="stat-row"><span>Parameters</span><strong className="purple">50+</strong></div>
              <div className="stat-row"><span>Max Files</span><strong>Unlimited</strong></div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <CheckCircle size={16} className="info-card-icon green"/>
              <h3>Supported Labs</h3>
            </div>
            <div className="labs-grid">
              {["Dr. Lal PathLabs","SRL Diagnostics","Thyrocare","Metropolis","Apollo Health","Vijaya Diagnostic","+10 more Labs"].map(lab => (
                <div key={lab} className={`lab-chip ${lab.startsWith("+")?"muted":""}`}>
                  {!lab.startsWith("+") && <CheckCircle size={12}/>}
                  {lab}
                </div>
              ))}
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <span className="tips-emoji">💡</span>
              <h3>Tips</h3>
            </div>
            <ul className="tips-list">
              <li>Use high-resolution scans (300+ DPI)</li>
              <li>Ensure report is fully visible</li>
              <li>Upload all pages of multi-page reports</li>
              <li>Remove PDF password before upload</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadReport;
