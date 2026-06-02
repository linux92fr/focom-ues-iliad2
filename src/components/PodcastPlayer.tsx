import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface PodcastPlayerProps {
  audioUrl: string;
  title: string;
  episodeNumber: number;
  coverUrl?: string;
  durationSeconds?: number;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

function formatTime(s: number): string {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function PodcastPlayer({
  audioUrl, title, episodeNumber, coverUrl, durationSeconds,
}: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds ?? 0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1); // 1x par défaut
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDuration = () => { if (!isNaN(audio.duration)) setDuration(audio.duration); };
    const onEnded = () => setPlaying(false);
    const onCanPlay = () => setLoaded(true);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("canplay", onCanPlay);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  }, [playing]);

  const seek = useCallback((val: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = val[0];
    setCurrentTime(val[0]);
  }, []);

  const skip = useCallback((sec: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(0, audio.currentTime + sec), duration);
  }, [duration]);

  const changeVolume = useCallback((val: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = val[0];
    setVolume(val[0]);
    setMuted(val[0] === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  }, [muted]);

  const cycleSpeed = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = (speedIdx + 1) % SPEEDS.length;
    audio.playbackRate = SPEEDS[next];
    setSpeedIdx(next);
  }, [speedIdx]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-2xl bg-[#13233A] text-white overflow-hidden shadow-xl">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Top : cover + infos */}
      <div className="flex items-center gap-4 p-4 sm:p-5">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-white/10">
          {coverUrl
            ? <img src={coverUrl} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white/30">
                #{episodeNumber}
              </div>
          }
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-red-300">
            Épisode {episodeNumber}
          </p>
          <p className="text-base sm:text-lg font-bold leading-tight mt-0.5 truncate">{title}</p>
          <p className="text-xs text-white/50 mt-0.5">FOCOM UES ILIAD · Podcast syndical</p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="px-4 sm:px-5">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={seek}
          disabled={!loaded}
          className="[&_[role=slider]]:bg-red-500 [&_[role=slider]]:border-0 [&_.bg-primary]:bg-red-500"
        />
        <div className="flex justify-between text-[10px] text-white/40 mt-1 mb-3">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Contrôles */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex items-center justify-between gap-2">
        {/* Skip -15 */}
        <button onClick={() => skip(-15)} className="text-white/60 hover:text-white transition-colors flex flex-col items-center" title="Reculer 15s">
          <SkipBack className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">15s</span>
        </button>

        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          disabled={!loaded}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-50 flex items-center justify-center shadow-lg transition-all active:scale-95"
        >
          {playing
            ? <Pause className="w-6 h-6 fill-white text-white" />
            : <Play className="w-6 h-6 fill-white text-white ml-0.5" />
          }
        </button>

        {/* Skip +30 */}
        <button onClick={() => skip(30)} className="text-white/60 hover:text-white transition-colors flex flex-col items-center" title="Avancer 30s">
          <SkipForward className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">30s</span>
        </button>

        {/* Vitesse */}
        <button onClick={cycleSpeed} className="text-[11px] font-bold text-white/60 hover:text-white w-10 text-center transition-colors">
          {SPEEDS[speedIdx]}×
        </button>

        {/* Volume */}
        <div className="hidden sm:flex items-center gap-2">
          <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
            {muted || volume === 0
              ? <VolumeX className="w-4 h-4" />
              : <Volume2 className="w-4 h-4" />
            }
          </button>
          <div className="w-20">
            <Slider
              value={[muted ? 0 : volume]}
              max={1}
              step={0.05}
              onValueChange={changeVolume}
              className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_.bg-primary]:bg-white/70"
            />
          </div>
        </div>

        {/* Téléchargement */}
        <a
          href={audioUrl}
          download
          className="text-white/60 hover:text-white transition-colors"
          title="Télécharger l'épisode"
        >
          <Download className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
