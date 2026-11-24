const STORAGE_KEY = "monthly_budget_entries_v1";

const monthPicker = document.getElementById("monthPicker");
const budgetForm = document.getElementById("budgetForm");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const entryList = document.getElementById("entryList");
const totalIncomeEl = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");
const balanceEl = document.getElementById("balance");

let expensePieInstance = null;
let incomePieInstance = null;
let incomeBarChartInstance = null;
let expenseBarChartInstance = null;

// Aktuellen Monat als Standard setzen (YYYY-MM)
const now = new Date();
monthPicker.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

const EXPENSE_CATEGORIES = [
  "Wohnen",
  "Lebensmittel",
  "Mobilität",
  "Freizeit",
  "Abos",
  "Vereine",
  "Sonstiges"
];

const INCOME_CATEGORIES = [
  "Gehalt",
  "Vermieten",
  "Sonstiges"
];

function populateCategories() {
  const categories = typeInput.value === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  categoryInput.disabled = false;
  categoryInput.innerHTML = categories
    .map((cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`)
    .join("");
}

typeInput.addEventListener("change", populateCategories);
populateCategories();

function loadAllData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveAllData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatEuro(value) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

function createPieConfig(labels, values, colors, emptyLabel) {
  const hasData = values.length > 0;
  return {
    type: "pie",
    data: {
      labels: hasData ? labels : [emptyLabel],
      datasets: [
        {
          data: hasData ? values : [1],
          backgroundColor: hasData ? colors : ["#e2e8f0"]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: hasData,
          callbacks: {
            label: (context) => `${context.label}: ${formatEuro(context.raw)}`
          }
        }
      }
    }
  };
}

function updatePieChart(entries) {
  const expenseTotals = {};
  const incomeTotals = {};

  entries.forEach((entry) => {
    const cat = entry.category || "Sonstiges";
    if (entry.type === "expense") {
      expenseTotals[cat] = (expenseTotals[cat] || 0) + entry.amount;
    } else if (entry.type === "income") {
      incomeTotals[cat] = (incomeTotals[cat] || 0) + entry.amount;
    }
  });

  const ctx1 = document.getElementById("expensePieChart").getContext("2d");
  const ctx2 = document.getElementById("incomePieChart").getContext("2d");

  if (expensePieInstance) expensePieInstance.destroy();
  if (incomePieInstance) incomePieInstance.destroy();

  expensePieInstance = new Chart(
    ctx1,
    createPieConfig(
      Object.keys(expenseTotals),
      Object.values(expenseTotals),
      ["#ef4444", "#f97316", "#f59e0b", "#ec4899", "#8b5cf6"],
      "Keine Ausgaben"
    )
  );

  incomePieInstance = new Chart(
    ctx2,
    createPieConfig(
      Object.keys(incomeTotals),
      Object.values(incomeTotals),
      ["#16a34a", "#22c55e", "#0ea5e9", "#14b8a6"],
      "Keine Einnahmen"
    )
  );
  }

function createBarConfig(labels, label, data, color) {
  return {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: label,
          data: data,
          backgroundColor: color,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${formatEuro(context.raw)}`
          }
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  };
}


function updateBarChart(allData, selectedMonth) {
  const year = selectedMonth.split("-")[0];
  const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

  const monthlyIncome = new Array(12).fill(0);
  const monthlyExpense = new Array(12).fill(0);

  for (let m = 1; m <= 12; m++) {
    const key = `${year}-${String(m).padStart(2, "0")}`;
    const list = allData[key] || [];
    list.forEach((entry) => {
      if (entry.type === "income") {
        monthlyIncome[m - 1] += entry.amount;
      } else {
        monthlyExpense[m - 1] += entry.amount;
      }
    });
  }

  const ctx1 = document.getElementById("monthlyBarChartIncome").getContext("2d");
  const ctx2 = document.getElementById("monthlyBarChartExpense").getContext("2d");

  if (incomeBarChartInstance) incomeBarChartInstance.destroy();
  if (expenseBarChartInstance) expenseBarChartInstance.destroy();

  incomeBarChartInstance = new Chart(
    ctx1,
    createBarConfig(monthNames, "Einnahmen", monthlyIncome, "#22c55e")
  );

  expenseBarChartInstance = new Chart(
    ctx2,
    createBarConfig(monthNames, "Ausgaben", monthlyExpense, "#ef4444")
  );
}

function render() {
  const month = monthPicker.value;
  const allData = loadAllData();
  const entries = allData[month] || [];

  let income = 0;
  let expense = 0;

  entryList.innerHTML = "";

  entries.forEach((entry) => {
    if (entry.type === "income") {
      income += entry.amount;
    } else {
      expense += entry.amount;
    }

    const li = document.createElement("li");
    const sign = entry.type === "income" ? "+" : "-";
    const cssClass = entry.type === "income" ? "amount-income" : "amount-expense";
    const categoryBadge =
      entry.type === "expense"
        ? `<span class="badge">${escapeHtml(entry.category || "Sonstiges")}</span>`
        : `<span class="badge">Einnahme</span>`;

    li.innerHTML = `
      <div class="entry-info">
        ${categoryBadge}
        <span>${escapeHtml(entry.title)}</span>
      </div>
      <div>
        <span class="${cssClass}">${sign}${formatEuro(entry.amount)}</span>
        <button class="delete-btn" data-id="${entry.id}" title="Löschen">✕</button>
      </div>
    `;
    entryList.appendChild(li);
  });

  const balance = income - expense;
  totalIncomeEl.textContent = formatEuro(income);
  totalExpenseEl.textContent = formatEuro(expense);
  balanceEl.textContent = formatEuro(balance);

  updatePieChart(entries);
  updateBarChart(allData, month);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

budgetForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const month = monthPicker.value;
  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const category = type === "expense" ? categoryInput.value : "Einnahme";

  if (!month || !title || Number.isNaN(amount) || amount <= 0) return;

  const allData = loadAllData();
  if (!allData[month]) allData[month] = [];

  allData[month].push({
    id: crypto.randomUUID(),
    type,
    category,
    title,
    amount
  });

  saveAllData(allData);
  titleInput.value = "";
  amountInput.value = "";
  titleInput.focus();
  render();
});

entryList.addEventListener("click", (e) => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;

  const id = btn.dataset.id;
  const month = monthPicker.value;
  const allData = loadAllData();
  allData[month] = (allData[month] || []).filter((item) => item.id !== id);

  saveAllData(allData);
  render();
});

monthPicker.addEventListener("change", render);

render();
