import Image from "next/image";
import { GalleryItem } from "@/lib/data/gallery";

interface GalleryGridProps {
  items: GalleryItem[];
  variant?: "compact" | "full";
}

export function GalleryGrid({ items, variant = "full" }: GalleryGridProps) {
  const isCompact = variant === "compact";
  const gridClasses = isCompact
    ? "grid grid-cols-2 gap-3 md:grid-cols-4"
    : "grid gap-4 sm:grid-cols-2 md:grid-cols-4";

  return (
    <div className={gridClasses}>
      {items.map((item, index) => {
        const spanClass = !isCompact && (index === 0 || index === 3)
          ? "md:col-span-2 md:row-span-2"
          : "";

        return (
          <figure
            key={item.id}
            className={`relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 ${spanClass}`}
          >
            <Image
              src={item.imageUrl}
              alt={item.alt}
              width={isCompact ? 600 : 800}
              height={isCompact ? 400 : 600}
              className="h-full w-full object-cover transition duration-700 ease-out hover:scale-105"
              loading={index === 0 ? "eager" : "lazy"}
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 text-xs font-medium uppercase tracking-wide text-white/80">
              {item.title}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
