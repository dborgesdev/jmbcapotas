import { useState } from "react";
import video from "../../assets/hero-video.mp4?url";
import { useReducedMotion } from "../../lib/use-reduced-motion";
import type { Media } from "../../lib/wordpress/types";
import { Picture } from "../common/Picture";
export function HeroVideo({ fallback }: { fallback?: Media }) {
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  return (
    <div className="absolute inset-0 -z-20 bg-[#25282b]">
      <Picture
        image={fallback}
        alt=""
        eager
        className="h-full w-full object-cover"
      />
      {!reduced && !failed && (
        <video
          src={video}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={fallback?.url}
          aria-hidden="true"
          onPlaying={() => setPlaying(true)}
          onError={() => setFailed(true)}
          className={
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 " +
            (playing ? "opacity-100" : "opacity-0")
          }
        />
      )}
    </div>
  );
}
