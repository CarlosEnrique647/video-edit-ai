
import React from 'react';

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">V</div>
          <span>VIDEO EDIT <strong>AI</strong></span>
        </div>

        <div className="topbar-center">
          <span className="status-dot"></span>
          Editor de video inteligente
        </div>

        <button className="export-button" disabled>
          Exportar video
        </button>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <div className="sidebar-title">HERRAMIENTAS</div>

          <button className="tool active">
            <span>✂️</span> Edición
          </button>
          <button className="tool">
            <span>🤖</span> Inteligencia artificial
          </button>
          <button className="tool">
            <span>📝</span> Subtítulos
          </button>
          <button className="tool">
            <span>🎨</span> Efectos y filtros
          </button>
          <button className="tool">
            <span>🔊</span> Audio
          </button>

          <div className="sidebar-bottom">
            <div className="local-card">
              <span>🛡️</span>
              <div>
                <strong>Procesamiento local</strong>
                <p>Tus archivos permanecen en tu dispositivo.</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="editor">
          <div className="editor-heading">
            <div>
              <h1>Mi espacio de edición</h1>
              <p>Todo lo que necesitas para crear tus videos.</p>
            </div>
            <span className="project-label">PROYECTO NUEVO</span>
          </div>

          <div className="preview-area">
            <div className="preview-screen">
              <div className="preview-content">
                <div className="play-icon">▶</div>
                <h2>Tu próximo video comienza aquí</h2>
                <p>Importa un archivo para comenzar a editar.</p>
                <label className="import-button">
                  <span>＋</span> Importar video
                  <input type="file" accept="video/*" hidden />
                </label>
              </div>
              <div className="preview-time">00:00 / 00:00</div>
            </div>
          </div>

          <section className="timeline">
            <div className="timeline-header">
              <h2>Línea de tiempo</h2>
              <span>00:00:00</span>
            </div>

            <div className="timeline-ruler">
              <span>00:00</span>
              <span>00:10</span>
              <span>00:20</span>
              <span>00:30</span>
              <span>00:40</span>
              <span>00:50</span>
            </div>

            <div className="track">
              <span className="track-icon">🎬</span>
              <span>Video principal</span>
              <div className="empty-track">Arrastra aquí tus videos</div>
            </div>

            <div className="track">
              <span className="track-icon">🔊</span>
              <span>Audio</span>
              <div className="empty-track">Añade una pista de audio</div>
            </div>

            <div className="track">
              <span className="track-icon">T</span>
              <span>Texto</span>
              <div className="empty-track">Añade títulos y subtítulos</div>
            </div>
          </section>
        </section>

        <aside className="properties">
          <h2>Panel de edición</h2>
          <div className="properties-empty">
            <span>⚙️</span>
            <strong>Sin elementos seleccionados</strong>
            <p>Selecciona un elemento de tu proyecto para editar sus propiedades.</p>
          </div>
        </aside>
      </main>

      <footer className="app-footer">
        <span>VIDEO EDIT AI · Versión inicial</span>
        <span>Diseñado para crear. Potenciado por tu dispositivo.</span>
      </footer>
    </div>
  );
}
