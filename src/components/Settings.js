import React, { useState, useRef } from 'react';
import {
  User, Mail, Phone, MapPin, Building2, FileText,
  Bell, Lock, CreditCard, Save, Camera, Globe
} from 'lucide-react';
import './Settings.css';

const Settings = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [photoURL, setPhotoURL] = useState(null);      // ← working photo state
  const [saved, setSaved]       = useState(false);
  const photoInputRef           = useRef(null);

  const [formData, setFormData] = useState({
    firstName:      user?.name?.split(' ')[0] || 'Shreeya',
    lastName:       user?.name?.split(' ')[1] || 'Rajagopal',
    email:          user?.email || 'rjshreeya@gmail.com',
    phone:          '+91 98765 43210',
    location:       'Mumbai, Maharashtra, India',
    hospital:       user?.hospital || 'Apollo Hospital',
    specialization: user?.specialization || 'Internal Medicine',
    license:        'MH-12345-2020',
    website:        'https://apollohospital.com'
  });

  const [notifications, setNotifications] = useState({
    emailReports: true,
    emailUpdates: false,
    pushReports:  true,
    pushUpdates:  true,
    smsAlerts:    false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({ ...prev, [name]: checked }));
  };

  // ── Photo upload ────────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoURL(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoURL(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="settings-container fade-in">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your account, preferences, and security settings</p>
      </div>

      <div className="settings-content">
        {/* Tabs */}
        <div className="settings-tabs">
          {[
            { id: 'profile',       icon: <User size={18}/>,       label: 'Profile'       },
            { id: 'notifications', icon: <Bell size={18}/>,       label: 'Notifications' },
            { id: 'preferences',   icon: <FileText size={18}/>,   label: 'Preferences'  },
            { id: 'security',      icon: <Lock size={18}/>,       label: 'Security'     },
            { id: 'billing',       icon: <CreditCard size={18}/>, label: 'Billing'      },
          ].map(t => (
            <button key={t.id}
              className={`settings-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}>
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <div className="settings-panel">

            {/* Photo */}
            <div className="settings-section">
              <h2 className="section-title">Profile Picture</h2>
              <div className="profile-picture-section">

                {/* Avatar — shows photo or initials */}
                <div className="profile-avatar-large" style={{ overflow:'hidden', cursor:'pointer' }}
                  onClick={() => photoInputRef.current?.click()}>
                  {photoURL
                    ? <img src={photoURL} alt="Profile" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }}/>
                    : <span style={{ fontSize:'28px', fontWeight:800, color:'white', letterSpacing:'-1px' }}>{initials || <User size={48}/>}</span>
                  }
                </div>

                <div className="profile-picture-actions">
                  {/* Hidden real file input */}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    style={{ display:'none' }}
                    onChange={handlePhotoChange}
                  />
                  <button className="btn-upload-photo" onClick={() => photoInputRef.current?.click()}>
                    <Camera size={17}/> Change Photo
                  </button>
                  <button className="btn-remove-photo" onClick={handleRemovePhoto}>
                    Remove Photo
                  </button>
                  <p className="photo-hint">JPG, GIF or PNG. Max size of 2MB</p>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="settings-section">
              <h2 className="section-title">Personal Information</h2>
              <p className="section-description">Update your personal details</p>
              <div className="form-grid">
                {[
                  { label:'First Name',    name:'firstName',  icon:<User/>,   type:'text'  },
                  { label:'Last Name',     name:'lastName',   icon:<User/>,   type:'text'  },
                  { label:'Email Address', name:'email',      icon:<Mail/>,   type:'email' },
                  { label:'Phone Number',  name:'phone',      icon:<Phone/>,  type:'tel'   },
                ].map(f => (
                  <div className="form-group-settings" key={f.name}>
                    <label>{f.label}</label>
                    <div className="input-wrapper-settings">
                      {React.cloneElement(f.icon, { className:'input-icon-settings', size:17 })}
                      <input type={f.type} name={f.name} value={formData[f.name]}
                        onChange={handleChange} className="input-settings"/>
                    </div>
                  </div>
                ))}
                <div className="form-group-settings full-width">
                  <label>Location</label>
                  <div className="input-wrapper-settings">
                    <MapPin className="input-icon-settings" size={17}/>
                    <input type="text" name="location" value={formData.location}
                      onChange={handleChange} className="input-settings"/>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="settings-section">
              <h2 className="section-title">Professional Information</h2>
              <p className="section-description">Update your professional details</p>
              <div className="form-grid">
                {[
                  { label:'Hospital / Clinic', name:'hospital',       icon:<Building2/> },
                  { label:'Specialization',    name:'specialization', icon:<FileText/>  },
                  { label:'Medical License',   name:'license',        icon:<FileText/>  },
                  { label:'Website',           name:'website',        icon:<Globe/>     },
                ].map(f => (
                  <div className="form-group-settings" key={f.name}>
                    <label>{f.label}</label>
                    <div className="input-wrapper-settings">
                      {React.cloneElement(f.icon, { className:'input-icon-settings', size:17 })}
                      <input type="text" name={f.name} value={formData[f.name]}
                        onChange={handleChange} className="input-settings"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="settings-actions">
              <button className="btn-cancel">Cancel</button>
              <button className="btn-save" onClick={handleSave}>
                <Save size={17}/>
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ── Notifications Tab ── */}
        {activeTab === 'notifications' && (
          <div className="settings-panel">
            {[
              { title:'Email Notifications', desc:'Manage your email notification preferences',
                items:[
                  { name:'emailReports', label:'Report Processing Complete', desc:'Get notified when your blood reports are processed' },
                  { name:'emailUpdates', label:'Product Updates',            desc:'Get updates about new features and improvements' },
                ]},
              { title:'Push Notifications', desc:'Manage your push notification preferences',
                items:[
                  { name:'pushReports',  label:'Report Processing', desc:'Receive push notifications for report updates'     },
                  { name:'pushUpdates',  label:'System Updates',    desc:'Important system notifications and alerts'          },
                ]},
              { title:'SMS Notifications', desc:'Manage SMS alerts for critical updates',
                items:[
                  { name:'smsAlerts',   label:'Critical Alerts', desc:'Receive SMS for critical abnormal values' },
                ]},
            ].map(section => (
              <div className="settings-section" key={section.title}>
                <h2 className="section-title">{section.title}</h2>
                <p className="section-description">{section.desc}</p>
                <div className="notification-options">
                  {section.items.map(item => (
                    <div className="notification-item" key={item.name}>
                      <div className="notification-info">
                        <h4>{item.label}</h4>
                        <p>{item.desc}</p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" name={item.name}
                          checked={notifications[item.name]}
                          onChange={handleNotificationChange}/>
                        <span className="toggle-slider"/>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="settings-actions">
              <button className="btn-cancel">Cancel</button>
              <button className="btn-save" onClick={handleSave}>
                <Save size={17}/>{saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ── Other tabs ── */}
        {['preferences','security','billing'].includes(activeTab) && (
          <div className="settings-panel">
            <div className="coming-soon">
              <FileText size={64}/>
              <h2>Coming Soon</h2>
              <p>This section is under development</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
