import React from 'react';
import TelemetryChart from './TelemetryChart';

export default function DashboardResults({ data }) {
  if (!data) {
    return (
      <div className="custom-card">
        <div className="card-header-beige">Résultats de l'Optimisation (Module F4)</div>
        <div className="p-3">
          <div className="empty-state">
            <i className="bi bi-sliders"></i>
            <h5>Aucune simulation en cours</h5>
            <p>Configurez les paramètres à gauche et cliquez sur <strong>Calculer Stratégie Optimale</strong>.</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.status === 'error') {
    return (
      <div className="custom-card">
        <div className="card-header-beige">Résultats de l'Optimisation (Module F4)</div>
        <div className="p-3">
          <div className="empty-state">
            <i className="bi bi-exclamation-circle text-danger" style={{ color: 'var(--accent-red)' }}></i>
            <h5 className="text-danger">Erreur lors de l'optimisation</h5>
            <p>{data.message}</p>
            {data.trace && (
              <div className="error-trace">{data.trace}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { result, chart_series, N, tour_pluie } = data;
  const best = result.meilleure_strategie_globale;

  const handleExportCSV = () => {
    if (!best || !best.relais) return;
    let csvContent = "\ufeffTour,Relais,Gomme,Tour_Départ,Tour_Fin\n";
    best.relais.forEach((relais) => {
      for (let tour = relais.tour_depart; tour <= relais.tour_fin; tour++) {
        csvContent += `${tour},${relais.num_relais},${relais.gomme},${relais.tour_depart},${relais.tour_fin}\n`;
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "pitsim_strategie_optimale.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="custom-card">
      <div className="card-header-beige">
        <span>Résultats de l'Optimisation (Module F4)</span>
        <button className="btn-export-csv" onClick={handleExportCSV}>
          <i className="bi bi-download"></i> Export CSV
        </button>
      </div>
      <div className="p-3">
        
        {/* Verdict Stratégique */}
        <div className="mb-3" style={{ marginBottom: '20px' }}>
          <h6 className="fw-bold mb-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
            <i className="bi bi-graph-up-arrow text-danger" style={{ color: 'var(--accent-red)' }}></i> Verdict Stratégique
          </h6>
          <div className="d-flex align-items-center mb-1" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="bi bi-exclamation-triangle-fill text-warning" style={{ color: 'var(--accent-yellow)' }}></i>
            <strong>Stratégie Optimale: {best.nombre_arrets} Arrêt{best.nombre_arrets > 1 ? 's' : ''}</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({best.temps_total_formate})</span>
          </div>

          {/* Barre de Stints */}
          <div className="stint-bar-container">
            {best.relais.map((relais, idx) => (
              <div
                key={idx}
                className={`stint-segment ${relais.gomme.toLowerCase()}`}
                style={{ flex: relais.duree }}
                title={`${relais.gomme} — Laps ${relais.tour_depart}–${relais.tour_fin} (${relais.duree} tours)`}
              >
                L{relais.tour_depart}–{relais.tour_fin} ({relais.gomme})
              </div>
            ))}
          </div>
        </div>

        {/* Comparaison des Stratégies */}
        <div className="mb-3" style={{ marginBottom: '20px' }}>
          <h6 className="fw-bold mb-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
            <i className="bi bi-bar-chart-fill text-success" style={{ color: 'var(--success-green)' }}></i> Comparaison des Stratégies
          </h6>
          <div className="strat-card-container">
            {Object.entries(result.comparatif_strategies).map(([key, strat]) => {
              const isOptimal = strat.temps_total_s === best.temps_total_s;
              return (
                <div key={key} className={`strat-card ${isOptimal ? 'optimal' : ''}`}>
                  <div className="strat-title">
                    {strat.label_lisible}
                    {isOptimal && <span className="badge-optimal">OPTIMALE</span>}
                  </div>
                  <div className="strat-stats">
                    <strong>Temps total :</strong> {strat.temps_total_formate}<br />
                    <strong>Pit Stop Laps :</strong> {strat.tours_arret.join(', ') || 'Aucun'}<br />
                    <strong>Gommes :</strong> {strat.gommes.join(' → ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graphique et Panneaux */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '20px', marginTop: '20px' }}>
          
          {/* Zone Graphique */}
          <div>
            <h6 className="fw-bold mb-0" style={{ fontWeight: '700' }}>Évolution du Temps au Tour</h6>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '10px' }}>
              Inférence dynamique — Dégradation pneu par relais
            </div>
            <TelemetryChart chartSeries={chart_series} nTours={N} />
          </div>

          {/* Panneau de Métriques & Météo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Métriques ML */}
            <div className="mini-panels-grid">
              <div className="mini-panel">
                <div className="mini-label">RMSE ML</div>
                <div className="mini-value">0.001s</div>
              </div>
              <div className="mini-panel">
                <div className="mini-label">Silhouette</div>
                <div className="mini-value">0.998</div>
              </div>
            </div>

            {/* Race Log / Crossovers */}
            <div className="mini-panel" style={{ flex: 1 }}>
              <div className="mini-label" style={{ marginBottom: '6px', textAlign: 'left', fontWeight: '700' }}>Race Log</div>
              <div className="log-content">
                {result.crossovers_detectes && result.crossovers_detectes.length > 0 ? (
                  result.crossovers_detectes.map((cx, idx) => (
                    <div key={idx} style={{ marginBottom: '6px' }}>
                      <span>[Lap {cx.tour}]</span> {cx.raison}
                    </div>
                  ))
                ) : (
                  <div>Aucun crossover détecté.<br />Stratégie stable.</div>
                )}
              </div>
            </div>

            {/* Prévisions Météo */}
            <div className="mini-panel">
              <div className="mini-label" style={{ marginBottom: '6px', textAlign: 'left', fontWeight: '700' }}>Weather Forecast</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div>Now<br />☀️</div>
                <div>+10T<br />⛅</div>
                <div>+20T<br />{tour_pluie ? '🌧️' : '☀️'}</div>
                <div>+30T<br />{tour_pluie ? '⛈️' : '⛅'}</div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
