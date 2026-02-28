import PageLayout from "../layouts/PageLayout";
import "./TermsOfService.css";

export default function TermsOfService() {
  return (
    <PageLayout>
      <div className="terms-container">
        <h1>Clink Terms of Service</h1>
        <p className="terms-updated">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <section>
          <h2>1. Platform Overview</h2>
          <p>
            Clink is an online marketplace that connects businesses with
            independent content creators. Clink facilitates payments,
            communication, and project coordination but does not directly
            provide creative services.
          </p>
        </section>

        <section>
          <h2>2. Platform Fees</h2>
          <p>
            Clink retains a <strong>12% platform fee</strong> on each completed
            project. This fee supports payment processing, infrastructure,
            fraud prevention, dispute handling, and platform maintenance.
          </p>
          <p>
            Attempting to bypass Clink’s payment system to avoid platform fees
            may result in immediate account suspension or termination.
          </p>
        </section>

        <section>
          <h2>3. Payments & Refunds</h2>
          <p>
            Payments are processed securely through third-party providers
            such as Stripe. Clink does not store full payment credentials.
          </p>
          <p>
            Refunds may be issued at Clink’s discretion in cases of confirmed
            fraud, service failure, or policy violations.
          </p>
        </section>

        <section>
          <h2>4. Independent Contractors</h2>
          <p>
            Creators are independent contractors and are not employees,
            agents, or representatives of Clink. Clink does not guarantee
            service quality, timelines, or outcomes.
          </p>
        </section>

        <section>
          <h2>5. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Clink shall not be liable
            for indirect, incidental, special, consequential, or punitive
            damages arising from platform use.
          </p>
          <p>
            Clink’s total liability for any claim shall not exceed the total
            amount paid for the specific project giving rise to the dispute.
          </p>
        </section>

        <section>
          <h2>6. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Clink, its founders,
            affiliates, and operators from any claims, damages, liabilities,
            costs, or expenses arising from your use of the platform or
            violation of these Terms.
          </p>
        </section>

        <section>
          <h2>7. Dispute Resolution & Arbitration</h2>
          <p>
            Any disputes arising from these Terms shall be resolved through
            binding arbitration rather than court litigation, except where
            prohibited by applicable law.
          </p>
          <p>
            Users waive the right to participate in class-action lawsuits
            against Clink.
          </p>
        </section>

        <section>
          <h2>8. Intellectual Property</h2>
          <p>
            Clink owns all platform branding, design, and proprietary
            software. Users may not copy, distribute, reverse engineer,
            or exploit platform content without written permission.
          </p>
        </section>

        <section>
          <h2>9. Account Termination</h2>
          <p>
            Clink reserves the right to suspend or terminate accounts for
            fraud, abuse, fee avoidance, or violations of platform rules.
          </p>
        </section>

        <section>
          <h2>10. Force Majeure</h2>
          <p>
            Clink shall not be liable for failure or delay resulting from
            causes beyond reasonable control, including but not limited to
            natural disasters, internet outages, or payment processor failures.
          </p>
        </section>

        <section>
          <h2>11. Modifications</h2>
          <p>
            Clink reserves the right to modify these Terms at any time.
            Continued use of the platform constitutes acceptance of the
            updated Terms.
          </p>
        </section>

        <section>
          <h2>12. Governing Law</h2>
          <p>
            These Terms shall be governed by and interpreted in accordance
            with applicable laws without regard to conflict of law principles.
          </p>
        </section>

        <p className="terms-footer">
          By using Clink, you acknowledge that you have read, understood,
          and agree to these Terms of Service.
        </p>
      </div>
    </PageLayout>
  );
}
