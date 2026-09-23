import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy — AislePilot" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="September 22, 2026">
      <p>
        AislePilot (&quot;we,&quot; &quot;us&quot;) is an early-stage, independently run app.
        This policy explains what we collect and why, in plain terms. It isn&apos;t a substitute
        for legal advice, and it will evolve as the app does.
      </p>

      <div>
        <h2>What we collect</h2>
        <ul>
          <li>Account info: your name and email address, when you create an account.</li>
          <li>Content you create: shopping lists, items, budgets, notes, and store selections.</li>
          <li>
            Basic usage data needed to operate the app (e.g. error logs), and, if you use the
            mobile app and enable notifications, a device push token.
          </li>
        </ul>
      </div>

      <div>
        <h2>Who we share it with</h2>
        <ul>
          <li>
            <strong>Supabase</strong> — hosts our database and handles authentication. Your
            account info and list data are stored there.
          </li>
          <li>
            <strong>Kroger&apos;s Public API</strong> — we send store and product search terms
            (e.g. a zip code, an item name) to Kroger to get real store, price, and aisle data.
            We are not affiliated with The Kroger Co. See{" "}
            <a href="https://www.kroger.com/i/privacy" target="_blank" rel="noreferrer">
              Kroger&apos;s own privacy policy
            </a>{" "}
            for how they handle that request.
          </li>
          <li>
            <strong>Vercel</strong> — hosts the app itself.
          </li>
        </ul>
        <p className="mt-2">We don&apos;t sell your data, and we don&apos;t share it for advertising.</p>
      </div>

      <div>
        <h2>List sharing</h2>
        <p>
          If you share a list, the people you invite can see that list&apos;s items and who
          checked off what. Sharing a list doesn&apos;t give anyone access to your other lists or
          account details.
        </p>
      </div>

      <div>
        <h2>Data deletion</h2>
        <p>
          There&apos;s no self-serve delete-account button yet — email{" "}
          <a href="mailto:support@aisle-pilot.app">support@aisle-pilot.app</a> and we&apos;ll
          remove your account and data.
        </p>
      </div>

      <div>
        <h2>Children</h2>
        <p>AislePilot isn&apos;t directed at children under 13, and we don&apos;t knowingly collect their data.</p>
      </div>

      <div>
        <h2>Changes</h2>
        <p>We&apos;ll update the date at the top of this page if this policy changes.</p>
      </div>

      <div>
        <h2>Questions</h2>
        <p>
          Reach out at <a href="mailto:support@aisle-pilot.app">support@aisle-pilot.app</a>.
        </p>
      </div>
    </LegalPage>
  );
}
