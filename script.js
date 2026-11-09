
/* ==========================================
   FARMPULSE AI
   SMART AGRICULTURE PLATFORM
========================================== */

const STORAGE_KEY = "farmpulse_ai_data";

// ==========================================
// 1. DATA STORAGE
// ==========================================

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            const data = JSON.parse(saved);

            return {
                crops: Array.isArray(data.crops) ? data.crops : [],
                irrigation: Array.isArray(data.irrigation) ? data.irrigation : [],
                harvest: Array.isArray(data.harvest) ? data.harvest : [],
                freshness: Array.isArray(data.freshness) ? data.freshness : [],
                market: Array.isArray(data.market) ? data.market : [],
                activities: Array.isArray(data.activities) ? data.activities : []
            };
        }
    } catch (error) {
        console.error("Could not load saved data:", error);
    }

    return {
        crops: [],
        irrigation: [],
        harvest: [],
        freshness: [],
        market: [],
        activities: []
    };
}

let appData = loadData();

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (error) {
        alert("Unable to save data. Your browser storage may be full.");
        console.error(error);
    }
}

// ==========================================
// 2. COMMON FUNCTIONS
// ==========================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];
    });
}

function formatDate(date = new Date()) {
    return new Date(date).toLocaleDateString("en-IN");
}

function formatNumber(value) {
    return Number(value).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

function money(value) {
    return "₹" + formatNumber(value);
}

function addActivity(message, icon = "🌱") {
    appData.activities.unshift({
        message,
        icon,
        date: new Date().toISOString()
    });

    appData.activities = appData.activities.slice(0, 12);
}

function showResult(id, content) {
    document.getElementById(id).innerHTML = content;
}

function emptyRow(columns, message) {
    return `<tr><td colspan="${columns}" class="empty-cell">${message}</td></tr>`;
}

function statusBadge(text, type) {
    return `<span class="status ${type}">${escapeHTML(text)}</span>`;
}

// ==========================================
// 3. NAVIGATION
// ==========================================

const navigationLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");

const pageTitles = {
    dashboard: "Dashboard Overview",
    "crop-health": "Crop Health Analyzer",
    irrigation: "Smart Irrigation Advisor",
    harvest: "Harvest Readiness Predictor",
    freshness: "Food Freshness Analyzer",
    market: "Market Price Intelligence",
    reports: "Reports & Analytics"
};

navigationLinks.forEach(link => {
    link.addEventListener("click", function (event) {
        event.preventDefault();

        const selectedPage = this.dataset.page;

        navigationLinks.forEach(item => {
            item.classList.remove("active");
        });

        pages.forEach(page => {
            page.classList.remove("active");
        });

        this.classList.add("active");

        const page = document.getElementById(selectedPage);

        if (page) {
            page.classList.add("active");
        }

        document.getElementById("page-heading").textContent =
            pageTitles[selectedPage] || "FarmPulse AI";

        document.getElementById("breadcrumb-page").textContent =
            pageTitles[selectedPage] || "Dashboard";
    });
});

// ==========================================
// 4. CROP HEALTH ANALYZER
// ==========================================

const cropForm = document.getElementById("cropForm");

const symptomDetails = {
    healthy: {
        status: "Healthy appearance",
        type: "good",
        advice: "Continue regular crop monitoring and maintain suitable growing conditions."
    },
    yellow: {
        status: "Yellowing symptoms",
        type: "warning",
        advice: "Check watering practices, soil nutrients and possible root problems."
    },
    spots: {
        status: "Leaf spot symptoms",
        type: "danger",
        advice: "Inspect affected leaves and consult an agricultural expert about possible fungal or bacterial causes."
    },
    wilting: {
        status: "Wilting symptoms",
        type: "warning",
        advice: "Check soil moisture, root health and drainage conditions."
    },
    curling: {
        status: "Leaf curling symptoms",
        type: "warning",
        advice: "Inspect for pests, heat stress and watering problems."
    }
};

cropForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const crop = document.getElementById("cropName").value;
    const location = document.getElementById("cropLocation").value.trim();
    const area = Number(document.getElementById("cropArea").value);
    const stage = document.getElementById("cropStage").value;
    const symptom = document.getElementById("cropSymptom").value;

    if (!crop || !location || !stage || !symptom || !Number.isFinite(area) || area <= 0) {
        alert("Please enter valid crop details.");
        return;
    }

    const result = symptomDetails[symptom];

    const record = {
        id: Date.now(),
        crop,
        location,
        area,
        stage,
        symptom,
        status: result.status,
        date: new Date().toISOString()
    };

    appData.crops.push(record);

    addActivity(`${crop} crop registered in ${location}`, "🌿");

    saveData();

    showResult("cropResult", `
        <h4>${escapeHTML(crop)} - Crop Assessment</h4>
        <p><strong>Location:</strong> ${escapeHTML(location)}</p>
        <p><strong>Crop stage:</strong> ${escapeHTML(stage)}</p>
        <p><strong>Observation:</strong> ${escapeHTML(result.status)}</p>
        <p><strong>Guidance:</strong> ${escapeHTML(result.advice)}</p>
        <br>
        ${statusBadge(result.status, result.type)}
    `);

    cropForm.reset();
    refreshApplication();
});

// ==========================================
// 5. SMART IRRIGATION ADVISOR
// ==========================================

const irrigationForm = document.getElementById("irrigationForm");

irrigationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const crop = document.getElementById("irrigationCrop").value;
    const moisture = Number(document.getElementById("soilMoisture").value);
    const temperature = Number(document.getElementById("soilTemperature").value);
    const rainfall = Number(document.getElementById("rainfall").value);
    const soil = document.getElementById("soilType").value;

    if (
        !crop || !soil ||
        !Number.isFinite(moisture) || moisture < 0 || moisture > 100 ||
        !Number.isFinite(temperature) || temperature < -10 || temperature > 60 ||
        !Number.isFinite(rainfall) || rainfall < 0
    ) {
        alert("Please enter valid irrigation details.");
        return;
    }

    let recommendation;
    let type;
    let explanation;

    if (rainfall >= 20) {
        recommendation = "Delay Irrigation";
        type = "good";
        explanation = "Recent rainfall is high. Check field drainage and soil moisture before watering.";
    } else if (moisture < 25) {
        recommendation = "Irrigation Required";
        type = "danger";
        explanation = "The entered soil moisture is low. Consider watering after checking the crop's requirements.";
    } else if (moisture < 45) {
        recommendation = "Monitor and Water";
        type = "warning";
        explanation = "Soil moisture is moderate. Monitor the field and plan irrigation if conditions remain dry.";
    } else {
        recommendation = "No Immediate Irrigation";
        type = "good";
        explanation = "The entered moisture level is relatively high. Recheck conditions before the next irrigation.";
    }

    if (temperature >= 35 && moisture < 45 && rainfall < 20) {
        explanation += " High temperature may increase water demand.";
    }

    const record = {
        crop,
        moisture,
        temperature,
        rainfall,
        soil,
        recommendation,
        type,
        date: new Date().toISOString()
    };

    appData.irrigation.push(record);

    addActivity(`${crop}: ${recommendation}`, "💧");

    saveData();

    showResult("irrigationResult", `
        <h4>${escapeHTML(recommendation)}</h4>
        <p><strong>Crop:</strong> ${escapeHTML(crop)}</p>
        <p><strong>Soil moisture:</strong> ${moisture}%</p>
        <p><strong>Temperature:</strong> ${temperature}°C</p>
        <p><strong>Rainfall:</strong> ${rainfall} mm</p>
        <p><strong>Soil type:</strong> ${escapeHTML(soil)}</p>
        <p><strong>Advice:</strong> ${escapeHTML(explanation)}</p>
        <br>
        ${statusBadge(recommendation, type)}
    `);

    irrigationForm.reset();
    refreshApplication();
});

// ==========================================
// 6. HARVEST READINESS PREDICTOR
// ==========================================

const harvestForm = document.getElementById("harvestForm");

harvestForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const crop = document.getElementById("harvestCrop").value;
    const days = Number(document.getElementById("plantingDays").value);
    const duration = Number(document.getElementById("cropDuration").value);
    const stage = document.getElementById("harvestStage").value;
    const appearance = document.getElementById("cropAppearance").value;

    if (
        !crop || !stage || !appearance ||
        !Number.isFinite(days) || days < 0 ||
        !Number.isFinite(duration) || duration <= 0
    ) {
        alert("Please enter valid harvest details.");
        return;
    }

    const progress = Math.min(100, (days / duration) * 100);

    let readiness;
    let type;
    let advice;

    if (
        progress >= 90 &&
        stage === "Maturity" &&
        appearance === "mature"
    ) {
        readiness = "Likely Ready for Inspection";
        type = "good";
        advice = "Inspect crop maturity, quality and field conditions before deciding to harvest.";
    } else if (progress >= 70 || stage === "Maturity" || appearance === "changing") {
        readiness = "Approaching Harvest";
        type = "warning";
        advice = "Continue monitoring crop maturity and inspect the produce regularly.";
    } else {
        readiness = "Still Growing";
        type = "danger";
        advice = "Allow more growth time and continue suitable crop management.";
    }

    const daysLeft = Math.max(0, Math.ceil(duration - days));

    const record = {
        crop,
        days,
        duration,
        stage,
        appearance,
        progress,
        readiness,
        type,
        daysLeft,
        date: new Date().toISOString()
    };

    appData.harvest.push(record);

    addActivity(`${crop}: ${readiness}`, "🌾");

    saveData();

    showResult("harvestResult", `
        <h4>${escapeHTML(readiness)}</h4>
        <p><strong>Crop:</strong> ${escapeHTML(crop)}</p>
        <p><strong>Growth progress:</strong> ${formatNumber(progress)}%</p>
        <p><strong>Days since planting:</strong> ${days}</p>
        <p><strong>Expected duration:</strong> ${duration} days</p>
        <p><strong>Estimated days remaining:</strong> ${daysLeft}</p>
        <p><strong>Advice:</strong> ${escapeHTML(advice)}</p>
        <br>
        ${statusBadge(readiness, type)}
    `);

    harvestForm.reset();
    refreshApplication();
});

// ==========================================
// 7. FOOD FRESHNESS ANALYZER
// ==========================================

const freshnessForm = document.getElementById("freshnessForm");

const storageGuidelines = {
    Vegetables: { days: 7, temperature: 10 },
    Fruits: { days: 10, temperature: 12 },
    Grains: { days: 180, temperature: 25 },
    Dairy: { days: 3, temperature: 4 },
    Other: { days: 5, temperature: 10 }
};

freshnessForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const category = document.getElementById("foodCategory").value;
    const product = document.getElementById("foodProduct").value.trim();
    const storageDays = Number(document.getElementById("storageDuration").value);
    const temperature = Number(document.getElementById("storageTemperature").value);
    const appearance = document.getElementById("foodAppearance").value;

    if (
        !category || !product || !appearance ||
        !Number.isFinite(storageDays) || storageDays < 0 ||
        !Number.isFinite(temperature) || temperature < -30 || temperature > 70
    ) {
        alert("Please enter valid food storage details.");
        return;
    }

    const guideline = storageGuidelines[category];

    let riskScore = 10;

    riskScore += Math.min(50, (storageDays / guideline.days) * 35);

    if (temperature > guideline.temperature) {
        riskScore += Math.min(
            25,
            (temperature - guideline.temperature) * 2
        );
    }

    if (appearance === "slight") {
        riskScore += 15;
    }

    if (appearance === "damaged") {
        riskScore += 35;
    }

    riskScore = Math.min(100, Math.round(riskScore));

    let risk;
    let type;
    let advice;

    if (riskScore >= 70) {
        risk = "High Estimated Risk";
        type = "danger";
        advice = "Do not rely on this estimate to judge safety. Inspect the product and follow food-safety guidance. Discard food with signs of spoilage.";
    } else if (riskScore >= 35) {
        risk = "Moderate Estimated Risk";
        type = "warning";
        advice = "Review storage conditions and inspect the product carefully. Follow suitable storage and food-safety guidance.";
    } else {
        risk = "Lower Estimated Risk";
        type = "good";
        advice = "The entered conditions indicate a lower estimated risk. Continue correct storage and inspect the food before use.";
    }

    const record = {
        product,
        category,
        storageDays,
        temperature,
        appearance,
        riskScore,
        risk,
        type,
        date: new Date().toISOString()
    };

    appData.freshness.push(record);

    addActivity(`${product}: ${risk}`, "🥬");

    saveData();

    showResult("freshnessResult", `
        <h4>${escapeHTML(risk)}</h4>
        <p><strong>Food product:</strong> ${escapeHTML(product)}</p>
        <p><strong>Category:</strong> ${escapeHTML(category)}</p>
        <p><strong>Storage duration:</strong> ${storageDays} days</p>
        <p><strong>Temperature:</strong> ${temperature}°C</p>
        <p><strong>Estimated risk score:</strong> ${riskScore}/100</p>
        <p><strong>Guidance:</strong> ${escapeHTML(advice)}</p>
        <br>
        ${statusBadge(risk, type)}
    `);

    freshnessForm.reset();
    refreshApplication();
});

// ==========================================
// 8. MARKET PRICE INTELLIGENCE
// ==========================================

const marketForm = document.getElementById("marketForm");

marketForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const crop = document.getElementById("marketCrop").value;
    const quantity = Number(document.getElementById("marketQuantity").value);
    const currentPrice = Number(document.getElementById("currentPrice").value);
    const comparisonPrice = Number(document.getElementById("comparisonPrice").value);

    if (
        !crop ||
        !Number.isFinite(quantity) || quantity <= 0 ||
        !Number.isFinite(currentPrice) || currentPrice <= 0 ||
        !Number.isFinite(comparisonPrice) || comparisonPrice <= 0
    ) {
        alert("Please enter valid market details.");
        return;
    }

    const totalValue = quantity * currentPrice;

    const difference = currentPrice - comparisonPrice;

    const percentageChange =
        (difference / comparisonPrice) * 100;

    let trend;
    let type;

    if (difference > 0) {
        trend = "Price Increased";
        type = "good";
    } else if (difference < 0) {
        trend = "Price Decreased";
        type = "danger";
    } else {
        trend = "Price Unchanged";
        type = "warning";
    }

    const record = {
        crop,
        quantity,
        currentPrice,
        comparisonPrice,
        totalValue,
        percentageChange,
        trend,
        date: new Date().toISOString()
    };

    appData.market.push(record);

    addActivity(`${crop}: Market price analysis completed`, "📈");

    saveData();

    showResult("marketResult", `
        <h4>${escapeHTML(crop)} Market Analysis</h4>
        <p><strong>Available quantity:</strong> ${formatNumber(quantity)} kg</p>
        <p><strong>Current price:</strong> ${money(currentPrice)} / kg</p>
        <p><strong>Comparison price:</strong> ${money(comparisonPrice)} / kg</p>
        <p><strong>Estimated selling value:</strong> ${money(totalValue)}</p>
        <p><strong>Price change:</strong> ${formatNumber(percentageChange)}%</p>
        <p><strong>Market trend:</strong> ${escapeHTML(trend)}</p>
        <br>
        ${statusBadge(trend, type)}
    `);

    marketForm.reset();
    refreshApplication();
});

// ==========================================
// 9. RENDER CROP TABLE
// ==========================================

function renderCropTables() {
    const recent = [...appData.crops].reverse();

    const recentBody = document.getElementById("recent-crops");
    const cropBody = document.getElementById("crop-records");

    if (recent.length === 0) {
        recentBody.innerHTML = emptyRow(5, "No crop records available.");
        cropBody.innerHTML = emptyRow(6, "No crop records available.");
        return;
    }

    recentBody.innerHTML = recent.slice(0, 5).map(item => `
        <tr>
            <td>${escapeHTML(item.crop)}</td>
            <td>${escapeHTML(item.location)}</td>
            <td>${formatNumber(item.area)}</td>
            <td>${escapeHTML(item.stage)}</td>
            <td>${formatDate(item.date)}</td>
        </tr>
    `).join("");

    cropBody.innerHTML = recent.map(item => {
        const details = symptomDetails[item.symptom];

        return `
            <tr>
                <td>${escapeHTML(item.crop)}</td>
                <td>${escapeHTML(item.location)}</td>
                <td>${formatNumber(item.area)} acres</td>
                <td>${escapeHTML(item.stage)}</td>
                <td>${escapeHTML(item.status)}</td>
                <td>${statusBadge(item.status, details.type)}</td>
            </tr>
        `;
    }).join("");
}

// ==========================================
// 10. RENDER IRRIGATION HISTORY
// ==========================================

function renderIrrigation() {
    const body = document.getElementById("irrigation-records");
    const records = [...appData.irrigation].reverse();

    if (records.length === 0) {
        body.innerHTML = emptyRow(5, "No irrigation assessments yet.");
        return;
    }

    body.innerHTML = records.map(item => `
        <tr>
            <td>${escapeHTML(item.crop)}</td>
            <td>${item.moisture}%</td>
            <td>${item.temperature}°C</td>
            <td>${formatNumber(item.rainfall)} mm</td>
            <td>${statusBadge(item.recommendation, item.type)}</td>
        </tr>
    `).join("");
}

// ==========================================
// 11. RENDER HARVEST HISTORY
// ==========================================

function renderHarvest() {
    const body = document.getElementById("harvest-records");
    const records = [...appData.harvest].reverse();

    if (records.length === 0) {
        body.innerHTML = emptyRow(5, "No harvest predictions yet.");
        return;
    }

    body.innerHTML = records.map(item => `
        <tr>
            <td>${escapeHTML(item.crop)}</td>
            <td>${item.days}</td>
            <td>${item.duration}</td>
            <td>${statusBadge(item.readiness, item.type)}</td>
            <td>${item.daysLeft} days</td>
        </tr>
    `).join("");
}

// ==========================================
// 12. RENDER FRESHNESS HISTORY
// ==========================================

function renderFreshness() {
    const body = document.getElementById("freshness-records");
    const records = [...appData.freshness].reverse();

    if (records.length === 0) {
        body.innerHTML = emptyRow(5, "No food assessments yet.");
        return;
    }

    body.innerHTML = records.map(item => `
        <tr>
            <td>${escapeHTML(item.product)}</td>
            <td>${escapeHTML(item.category)}</td>
            <td>${item.storageDays} days</td>
            <td>${item.temperature}°C</td>
            <td>${statusBadge(item.risk, item.type)}</td>
        </tr>
    `).join("");
}

// ==========================================
// 13. RENDER MARKET HISTORY
// ==========================================

function renderMarket() {
    const body = document.getElementById("market-records");
    const records = [...appData.market].reverse();

    if (records.length === 0) {
        body.innerHTML = emptyRow(5, "No market analyses yet.");
        return;
    }

    body.innerHTML = records.map(item => `
        <tr>
            <td>${escapeHTML(item.crop)}</td>
            <td>${formatNumber(item.quantity)} kg</td>
            <td>${money(item.currentPrice)}</td>
            <td>${money(item.comparisonPrice)}</td>
            <td>${money(item.totalValue)}</td>
        </tr>
    `).join("");
}

// ==========================================
// 14. DASHBOARD ACTIVITY
// ==========================================

function renderActivities() {
    const container = document.getElementById("recent-activity");

    if (appData.activities.length === 0) {
        container.innerHTML =
            '<div class="empty-state">No activities yet. Start by registering a crop.</div>';
        return;
    }

    container.innerHTML = appData.activities.slice(0, 6).map(item => `
        <div class="activity-item">
            <div class="activity-icon">${escapeHTML(item.icon)}</div>
            <div>
                <strong>${escapeHTML(item.message)}</strong>
                <small>${formatDate(item.date)}</small>
            </div>
        </div>
    `).join("");
}

// ==========================================
// 15. DASHBOARD STATISTICS
// ==========================================

function updateStatistics() {
    const totalCrops = appData.crops.length;
    const totalIrrigation = appData.irrigation.length;
    const totalHarvest = appData.harvest.filter(item =>
        item.readiness === "Likely Ready for Inspection"
    ).length;
    const totalFreshness = appData.freshness.length;

    document.getElementById("total-crops").textContent = totalCrops;
    document.getElementById("total-irrigation").textContent = totalIrrigation;
    document.getElementById("harvest-ready").textContent = totalHarvest;
    document.getElementById("total-freshness").textContent = totalFreshness;

    document.getElementById("report-crops").textContent = totalCrops;
    document.getElementById("report-irrigation").textContent = totalIrrigation;
    document.getElementById("report-harvest").textContent = appData.harvest.length;
    document.getElementById("report-freshness").textContent = totalFreshness;
}

// ==========================================
// 16. CHARTS
// ==========================================

let cropChart = null;
let reportChart = null;

function createCharts() {
    if (typeof Chart === "undefined") {
        console.warn("Chart.js is not available. Check your internet connection.");
        return;
    }

    const cropCanvas = document.getElementById("cropChart");
    const reportCanvas = document.getElementById("reportChart");

    if (cropChart) {
        cropChart.destroy();
    }

    if (reportChart) {
        reportChart.destroy();
    }

    const cropCounts = {};

    appData.crops.forEach(item => {
        cropCounts[item.crop] = (cropCounts[item.crop] || 0) + 1;
    });

    const cropLabels = Object.keys(cropCounts);
    const cropValues = Object.values(cropCounts);

    cropChart = new Chart(cropCanvas, {
        type: "doughnut",
        data: {
            labels: cropLabels.length ? cropLabels : ["No crop data"],
            datasets: [{
                data: cropValues.length ? cropValues : [1],
                backgroundColor: [
                    "#16845b",
                    "#4c91d9",
                    "#e5a13b",
                    "#9873d5",
                    "#e36f79",
                    "#65b7a2",
                    "#8eaa53"
                ],
                borderWidth: 3,
                borderColor: "#ffffff"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        padding: 16,
                        font: { size: 11 }
                    }
                }
            }
        }
    });

    reportChart = new Chart(reportCanvas, {
        type: "bar",
        data: {
            labels: [
                "Crop Records",
                "Irrigation",
                "Harvest",
                "Food Checks",
                "Market"
            ],
            datasets: [{
                label: "Total Activities",
                data: [
                    appData.crops.length,
                    appData.irrigation.length,
                    appData.harvest.length,
                    appData.freshness.length,
                    appData.market.length
                ],
                backgroundColor: [
                    "#16845b",
                    "#4c91d9",
                    "#e5a13b",
                    "#9873d5",
                    "#65b7a2"
                ],
                borderRadius: 7,
                maxBarThickness: 48
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });
}

// ==========================================
// 17. REPORT SUMMARY
// ==========================================

function updateReportSummary() {
    const total = appData.crops.length +
        appData.irrigation.length +
        appData.harvest.length +
        appData.freshness.length +
        appData.market.length;

    const summary = document.getElementById("impact-summary");

    summary.innerHTML = `
        <p><strong>Total crop records:</strong> ${appData.crops.length}</p>
        <p><strong>Irrigation assessments:</strong> ${appData.irrigation.length}</p>
        <p><strong>Harvest predictions:</strong> ${appData.harvest.length}</p>
        <p><strong>Food freshness checks:</strong> ${appData.freshness.length}</p>
        <p><strong>Market analyses:</strong> ${appData.market.length}</p>
        <p><strong>Total platform activities:</strong> ${total}</p>
        <p>FarmPulse AI helps organize agricultural observations and support informed farming decisions.</p>
    `;
}

// ==========================================
// 18. EXPORT CSV REPORT
// ==========================================

document.getElementById("exportBtn").addEventListener("click", function () {
    const rows = [
        ["FarmPulse AI - Activity Report"],
        ["Generated Date", formatDate()],
        [],
        ["MODULE", "RECORD DETAILS"]
    ];

    appData.crops.forEach(item => {
        rows.push([
            "Crop",
            item.crop,
            item.location,
            item.area + " acres",
            item.stage,
            item.status
        ]);
    });

    appData.irrigation.forEach(item => {
        rows.push([
            "Irrigation",
            item.crop,
            item.moisture + "%",
            item.temperature + " C",
            item.rainfall + " mm",
            item.recommendation
        ]);
    });

    appData.harvest.forEach(item => {
        rows.push([
            "Harvest",
            item.crop,
            item.days + " days planted",
            item.progress + "% progress",
            item.daysLeft + " days remaining",
            item.readiness
        ]);
    });

    appData.freshness.forEach(item => {
        rows.push([
            "Freshness",
            item.product,
            item.category,
            item.storageDays + " days",
            item.temperature + " C",
            item.risk
        ]);
    });

    appData.market.forEach(item => {
        rows.push([
            "Market",
            item.crop,
            item.quantity + " kg",
            money(item.currentPrice),
            money(item.comparisonPrice),
            money(item.totalValue)
        ]);
    });

    const csv = rows.map(row =>
        row.map(value => {
            const safeValue = String(value ?? "");
            return '"' + safeValue.replace(/"/g, '""') + '"';
        }).join(",")
    ).join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "FarmPulse_AI_Report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
});

// ==========================================
// 19. REFRESH APPLICATION
// ==========================================

function refreshApplication() {
    renderCropTables();
    renderIrrigation();
    renderHarvest();
    renderFreshness();
    renderMarket();

    renderActivities();

    updateStatistics();
    updateReportSummary();

    createCharts();
}

// ==========================================
// 20. START APPLICATION
// ==========================================

refreshApplication();

console.log("FarmPulse AI loaded successfully!");
console.log("All seven project modules are ready.");
