"use client";

import { useEffect, useMemo, useState } from "react";

type Domain = "Emergency" | "Vehicle" | "911 Call";
type Priority = "Critical" | "High" | "Medium";
type CallScenario = "Medical" | "Fire" | "Crime" | "Traffic";

type Item = {
  id: string;
  domain: Domain;
  title: string;
  location: string;
  owner: string;
  status: string;
  priority: Priority;
  updatedAt: string;
  details: string;
  callScenario?: CallScenario;
};

const INITIAL_ITEMS: Item[] = [
  {
    id: "EM-2401",
    domain: "Emergency",
    title: "Bushfire front near township",
    location: "Traralgon",
    owner: "Ops Alpha",
    status: "Containment active",
    priority: "Critical",
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    details: "Shelter-in-place notices active for southern blocks.",
  },
  {
    id: "EM-2402",
    domain: "Emergency",
    title: "Flash flood watch",
    location: "Bendigo",
    owner: "Ops Delta",
    status: "Monitoring rainfall",
    priority: "High",
    updatedAt: new Date(Date.now() - 1000 * 60 * 13).toISOString(),
    details: "Creek levels rising; road closure teams on standby.",
  },
  {
    id: "VH-3321",
    domain: "Vehicle",
    title: "Ambulance dispatch load",
    location: "Metro South",
    owner: "Fleet One",
    status: "8 active units",
    priority: "High",
    updatedAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    details: "High-priority transport queue at 78% capacity.",
  },
  {
    id: "VH-3322",
    domain: "Vehicle",
    title: "Rescue truck maintenance",
    location: "Ballarat Depot",
    owner: "Fleet Three",
    status: "Service in progress",
    priority: "Medium",
    updatedAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    details: "Vehicle expected back online within 45 minutes.",
  },
  {
    id: "C-911-889",
    domain: "911 Call",
    title: "Multi-caller incident",
    location: "Dandenong",
    owner: "Call Team Bravo",
    status: "Units dispatched",
    priority: "Critical",
    updatedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    details: "Three related calls merged and escalated to fire + medical.",
    callScenario: "Fire",
  },
  {
    id: "C-911-890",
    domain: "911 Call",
    title: "Welfare check",
    location: "Geelong",
    owner: "Call Team Echo",
    status: "Awaiting callback",
    priority: "Medium",
    updatedAt: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
    details: "Local patrol assigned for doorstep verification.",
    callScenario: "Medical",
  },
];

const DOMAIN_FILTERS: Array<"All" | Domain> = ["All", "Emergency", "Vehicle", "911 Call"];
const PRIORITY_FILTERS: Array<"All" | Priority> = ["All", "Critical", "High", "Medium"];
const CALL_SCENARIO_QUESTIONS: Record<CallScenario, string[]> = {
  Medical: [
    "Can you tell me if the person is conscious and breathing?",
    "Do you see severe bleeding right now?",
    "Are there any known allergies or medications I should note?",
  ],
  Fire: [
    "What is burning right now and how large is the fire?",
    "Are you and everyone nearby able to move to a safe location?",
    "Do you hear or see any gas leaks, explosions, or trapped people?",
  ],
  Crime: [
    "Are you in immediate danger right now?",
    "Can you describe the suspect and current location?",
    "Do you see weapons or immediate threats nearby?",
  ],
  Traffic: [
    "How many vehicles are involved and is anyone trapped?",
    "Is traffic still moving through the scene?",
    "Do you see fuel leakage, smoke, or fire?",
  ],
};

const CALL_SCENARIO_ACTIONS: Record<CallScenario, string[]> = {
  Medical: [
    "Keep the caller calm and on the line.",
    "Guide basic first aid only if safe.",
    "Confirm exact location and entry access for responders.",
  ],
  Fire: [
    "Instruct evacuation to a safe outdoor area immediately.",
    "Do not allow re-entry into buildings or vehicles.",
    "Ask caller to report changing wind/smoke conditions.",
  ],
  Crime: [
    "Move caller to a hidden or secure location if possible.",
    "Avoid confrontation and keep line open silently if needed.",
    "Capture suspect direction of travel and live landmarks.",
  ],
  Traffic: [
    "Warn caller to stay clear of moving traffic lanes.",
    "Advise hazard lights and scene marking if safe.",
    "Prioritize trapped or unconscious patient details.",
  ],
};

function minutesAgo(iso: string): number {
  return Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}

export default function Home() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [domain, setDomain] = useState<"All" | Domain>("All");
  const [priority, setPriority] = useState<"All" | Priority>("All");
  const [search, setSearch] = useState("");
  const [lastSync, setLastSync] = useState(new Date());
  const callItems = useMemo(() => items.filter((entry) => entry.domain === "911 Call"), [items]);
  const [selectedCallId, setSelectedCallId] = useState("C-911-889");
  const [questionInput, setQuestionInput] = useState("");
  const [callTranscript, setCallTranscript] = useState<string[]>([
    "Operator connected. Confirming location and immediate safety status.",
  ]);
  const [feed, setFeed] = useState<string[]>([
    "System online. Monitoring emergency, vehicle, and call channels.",
  ]);

  const selectedCall =
    callItems.find((entry) => entry.id === selectedCallId) ?? callItems[0];
  const selectedScenario = selectedCall?.callScenario ?? "Medical";

  useEffect(() => {
    const clock = setInterval(() => setLastSync(new Date()), 1000);
    const pulse = setInterval(() => {
      setItems((previous) => {
        const next = previous.map((entry, index) =>
          index === 0 ? { ...entry, updatedAt: new Date().toISOString() } : entry,
        );
        return [next[1], next[2], next[3], next[4], next[5], next[0]];
      });
      setFeed((previous) => {
        const newest = `Auto-sync ${new Date().toLocaleTimeString()} · refreshed live queue`;
        return [newest, ...previous].slice(0, 5);
      });
    }, 9000);

    return () => {
      clearInterval(clock);
      clearInterval(pulse);
    };
  }, []);

  const filtered = useMemo(() => {
    const token = search.trim().toLowerCase();
    return items
      .filter((entry) => domain === "All" || entry.domain === domain)
      .filter((entry) => priority === "All" || entry.priority === priority)
      .filter(
        (entry) =>
          token.length === 0 ||
          entry.title.toLowerCase().includes(token) ||
          entry.location.toLowerCase().includes(token) ||
          entry.id.toLowerCase().includes(token),
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [domain, items, priority, search]);

  const summary = useMemo(
    () => ({
      total: items.length,
      critical: items.filter((entry) => entry.priority === "Critical").length,
      emergency: items.filter((entry) => entry.domain === "Emergency").length,
      vehicles: items.filter((entry) => entry.domain === "Vehicle").length,
      calls: items.filter((entry) => entry.domain === "911 Call").length,
    }),
    [items],
  );

  function addQuestionToTranscript(question: string) {
    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }

    setCallTranscript((previous) => [
      `Operator: ${trimmed}`,
      `Caller: ${selectedCall?.location ?? "Caller location"} confirms and follows directions.`,
      ...previous,
    ].slice(0, 10));
    setFeed((previous) => [
      `911 guidance sent ${new Date().toLocaleTimeString()} · ${selectedCall?.id ?? "Call"} updated`,
      ...previous,
    ].slice(0, 5));
    setQuestionInput("");
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="label">Emergency Operations Hub</p>
          <h1>Adaptive Incident & Dispatch Management</h1>
          <p className="subtitle">Live operations view for emergencies, vehicle fleets, and 911 call workflows.</p>
        </div>
        <div className="sync-box">
          <strong>Live</strong>
          <span>{lastSync.toLocaleString()}</span>
        </div>
      </header>

      <section className="stats-grid" aria-label="Operation summary">
        <article>
          <h2>{summary.total}</h2>
          <p>Total active records</p>
        </article>
        <article>
          <h2>{summary.critical}</h2>
          <p>Critical priority</p>
        </article>
        <article>
          <h2>{summary.emergency}</h2>
          <p>Emergency cases</p>
        </article>
        <article>
          <h2>{summary.vehicles}</h2>
          <p>Vehicle operations</p>
        </article>
        <article>
          <h2>{summary.calls}</h2>
          <p>911 call events</p>
        </article>
      </section>

      <section className="controls" aria-label="Filters">
        <label>
          Search ID, location, title
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Try: Traralgon, VH-3321, flash flood"
          />
        </label>
        <label>
          Domain
          <select value={domain} onChange={(event) => setDomain(event.target.value as "All" | Domain)}>
            {DOMAIN_FILTERS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select value={priority} onChange={(event) => setPriority(event.target.value as "All" | Priority)}>
            {PRIORITY_FILTERS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="main-grid">
        <article className="panel" aria-label="Operations records">
          <h2>Operations queue</h2>
          <ul className="records">
            {filtered.length === 0 ? (
              <li className="empty">No records match your filters.</li>
            ) : (
              filtered.map((entry) => (
                <li key={entry.id} className="record">
                  <div className="record-head">
                    <div>
                      <p className="record-id">
                        {entry.id} · {entry.domain}
                      </p>
                      <h3>{entry.title}</h3>
                    </div>
                    <span className={`priority ${entry.priority.toLowerCase()}`}>{entry.priority}</span>
                  </div>
                  <p className="record-meta">
                    {entry.location} · {entry.owner} · {entry.status} · Updated {minutesAgo(entry.updatedAt)}m ago
                  </p>
                  <p className="record-details">{entry.details}</p>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="panel" aria-label="Activity feed">
          <h2>Live activity</h2>
          <ul className="feed">
            {feed.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
          <div className="actions">
            <button
              type="button"
              onClick={() =>
                setFeed((previous) => [
                  `Manual dispatch sync ${new Date().toLocaleTimeString()} · supervisors notified`,
                  ...previous,
                ].slice(0, 5))
              }
            >
              Trigger dispatch sync
            </button>
            <button
              type="button"
              onClick={() =>
                setFeed((previous) => [
                  `Escalation broadcast ${new Date().toLocaleTimeString()} · cross-team alert sent`,
                  ...previous,
                ].slice(0, 5))
              }
            >
              Send escalation alert
            </button>
          </div>
        </article>
      </section>

      <section className="panel caller-assist" aria-label="911 caller assistance">
        <div className="assist-header">
          <h2>911 Caller Guidance Console</h2>
          <select
            value={selectedCall?.id ?? ""}
            onChange={(event) => setSelectedCallId(event.target.value)}
            aria-label="Select active 911 call"
          >
            {callItems.map((call) => (
              <option key={call.id} value={call.id}>
                {call.id} · {call.location} · {call.title}
              </option>
            ))}
          </select>
        </div>

        <p className="assist-summary">
          Active scenario: <strong>{selectedScenario}</strong> · {selectedCall?.status}
        </p>

        <div className="assist-grid">
          <div>
            <h3>Suggested questions</h3>
            <div className="question-list">
              {CALL_SCENARIO_QUESTIONS[selectedScenario].map((question) => (
                <button key={question} type="button" onClick={() => addQuestionToTranscript(question)}>
                  {question}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3>Immediate operator actions</h3>
            <ul className="action-list">
              {CALL_SCENARIO_ACTIONS[selectedScenario].map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="custom-question">
          <label>
            Ask your own question to caller
            <input
              type="text"
              value={questionInput}
              onChange={(event) => setQuestionInput(event.target.value)}
              placeholder="Type a custom question to guide the caller..."
            />
          </label>
          <button type="button" onClick={() => addQuestionToTranscript(questionInput)}>
            Add to caller transcript
          </button>
        </div>

        <div>
          <h3>Call transcript log</h3>
          <ul className="transcript">
            {callTranscript.map((entry, index) => (
              <li key={`${entry}-${index}`}>{entry}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
