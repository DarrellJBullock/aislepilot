import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StorePicker } from "@/components/stores/StorePicker";
import { fetchStores } from "@/lib/retailer-client";

vi.mock("@/lib/retailer-client", () => ({
  fetchStores: vi.fn(),
}));

describe("StorePicker", () => {
  beforeEach(() => {
    vi.mocked(fetchStores).mockReset();
  });

  it("shows a fallback message for a zip with no live stores nearby", async () => {
    // e.g. searching a zip outside Kroger's footprint (Texas, Florida, ...)
    vi.mocked(fetchStores).mockResolvedValue({ stores: [], live: true });

    render(<StorePicker onChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("No stores found.")).toBeInTheDocument();
    });
    // Live, just empty — must not be mistaken for the demo-data fallback.
    expect(screen.queryByText(/fictional demo stores/)).not.toBeInTheDocument();
  });
});
