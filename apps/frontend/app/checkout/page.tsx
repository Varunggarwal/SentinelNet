import Link from "next/link";
import { ArrowLeft, BadgeCheck, CreditCard, Lock, ShieldCheck } from "lucide-react";

const plans = {
  starter: {
    name: "Starter",
    price: 29,
    description: "For solo builders and early-stage teams that need reliable uptime visibility.",
    features: ["10 monitors", "1-minute checks", "Email notifications", "5 team members", "24h data retention"],
  },
  professional: {
    name: "Professional",
    price: 79,
    description: "For growing products that need more monitors, faster checks, and team-wide access.",
    features: ["50 monitors", "30-second checks", "All notification channels", "Unlimited team members", "30-day data retention", "API access"],
  },
  enterprise: {
    name: "Enterprise",
    price: 199,
    description: "For large-scale infrastructure with custom support and higher reliability guarantees.",
    features: ["Unlimited monitors", "15-second checks", "Priority support", "Custom solutions", "90-day data retention", "SLA guarantee"],
  },
} as const;

type PlanKey = keyof typeof plans;

function isPlanKey(value: string | null): value is PlanKey {
  return value === "starter" || value === "professional" || value === "enterprise";
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const planKey = resolvedSearchParams?.plan ?? null;
  const selectedPlan = isPlanKey(planKey) ? plans[planKey] : plans.professional;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.15),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_48%,_#f8fafc_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.18),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_48%,_#020617_100%)]">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:border-slate-400 hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to pricing
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-2xl shadow-cyan-950/5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-none">
            <div className="inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300">
              SentinelNet Checkout
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Complete your {selectedPlan.name} plan setup.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              {selectedPlan.description} You are one step away from launching decentralized uptime monitoring for your stack.
            </p>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Selected Plan</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{selectedPlan.name}</p>
                </div>
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right text-white dark:bg-cyan-500 dark:text-slate-950">
                  <div className="text-3xl font-bold">${selectedPlan.price}</div>
                  <div className="text-xs font-medium uppercase tracking-[0.18em]">per month</div>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {selectedPlan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    <BadgeCheck className="h-4 w-4 text-cyan-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <InfoCard icon={<Lock className="h-5 w-5" />} title="Secure checkout" copy="Your plan selection is prepared for a payment provider redirect." />
              <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title="Protected billing" copy="You can plug Stripe, Razorpay, or any hosted checkout from here." />
              <InfoCard icon={<CreditCard className="h-5 w-5" />} title="Gateway ready" copy="This page is the handoff point before redirecting to your real payment gateway." />
            </div>
          </section>

          <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/20 dark:border-slate-800">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Payment Summary</p>
            <div className="mt-6 border-b border-white/10 pb-6">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{selectedPlan.name} subscription</span>
                <span>${selectedPlan.price}.00</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                <span>Setup fee</span>
                <span>$0.00</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                <span>Validator activation</span>
                <span>Included</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.18em] text-slate-400">Total due today</span>
              <span className="text-3xl font-bold">${selectedPlan.price}</span>
            </div>

            <button
              type="button"
              className="mt-8 w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Continue to Gateway
            </button>
            <p className="mt-3 text-center text-xs text-slate-400">
              This button is ready for your payment provider redirect.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">Next integration step</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Connect this button to Stripe Checkout, Razorpay, or your preferred hosted payment gateway once you choose the provider.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function InfoCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300">
        {icon}
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{copy}</p>
    </div>
  );
}
