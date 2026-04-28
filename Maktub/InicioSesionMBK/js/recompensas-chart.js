(function () {
  "use strict";

  const rewardsPage = document.querySelector('[data-mk-page="rewards"]');

  if (!rewardsPage) {
    return;
  }

  const chartCanvas = rewardsPage.querySelector("[data-mk-rewards-chart]");

  if (!chartCanvas || typeof window.Chart === "undefined") {
    return;
  }

  const chartScaleLabels = ["0", "25M", "50M", "100M", "250M", "500M"];

  const readCssVar = (name, fallback) => {
    const value = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  };

  const readCssNumber = (name, fallback) => {
    const parsed = Number.parseFloat(readCssVar(name, String(fallback)));
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const chartFontFamily = () => {
    const base = readCssVar("--mk-font-primary", "sans-serif");
    return '"Inter", ' + base;
  };

  const createLineGradient = (context, chartArea) => {
    const gradient = context.createLinearGradient(chartArea.left, chartArea.top, chartArea.right, chartArea.bottom);
    gradient.addColorStop(0, readCssVar("--mk-rewards-chart-line-start", "#2290ff"));
    gradient.addColorStop(0.52, readCssVar("--mk-rewards-chart-line-mid", "#74b6f2"));
    gradient.addColorStop(1, readCssVar("--mk-rewards-chart-line-end", "#ffffff"));
    return gradient;
  };

  const rewardsChart = new window.Chart(chartCanvas, {
    type: "line",
    data: {
      labels: ["Ene", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Recompensas mensuales",
          data: [0, 5, 0, 4.2, 0, 0],
          borderColor: (context) => {
            const chart = context.chart;
            const area = chart.chartArea;

            if (!area) {
              return readCssVar("--mk-rewards-chart-line-start", "#2290ff");
            }

            return createLineGradient(chart.ctx, area);
          },
          borderWidth: () => readCssNumber("--mk-rewards-chart-line-width", 6),
          tension: 0.45,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHitRadius: 12,
          fill: false,
          spanGaps: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 8, right: 6, bottom: 0, left: 0 },
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          displayColors: false,
          backgroundColor: () => readCssVar("--mk-rewards-chart-tooltip-bg", "rgba(5, 24, 40, 0.95)"),
          titleColor: () => readCssVar("--mk-rewards-chart-axis", "#f6f7f9"),
          bodyColor: () => readCssVar("--mk-rewards-chart-axis", "#f6f7f9"),
          callbacks: {
            label: (context) => {
              const rawValue = Number(context.raw);
              const index = Math.max(0, Math.min(chartScaleLabels.length - 1, Math.round(rawValue)));
              return "Puntos: " + chartScaleLabels[index];
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: () => readCssVar("--mk-rewards-chart-axis", "#f6f7f9"),
            padding: 12,
            font: () => ({
              family: chartFontFamily(),
              size: readCssNumber("--mk-rewards-chart-tick-x", 12),
              weight: "400",
            }),
          },
        },
        y: {
          min: 0,
          max: 5,
          border: { display: false },
          ticks: {
            stepSize: 1,
            color: () => readCssVar("--mk-rewards-chart-axis", "#f6f7f9"),
            padding: 10,
            font: () => ({
              family: chartFontFamily(),
              size: readCssNumber("--mk-rewards-chart-tick-y", 16),
              weight: "400",
            }),
            callback: (value) => {
              const index = Number(value);
              if (!Number.isInteger(index) || index < 0 || index >= chartScaleLabels.length) {
                return "";
              }
              return chartScaleLabels[index];
            },
          },
          grid: {
            color: () => readCssVar("--mk-rewards-chart-grid", "rgba(255, 255, 255, 0.9)"),
            borderDash: [3, 3],
            lineWidth: 1,
            drawTicks: false,
          },
        },
      },
      animation: {
        duration: 700,
        easing: "easeOutQuart",
      },
    },
  });

  window.addEventListener("resize", () => {
    rewardsChart.update("none");
  });
})();
