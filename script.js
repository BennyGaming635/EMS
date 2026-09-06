const incidents = [
  {
    id: 1,
    title: "Grass fire near Princes Highway",
    location: "Geelong",
    region: "South West",
    severity: "Watch and Act",
    updatedMinutesAgo: 6,
    advice: "Smoke is moving east. Stay indoors and monitor updates.",
  },
  {
    id: 2,
    title: "Flash flooding risk",
    location: "Bendigo",
    region: "North Central",
    severity: "Advice",
    updatedMinutesAgo: 11,
    advice: "Avoid floodwater crossings and relocate vehicles to higher ground.",
  },
  {
    id: 3,
    title: "Bushfire approaching township",
    location: "Traralgon",
    region: "Gippsland",
    severity: "Emergency Warning",
    updatedMinutesAgo: 3,
    advice: "It is too late to leave. Shelter indoors immediately.",
  },
  {
    id: 4,
    title: "Hazardous wind conditions",
    location: "Ballarat",
    region: "Central",
    severity: "Advice",
    updatedMinutesAgo: 20,
    advice: "Secure loose outdoor items and stay clear of damaged powerlines.",
  },
  {
    id: 5,
    title: "Factory chemical spill",
    location: "Dandenong",
    region: "Metro",
    severity: "Watch and Act",
    updatedMinutesAgo: 8,
    advice: "Avoid the industrial precinct and follow detour signage.",
  },
];

const severityOrder = ["Emergency Warning", "Watch and Act", "Advice"];

const listElement = document.getElementById("incidentList");
const regionGrid = document.getElementById("regionGrid");
const searchInput = document.getElementById("searchInput");
const severityFilter = document.getElementById("severityFilter");
const totalIncidents = document.getElementById("totalIncidents");
const watchActCount = document.getElementById("watchActCount");
const adviceCount = document.getElementById("adviceCount");
const emergencyCount = document.getElementById("emergencyCount");
const lastUpdated = document.getElementById("lastUpdated");

function cssClassFromSeverity(severity) {
  return severity.replace(/\s+/g, "");
}

function filterIncidents() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const selectedSeverity = severityFilter.value;

  return incidents.filter((incident) => {
    const matchesSearch =
      incident.title.toLowerCase().includes(searchValue) ||
      incident.location.toLowerCase().includes(searchValue) ||
      incident.region.toLowerCase().includes(searchValue);
    const matchesSeverity = selectedSeverity === "all" || incident.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });
}

function renderSummary() {
  totalIncidents.textContent = incidents.length;
  watchActCount.textContent = incidents.filter((item) => item.severity === "Watch and Act").length;
  adviceCount.textContent = incidents.filter((item) => item.severity === "Advice").length;
  emergencyCount.textContent = incidents.filter((item) => item.severity === "Emergency Warning").length;
}

function renderRegionSummary(data) {
  const regionMap = data.reduce((acc, incident) => {
    const current = acc.get(incident.region);
    if (!current) {
      acc.set(incident.region, incident.severity);
      return acc;
    }

    const previousIndex = severityOrder.indexOf(current);
    const currentIndex = severityOrder.indexOf(incident.severity);
    if (currentIndex < previousIndex) {
      acc.set(incident.region, incident.severity);
    }

    return acc;
  }, new Map());

  regionGrid.innerHTML = "";
  if (!regionMap.size) {
    regionGrid.innerHTML = '<p class="empty">No regions match the current filters.</p>';
    return;
  }

  for (const [region, severity] of regionMap.entries()) {
    const div = document.createElement("div");
    div.className = "region";
    div.innerHTML = `
      <strong>${region}</strong>
      <span class="badge ${cssClassFromSeverity(severity)}">${severity}</span>
    `;
    regionGrid.appendChild(div);
  }
}

function renderIncidents(data) {
  listElement.innerHTML = "";

  if (data.length === 0) {
    listElement.innerHTML = '<li><p class="empty">No incidents match the selected filters.</p></li>';
    return;
  }

  data
    .slice()
    .sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity) || a.updatedMinutesAgo - b.updatedMinutesAgo)
    .forEach((incident) => {
      const item = document.createElement("li");
      item.className = "incident-card";
      item.innerHTML = `
        <h3>${incident.title}</h3>
        <div class="incident-meta">
          <span>${incident.location} • ${incident.region}</span>
          <span class="badge ${cssClassFromSeverity(incident.severity)}">${incident.severity}</span>
          <span>Updated ${incident.updatedMinutesAgo} minutes ago</span>
        </div>
        <p>${incident.advice}</p>
      `;
      listElement.appendChild(item);
    });
}

function renderAll() {
  const filtered = filterIncidents();
  renderIncidents(filtered);
  renderRegionSummary(filtered);
}

function setUpdatedTime() {
  const now = new Date();
  lastUpdated.textContent = `Last updated ${now.toLocaleString()}`;
}

searchInput.addEventListener("input", renderAll);
severityFilter.addEventListener("change", renderAll);

renderSummary();
setUpdatedTime();
renderAll();
