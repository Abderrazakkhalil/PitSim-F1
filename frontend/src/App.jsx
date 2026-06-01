import React, { useState } from 'react';
import RaceConfigForm from './components/RaceConfigForm';
import DashboardResults from './components/DashboardResults';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function App() {
  const [optimizationData, setOptimizationData] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = (formData) => {
    setIsOptimizing(true);
    setOptimizationData(null);

    fetch(`${API_BASE}/api/optimize/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((r) => {
        if (!r.ok) {
          return r.json().then((errData) => {
            throw new Error(errData.message || "Erreur serveur lors de l'optimisation.");
          });
        }
        return r.json();
      })
      .then((data) => {
        setOptimizationData(data);
      })
      .catch((err) => {
        console.error(err);
        setOptimizationData({
          status: 'error',
          message: err.message || "Impossible de se connecter au serveur backend F1."
        });
      })
      .finally(() => {
        setIsOptimizing(false);
      });
  };

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="brand">
            <i className="bi bi-flag-fill"></i> PITSIM-F1 v3.0
          </div>
          <div className="sub-brand ms-3" style={{ marginLeft: '20px' }}>
            Département IA &amp; Data Science | Édition React &amp; Django Decoupled
          </div>
        </div>
        <div>
          <button className="logout-btn">
            Logout <i className="bi bi-person-circle"></i>
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="main-layout">
        <div className="layout-grid">
          
          {/* Formulaire de Configuration (Gauche) */}
          <RaceConfigForm onFormSubmit={handleOptimize} isOptimizing={isOptimizing} />

          {/* Résultats de Télémétrie et Optimisation (Droite) */}
          <DashboardResults data={optimizationData} />

        </div>

        {/* Footer */}
        <div className="text-center text-muted" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '24px' }}>
          PitSim-F1 — <span style={{ color: 'var(--accent-yellow)' }}>Cahier des Charges v3.0</span> | Département IA &amp; Data Science | 2026 |
          Optimisation Combinatoire · Machine Learning · Programmation Dynamique · Clustering K-Means
        </div>
      </div>
    </div>
  );
}
