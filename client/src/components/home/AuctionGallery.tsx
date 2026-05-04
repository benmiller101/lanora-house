import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Gavel } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: number;
  title: string;
  estimate: string | null;
  soldPrice: string | null;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
}

const defaultImages: GalleryImage[] = [
  {
    id: 1,
    title: "18ct White Gold Diamond Drop Pendant",
    estimate: "£1,500 – £1,800",
    soldPrice: "£2,100",
    imageUrl: "https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=600&h=600&fit=crop",
    displayOrder: 0,
    isActive: true,
  },
  {
    id: 2,
    title: "c.1900 9ct Rose Gold Sovereign Case with Albert Chain 47g",
    estimate: "£2,200 – £2,500",
    soldPrice: "£2,800",
    imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=600&fit=crop",
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 3,
    title: "Fine Antique Mahogany Bureau Bookcase",
    estimate: "£400 – £800",
    soldPrice: "£920",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 4,
    title: "Original Watercolour — Cornish Coastline",
    estimate: "£150 – £500",
    soldPrice: "£680",
    imageUrl: "https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=600&h=600&fit=crop",
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 5,
    title: "Studio Ceramics & Hand-Thrown Pottery Collection",
    estimate: "£30 – £150",
    soldPrice: "£175",
    imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&h=600&fit=crop",
    displayOrder: 4,
    isActive: true,
  },
  {
    id: 6,
    title: "Edwardian Bracket Mantel Clock",
    estimate: "£100 – £300",
    soldPrice: "£420",
    imageUrl: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=600&h=600&fit=crop",
    displayOrder: 5,
    isActive: true,
  },
  {
    id: 7,
    title: "Victorian Sterling Silver Tea Service",
    estimate: "£300 – £700",
    soldPrice: "£850",
    imageUrl: "https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?w=600&h=600&fit=crop",
    displayOrder: 6,
    isActive: true,
  },
];

function ItemCard({ image }: { image: GalleryImage }) {
  return (
    <div className="group rounded-2xl overflow-hidden bg-white border border-neutral-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <img
          src={image.imageUrl}
          alt={image.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="px-4 pt-3 pb-4">
        <h3 className="font-semibold text-neutral-900 text-sm leading-snug line-clamp-2 mb-2 min-h-[2.5rem]">
          {image.title}
        </h3>
        {image.soldPrice && (
          <div className="flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-primary font-bold text-sm">
              Hammer: {image.soldPrice}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function parsePrice(soldPrice: string | null): number | null {
  if (!soldPrice) return null;
  const cleaned = soldPrice.replace(/[£,\s]/g, "");
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}

/**
 * Seeded shuffle using a simple mulberry32 PRNG so the order is deterministic
 * per data-load (seed is derived from item IDs) but varies across catalogues.
 */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed >>> 0;
  for (let i = copy.length - 1; i > 0; i--) {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5;
    const j = (s >>> 0) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function selectMixedItems(items: GalleryImage[], count: number): GalleryImage[] {
  const seed = items.reduce((acc, img) => acc ^ img.id, 0);
  const priced = items
    .map((item) => ({ item, price: parsePrice(item.soldPrice) }))
    .filter((x): x is { item: GalleryImage; price: number } => x.price !== null)
    .sort((a, b) => a.price - b.price);

  const unpriced = items.filter((item) => parsePrice(item.soldPrice) === null);

  const bandSize = Math.ceil(priced.length / 3);

  // Shuffle each band once up front; leftovers are tracked from that shuffled slice
  const bandDefs = [
    { shuffled: seededShuffle(priced.slice(0, bandSize).map((x) => x.item), seed),            want: Math.round(count * 0.3) },
    { shuffled: seededShuffle(priced.slice(bandSize, bandSize * 2).map((x) => x.item), seed + 1), want: Math.round(count * 0.4) },
    { shuffled: seededShuffle(priced.slice(bandSize * 2).map((x) => x.item), seed + 2),        want: Math.round(count * 0.3) },
  ];

  const selected: GalleryImage[] = [];
  let remaining = count;

  // First pass: take up to each band's quota without replacement
  for (const band of bandDefs) {
    const take = Math.min(band.want, band.shuffled.length, remaining);
    selected.push(...band.shuffled.slice(0, take));
    band.shuffled = band.shuffled.slice(take); // true leftovers — no duplicates
    remaining -= take;
  }

  // Second pass: reallocate leftover slots to remaining priced items (no duplicates)
  if (remaining > 0) {
    const leftoverPriced = seededShuffle(bandDefs.flatMap((b) => b.shuffled), seed + 3);
    const take = Math.min(leftoverPriced.length, remaining);
    selected.push(...leftoverPriced.slice(0, take));
    remaining -= take;
  }

  // Final pass: fill any remaining slots from unpriced items
  if (remaining > 0) {
    selected.push(...seededShuffle(unpriced, seed + 4).slice(0, remaining));
  }

  return seededShuffle(selected, seed + 5);
}

export default function AuctionGallery() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: apiImages = [] } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery-images"],
  });

  const allItems = apiImages.length > 0 ? apiImages : defaultImages;

  // Derive a stable seed from the item IDs so selection is consistent per
  // data-load but changes when the catalogue changes.
  const images = useMemo(() => selectMixedItems(allItems, 10), [allItems]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <section className="py-14 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl text-primary mb-3">
            Some of Our Previous Items Sold at Auction
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A selection of unique antiques, collectibles, and treasures that found new homes through our auctions
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="overflow-hidden py-2 -my-2" ref={emblaRef}>
            <div className="flex">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="flex-[0_0_82%] min-w-0 px-2 sm:flex-[0_0_48%] md:flex-[0_0_31%] lg:flex-[0_0_24%]"
                >
                  <ItemCard image={image} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-10 h-10 bg-white rounded-full shadow-lg border border-neutral-100 flex items-center justify-center hover:bg-neutral-50 transition-colors z-10"
            aria-label="Previous item"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-10 h-10 bg-white rounded-full shadow-lg border border-neutral-100 flex items-center justify-center hover:bg-neutral-50 transition-colors z-10"
            aria-label="Next item"
          >
            <ChevronRight className="w-5 h-5 text-neutral-600" />
          </button>

          {/* Dot indicators */}
          <div className="flex justify-center mt-6 gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  selectedIndex === index
                    ? "bg-primary w-6"
                    : "bg-primary/25 w-2 hover:bg-primary/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
