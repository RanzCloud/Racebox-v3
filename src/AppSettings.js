import React, { useEffect, useState } from "react";

const STORAGE_KEY = "raceboxd-settings";
const defaults = {
  units: "metric",
  appearance: "system",
  density: "comfortable",
  haptics: true,
  sounds: false,
  keepAwake: true,
  autoSave: true,
  raceReminders: true,
  seasonUpdates: false,
  privateProfile: true,
};

const sections = [
  { id: "general", label: "General", caption: "Your account & app" },
  { id: "display", label: "Display", caption: "Look & feel" },
  { id: "mobile", label: "Mobile", caption: "On-the-go controls" },
  { id: "notifications", label: "Notifications", caption: "Race weekend alerts" },
  { id: "privacy", label: "Privacy", caption: "Your data, your rules" },
];

function readSettings() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return defaults;
  }
}

function SettingToggle({ title, description, checked, onChange }) {
  return (
    <label className="setting-row">
      <span className="setting-row__copy">
        <span className="setting-row__title">{title}</span>
        <span className="setting-row__description">{description}</span>
      </span>
      <input
        className="setting-switch"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function SettingSelect({ title, description, value, options, onChange }) {
  return (
    <label className="setting-row setting-row--select">
      <span className="setting-row__copy">
        <span className="setting-row__title">{title}</span>
        <span className="setting-row__description">{description}</span>
      </span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function AppSettings({ onClose }) {
  const [settings, setSettings] = useState(readSettings);
  const [activeSection, setActiveSection] = useState("general");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const updateSetting = (key, value) => {
    setSettings((current) => {
      const next = { ...current, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetSettings = () => {
    setSettings(defaults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  };

  const section = sections.find((item) => item.id === activeSection);

  return (
    <div className="settings-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        className="settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <header className="settings-header">
          <div className="settings-header__heading">
            <span className="settings-eyebrow">RACEBOXD / PREFERENCES</span>
            <h2 id="settings-title">Settings</h2>
          </div>
          <button type="button" className="settings-close" onClick={onClose} aria-label="Close settings">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="settings-layout">
          <nav className="settings-nav" aria-label="Settings categories">
            {sections.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className={`settings-nav__item ${activeSection === item.id ? "settings-nav__item--active" : ""}`}
                onClick={() => setActiveSection(item.id)}
                aria-current={activeSection === item.id ? "page" : undefined}
              >
                <span className="settings-nav__number">0{index + 1}</span>
                <span className="settings-nav__text">
                  <strong>{item.label}</strong>
                  <small>{item.caption}</small>
                </span>
                <span className="settings-nav__arrow" aria-hidden="true">›</span>
              </button>
            ))}
            <div className="settings-device-card">
              <span className="settings-device-card__dot" />
              <span><strong>RaceBoxd mobile</strong><small>Settings sync on this device</small></span>
            </div>
          </nav>

          <div className="settings-content">
            <div className="settings-content__intro">
              <span className="settings-eyebrow">PREFERENCES / 0{sections.findIndex((item) => item.id === activeSection) + 1}</span>
              <h3>{section.label}</h3>
              <p>{section.caption} — make RaceBoxd work your way.</p>
            </div>

            {activeSection === "general" && (
              <div className="settings-group">
                <p className="settings-group__label">RACE LOG</p>
                <SettingSelect title="Measurement units" description="Choose how distances and speeds appear" value={settings.units} options={[{ value: "metric", label: "Metric · km" }, { value: "imperial", label: "Imperial · mi" }]} onChange={(value) => updateSetting("units", value)} />
                <SettingToggle title="Auto-save reviews" description="Keep your race verdicts saved as you go" checked={settings.autoSave} onChange={(value) => updateSetting("autoSave", value)} />
              </div>
            )}

            {activeSection === "display" && (
              <div className="settings-group">
                <p className="settings-group__label">INTERFACE</p>
                <SettingSelect title="Appearance" description="Match your device or set a fixed look" value={settings.appearance} options={[{ value: "system", label: "System" }, { value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} onChange={(value) => updateSetting("appearance", value)} />
                <SettingSelect title="List density" description="Fit more race weekends on screen" value={settings.density} options={[{ value: "comfortable", label: "Comfortable" }, { value: "compact", label: "Compact" }]} onChange={(value) => updateSetting("density", value)} />
              </div>
            )}

            {activeSection === "mobile" && (
              <div className="settings-group">
                <p className="settings-group__label">PHONE EXPERIENCE</p>
                <SettingToggle title="Haptic feedback" description="Vibrate lightly when you rate a race" checked={settings.haptics} onChange={(value) => updateSetting("haptics", value)} />
                <SettingToggle title="Interface sounds" description="Play subtle sounds for key actions" checked={settings.sounds} onChange={(value) => updateSetting("sounds", value)} />
                <SettingToggle title="Keep screen awake" description="Prevent dimming while you write a review" checked={settings.keepAwake} onChange={(value) => updateSetting("keepAwake", value)} />
                <div className="settings-note"><span aria-hidden="true">i</span><p>Mobile preferences are saved on this device. Screen wake and haptics depend on browser support.</p></div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="settings-group">
                <p className="settings-group__label">YOUR RACE CALENDAR</p>
                <SettingToggle title="Race weekend reminders" description="Get a nudge before lights out" checked={settings.raceReminders} onChange={(value) => updateSetting("raceReminders", value)} />
                <SettingToggle title="Season updates" description="Hear when a new calendar is available" checked={settings.seasonUpdates} onChange={(value) => updateSetting("seasonUpdates", value)} />
                <div className="settings-note"><span aria-hidden="true">i</span><p>Browser notifications can be enabled when notification delivery is connected.</p></div>
              </div>
            )}

            {activeSection === "privacy" && (
              <div className="settings-group">
                <p className="settings-group__label">PROFILE & DATA</p>
                <SettingToggle title="Private profile" description="Keep your race journal visible only to you" checked={settings.privateProfile} onChange={(value) => updateSetting("privateProfile", value)} />
                <div className="settings-reset">
                  <span><strong>Reset preferences</strong><small>Restore the original RaceBoxd settings</small></span>
                  <button type="button" onClick={resetSettings}>Reset</button>
                </div>
              </div>
            )}

            <footer className="settings-footer">
              <span><span className="settings-footer__status" /> ALL CHANGES SAVED</span>
              <button type="button" onClick={onClose}>Done <span aria-hidden="true">→</span></button>
            </footer>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AppSettings;
