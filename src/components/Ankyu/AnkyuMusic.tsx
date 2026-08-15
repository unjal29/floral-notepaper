import { useEffect, useRef, useState } from "react";

export interface MusicTrack {
  title: string;
  artist: string;
  url: string;
  cover?: string;
}

const DEFAULT_TRACKS: MusicTrack[] = [
  { title: "Choose an audio file", artist: "Local playlist", url: "" },
];

/**
 * A browser-native music card for the Ankyu rail.
 *
 * The original implementation depended on an Astro island. Keeping the
 * player on HTMLAudioElement means it works in the Tauri webview, Vite
 * preview, and the portable Windows build without a framework runtime.
 */
export function AnkyuMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const [tracks, setTracks] = useState<MusicTrack[]>(DEFAULT_TRACKS);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const current = tracks[index] ?? DEFAULT_TRACKS[0];
  const hasAudio = Boolean(current.url);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.src = current.url;
    audio.load();
    setProgress(0);
    setDuration(0);

    if (playing && current.url) {
      void audio.play().catch(() => setPlaying(false));
    }
  }, [current.url, playing]);

  useEffect(() => () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  });

  const openFilePicker = () => fileRef.current?.click();

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) {
      openFilePicker();
      return;
    }
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  };

  const loadFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files)
      .filter((file) => file.type.startsWith("audio/"))
      .map((file) => {
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.push(url);
        return {
          title: file.name.replace(/\.[^.]+$/, ""),
          artist: "Local file",
          url,
        } satisfies MusicTrack;
      });
    if (!next.length) return;

    const wasPlaceholder = tracks.length === 1 && !tracks[0].url;
    setTracks((currentTracks) => (wasPlaceholder ? next : [...currentTracks, ...next]));
    if (wasPlaceholder) setIndex(0);
    setPlaying(false);
    setExpanded(true);
  };

  return (
    <section className="editor-card music-card ankyu-music" aria-label="Music player">
      <div className="editor-card-heading">
        <button
          type="button"
          className="plain-title"
          onClick={() => setExpanded((value) => !value)}
        >
          Music
        </button>
        <div className="music-actions">
          <button
            type="button"
            onClick={openFilePicker}
            title="Add local tracks"
            aria-label="Add local tracks"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            title={expanded ? "Collapse playlist" : "Show playlist"}
            aria-label={expanded ? "Collapse playlist" : "Show playlist"}
          >
            {expanded ? "−" : "list"}
          </button>
        </div>
      </div>

      <div className="music-player">
        <div
          className="music-cover"
          style={current.cover ? { backgroundImage: `url(${current.cover})` } : undefined}
          aria-hidden="true"
        >
          {playing ? "♫" : "♪"}
        </div>
        <div className="music-now">
          <strong title={current.title}>{current.title}</strong>
          <span>{current.artist}</span>
          <input
            type="range"
            min={0}
            max={Math.max(1, duration)}
            value={Math.min(progress, duration || 1)}
            disabled={!hasAudio}
            aria-label="Track progress"
            onChange={(event) => {
              const value = Number(event.target.value);
              setProgress(value);
              if (audioRef.current) audioRef.current.currentTime = value;
            }}
          />
          <small>
            {formatTime(progress)} / {formatTime(duration)}
          </small>
        </div>
        <button
          type="button"
          className="music-play"
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
        >
          {hasAudio && playing ? "pause" : "play"}
        </button>
      </div>

      {expanded && (
        <div className="music-playlist">
          {tracks.map((track, trackIndex) => (
            <button
              type="button"
              key={`${track.title}-${trackIndex}`}
              className={trackIndex === index ? "active" : ""}
              onClick={() => {
                setIndex(trackIndex);
                setPlaying(Boolean(track.url));
              }}
            >
              <span>{track.title}</span>
              <small>{track.artist}</small>
            </button>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
        multiple
        hidden
        onChange={(event) => {
          loadFiles(event.target.files);
          event.currentTarget.value = "";
        }}
      />
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          if (tracks.length <= 1) {
            setPlaying(false);
            setProgress(0);
            return;
          }
          setIndex((value) => (value + 1) % tracks.length);
          setPlaying(true);
        }}
      />
    </section>
  );
}

function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const seconds = Math.floor(value);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
