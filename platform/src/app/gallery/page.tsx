import { Metadata } from "next";
import { SectionHeading } from "@/components/common/SectionHeading";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { galleryItems } from "@/lib/data/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Experience the Afrobeat Lounge atmosphere through curated photography and motion stills.",
};

export default function GalleryPage() {
  return (
    <div className="flex flex-col gap-12">
      <SectionHeading
        eyebrow="Gallery"
        title="Recent highlights"
        description="Each capture is optimised for fast loading and high contrast so guests can preview the vibe from any device."
      />
      <GalleryGrid items={galleryItems} />
    </div>
  );
}
