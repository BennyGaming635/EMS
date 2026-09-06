"use client";

import { useEffect, useMemo, useState } from "react";

type Domain = "Emergency" | "Vehicle" | "911 Call";
type Priority = "Critical" | "High" | "Medium";

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
  },
];

const DOMAIN_FILTERS: Array<"All" | Domain> = ["All", "Emergency", "Vehicle", "911 Call"];
const PRIORITY_FILTERS: Array<"All" | Priority> = ["All", "Critical", "High", "Medium"];

function minutesAgo(iso: string): number {
  return Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}

export default function Home() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [domain, setDomain] = useState<"All" | Domain>("All");
  const [priority, setPriority] = useState<"All" | Priority>("All");
  const [search, setSearch] = useState("");
  const [lastSync, setLastSync] = useState(new Date());
  const [feed, setFeed] = useState<string[]>([
    "System online. Monitoring emergency, vehicle, and call channels.",
  ]);

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
    </div>
  );
}
