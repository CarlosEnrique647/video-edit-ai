
import React, { useRef, useState, useEffect } from 'react';

export default function App() {
  const [video, setVideo] = useState(null);
  const [videoName, setVideoName] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '00:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function importVideo(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (video) URL.revokeObjectURL(video);

    const url = URL.createObjectURL(file);
    setVideo(url);
    setVideoName(file.name);
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    event.target.value = '';
  }

  function removeVideo() {
    if (video) URL.revokeObjectURL(video);
    setVideo(null);
    setVideoName('');
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
  }

  function seekVideo(value) {
    const time = Number(value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }

  function togglePlayback() {
    const player = videoRef.current;
    if (!player) return;

    if (player.paused) {
      player.play().catch(() => {});
    } else {
      player.pause();
    }
  }

  useEffect(() => {
    return () => {
      if (video) URL.revokeObjectURL(video);
    };
  }, [video]);

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
          <button className="tool active"><span>✂️</span> Edición</button>
          <button className="tool"><span>🤖</span> Inteligencia artificial</button>
          <button className="tool"><span>📝</span> Subtítulos</button>
          <button className="tool"><span>🎨</span> Efectos y filtros</button>
          <button className="tool"><span>🔊</span> Audio</button>

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
              {video ? (
                <video
                  ref={videoRef}
                  className="video-preview"
                  src={video}
                  controls
                  onLoadedMetadata={(event) => {
                    setDuration(event.currentTarget.duration);
                  }}
                  onTimeUpdate={(event) => {
                    setCurrentTime(event.currentTarget.currentTime);
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
              ) : (
                <div className="preview-content">
                  <div className="play-icon">▶</div>
                  <h2>Tu próximo video comienza aquí</h2>
                  <p>Importa un archivo para comenzar a editar.</p>
                  <label className="import-button">
                    <span>＋</span> Importar video
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={importVideo}
                      hidden
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {video && (
            <>
              <div className="imported-file">
                <span>🎬</span>
                <span>{videoName}</span>
                <button onClick={removeVideo}>Quitar video</button>
              </div>

              <div className="playback-controls">
                <button onClick={togglePlayback}>
                  {isPlaying ? '❚❚ Pausar' : '▶ Reproducir'}
                </button>
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </>
          )}

          <section className="timeline">
            <div className="timeline-header">
              <h2>Línea de tiempo</h2>
              <span>{formatTime(currentTime)}</span>
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
              <div className="empty-track">
                {video ? videoName : 'Importa un video para comenzar'}
              </div>
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

            {video && (
              <div className="timeline-seek">
                <label htmlFor="timeline-range">
                  DESPLAZAMIENTO POR EL VIDEO
                </label>
                <input
                  id="timeline-range"
                  type="range"
                  min="0"
                  max={duration || 1}
                  step="0.01"
                  value={Math.min(currentTime, duration || 1)}
                  onChange={(event) => seekVideo(event.target.value)}
                />
                <div className="seek-times">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}
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
