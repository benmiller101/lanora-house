import { Link } from "wouter";
import { useRef, useState, useEffect, useCallback } from "react";
import logoWhite from "@assets/Lanora_house-Vertical-Logo-White_1771839642410.png";

const CLIP_COUNT = 9;
const FADE_DURATION = 1500;
const FADE_BEFORE_END = 2;
const START_INDEX = 5;

export default function Hero() {
  const refA = useRef<HTMLVideoElement>(null);
  const refB = useRef<HTMLVideoElement>(null);

  // Each slot tracks which clip index it is currently showing/buffering
  const [slotA, setSlotA] = useState(START_INDEX);
  const [slotB, setSlotB] = useState((START_INDEX + 1) % CLIP_COUNT);

  // Which slot is the foreground (visible) clip
  const [activeSlot, setActiveSlot] = useState<"a" | "b">("a");

  // Whether a cross-fade is in progress
  const [fading, setFading] = useState(false);

  const fadingRef = useRef(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prePlayTimerA = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prePlayTimerB = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeSlotRef = useRef<"a" | "b">("a");
  const nextClipRef = useRef((START_INDEX + 2) % CLIP_COUNT);

  useEffect(() => {
    activeSlotRef.current = activeSlot;
  }, [activeSlot]);

  const doTransition = useCallback(() => {
    if (fadingRef.current) return;
    fadingRef.current = true;

    const wasActive = activeSlotRef.current;
    const inactiveVid = wasActive === "a" ? refB.current : refA.current;

    if (inactiveVid) {
      inactiveVid.currentTime = 0;
      inactiveVid.play().catch(() => {});
    }

    setFading(true);

    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(() => {
      const nextIdx = nextClipRef.current;
      nextClipRef.current = (nextIdx + 1) % CLIP_COUNT;

      setFading(false);
      setActiveSlot(wasActive === "a" ? "b" : "a");

      // Hand the old-active slot a new clip to buffer
      if (wasActive === "a") {
        setSlotA(nextIdx);
      } else {
        setSlotB(nextIdx);
      }

      fadingRef.current = false;
    }, FADE_DURATION + 100);
  }, []);

  // Attach timeupdate + ended listeners to whichever slot is active
  useEffect(() => {
    const vid = activeSlot === "a" ? refA.current : refB.current;
    if (!vid) return;

    const onTimeUpdate = () => {
      if (!vid.duration || fadingRef.current) return;
      if (vid.duration - vid.currentTime <= FADE_BEFORE_END) doTransition();
    };
    const onEnded = () => doTransition();

    vid.addEventListener("timeupdate", onTimeUpdate);
    vid.addEventListener("ended", onEnded);
    return () => {
      vid.removeEventListener("timeupdate", onTimeUpdate);
      vid.removeEventListener("ended", onEnded);
    };
  }, [activeSlot, doTransition]);

  // When slotA changes: A is the new background slot. Load it, then pre-play silently.
  useEffect(() => {
    const vid = refA.current;
    if (!vid) return;
    vid.load();
    if (prePlayTimerA.current) clearTimeout(prePlayTimerA.current);
    prePlayTimerA.current = setTimeout(() => {
      if (activeSlotRef.current !== "a") {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      }
    }, 2000);
  }, [slotA]);

  // When slotB changes: B is the new background slot. Load it, then pre-play silently.
  useEffect(() => {
    const vid = refB.current;
    if (!vid) return;
    vid.load();
    if (prePlayTimerB.current) clearTimeout(prePlayTimerB.current);
    prePlayTimerB.current = setTimeout(() => {
      if (activeSlotRef.current !== "b") {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      }
    }, 2000);
  }, [slotB]);

  // Mount: start the initial active clip
  useEffect(() => {
    refA.current?.play().catch(() => {});
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (prePlayTimerA.current) clearTimeout(prePlayTimerA.current);
      if (prePlayTimerB.current) clearTimeout(prePlayTimerB.current);
    };
  }, []);

  // Opacity: active slot is 1, background is 0; they swap during fade
  const opacityA = activeSlot === "a" ? (fading ? 0 : 1) : fading ? 1 : 0;
  const opacityB = activeSlot === "b" ? (fading ? 0 : 1) : fading ? 1 : 0;
  const zIndexA = fading && activeSlot !== "a" ? 2 : 1;
  const zIndexB = fading && activeSlot !== "b" ? 2 : 1;

  return (
    <section className="relative min-h-[100dvh] overflow-hidden flex items-center justify-center">

      <video
        ref={refA}
        src={`/videos/hero-shot-${slotA + 1}.mp4`}
        muted
        playsInline
        preload="auto"
        poster={slotA === START_INDEX ? "/videos/hero-poster.jpg" : undefined}
        className="absolute inset-0 w-full h-full object-cover scale-105 blur-[5px]"
        style={{
          opacity: opacityA,
          transition: `opacity ${FADE_DURATION}ms ease`,
          zIndex: zIndexA,
        }}
      />

      <video
        ref={refB}
        src={`/videos/hero-shot-${slotB + 1}.mp4`}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover scale-105 blur-[5px]"
        style={{
          opacity: opacityB,
          transition: `opacity ${FADE_DURATION}ms ease`,
          zIndex: zIndexB,
        }}
      />

      <div
        className="absolute inset-0"
        style={{ backgroundColor: "#1a2080", opacity: 0.78, zIndex: 5 }}
      />

      <div
        className="container mx-auto px-4 relative flex justify-center"
        style={{ zIndex: 6 }}
      >
        <div className="text-center max-w-2xl">
          <img
            src={logoWhite}
            alt="Lanora House"
            className="h-28 md:h-40 w-auto mx-auto mb-6"
          />
          <h1 className="text-white font-display text-3xl md:text-[3rem] leading-tight mb-3 drop-shadow-lg">
            Cornwall's House Clearance Specialists
          </h1>
          <p className="text-white/70 text-sm md:text-base mb-4 tracking-wide">
            House Clearance&nbsp;&nbsp;|&nbsp;&nbsp;Property Clearance&nbsp;&nbsp;|&nbsp;&nbsp;Auction Services
          </p>
          <p className="text-neutral-200 text-base md:text-lg mb-3 font-light max-w-lg mx-auto leading-relaxed">
            Professional, sustainable property clearances across Cornwall &amp; Devon. We recycle, rehome, and recover value from every clearance.
          </p>
          <p className="text-white/50 text-xs md:text-sm mb-8 tracking-wide">
            Monthly Saturday · 10am · Online Only &middot; Viewing Fridays 11am–4pm, Hayle
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
            <Link
              href="/contact"
              className="bg-white hover:bg-neutral-100 text-primary py-2.5 px-7 rounded-md transition-colors font-semibold text-center text-base shadow-md"
            >
              Get Free Valuation
            </Link>
            <Link
              href="/clearance"
              className="border border-white/50 hover:bg-white/10 text-white/90 py-2.5 px-7 rounded-md transition-colors font-medium text-center text-base"
            >
              Book a Clearance
            </Link>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors cursor-pointer group"
        style={{ zIndex: 6 }}
        aria-label="Scroll down to learn more"
      >
        <span className="text-xs tracking-widest uppercase">Learn More</span>
        <svg
          className="w-5 h-5 animate-bounce"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </section>
  );
}
