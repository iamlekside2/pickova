import type { Metadata } from "next";
import Link from "next/link";
import { Ticket, Mail, Sparkles, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Marketing" };
export const dynamic = "force-dynamic";

export default async function AdminMarketingPage() {
  const [coupons, subscribers, collections] = await Promise.all([
    prisma.coupon.count(),
    prisma.newsletterSubscriber.count(),
    prisma.collection.count(),
  ]);

  const cards = [
    {
      title: "Coupons",
      count: `${coupons} active & inactive`,
      href: "/admin/marketing/coupons",
      icon: Ticket,
      ready: true,
    },
    {
      title: "Newsletter",
      count: `${subscribers} subscribers`,
      href: "/admin/marketing/newsletter",
      icon: Mail,
      ready: true,
    },
    {
      title: "Collections",
      count: `${collections} seasonal collections`,
      href: "/admin/marketing/collections",
      icon: Sparkles,
      ready: true,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Marketing</h1>
        <p className="text-sm text-brand-muted">Coupons, newsletter and seasonal collections.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, count, href, icon: Icon, ready }) => {
          const inner = (
            <>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                <Icon size={20} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-lg font-extrabold text-brand-ink">{title}</div>
                  <div className="text-[13px] text-brand-muted">{count}</div>
                </div>
                {ready && <ArrowRight size={18} className="text-brand-muted" />}
              </div>
              {!ready && (
                <span className="mt-2 inline-block rounded-full bg-brand-bg px-2 py-0.5 text-[10px] font-bold uppercase text-brand-muted-2">
                  Soon
                </span>
              )}
            </>
          );
          return ready ? (
            <Link
              key={title}
              href={href}
              className="rounded-card border border-brand-line-2 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-green hover:shadow-[0_10px_24px_rgba(10,61,38,0.10)]"
            >
              {inner}
            </Link>
          ) : (
            <div key={title} className="rounded-card border border-brand-line-2 bg-white p-5 opacity-70">
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
