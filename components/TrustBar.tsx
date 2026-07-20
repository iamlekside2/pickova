import { ShieldCheck, Truck, BadgePercent } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, label: "Secure Payment" },
  { icon: Truck, label: "Fast Delivery" },
  { icon: BadgePercent, label: "Best Prices" },
];

export function TrustBar() {
  return (
    <section className="mx-auto max-w-content px-6 pt-5">
      <div className="flex flex-wrap justify-center gap-x-9 gap-y-3 rounded-2xl bg-white px-6 py-4 shadow-[0_1px_0_rgba(10,102,64,0.08)]">
        {ITEMS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="flex items-center gap-2 text-sm font-semibold text-brand-green"
          >
            <Icon size={20} />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
