import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocationBadge } from "@/components/ui/StatusPill";

describe("LocationBadge", () => {
  it("labels estimates as estimates, not verified", () => {
    render(<LocationBadge source="aislepilot_mapped" />);
    expect(screen.getByText(/AislePilot estimate/i)).toBeInTheDocument();
    expect(screen.queryByText(/verified/i)).not.toBeInTheDocument();
  });

  it("labels retailer-verified locations as verified", () => {
    render(<LocationBadge source="retailer_verified" />);
    expect(screen.getByText(/Retailer verified/i)).toBeInTheDocument();
  });

  it("labels category estimates clearly", () => {
    render(<LocationBadge source="category_estimate" />);
    expect(screen.getByText(/Estimated by category/i)).toBeInTheDocument();
  });
});
