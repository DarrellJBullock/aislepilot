import Link from "next/link";
import { Logo } from "@/components/app/Logo";
import { Card, CardBody } from "@/components/ui";

export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link href="/" className="mb-8 flex justify-center">
        <Logo />
      </Link>
      <Card>
        <CardBody className="sm:p-8">
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-ink-muted">Last updated {lastUpdated}</p>
          <div className="prose-legal mt-6 space-y-5 text-sm leading-relaxed text-ink-soft [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink [&_a]:text-brand-700 [&_a]:underline [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-5">
            {children}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
