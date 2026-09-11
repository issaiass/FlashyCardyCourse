import { PricingTable } from "@clerk/nextjs";
import { PricingBackButton } from "./pricing-back-button";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <PricingBackButton />
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-foreground">Pricing</h1>
          <p className="text-muted-foreground">
            Choose the plan that fits how you study.
          </p>
        </header>
        <PricingTable />
      </div>
    </div>
  );
}
