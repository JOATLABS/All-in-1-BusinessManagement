"use client";

import { useState } from "react";
import Link from "next/link";
import { PartnerDialog } from "@/components/layout/PartnerDialog";

export function PartnerBreadcrumb() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span aria-hidden>•</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-white/20 px-3 py-1 text-white/80 transition hover:border-white hover:text-white"
        >
          Partner with us
        </button>
      </nav>
      <PartnerDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
