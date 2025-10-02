"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { galleryItems } from "@/lib/data/gallery";
import { getUpcomingEvents } from "@/lib/data/events";

const AUTO_INTERVAL_MS = 6500;

export function GalleryPreview() {
  const items = galleryItems.slice(0, 8);
  const upcomingEvent = getUpcomingEvents()[0];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) {
      return () => undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % items.length);
    }, AUTO_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }

  const previousIndex = (activeIndex + items.length - 1) % items.length;
  const nextIndex = (activeIndex + 1) % items.length;

  const jumpTo = (target: number) => {
    setActiveIndex(((target % items.length) + items.length) % items.length);
  };

  return (
    <section className="relative isolate overflow-hidden px-6 pb-24 pt-16 text-white sm:px-10">
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,var(--accent-glow),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 animate-[galleryAurora_18s_ease-in-out_infinite] bg-[radial-gradient(circle_at_bottom,rgba(19,8,28,0.48),transparent_70%)]"
        aria-hidden
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
              <span
                className="inline-flex h-2 w-2 rounded-full bg-[radial-gradient(circle,var(--accent-primary),rgba(var(--accent-primary-rgb),0.45))]"
                aria-hidden
              />
              Gallery
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">Tonight looks like this.</h2>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-3 rounded-full bg-[linear-gradient(120deg,var(--accent-primary),rgba(var(--accent-primary-rgb),0.82),rgba(var(--accent-secondary-rgb),0.7))] px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black transition hover:brightness-110"
          >
            View full gallery
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="relative">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_380px_minmax(0,1fr)] lg:items-center">
            <figure className="relative hidden h-[420px] overflow-hidden rounded-[50px] border border-white/10 bg-black/40 shadow-[0_90px_200px_-130px_rgba(0,0,0,0.95)] backdrop-blur lg:block">
              <Image
                src={items[previousIndex].imageUrl}
                alt={items[previousIndex].alt}
                fill
                className="object-cover object-center"
                sizes="(min-width: 1280px) 360px, (min-width: 1024px) 320px"
              />
              <figcaption className="sr-only">{items[previousIndex].title}</figcaption>
            </figure>

            <div className="relative flex h-[540px] items-center justify-center">
              <figure className="relative h-full w-full overflow-hidden rounded-[64px] border border-white/10 bg-black/50 shadow-[0_120px_260px_-150px_rgba(0,0,0,0.95)] backdrop-blur">
                {items.map((item, index) => (
                  <Image
                    key={item.id}
                    src={item.imageUrl}
                    alt={item.alt}
                    fill
                    className={`absolute inset-0 object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${
                      index === activeIndex ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}
                    sizes="(min-width: 1280px) 420px, (min-width: 1024px) 360px, 88vw"
                  />
                ))}
                <figcaption className="sr-only">{items[activeIndex].title}</figcaption>
              </figure>

              <button
                type="button"
                onClick={() => setActiveIndex((index) => (index + items.length - 1) % items.length)}
                className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-3 text-sm font-semibold uppercase tracking-[0.35em] text-white/80 transition hover:border-white hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 sm:flex"
                aria-label="Show previous gallery moment"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((index) => (index + 1) % items.length)}
                className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-3 text-sm font-semibold uppercase tracking-[0.35em] text-white/80 transition hover:border-white hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 sm:flex"
                aria-label="Show next gallery moment"
              >
                →
              </button>

              {upcomingEvent ? (
                <article className="absolute bottom-6 left-1/2 w-[min(90%,320px)] -translate-x-1/2 rounded-[36px] border border-white/10 bg-black/75 p-6 text-center shadow-[0_90px_220px_-150px_rgba(0,0,0,0.95)] backdrop-blur">
                  <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border border-white/20">
                    <Image
                      src={upcomingEvent.coverImage}
                      alt={upcomingEvent.title}
                      width={160}
                      height={160}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/55">Next up</p>
                  <h3 className="mt-3 text-lg font-semibold text-white">{upcomingEvent.title}</h3>
                  <p className="mt-2 text-sm text-white/70">
                    {new Date(upcomingEvent.start).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="mt-5 flex flex-col gap-2">
                    <Link
                      href={`/events#${upcomingEvent.id}`}
                      className="inline-flex items-center justify-center rounded-full border border-white/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/85 transition hover:border-white hover:text-white"
                    >
                      Event details
                    </Link>
                    <Link
                      href="/reservations"
                      className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(120deg,var(--accent-primary),rgba(var(--accent-primary-rgb),0.82),rgba(var(--accent-secondary-rgb),0.7))] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-black transition hover:brightness-110"
                    >
                      Reserve a table
                    </Link>
                  </div>
                </article>
              ) : null}
            </div>

            <figure className="relative hidden h-[420px] overflow-hidden rounded-[50px] border border-white/10 bg-black/40 shadow-[0_90px_200px_-130px_rgba(0,0,0,0.95)] backdrop-blur lg:block">
              <Image
                src={items[nextIndex].imageUrl}
                alt={items[nextIndex].alt}
                fill
                className="object-cover object-center"
                sizes="(min-width: 1280px) 360px, (min-width: 1024px) 320px"
              />
              <figcaption className="sr-only">{items[nextIndex].title}</figcaption>
            </figure>
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => jumpTo(index)}
                className={`group relative h-3 w-12 overflow-hidden rounded-full border border-white/15 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${
                  index === activeIndex ? "bg-white/80" : "bg-white/10 hover:bg-white/25"
                }`}
                aria-label={`Show gallery moment ${index + 1}`}
                aria-current={index === activeIndex}
              >
                <span
                  className={`absolute inset-0 bg-[linear-gradient(120deg,var(--accent-primary),rgba(var(--accent-primary-rgb),0.82),rgba(var(--accent-secondary-rgb),0.7))] transition-transform duration-700 ease-out ${
                    index === activeIndex ? "translate-x-0" : "-translate-x-full"
                  }`}
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
