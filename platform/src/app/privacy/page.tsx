import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How we protect guest, promoter and vendor data across the platform.",
};

const commitments = [
  "Tenant data isolated with row-level security and encrypted backups.",
  "GDPR and CCPA compliant consent flows with preference centers for marketing communications.",
  "AI personalisation models trained on anonymised datasets with explicit opt-in.",
  "Vendor contracts and payouts safeguarded with audit trails and retention policies.",
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--accent-primary)] opacity-80">Privacy</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Data stewardship</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70">
          The Afrobeat Lounge platform balances personalised experiences with rigorous privacy and compliance guardrails.
        </p>
      </div>
      <ol className="space-y-4 text-sm text-white/70">
        {commitments.map((commitment) => (
          <li key={commitment} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            {commitment}
          </li>
        ))}
      </ol>
      <div className="rounded-3xl border border-white/10 bg-black/40 p-6 text-sm text-white/70">
        <p className="font-semibold text-white">Need to exercise your rights?</p>
        <p className="mt-2">
          Email privacy@afrobeatlounge.com to request access, deletion or restriction of your data. We respond within 72 hours.
        </p>
      </div>
    </div>
  );
}
