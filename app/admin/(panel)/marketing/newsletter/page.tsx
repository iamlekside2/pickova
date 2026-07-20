import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Mail } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Newsletter" };
export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/marketing"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-green"
      >
        <ChevronLeft size={16} /> Marketing
      </Link>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Newsletter</h1>
        <p className="text-sm text-brand-muted">{subscribers.length} subscribers.</p>
      </div>

      {subscribers.length === 0 ? (
        <div className="rounded-card border border-brand-line-2 bg-white px-5 py-16 text-center text-sm text-brand-muted-2">
          No subscribers yet. Signups from the storefront newsletter appear here.
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-brand-line-2 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-line text-left text-xs uppercase tracking-wide text-brand-muted">
                <th className="px-4 py-3 font-bold">Email</th>
                <th className="px-4 py-3 font-bold text-right">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-brand-bg/50">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 text-brand-ink">
                      <Mail size={15} className="text-brand-muted" /> {s.email}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-brand-muted">
                    {s.createdAt.toISOString().slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
