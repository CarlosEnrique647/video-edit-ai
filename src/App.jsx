
import React, { useEffect, useRef, useState } from 'react';

const makeId = () => `${Date.now()}-${Math.random()}`;

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

function createThumbnail(url, time, duration) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    const finish = (result) => {
      video.removeAttribute('src');
      video.load();
      resolve(result);
    };

    video.onerror = () => finish(null);

    video.onloadedmetadata = () => {
      const safeTime = Math.min(time, Math.max(0, duration - 0.1));
      video.currentTime = safeTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 90;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL('image/jpeg', 0.65));
      } catch {
        finish(null);
      }
    };
  });
}

export default function App() {
  const [clips, setClips] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePanel, setActivePanel] = useState('editor');
  const [loading, setLoading] = useState(false);

  const playerRef = useRef(null);
  const clipsRef = useRef([]);
  const indexRef = useRef(0);
  const fileInputRef = useRef(null);
  const urlsRef = useRef([]);

  useEffect(() => {
    clipsRef.current = clips;
    const total = clips.reduce((sum, clip) => sum + clip.duration, 0);
    setTotalDuration(total);
  }, [clips]);

  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      urlsRef.current.forEach(URL.revokeObjectURL);
    };
  }, []);

  async function importVideos(event) {
    const files = Array.from(event.target.files || []).filter(
      (file) => file.type.startsWith('video/')
    );

    if (!files.length) return;

    setLoading(true);
    setIsPlaying(false);

    const newClips = [];

    for (const file of files) {
      const url = URL.createObjectURL(file);
      urlsRef.current.push(url);

      const metadata = await new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = url;

        video.onloadedmetadata = () => {
          resolve({
            duration: Number.isFinite(video.duration) ? video.duration : 0
          });
        };

        video.onerror = () => resolve({ duration: 0 });
      });

      const duration = metadata.duration;

      if (!duration) continue;

      const thumbnailCount = Math.min(8, Math.max(2, Math.ceil(duration / 5)));
      const thumbnails = await Promise.all(
        Array.from({ length: thumbnailCount }, (_, i) =>
          createThumbnail(url, (duration * i) / thumbnailCount, duration)
        )
      );

      newClips.push({
        id: makeId(),
        name: file.name,
        url,
        duration,
        thumbnails: thumbnails.filter(Boolean)
      });
    }

    setClips((previous) => [...previous, ...newClips]);
    if (newClips.length && clipsRef.current.length === 0) {
      setSelectedId(newClips[0].id);
      setCurrentIndex(0);
      setCurrentTime(0);
    } else if (newClips.length && !selectedId) {
      setSelectedId(newClips[0].id);
    }

    setLoading(false);
    event.target.value = '';
  }

  function selectClip(clip, index) {
    setIsPlaying(false);
    setSelectedId(clip.id);
    setCurrentIndex(index);
    setCurrentTime(0);

    if (playerRef.current) {
      playerRef.current.src = clip.url;
      playerRef.current.load();
    }
  }

  function removeClip(id) {
    const index = clips.findIndex((clip) => clip.id === id);
    const next = clips.filter((clip) => clip.id !== id);

    setIsPlaying(false);
    setClips(next);

    if (selectedId === id) {
      setSelectedId(next[0]?.id || null);
      setCurrentIndex(0);
      setCurrentTime(0);

      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.src = next[0]?.url || '';
      }
    } else if (index < currentIndex) {
      setCurrentIndex((value) => Math.max(0, value - 1));
    }
  }

  function moveClip(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= clips.length) return;

    const reordered = [...clips];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setClips(reordered);

    if (reordered[currentIndex]) {
      setSelectedId(reordered[currentIndex].id);
    }
  }

  function playNext() {
    const nextIndex = indexRef.current + 1;
    if (nextIndex >= clipsRef.current.length) {
      setIsPlaying(false);
      setCurrentTime(totalDuration);
      return;
    }

    const nextClip = clipsRef.current[nextIndex];
    setCurrentIndex(nextIndex);
    indexRef.current = nextIndex;
    setSelectedId(nextClip.id);
    setCurrentTime(0);

    if (playerRef.current) {
      playerRef.current.src = nextClip.url;
      playerRef.current.load();
      playerRef.current.play().catch(() => setIsPlaying(false));
    }
  }

  function togglePlayback() {
    const player = playerRef.current;
    if (!player || !clips.length) return;

    if (player.paused) {
      player.play().catch(() => setIsPlaying(false));
    } else {
      player.pause();
    }
  }

  function seek(value) {
    if (playerRef.current) {
      playerRef.current.currentTime = Number(value);
      setCurrentTime(Number(value));
    }
  }

  const selectedClip = clips.find((clip) => clip.id === selectedId);
  const timelinePosition =
    clips.slice(0, currentIndex).reduce((sum, clip) => sum + clip.duration, 0) +
    currentTime;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">V</div>
          <span>VIDEO EDIT <strong>AI</strong></span>
        </div>

        <div className="topbar-center">
          <span className="status-dot"></span>
          Editor multipista
        </div>

        <button className="export-button" disabled>
          Exportar
        </button>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <div className="sidebar-title">ESPACIOS DE TRABAJO</div>

          <button
            className={`tool ${activePanel === 'editor' ? 'active' : ''}`}
            onClick={() => setActivePanel('editor')}
          >
            <span>🎬</span> Editor de video
          </button>

          <button
            className={`tool ${activePanel === 'ai' ? 'active' : ''}`}
            onClick={() => setActivePanel('ai')}
          >
            <span>🤖</span> Laboratorio IA
          </button>

          <button className="tool"><span>📁</span> Mis proyectos</button>
          <button className="tool"><span>⚙️</span> Configuración</button>

          <div className="sidebar-bottom">
            <div className="local-card">
              <span>🛡️</span>
              <div>
                <strong>Procesamiento local</strong>
                <p>Los videos se procesan en tu dispositivo.</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="editor">
          {activePanel === 'editor' ? (
            <>
              <div className="editor-heading">
                <div>
                  <h1>Editor multipista</h1>
                  <p>Organiza varios videos en una sola edición.</p>
                </div>

                <button
                  className="import-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  ＋ Importar videos
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  hidden
                  onChange={importVideos}
                />
              </div>

              {loading && <p className="loading-message">Preparando videos y miniaturas...</p>}

              <div className="preview-area">
                <div className="preview-screen">
                  {selectedClip ? (
                    <video
                      ref={playerRef}
                      className="video-preview"
                      src={selectedClip.url}
                      onLoadedMetadata={(event) => {
                        const player = event.currentTarget;
                        if (Number.isFinite(player.duration)) {
                          setCurrentTime(player.currentTime);
                        }
                      }}
                      onTimeUpdate={(event) =>
                        setCurrentTime(event.currentTarget.currentTime)
                      }
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={playNext}
                    />
                  ) : (
                    <div className="preview-content">
                      <div className="play-icon">▶</div>
                      <h2>Tu próximo video comienza aquí</h2>
                      <p>Importa varios videos para crear tu proyecto.</p>
                      <button
                        className="import-button"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        ＋ Importar videos
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="transport-controls">
                <button title="Ir al primer clip" onClick={() => clips[0] && selectClip(clips[0], 0)}>
                  ⏮
                </button>
                <button title="Reproducir o pausar" onClick={togglePlayback}>
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <button title="Siguiente clip" onClick={playNext}>
                  ⏭
                </button>
                <span>{formatTime(timelinePosition)} / {formatTime(totalDuration)}</span>
              </div>

              <section className="timeline">
                <div className="timeline-header">
                  <h2>Línea de tiempo</h2>
                  <span>{clips.length} clips · {formatTime(totalDuration)}</span>
                </div>

                <div className="timeline-ruler">
                  <span>INICIO</span>
                  <span>SECUENCIA DE VIDEO</span>
                  <span>FINAL</span>
                </div>

                <div className="timeline-track">
                  <div className="track-label">🎬 VIDEO 1</div>

                  <div className="clip-lane">
                    {clips.length === 0 ? (
                      <div className="empty-track">
                        Importa varios videos para comenzar
                      </div>
                    ) : (
                      clips.map((clip, index) => (
                        <div
                          key={clip.id}
                          className={`video-clip ${selectedId === clip.id ? 'selected' : ''}`}
                          onClick={() => selectClip(clip, index)}
                          style={{
                            width: `${Math.max(180, clip.duration * 18)}px`
                          }}
                        >
                          <div className="clip-thumbnails">
                            {clip.thumbnails.map((thumbnail, i) => (
                              <img key={i} src={thumbnail} alt="" />
                            ))}
                          </div>

                          <div className="clip-caption">
                            <span>{clip.name}</span>
                            <small>{formatTime(clip.duration)}</small>
                          </div>

                          <div className="clip-actions">
                            <button
                              title="Mover a la izquierda"
                              onClick={(event) => {
                                event.stopPropagation();
                                moveClip(index, -1);
                              }}
                            >◀</button>
                            <button
                              title="Mover a la derecha"
                              onClick={(event) => {
                                event.stopPropagation();
                                moveClip(index, 1);
                              }}
                            >▶</button>
                            <button
                              title="Eliminar clip"
                              onClick={(event) => {
                                event.stopPropagation();
                                removeClip(clip.id);
                              }}
                            >×</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="timeline-track">
                  <div className="track-label">🔊 AUDIO</div>
                  <div className="clip-lane">
                    <div className="empty-track">Pista de audio preparada</div>
                  </div>
                </div>

                <div className="timeline-track">
                  <div className="track-label">T TEXTO</div>
                  <div className="clip-lane">
                    <div className="empty-track">Pista de texto preparada</div>
                  </div>
                </div>

                {selectedClip && (
                  <div className="timeline-seek">
                    <label>POSICIÓN DENTRO DEL CLIP</label>
                    <input
                      type="range"
                      min="0"
                      max={selectedClip.duration || 1}
                      step="0.01"
                      value={Math.min(currentTime, selectedClip.duration)}
                      onChange={(event) => seek(event.target.value)}
                    />
                    <div className="seek-times">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(selectedClip.duration)}</span>
                    </div>
                  </div>
                )}
              </section>
            </>
          ) : (
            <section className="ai-placeholder">
              <div className="play-icon">✦</div>
              <h1>Laboratorio de inteligencia artificial</h1>
              <p>Próximamente: quitar fondos, subtítulos, limpieza de audio y mejora de video.</p>
            </section>
          )}
        </section>

        <aside className="properties">
          <h2>Propiedades del proyecto</h2>

          {selectedClip ? (
            <div className="properties-empty">
              <span>🎬</span>
              <strong>{selectedClip.name}</strong>
              <p>Duración: {formatTime(selectedClip.duration)}</p>
              <p>Clip {currentIndex + 1} de {clips.length}</p>
            </div>
          ) : (
            <div className="properties-empty">
              <span>⚙️</span>
              <strong>Sin elementos seleccionados</strong>
              <p>Importa un video para comenzar.</p>
            </div>
          )}
        </aside>
      </main>

      <footer className="app-footer">
        <span>VIDEO EDIT AI · Editor multipista</span>
        <span>Diseñado para crear. Potenciado por tu dispositivo.</span>
      </footer>
    </div>
  );
}
