import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8000';

export default function RaceConfigForm({ onFormSubmit, isOptimizing }) {
  const [initialData, setInitialData] = useState(null);
  const [ecurieId, setEcurieId] = useState('');
  const [circuitId, setCircuitId] = useState('');
  // `nombreTours` is computed server-side from circuit metadata
  const [meteoInitiale, setMeteoInitiale] = useState(1);
  const [tourPluie, setTourPluie] = useState(0);
  const [gommeDepart, setGommeDepart] = useState('Medium');
  const [agressivite, setAgressivite] = useState('moyen');
  const [tBase, setTBase] = useState(90.0);

  const [ecurieDetails, setEcurieDetails] = useState(null);
  const [circuitDetails, setCircuitDetails] = useState(null);

  // Charger les données initiales (écuries, circuits, gommes, etc.)
  useEffect(() => {
    fetch(`${API_BASE}/api/initial-data/`)
      .then((r) => r.json())
      .then((data) => {
        setInitialData(data);
        if (data.ecuries && data.ecuries.length > 0) {
          setEcurieId(data.ecuries[0].id);
        }
        if (data.circuits && data.circuits.length > 0) {
          setCircuitId(data.circuits[0].id);
        }
      })
      .catch((err) => console.error("Erreur de chargement des données initiales:", err));
  }, []);

  // Charger les détails de l'écurie sélectionnée
  useEffect(() => {
    if (!ecurieId) {
      setEcurieDetails(null);
      return;
    }
    fetch(`${API_BASE}/api/ecurie-details/?ecurie=${ecurieId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setEcurieDetails(data);
      })
      .catch((err) => console.error(err));
  }, [ecurieId]);

  // Charger les détails du circuit sélectionné
  useEffect(() => {
    if (!circuitId) {
      setCircuitDetails(null);
      return;
    }
    fetch(`${API_BASE}/api/circuit-details/?circuit=${circuitId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setCircuitDetails(data);
      })
      .catch((err) => console.error(err));
  }, [circuitId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ecurieId || !circuitId) return;

    onFormSubmit({
      ecurie: parseInt(ecurieId),
      circuit: parseInt(circuitId),
      meteo_initiale: parseInt(meteoInitiale),
      tour_pluie: parseInt(tourPluie),
      gomme_depart: gommeDepart,
      agressivite: agressivite,
      t_base: parseFloat(tBase)
    });
  };

  const getMeteoLabel = (val) => {
    const labels = { 1: "Sec", 2: "Humide", 3: "Pluie" };
    return labels[val] || "Sec";
  };

  if (!initialData) {
    return (
      <div className="custom-card p-3 text-center">
        <div className="spinner-border spinner-border-sm text-warning me-2" role="status"></div>
        Chargement des paramètres...
      </div>
    );
  }

  return (
    <div className="custom-card">
      <div className="card-header-beige">Race Configuration (F1) (Module F1)</div>
      <div className="p-3">
        <form onSubmit={handleSubmit} id="config-form">
          
          {/* Écurie */}
          <div className="form-group">
            <label className="form-label">Sélection de l'Écurie</label>
            <select
              className="form-select"
              value={ecurieId}
              onChange={(e) => setEcurieId(e.target.value)}
              required
            >
              <option value="">-- Sélectionnez une écurie --</option>
              {initialData.ecuries.map((e) => (
                <option key={e.id} value={e.id}>{e.nom}</option>
              ))}
            </select>
            {ecurieDetails && (
              <div className="details-panel mt-1">
                <i className="bi bi-info-circle"></i> γ={ecurieDetails.gamma} | T_pit={ecurieDetails.t_pit}s | {ecurieDetails.profil}
              </div>
            )}
          </div>

          {/* Circuit */}
          <div className="form-group">
            <label className="form-label">
              Sélection du Circuit 🏁
              <span className="text-primary" style={{ fontSize: '0.65rem', fontWeight: 'normal' }}>IA-2 clustering</span>
            </label>
            <select
              className="form-select"
              value={circuitId}
              onChange={(e) => setCircuitId(e.target.value)}
              required
            >
              <option value="">-- Sélectionnez un circuit --</option>
              {initialData.circuits.map((c) => (
                <option key={c.id} value={c.id}>{c.nom_circuit}</option>
              ))}
            </select>
            {circuitDetails && (
              <div className="details-panel mt-1">
                <span className="badge bg-warning text-dark me-2">Cluster: {circuitDetails.cluster_label || 'N/A'}</span>
                T°piste: {circuitDetails.temp_piste_moy}°C
              </div>
            )}
          </div>

          {/* Nombre de tours officiel (déterminé par le circuit) */}
          <div className="form-group">
            <label className="form-label">Nombre de Tours (officiel)</label>
            <div className="read-only-field fw-bold text-warning">
              {circuitDetails?.official_laps || (initialData.circuits.find(c=>c.id==circuitId)?.official_laps) || 55}
            </div>
          </div>

          {/* Météo Initiale */}
          <div className="form-group">
            <label className="form-label">
              <span>Météo Initiale ☀️</span>
              <span>
                <span className="fw-bold text-warning">{getMeteoLabel(meteoInitiale)}</span>
                <span> 🌧️</span>
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="1"
              className="form-range"
              value={meteoInitiale}
              onChange={(e) => setMeteoInitiale(e.target.value)}
            />
          </div>

          {/* Injection Pluie */}
          <div className="form-group">
            <label className="form-label">
              Injection Pluie <i className="bi bi-info-circle"></i> 
              <span className="fw-bold text-warning">
                {tourPluie === 0 ? "Aucune" : `Tour ${tourPluie}`}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="78"
              step="1"
              className="form-range"
              value={tourPluie}
              onChange={(e) => setTourPluie(e.target.value)}
            />
          </div>

          {/* Gomme de départ */}
          <div className="form-group">
            <label className="form-label">Gomme de Départ 🛞</label>
            <select
              className="form-select"
              value={gommeDepart}
              onChange={(e) => setGommeDepart(e.target.value)}
            >
              {initialData.gommes.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          {/* Style de conduite */}
          <div className="form-group">
            <label className="form-label">Style de Conduite</label>
            <div className="agressivite-radio">
              {initialData.agressivite.map((a) => (
                <label key={a.value} className="radio-option">
                  <input
                    type="radio"
                    name="agressivite"
                    value={a.value}
                    checked={agressivite === a.value}
                    onChange={(e) => setAgressivite(e.target.value)}
                  />
                  {a.label}
                </label>
              ))}
            </div>
          </div>

          {/* Temps de base (t_base) caché */}
          <input type="hidden" value={tBase} />

          <button type="submit" className="btn-submit" disabled={isOptimizing}>
            {isOptimizing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Calcul en cours...
              </>
            ) : (
              <>
                <i className="bi bi-play-circle me-1"></i> Calculer Stratégie Optimale
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
