import { useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeftRight } from "lucide-react";
import { motion } from "framer-motion";

interface SliderItem {
  before: string;
  after: string;
  title: string;
  location?: string;
}

function BeforeAfterSlider({ before, after, title, location }: SliderItem) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => { dragging.current = true; e.preventDefault(); };
  const onMouseMove = (e: React.MouseEvent) => { if (dragging.current) move(e.clientX); };
  const onMouseUp = () => { dragging.current = false; };
  const onTouchMove = (e: React.TouchEvent) => { move(e.touches[0].clientX); };

  return (
    <div className="flex flex-col">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl select-none cursor-ew-resize"
        style={{ height: 320 }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <img src={before} alt={`Before: ${title}`} className="absolute inset-0 w-full h-full object-cover" draggable={false} />

        <div
          className="absolute inset-0 overflow-hidden z-10"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img src={after} alt={`After: ${title}`} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        </div>

        {/* Badges always on top, outside the clipped layer */}
        <span className="absolute bottom-3 left-3 z-[15] bg-black/60 text-white text-xs font-bold uppercase px-2.5 py-1 rounded-full tracking-wide pointer-events-none">
          Before
        </span>
        <span className="absolute bottom-3 right-3 z-[15] bg-primary text-white text-xs font-bold uppercase px-2.5 py-1 rounded-full tracking-wide pointer-events-none">
          After
        </span>

        <div
          className="absolute top-0 bottom-0 z-20 flex flex-col items-center"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
          onMouseDown={onMouseDown}
          onTouchStart={() => { dragging.current = true; }}
          onTouchMove={onTouchMove}
          onTouchEnd={() => { dragging.current = false; }}
        >
          <div className="w-0.5 flex-1 bg-white shadow-lg" />
          <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center flex-shrink-0 -my-5 border-2 border-primary/20">
            <ArrowLeftRight className="w-4 h-4 text-primary" />
          </div>
          <div className="w-0.5 flex-1 bg-white shadow-lg" />
        </div>
      </div>

      <div className="mt-3 text-center">
        <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
        {location && <p className="text-xs text-gray-500 mt-0.5">{location}</p>}
      </div>
    </div>
  );
}

const DEFAULT_TRANSFORMATIONS: SliderItem[] = [
  {
    before: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80",
    after:  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&q=80",
    title: "Full House Clearance",
    location: "Truro, Cornwall"
  },
  {
    before: "https://images.unsplash.com/photo-1505409628601-edc9af17fda6?w=800&h=600&fit=crop&q=80",
    after:  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80",
    title: "Living Room Clearance",
    location: "Falmouth, Cornwall"
  },
  {
    before: "https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?w=800&h=600&fit=crop&q=80",
    after:  "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&h=600&fit=crop&q=80",
    title: "Estate Clearance",
    location: "Plymouth, Devon"
  }
];

export default function DifferenceWeMake() {
  const { data: beforeAfterImages } = useQuery({
    queryKey: ["/api/before-after"],
    queryFn: async () => {
      const res = await fetch("/api/before-after");
      if (!res.ok) throw new Error("Failed to fetch before/after images");
      return res.json();
    },
  });

  const toSliderItem = (i: any): SliderItem => ({
    before: i.beforeImageUrls[0],
    after: i.afterImageUrls[0],
    title: i.title,
    location: i.location,
  });

  const allValid = (beforeAfterImages ?? []).filter(
    (i: any) => i.beforeImageUrls?.[0] && i.afterImageUrls?.[0]
  );
  const featuredItems  = allValid.filter((i: any) => i.featured).slice(0, 3).map(toSliderItem);
  const remainingItems = allValid.filter((i: any) => !i.featured).map(toSliderItem);
  const apiItems = [...featuredItems, ...remainingItems].slice(0, 3);
  const items: SliderItem[] = apiItems.length >= 3
    ? apiItems
    : [...apiItems, ...DEFAULT_TRANSFORMATIONS].slice(0, 3);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl text-primary font-bold mb-3">
            The Difference We Make
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Drag the handle left or right to reveal the transformation — real results from our clearances across Cornwall &amp; Devon
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <BeforeAfterSlider {...item} />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/before-after">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
              View All Transformations
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
