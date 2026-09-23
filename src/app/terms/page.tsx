import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Terms of Service — AislePilot" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="September 22, 2026">
      <p>
        AislePilot is an early-stage, independently run app, not affiliated with, endorsed by, or
        sponsored by The Kroger Co. By using it, you agree to the following.
      </p>

      <div>
        <h2>The service</h2>
        <p>
          AislePilot helps you build grocery lists, match items to real products at a Kroger-
          family store, route your trip by aisle, and track your spending. Prices, availability,
          and aisle locations come from Kroger&apos;s API and may be inaccurate, delayed, or
          change without notice — always verify at the shelf and register.
        </p>
      </div>

      <div>
        <h2>Your account</h2>
        <p>
          You&apos;re responsible for keeping your login credentials secure and for what happens
          under your account. Let us know if you think it&apos;s been compromised.
        </p>
      </div>

      <div>
        <h2>Acceptable use</h2>
        <p>
          Don&apos;t use AislePilot to abuse, scrape, or overload the service or Kroger&apos;s
          API, or to do anything illegal.
        </p>
      </div>

      <div>
        <h2>No warranty</h2>
        <p>
          AislePilot is provided &quot;as is,&quot; in active development, without warranty of
          any kind. Features may change or break. We&apos;re not liable for shopping trips that
          go over budget, items that were out of stock, or any other loss arising from using the
          app.
        </p>
      </div>

      <div>
        <h2>Changes</h2>
        <p>We may update these terms as the app changes. We&apos;ll update the date above when we do.</p>
      </div>

      <div>
        <h2>Contact</h2>
        <p>
          Questions? <a href="mailto:support@aisle-pilot.app">support@aisle-pilot.app</a>.
        </p>
      </div>
    </LegalPage>
  );
}
