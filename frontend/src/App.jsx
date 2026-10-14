import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Shield,
  Lock,
  Eye,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  VolumeX,
  FileText,
  Zap,
  Terminal,
  Crosshair,
  Server,
  X,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Radar from './Radar';
import Oscilloscope from './Oscilloscope';
import { playBlip, playAlert, playSuccess, toggleSound, isSoundEnabled } from './audio';

const BACKEND_URL = 'http://127.0.0.1:8000';
const WS_URL = 'ws://127.0.0.1:8000/ws';

export default function App() {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [dossierOpen, setDossierOpen] = useState(false);
  const [dossierData, setDossierData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const logContainerRef = useRef(null);
  const prevThreatRef = useRef(false);

  // Hybrid Cloud Simulation & WebSocket Connection
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;
    let simInterval = null;

    // Simulation loop for Cloud / Standalone Deployment
    const startCloudSimulation = () => {
      if (simInterval) return;
      simInterval = setInterval(() => {
        setData((prev) => {
          const isThreat = prev?.threat?.active || false;
          const threatName = prev?.threat?.name || 'None';

          const newCpuTotal = isThreat
            ? Math.floor(Math.random() * 25 + 72)
            : Math.floor(Math.random() * 15 + 18);

          const newCores = [
            Math.floor(Math.random() * 20 + (isThreat ? 65 : 15)),
            Math.floor(Math.random() * 25 + (isThreat ? 70 : 18)),
            Math.floor(Math.random() * 20 + (isThreat ? 60 : 12)),
            Math.floor(Math.random() * 30 + (isThreat ? 75 : 22)),
          ];

          const idleThoughts = [
            "SHA-512 memory hashes intact. No tampering detected.",
            "Deep behavioral audit completed. Variance: 0.02%.",
            "Stateful packet inspection active.",
            "Consensus model operational across subagents.",
            "Long-range heuristic probability: 99.4% stability.",
            "Telemetry telemetry models calibrated.",
            "Listening for asynchronous port scans."
          ];

          const agents = (prev?.swarm && prev.swarm.length > 0) ? prev.swarm : [
            { id: 'sentinel', name: 'Sentinel-01', role: 'Perimeter & Network Guard', status: 'MONITORING', load: 24, thought: 'Network boundaries secure. Monitoring packet dispersion.' },
            { id: 'cipher', name: 'Cipher-X', role: 'Cryptographic Integrity', status: 'MONITORING', load: 15, thought: 'SHA-512 memory hashes intact. No tampering detected.' },
            { id: 'recon', name: 'Recon-Vector', role: 'Heuristic Anomaly Scanner', status: 'ANALYZING', load: 42, thought: 'Scanning background daemon threads for behavioral deviations.' },
            { id: 'arbiter', name: 'Arbiter-Prime', role: 'Policy Enforcement & Dispatch', status: 'MONITORING', load: 19, thought: 'All automated compliance protocols within nominal thresholds.' },
            { id: 'orion', name: 'Orion-Predictive', role: 'Threat Forecasting Engine', status: 'MONITORING', load: 34, thought: 'Projecting attack surface vectors for next 300 seconds.' }
          ];

          const updatedSwarm = agents.map((ag) => {
            if (isThreat) {
              return {
                ...ag,
                load: Math.min(98, ag.load + Math.floor(Math.random() * 4 + 2)),
                status: ag.id === 'sentinel' ? 'SHIELD_REINFORCED' : ag.id === 'recon' ? 'ISOLATING_VECTOR' : 'COUNTERMEASURE_ENGAGED',
                thought: `Autonomous containment engaged against ${threatName}.`
              };
            } else {
              return {
                ...ag,
                load: Math.max(12, Math.min(55, ag.load + Math.floor(Math.random() * 7 - 3))),
                status: Math.random() < 0.8 ? 'MONITORING' : 'ANALYZING',
                thought: Math.random() < 0.3 ? idleThoughts[Math.floor(Math.random() * idleThoughts.length)] : ag.thought
              };
            }
          });

          const nowStr = new Date().toLocaleTimeString();
          const prevEvents = prev?.events || [
            { timestamp: nowStr, source: 'CLOUD_CORE', level: 'INFO', text: 'PulseZero Cloud Node initialized.' }
          ];

          return {
            timestamp: nowStr,
            vitals: {
              cpu: { total_percent: newCpuTotal, cores: newCores, core_count: 4 },
              memory: { total_gb: 16.0, used_gb: isThreat ? 11.2 : 6.8, percent: isThreat ? 70 : 42.5 },
              disk: { total_gb: 512.0, used_gb: 194.2, percent: 38.0 },
              network: {
                kb_sent_sec: Math.floor(Math.random() * 25 + (isThreat ? 280 : 18)),
                kb_recv_sec: Math.floor(Math.random() * 60 + (isThreat ? 640 : 85))
              },
              processes: prev?.vitals?.processes || [
                { pid: 4120, name: 'node.exe', cpu: 2.1, memory_mb: 184.2 },
                { pid: 8840, name: 'chrome.exe', cpu: 3.4, memory_mb: 612.0 },
                { pid: 1042, name: 'system_core.dll', cpu: 0.8, memory_mb: 95.4 },
                { pid: 6532, name: 'pulse_engine.exe', cpu: 1.5, memory_mb: 142.8 },
                { pid: 3204, name: 'explorer.exe', cpu: 0.4, memory_mb: 88.0 }
              ]
            },
            swarm: updatedSwarm,
            threat: prev?.threat || { active: false, name: 'None', severity: 'NOMINAL', threat_score: 3 },
            events: prevEvents.slice(-20)
          };
        });
      }, 1000);
    };

    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          setConnected(true);
          if (simInterval) {
            clearInterval(simInterval);
            simInterval = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            setData(payload);

            if (payload.threat?.active && !prevThreatRef.current) {
              playAlert();
            }
            prevThreatRef.current = !!payload.threat?.active;
          } catch (err) {
            console.error('Parse error:', err);
          }
        };

        ws.onclose = () => {
          setConnected(false);
          startCloudSimulation();
          reconnectTimeout = setTimeout(connect, 3500);
        };

        ws.onerror = () => {
          setConnected(false);
          startCloudSimulation();
          ws.close();
        };
      } catch (err) {
        setConnected(false);
        startCloudSimulation();
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (simInterval) clearInterval(simInterval);
    };
  }, []);

  // Auto-scroll terminal log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [data?.events]);

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    if (newState) playBlip();
  };

  const handleTriggerAnomaly = async () => {
    playBlip();
    setActionLoading(true);
    if (connected) {
      try {
        await fetch(`${BACKEND_URL}/api/stress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ threat_type: 'SYN_NEURAL_OVERDRIVE' }),
        });
        playAlert();
      } catch (err) {
        console.error(err);
      } finally {
        setActionLoading(false);
      }
    } else {
      // Cloud Standalone Simulation
      setData((prev) => ({
        ...prev,
        threat: {
          active: true,
          name: 'SYN_NEURAL_OVERDRIVE',
          severity: 'CRITICAL',
          origin: '192.168.1.189',
          threat_score: 94
        },
        events: [
          ...(prev?.events || []),
          {
            timestamp: new Date().toLocaleTimeString(),
            source: 'CLOUD_SENTINEL',
            level: 'CRITICAL',
            text: 'ALERT: Simulated anomaly triggered: SYN_NEURAL_OVERDRIVE from 192.168.1.189'
          }
        ]
      }));
      playAlert();
      setActionLoading(false);
    }
  };

  const handleMitigate = async () => {
    playBlip();
    setActionLoading(true);
    if (connected) {
      try {
        await fetch(`${BACKEND_URL}/api/mitigate`, { method: 'POST' });
        playSuccess();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#00ff88', '#a855f7'],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setActionLoading(false);
      }
    } else {
      // Cloud Standalone Simulation
      setData((prev) => ({
        ...prev,
        threat: {
          active: false,
          name: 'None',
          severity: 'NOMINAL',
          threat_score: 2
        },
        events: [
          ...(prev?.events || []),
          {
            timestamp: new Date().toLocaleTimeString(),
            source: 'SWARM_DISPATCH',
            level: 'SUCCESS',
            text: 'Countermeasures deployed: SYN_NEURAL_OVERDRIVE neutralized. Telemetry nominal.'
          }
        ]
      }));
      playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#00ff88', '#a855f7'],
      });
      setActionLoading(false);
    }
  };

  const handleKillProcess = async (pid) => {
    playBlip();
    if (connected) {
      try {
        await fetch(`${BACKEND_URL}/api/kill-proc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pid }),
        });
        playSuccess();
      } catch (err) {
        alert('Could not terminate process. (Access Denied or System Protected)');
      }
    } else {
      // Cloud Standalone Simulation
      setData((prev) => ({
        ...prev,
        vitals: {
          ...prev?.vitals,
          processes: (prev?.vitals?.processes || []).filter((p) => p.pid !== pid)
        },
        events: [
          ...(prev?.events || []),
          {
            timestamp: new Date().toLocaleTimeString(),
            source: 'CLOUD_KERNEL',
            level: 'WARNING',
            text: `Process terminated by operator: PID #${pid}`
          }
        ]
      }));
      playSuccess();
    }
  };

  const openDossier = async () => {
    playBlip();
    if (connected) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/dossier`);
        const json = await res.json();
        setDossierData(json);
        setDossierOpen(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      // Cloud Standalone Mock
      setDossierData({
        title: "PULSEZERO CLOUD INCIDENT DOSSIER",
        generated_at: new Date().toLocaleString(),
        system_status: "OPERATIONAL",
        threat_status: data?.threat || { active: false, name: "None", severity: "NOMINAL" },
        subagents: data?.swarm || [],
        audit_hash: `SHA256-CLOUD-${Math.random().toString(16).substring(2, 10).toUpperCase()}`
      });
      setDossierOpen(true);
    }
  };

  // Safe vitals fallback
  const vitals = data?.vitals || {
    cpu: { total_percent: 18, cores: [12, 24, 15, 30], core_count: 4 },
    memory: { total_gb: 16.0, used_gb: 7.4, percent: 46.2 },
    disk: { total_gb: 512.0, used_gb: 210.0, percent: 41.0 },
    network: { kb_sent_sec: 14.2, kb_recv_sec: 84.6 },
    processes: [],
  };

  const swarm = data?.swarm || [];
  const threat = data?.threat || { active: false, name: 'None', severity: 'NOMINAL', threat_score: 3 };
  const events = data?.events || [];

  const getAgentIcon = (id) => {
    switch (id) {
      case 'sentinel': return <Shield size={18} className="text-cyan" />;
      case 'cipher': return <Lock size={18} className="text-purple" />;
      case 'recon': return <Eye size={18} className="text-emerald" />;
      case 'arbiter': return <Cpu size={18} className="text-amber" />;
      case 'orion': return <Activity size={18} className="text-cyan" />;
      default: return <Server size={18} className="text-cyan" />;
    }
  };

  return (
    <div className={`app-root ${threat.active ? 'threat-mode' : ''}`}>
      {/* Background glow effects */}
      <div className="ambient-glow ambient-cyan"></div>
      <div className="ambient-glow ambient-magenta"></div>

      {/* TOP COMMAND BAR */}
      <header className="top-bar">
        <div className="brand-group">
          <div className="logo-pulse">
            <Crosshair size={22} className="logo-icon spin-slow" />
          </div>
          <div>
            <div className="brand-title">PULSEZERO // WAR-ROOM</div>
            <div className="brand-subtitle">AUTONOMOUS AGENT ORCHESTRATOR & KERNEL TELEMETRY</div>
          </div>
        </div>

        <div className="header-status-group">
          {/* Connection state */}
          <div className={`status-pill ${connected ? 'online' : 'cloud-mode'}`}>
            <span className="dot"></span>
            <span>{connected ? 'WS://CONNECTED (127.0.0.1)' : 'STANDALONE CLOUD NODE'}</span>
          </div>

          {/* Threat severity pill */}
          <div className={`threat-pill ${threat.active ? 'danger' : 'nominal'}`}>
            {threat.active ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
            <span>{threat.active ? `CRITICAL: ${threat.name}` : 'STATUS: NOMINAL'}</span>
          </div>

          {/* Audio toggle */}
          <button className="icon-btn" onClick={handleSoundToggle} title="Toggle Audio Feedback">
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Actions */}
          <button
            className="action-btn danger-btn"
            onClick={handleTriggerAnomaly}
            disabled={actionLoading || threat.active}
            onMouseEnter={playBlip}
          >
            <Zap size={15} />
            <span>TRIGGER ANOMALY</span>
          </button>

          <button
            className="action-btn success-btn"
            onClick={handleMitigate}
            disabled={actionLoading || !threat.active}
            onMouseEnter={playBlip}
          >
            <Shield size={15} />
            <span>DEPLOY MITIGATION</span>
          </button>

          <button className="action-btn secondary-btn" onClick={openDossier} onMouseEnter={playBlip}>
            <FileText size={15} />
            <span>DOSSIER</span>
          </button>
        </div>
      </header>

      {/* MAIN TELEMETRY GRID */}
      <main className="dashboard-grid">
        {/* ROW 1: REAL HARDWARE VITALS */}
        <section className="panel vitals-panel">
          <div className="panel-title-bar">
            <div className="flex-row items-center gap-2">
              <Cpu size={16} className="text-cyan" />
              <span>LIVE HARDWARE VITALS (WINDOWS KERNEL)</span>
            </div>
            <span className="badge-tag">REAL-TIME</span>
          </div>

          <div className="vitals-grid">
            {/* CPU Metric Card */}
            <div className="vital-card">
              <div className="vital-head">
                <span className="vital-name">CPU USAGE</span>
                <span className="vital-val text-cyan">{vitals.cpu.total_percent}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill cyan-fill"
                  style={{ width: `${Math.min(100, vitals.cpu.total_percent)}%` }}
                ></div>
              </div>
              <div className="cores-matrix">
                {vitals.cpu.cores.slice(0, 8).map((coreLoad, idx) => (
                  <div key={idx} className="core-bar-wrapper" title={`Core ${idx}: ${coreLoad}%`}>
                    <div className="core-bar" style={{ height: `${Math.max(10, coreLoad)}%` }}></div>
                    <span className="core-idx">C{idx}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RAM Metric Card */}
            <div className="vital-card">
              <div className="vital-head">
                <span className="vital-name">MEMORY (RAM)</span>
                <span className="vital-val text-emerald">{vitals.memory.percent}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill emerald-fill"
                  style={{ width: `${Math.min(100, vitals.memory.percent)}%` }}
                ></div>
              </div>
              <div className="vital-subtext">
                <span>{vitals.memory.used_gb} GB</span>
                <span>/ {vitals.memory.total_gb} GB TOTAL</span>
              </div>
            </div>

            {/* DISK C: Card */}
            <div className="vital-card">
              <div className="vital-head">
                <span className="vital-name">STORAGE (C:\)</span>
                <span className="vital-val text-purple">{vitals.disk.percent}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill purple-fill"
                  style={{ width: `${Math.min(100, vitals.disk.percent)}%` }}
                ></div>
              </div>
              <div className="vital-subtext">
                <span>{vitals.disk.used_gb} GB USED</span>
                <span>/ {vitals.disk.total_gb} GB</span>
              </div>
            </div>

            {/* Network Throughput */}
            <div className="vital-card">
              <div className="vital-head">
                <span className="vital-name">NETWORK I/O</span>
                <span className="vital-val text-amber">{vitals.network.kb_recv_sec} KB/s</span>
              </div>
              <div className="net-stats">
                <div className="net-row">
                  <span className="net-tag">▼ INGRESS:</span>
                  <span className="net-num">{vitals.network.kb_recv_sec} KB/s</span>
                </div>
                <div className="net-row">
                  <span className="net-tag">▲ EGRESS:</span>
                  <span className="net-num">{vitals.network.kb_sent_sec} KB/s</span>
                </div>
              </div>
              <Oscilloscope
                val={Math.min(100, vitals.network.kb_recv_sec / 2)}
                label="TELEMETRY WAVEFORM"
                color="#00f0ff"
              />
            </div>
          </div>
        </section>

        {/* ROW 2: AUTONOMOUS AGENT SWARM */}
        <section className="panel swarm-panel">
          <div className="panel-title-bar">
            <div className="flex-row items-center gap-2">
              <Activity size={16} className="text-cyan" />
              <span>AUTONOMOUS AGENT MATRIX (5 SUBAGENTS COOPERATING)</span>
            </div>
            <div className="flex-row items-center gap-2">
              <span className="swarm-ping">LATENCY: 1.2ms</span>
              <span className="badge-tag">SWARM MESH</span>
            </div>
          </div>

          <div className="swarm-grid">
            {swarm.map((agent) => (
              <div key={agent.id} className={`agent-card ${agent.status.includes('THREAT') || agent.status.includes('SHIELD') ? 'agent-alert' : ''}`}>
                <div className="agent-top">
                  <div className="agent-avatar-wrap">
                    {getAgentIcon(agent.id)}
                  </div>
                  <div>
                    <div className="agent-name">{agent.name}</div>
                    <div className="agent-role">{agent.role}</div>
                  </div>
                </div>

                <div className="agent-status-badge">
                  <span className="agent-pulse-dot"></span>
                  <span className="agent-status-text">{agent.status}</span>
                  <span className="agent-load-badge">{agent.load}% LOAD</span>
                </div>

                <div className="progress-track agent-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${agent.load}%`,
                      backgroundColor: agent.load > 75 ? '#ff2a5f' : '#00f0ff',
                    }}
                  ></div>
                </div>

                <div className="agent-thought-box">
                  <span className="thought-arrow">▶</span>
                  <span className="thought-text">{agent.thought}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ROW 3: RADAR & SCROLLING TELEMETRY LOG */}
        <div className="split-row">
          {/* Tactical Radar */}
          <div className="panel radar-panel-box">
            <Radar activeThreat={threat} />
          </div>

          {/* Scrolling Terminal Telemetry Log */}
          <div className="panel terminal-panel">
            <div className="panel-title-bar">
              <div className="flex-row items-center gap-2">
                <Terminal size={16} className="text-emerald" />
                <span>REAL-TIME KERNEL & SWARM LOG STREAM</span>
              </div>
              <span className="badge-tag live-blink">LIVE POOL</span>
            </div>

            <div className="terminal-logs" ref={logContainerRef}>
              {events.map((evt, i) => (
                <div key={i} className={`log-line log-${evt.level.toLowerCase()}`}>
                  <span className="log-time">[{evt.timestamp}]</span>
                  <span className={`log-badge badge-${evt.level.toLowerCase()}`}>{evt.source}</span>
                  <span className="log-text">{evt.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 4: REAL WINDOWS RUNNING PROCESSES */}
        <section className="panel process-panel">
          <div className="panel-title-bar">
            <div className="flex-row items-center gap-2">
              <Server size={16} className="text-cyan" />
              <span>ACTIVE SYSTEM PROCESSES (LIVE ON YOUR PC)</span>
            </div>
            <span className="badge-tag">KERNEL DISPATCH</span>
          </div>

          <div className="table-responsive">
            <table className="proc-table">
              <thead>
                <tr>
                  <th>PID</th>
                  <th>PROCESS NAME</th>
                  <th>CPU LOAD</th>
                  <th>MEMORY (RAM)</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {vitals.processes.map((p) => (
                  <tr key={p.pid}>
                    <td className="proc-pid">#{p.pid}</td>
                    <td className="proc-name">{p.name}</td>
                    <td className="proc-cpu">{p.cpu}%</td>
                    <td className="proc-mem">{p.memory_mb} MB</td>
                    <td>
                      <button
                        className="kill-btn"
                        onClick={() => handleKillProcess(p.pid)}
                        title="Terminate Process"
                        onMouseEnter={playBlip}
                      >
                        KILL
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* DOSSIER MODAL */}
      {dossierOpen && dossierData && (
        <div className="modal-backdrop" onClick={() => setDossierOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex-row items-center gap-2">
                <FileText size={18} className="text-cyan" />
                <span className="modal-title">{dossierData.title}</span>
              </div>
              <button className="icon-btn" onClick={() => setDossierOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="dossier-meta">
                <div><strong>TIMESTAMP:</strong> {dossierData.generated_at}</div>
                <div><strong>AUDIT HASH:</strong> <span className="text-cyan">{dossierData.audit_hash}</span></div>
                <div><strong>SYSTEM STATUS:</strong> <span className="text-emerald">{dossierData.system_status}</span></div>
              </div>

              <div className="dossier-section-title">ACTIVE SUBAGENT REPUTATION SCORECARD</div>
              <div className="dossier-agent-list">
                {dossierData.subagents.map((ag) => (
                  <div key={ag.id} className="dossier-agent-row">
                    <div>
                      <strong>{ag.name}</strong> ({ag.role})
                    </div>
                    <div className="text-cyan">{ag.status} // {ag.load}% LOAD</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="action-btn success-btn"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(dossierData, null, 2));
                  alert('Dossier copied to clipboard!');
                }}
              >
                COPY JSON DOSSIER
              </button>
              <button className="action-btn secondary-btn" onClick={() => setDossierOpen(false)}>
                DISMISS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
