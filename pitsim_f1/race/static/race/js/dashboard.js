document.addEventListener("DOMContentLoaded", () => {
    if (typeof CHART_SERIES === 'undefined' || !CHART_SERIES) return;

    const ctx = document.getElementById('lapTimesChart').getContext('2d');
    
    // Labels (1..N)
    const labels = Array.from({length: N_TOURS}, (_, i) => i + 1);

    const datasets = CHART_SERIES.map((serie) => {
        return {
            label: serie.label,
            data: serie.data,
            borderColor: serie.borderColor,
            backgroundColor: serie.backgroundColor,
            borderWidth: serie.borderWidth || 2,
            pointRadius: serie.pointRadius || 2,
            pointHoverRadius: serie.pointHoverRadius || 4,
            fill: true,
            tension: serie.tension || 0.3
        };
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { boxWidth: 12, usePointStyle: true, font: {family: 'Inter', size: 11} }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#000',
                    bodyColor: '#333',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 10,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    callbacks: {
                        label: function(context) {
                            let val = context.raw;
                            let min = Math.floor(val / 60);
                            let sec = (val % 60).toFixed(3);
                            return `${context.dataset.label} : ${min}:${sec.padStart(6, '0')}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Laps', font: {family: 'Inter'} },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                y: {
                    title: { display: false },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                        callback: function(value) {
                            let min = Math.floor(value / 60);
                            let sec = (value % 60).toFixed(3);
                            return `${min}:${sec.padStart(6, '0')}s`;
                        }
                    }
                }
            }
        }
    });
});
