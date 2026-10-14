import asyncio
import os
import time
import random
from typing import List, Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psutil

app = FastAPI(title="PulseZero Telemetry & AI Swarm Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Simulation & System State
swarm_agents = [
    {
        "id": "sentinel",
        "name": "Sentinel-01",
        "role": "Perimeter & Network Guard",
        "status": "MONITORING",
        "load": 28,
        "avatar": "shield",
        "thought": "Network boundaries secure. Monitoring packet dispersion.",
    },
    {
        "id": "cipher",
        "name": "Cipher-X",
        "role": "Cryptographic Integrity",
        "status": "MONITORING",
        "load": 15,
        "avatar": "lock",
        "thought": "SHA-512 memory hashes intact. No tampering detected.",
    },
    {
        "id": "recon",
        "name": "Recon-Vector",
        "role": "Heuristic Anomaly Scanner",
        "status": "ANALYZING",
        "load": 42,
        "avatar": "eye",
        "thought": "Scanning background daemon threads for behavioral deviations.",
    },
    {
        "id": "arbiter",
        "name": "Arbiter-Prime",
        "role": "Policy Enforcement & Dispatch",
        "status": "MONITORING",
        "load": 19,
        "avatar": "cpu",
        "thought": "All automated compliance protocols within nominal thresholds.",
    },
    {
        "id": "orion",
        "name": "Orion-Predictive",
        "role": "Threat Forecasting Engine",
        "status": "MONITORING",
        "load": 34,
        "avatar": "activity",
        "thought": "Projecting attack surface vectors for next 300 seconds.",
    },
]

simulated_events: List[Dict[str, Any]] = [
    {"timestamp": time.strftime("%H:%M:%S"), "source": "SYSTEM", "level": "INFO", "text": "PulseZero Core Engine initialized."},
    {"timestamp": time.strftime("%H:%M:%S"), "source": "SWARM", "level": "INFO", "text": "5 autonomous subagents synced to local kernel."},
]

active_threat: Dict[str, Any] = {
    "active": False,
    "name": "None",
    "severity": "NOMINAL",
    "origin": "N/A",
    "threat_score": 3,
}

last_net_io = psutil.net_io_counters()
last_net_time = time.time()

def get_system_vitals():
    global last_net_io, last_net_time
    now = time.time()
    elapsed = max(0.1, now - last_net_time)
    
    curr_net = psutil.net_io_counters()
    bytes_sent_rate = (curr_net.bytes_sent - last_net_io.bytes_sent) / elapsed
    bytes_recv_rate = (curr_net.bytes_recv - last_net_io.bytes_recv) / elapsed
    last_net_io = curr_net
    last_net_time = now

    cpu_percent = psutil.cpu_percent(interval=None)
    cpu_cores = psutil.cpu_percent(interval=None, percpu=True)
    memory = psutil.virtual_memory()
    
    try:
        disk = psutil.disk_usage('C:\\')
    except Exception:
        disk = psutil.disk_usage('/')

    # Top 5 processes by memory usage
    procs = []
    for p in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
        try:
            info = p.info
            mem_mb = round((info['memory_info'].rss or 0) / (1024 * 1024), 1)
            procs.append({
                "pid": info['pid'],
                "name": info['name'] or "Unknown",
                "cpu": info['cpu_percent'] or 0.0,
                "memory_mb": mem_mb,
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    procs.sort(key=lambda x: x['memory_mb'], reverse=True)
    top_procs = procs[:6]

    return {
        "cpu": {
            "total_percent": cpu_percent,
            "cores": cpu_cores,
            "core_count": len(cpu_cores)
        },
        "memory": {
            "total_gb": round(memory.total / (1024**3), 2),
            "used_gb": round(memory.used / (1024**3), 2),
            "percent": memory.percent
        },
        "disk": {
            "total_gb": round(disk.total / (1024**3), 2),
            "used_gb": round(disk.used / (1024**3), 2),
            "percent": disk.percent
        },
        "network": {
            "kb_sent_sec": round(bytes_sent_rate / 1024, 1),
            "kb_recv_sec": round(bytes_recv_rate / 1024, 1)
        },
        "processes": top_procs
    }

def update_agent_simulation():
    global active_threat, swarm_agents, simulated_events

    if active_threat["active"]:
        # Threat in progress
        for agent in swarm_agents:
            agent["load"] = min(98, agent["load"] + random.randint(2, 6))
            if agent["id"] == "recon":
                agent["status"] = "ISOLATING_VECTOR"
                agent["thought"] = f"Tracing anomaly payload signature ({active_threat['name']})."
            elif agent["id"] == "sentinel":
                agent["status"] = "SHIELD_REINFORCED"
                agent["thought"] = "Rerouting compromised sockets to containment sandbox."
            elif agent["id"] == "arbiter":
                agent["status"] = "COUNTERMEASURE_ENGAGED"
                agent["thought"] = "Awaiting operator authorization or autonomous purge trigger."
            elif agent["id"] == "cipher":
                agent["status"] = "RE_KEYING"
                agent["thought"] = "Rotating cryptographic keys to neutralize injection."
            elif agent["id"] == "orion":
                agent["status"] = "SIMULATING_DAMAGE"
                agent["thought"] = "Worst-case impact scenario: bounded to 4.2% data entropy."
    else:
        # Nominal / Peaceful operations
        idle_thoughts = {
            "sentinel": [
                "Zero ingress violations on encrypted ports.",
                "Listening for asynchronous port scans.",
                "Stateful packet inspection active.",
            ],
            "cipher": [
                "Local entropy pool verified and refreshed.",
                "Key derivation function rounds verified.",
                "Memory heap scrubbed of stale credentials.",
            ],
            "recon": [
                "Deep behavioral audit completed. Variance: 0.02%.",
                "Watching background daemons for abnormal memory growth.",
                "Kernel syscall traces within expected latency.",
            ],
            "arbiter": [
                "Consensus model operational across subagents.",
                "Ready to dispatch autonomous mitigation protocols.",
                "All security rules synchronized.",
            ],
            "orion": [
                "Long-range heuristic probability: 99.4% stability.",
                "No abnormal anomaly vectors predicted for next 10m.",
                "Telemetry telemetry models calibrated.",
            ]
        }
        for agent in swarm_agents:
            agent["load"] = max(12, min(55, agent["load"] + random.randint(-4, 4)))
            if random.random() < 0.25:
                agent["thought"] = random.choice(idle_thoughts[agent["id"]])
                agent["status"] = "MONITORING" if random.random() < 0.8 else "ANALYZING"

@app.websocket("/ws")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            update_agent_simulation()
            vitals = get_system_vitals()
            
            payload = {
                "timestamp": time.strftime("%H:%M:%S"),
                "vitals": vitals,
                "swarm": swarm_agents,
                "threat": active_threat,
                "events": simulated_events[-20:] # latest 20 events
            }
            await websocket.send_json(payload)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WS error: {e}")

class StressRequest(BaseModel):
    threat_type: str = "SYN_FLOOD_ANOMALY"

@app.post("/api/stress")
def trigger_stress(req: StressRequest):
    global active_threat, simulated_events
    active_threat = {
        "active": True,
        "name": req.threat_type,
        "severity": "CRITICAL",
        "origin": f"192.168.1.{random.randint(100, 240)}",
        "threat_score": random.randint(84, 98),
    }
    event = {
        "timestamp": time.strftime("%H:%M:%S"),
        "source": "THREAT_DETECTOR",
        "level": "CRITICAL",
        "text": f"ALERT: Hostile anomaly detected: {req.threat_type} from {active_threat['origin']}!",
    }
    simulated_events.append(event)
    return {"status": "Anomaly Triggered", "threat": active_threat}

@app.post("/api/mitigate")
def trigger_mitigate():
    global active_threat, simulated_events, swarm_agents
    threat_name = active_threat["name"]
    active_threat = {
        "active": False,
        "name": "None",
        "severity": "NOMINAL",
        "origin": "N/A",
        "threat_score": 2,
    }
    for agent in swarm_agents:
        agent["status"] = "SECURED"
        agent["load"] = random.randint(18, 25)
        agent["thought"] = "Threat neutralized. Host telemetry restored to equilibrium."
        
    event = {
        "timestamp": time.strftime("%H:%M:%S"),
        "source": "SWARM_DISPATCH",
        "level": "SUCCESS",
        "text": f"Autonomous countermeasures deployed: {threat_name} neutralized successfully.",
    }
    simulated_events.append(event)
    return {"status": "Mitigated", "message": f"{threat_name} resolved."}

class KillRequest(BaseModel):
    pid: int

@app.post("/api/kill-proc")
def kill_process(req: KillRequest):
    global simulated_events
    try:
        proc = psutil.Process(req.pid)
        proc_name = proc.name()
        proc.terminate()
        event = {
            "timestamp": time.strftime("%H:%M:%S"),
            "source": "KERNEL_EXEC",
            "level": "WARNING",
            "text": f"Process terminated by operator: {proc_name} (PID: {req.pid})",
        }
        simulated_events.append(event)
        return {"status": "success", "message": f"Killed {proc_name} ({req.pid})"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/dossier")
def get_dossier():
    return {
        "title": "PULSEZERO AUTOMATED INCIDENT DOSSIER",
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "system_status": "OPERATIONAL",
        "threat_status": active_threat,
        "subagents": swarm_agents,
        "audit_hash": f"SHA256-{hex(abs(hash(str(time.time()))))[2:].upper()}"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
