import { Metadata } from "next";
import { ContactSection } from "@/components/sections/ContactSection";

const visitingDetails = [
  {
    title: "Location",
    detail: "215 Peachtree Alley NE, Atlanta, GA",
  },
  {
    title: "Hours",
    detail: "Thu 7p-1a • Fri-Sat 8p-3a • Sun brunch 11a-4p",
  },
  {
    title: "Dress code",
    detail: "Elevated nightlife attire. Celebrate your culture and style with confidence.",
  },
];

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the Afrobeat Lounge host team for reservations, private events and general questions.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-12">
      <ContactSection />
      <div className="grid gap-6 md:grid-cols-3">
        {visitingDetails.map((item) => (
          <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm text-white/70">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
