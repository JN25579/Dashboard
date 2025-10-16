// Copied from views/dashboard.js — placed in static/ so it can be cached and fingerprinted
const weeklyGoals = [
  {
    week: 1,
    focus: "Define Offer",
    deliverable: "Choose niche + write 1-sentence offer",
    status: false,
  },
  {
    week: 2,
    focus: "Build Portfolio",
    deliverable: "Create demo repo + Notion portfolio",
    status: false,
  },
  {
    week: 3,
    focus: "Start Outreach",
    deliverable: "10 DMs/day + 5 Upwork proposals/day",
    status: false,
  },
  {
    week: 4,
    focus: "Deliver Client #1",
    deliverable: "Complete project + collect testimonial",
    status: false,
  },
  {
    week: 5,
    focus: "Productize Offer",
    deliverable: "Build 'CI/CD in 48 Hours' sales page",
    status: false,
  },
  {
    week: 6,
    focus: "Automate Workflow",
    deliverable: "Set up Zapier + ChatGPT templates",
    status: false,
  },
  {
    week: 7,
    focus: "Add Recurring Income",
    deliverable: "Create monthly maintenance package",
    status: false,
  },
  {
    week: 8,
    focus: "Cross £1K",
    deliverable: "Track milestone & reflect",
    status: false,
  },
  {
    week: 9,
    focus: "Create Digital Product",
    deliverable: "Template, guide, or course outline",
    status: false,
  },
  {
    week: 10,
    focus: "Launch on Gumroad",
    deliverable: "Add visuals + description",
    status: false,
  },
  {
    week: 11,
    focus: "Start Posting Content",
    deliverable: "3x/week on LinkedIn/X",
    status: false,
  },
  {
    week: 12,
    focus: "Build Newsletter",
    deliverable: "Collect 50+ emails",
    status: false,
  },
];

let goalsData = JSON.parse(localStorage.getItem("goalsData")) || weeklyGoals;
let incomeData = JSON.parse(localStorage.getItem("incomeData")) || [];

function saveData() {
  localStorage.setItem("goalsData", JSON.stringify(goalsData));
  localStorage.setItem("incomeData", JSON.stringify(incomeData));
}

function renderWeeklyGoals() {
  const body = document.getElementById("weekly-goals-body");
  if (!body) return;
  body.innerHTML = "";
  goalsData.forEach((goal, index) => {
    const row = body.insertRow();
    row.insertCell().textContent = goal.week;
    row.insertCell().textContent = goal.focus;
    row.insertCell().textContent = goal.deliverable;
    const statusCell = row.insertCell();
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = goal.status;
    checkbox.onchange = () => toggleGoalStatus(index);
    statusCell.appendChild(checkbox);
  });
}

function toggleGoalStatus(index) {
  goalsData[index].status = !goalsData[index].status;
  saveData();
}

function renderIncomeTracker() {
  const body = document.getElementById("income-tracker-body");
  if (!body) return;
  body.innerHTML = "";
  let cumulativeTotal = 0;
  incomeData.sort((a, b) => new Date(b.date) - new Date(a.date));
  incomeData.forEach((entry) => {
    const row = body.insertRow();
    row.insertCell().textContent = entry.date;
    row.insertCell().textContent = entry.source;
    row.insertCell().textContent = entry.type;
    row.insertCell().textContent = `£${entry.amount.toFixed(2)}`;
    row.insertCell().textContent = entry.hours || "N/A";
    row.insertCell().textContent = entry.notes;
    cumulativeTotal += entry.amount;
  });
  const el = document.getElementById("cumulative-total");
  if (el) el.textContent = `£${cumulativeTotal.toFixed(2)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  renderWeeklyGoals();
  renderIncomeTracker();
  const form = document.getElementById("income-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const newEntry = {
        date: document.getElementById("income-date").value,
        source: document.getElementById("income-source").value,
        type: document.getElementById("income-type").value,
        amount: parseFloat(document.getElementById("income-amount").value),
        hours: document.getElementById("income-hours").value
          ? parseFloat(document.getElementById("income-hours").value)
          : null,
        notes: document.getElementById("income-notes").value,
      };
      incomeData.push(newEntry);
      saveData();
      renderIncomeTracker();
    });
  }
});
