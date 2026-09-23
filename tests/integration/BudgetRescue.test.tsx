import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BudgetRescue } from "@/components/shopping-mode/BudgetRescue";
import { fetchProducts } from "@/lib/retailer-client";
import { makeItem, makeProduct } from "../factories";

vi.mock("@/lib/retailer-client", () => ({
  fetchProducts: vi.fn(),
}));

describe("BudgetRescue", () => {
  beforeEach(() => {
    vi.mocked(fetchProducts).mockReset();
  });

  it("suggests the cheapest genuinely-cheaper alternative and swaps on click", async () => {
    const current = makeProduct({ id: "p1", name: "Name Brand Cereal", currentPrice: 6 });
    const item = makeItem({ id: "i1", quantity: 2, product: current, status: "available" });
    const onSwap = vi.fn();

    vi.mocked(fetchProducts).mockResolvedValue({
      live: true,
      products: [
        makeProduct({ id: "p2", name: "Store Brand Cereal", currentPrice: 3 }),
        makeProduct({ id: "p3", name: "Pricier Cereal", currentPrice: 8 }),
        current, // same product must never be suggested as its own alternative
      ],
    });

    render(<BudgetRescue item={item} storeId="s1" overBudget={5} onSwap={onSwap} />);

    expect(await screen.findByText(/Store Brand Cereal/)).toBeInTheDocument();
    expect(screen.getByText(/\$5\.00 over budget/)).toBeInTheDocument();
    // (6 - 3) * 2 quantity = $6.00 saved
    expect(screen.getByText(/save \$6\.00/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Swap it" }));
    expect(onSwap).toHaveBeenCalledWith(expect.objectContaining({ id: "p2" }));
  });

  it("renders nothing when no cheaper alternative exists", async () => {
    const current = makeProduct({ id: "p1", currentPrice: 3 });
    const item = makeItem({ id: "i1", product: current, status: "available" });

    vi.mocked(fetchProducts).mockResolvedValue({
      live: true,
      products: [makeProduct({ id: "p2", currentPrice: 9 })],
    });

    const { container } = render(
      <BudgetRescue item={item} storeId="s1" overBudget={5} onSwap={vi.fn()} />,
    );

    await waitFor(() => expect(fetchProducts).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it("dismisses on 'Not now' and stays hidden for that item", async () => {
    const current = makeProduct({ id: "p1", currentPrice: 6 });
    const item = makeItem({ id: "i1", product: current, status: "available" });

    vi.mocked(fetchProducts).mockResolvedValue({
      live: true,
      products: [makeProduct({ id: "p2", currentPrice: 3 })],
    });

    render(<BudgetRescue item={item} storeId="s1" overBudget={5} onSwap={vi.fn()} />);

    await screen.findByText(/over budget/);
    await userEvent.click(screen.getByRole("button", { name: "Not now" }));
    expect(screen.queryByText(/over budget/)).not.toBeInTheDocument();
  });
});
