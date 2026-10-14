# PULSEZERO // AUTONOMOUS AI WAR-ROOM

A real-time cyberpunk command center and telemetry orchestrator built end-to-end with Antigravity.

## Architecture

- **Backend:** Python FastAPI + psutil + WebSockets (`http://127.0.0.1:8000`)
  - Live hardware vitals (CPU per core, RAM, C:\ Disk, Network KB/s, Running Processes)
  - Simulated 5-agent AI Swarm (Sentinel, Cipher, Recon, Arbiter, Orion)
  - Interactive REST APIs for anomaly injection, threat mitigation, and process termination.
- **Frontend:** React 19 + Vite + Lucide Icons + Canvas Radar + Oscilloscope (`http://127.0.0.1:5173`)
  - Glassmorphic dark cyberpunk interface with Orbitron & JetBrains Mono typography.
  - Procedural Web Audio API sound synthesizer (mechanical clicks, alarm siren, victory fanfare).
  - Sweeping canvas radar and live digital waveform oscilloscope.
  - Confetti celebration on successful mitigation.

## Running

The system is currently active in your background. Open:
**[http://localhost:5173](http://localhost:5173)**

To launch again in the future:
```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\user\.gemini\antigravity\scratch\pulsezero\start.ps1
```
