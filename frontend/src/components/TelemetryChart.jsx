import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function TelemetryChart({ chartSeries, nTours }) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !chartSeries || chartSeries.length === 0) return;

    // Détruire l'ancienne instance si elle existe
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    const labels = Array.from({ length: nTours }, (_, i) => i + 1);

    const datasets = chartSeries.map((serie) => ({
      label: serie.label,
      data: serie.data,
      borderColor: serie.borderColor,
      backgroundColor: serie.backgroundColor,
      borderWidth: serie.borderWidth || 2,
      pointRadius: serie.pointRadius || 2,
      pointHoverRadius: serie.pointHoverRadius || 5,
      fill: true,
      tension: serie.tension || 0.3,
    }));

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 12,
              usePointStyle: true,
              color: '#f3f4f6',
              font: { family: 'Inter', size: 11 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(19, 23, 28, 0.95)',
            titleColor: '#f3f4f6',
            bodyColor: '#9ca3af',
            borderColor: '#1f2937',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function (context) {
                const val = context.raw;
                const m = Math.floor(val / 60);
                const s = (val % 60).toFixed(3).padStart(6, '0');
                return ` ${context.dataset.label} : ${m}:${s}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Laps', color: '#9ca3af', font: { family: 'Inter', size: 11 } },
            grid: { color: 'rgba(31, 41, 55, 0.5)' },
            ticks: { color: '#9ca3af', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(31, 41, 55, 0.5)' },
            ticks: {
              color: '#9ca3af',
              font: { size: 10 },
              callback: function (val) {
                const m = Math.floor(val / 60);
                const s = (val % 60).toFixed(1).padStart(4, '0');
                return `${m}:${s}`;
              }
            }
          }
        }
      }
    });

    // Cleanup à la désinscription du composant
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartSeries, nTours]);

  return (
    <div className="chart-container">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
