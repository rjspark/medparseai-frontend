import React, { useState, useEffect, useRef } from 'react';
import { Activity, Mail, Lock, Heart, Zap, Shield, BarChart2 } from 'lucide-react';
import { authAPI } from '../api';   // ← components/ is one level below src/ where api.js lives
import './Login.css';

const Login = ({ onLogin }) => {
  const canvasRef = useRef(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    rememberMe: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [activeTab, setActiveTab] = useState("signin");
  const [error, setError] = useState("");

  /* ================= ANIMATION (UNCHANGED) ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    let particles = [];

    class Particle {
      constructor(){ this.reset(); }
      reset(){
        this.x = Math.random()*canvas.width;
        this.y = Math.random()*canvas.height;
        this.vx = (Math.random()-0.5)*0.4;
        this.vy = (Math.random()-0.5)*0.4;
        this.r = Math.random()*2+1;
      }
      update(){
        this.x+=this.vx;
        this.y+=this.vy;
        if(this.x<0||this.x>canvas.width||this.y<0||this.y>canvas.height){
          this.reset();
        }
      }
      draw(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
        ctx.fillStyle="rgba(99,179,237,0.6)";
        ctx.fill();
      }
    }

    for(let i=0;i<70;i++) particles.push(new Particle());

    const animate=()=>{
      ctx.fillStyle='rgba(6,18,42,0.2)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      particles.forEach(p=>{ p.update(); p.draw(); });
      requestAnimationFrame(animate);
    };

    animate();

    return ()=>window.removeEventListener('resize',resize);
  }, []);

  /* ================= FORM LOGIC ================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res =
        activeTab === "signin"
          ? await authAPI.login(formData.email, formData.password)
          : await authAPI.register(formData.email, formData.password, formData.name);

      localStorage.setItem("medparse_token", res.data.token);
      onLogin(res.data.user);

    } catch (err) {
      setError(err.response?.data?.error || "Authentication Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-root">
      <canvas ref={canvasRef} className="login-canvas" />
      <div className="login-overlay" />

      <div className="login-shell">
        {/* LEFT PANEL */}
        <div className="login-left">
          <div className="brand-mark">
            <div className="brand-icon-ring">
              <Activity size={28} strokeWidth={2.5} />
            </div>
            <span className="brand-wordmark">MedParseAI</span>
          </div>

          <div className="login-left-body">
            <div className="tagline-block">
              <div className="tagline-chip">AI-Powered Healthcare</div>
              <h1 className="tagline-headline">
                Blood Reports,<br />
                <span className="tagline-accent">Decoded Instantly</span>
              </h1>
              <p className="tagline-sub">
                Transform any Indian diagnostic lab report into standardized Electronic Health Records with 98%+ accuracy.
              </p>
            </div>

            <div className="pills-row">
              <div className="info-pill"><Zap size={15} /><span>15+ Labs Supported</span></div>
              <div className="info-pill"><Shield size={15} /><span>HIPAA Compliant</span></div>
              <div className="info-pill"><BarChart2 size={15} /><span>50+ Parameters</span></div>
            </div>
          </div>

          <div className="login-left-footer">
            <Heart size={13} className="heart-pulse" />
            <span>Built for Indian Healthcare · Made in India 🇮🇳</span>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right">
          <div className="form-glass">
            <div className="form-top">
              <h2 className="form-title">
                {activeTab === "signin" ? "Welcome back" : "Create Account"}
              </h2>
              <p className="form-subtitle">
                {activeTab === "signin"
                  ? "Sign in to your MedParseAI account"
                  : "Register to start decoding reports"}
              </p>
            </div>

            <div className="tab-row">
              <button
                type="button"
                className={`tab-btn ${activeTab === "signin" ? "active" : ""}`}
                onClick={() => setActiveTab("signin")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
                onClick={() => setActiveTab("register")}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="sign-form">

              {activeTab === "register" && (
                <div className="field-group">
                  <label>Full Name</label>
                  <div className="field-wrap">
                    <input
                      name="name"
                      placeholder="Dr. Priya Sharma"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              <div className={`field-group ${focused === 'email' ? 'field-focused' : ''}`}>
                <label>Email Address</label>
                <div className="field-wrap">
                  <Mail size={17} className="field-icon" />
                  <input
                    type="email"
                    name="email"
                    placeholder="doctor@hospital.com"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    required
                  />
                </div>
              </div>

              <div className={`field-group ${focused === 'password' ? 'field-focused' : ''}`}>
                <label>Password</label>
                <div className="field-wrap">
                  <Lock size={17} className="field-icon" />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                    required
                  />
                </div>
              </div>

              {error && <p className="error-text">{error}</p>}

              <button
                type="submit"
                className={`submit-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="btn-spinner" />
                ) : (
                  <>
                    {activeTab === "signin" ? "Sign In" : "Register"}
                    <span className="btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
