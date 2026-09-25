import { describe, it, expect } from "vitest";
import { buildUserExport, itemsToCsv, exportFilename } from "@aislepilot/domain/export";
import { withoutPrices } from "@aislepilot/domain/pricing";
import { makeProduct, makeItem, makeList } from "../factories";

const NOW = "2026-09-25T12:00:00.000Z";
const fresh = () => makeProduct({ pricedAt: NOW, promotionalPrice: 3.5, description: "x", metadata: { a: 1 } });

describe("buildUserExport", () => {
  const lists = [
    makeList(
      [
        makeItem({ id: "a", rawText: "Milk", status: "matched", product: fresh(), quantity: 2 }),
        makeItem({ id: "b", rawText: "Eggs", status: "unmatched" }),
      ],
      { name: "Weekly", budget: 75 },
    ),
  ];
  const out = buildUserExport(
    {
      profile: { id: "u1", email: "me@x.com", displayName: "Me", createdAt: NOW },
      lists,
      savedProducts: [{ id: "s1", userId: "u1", product: makeProduct(), savedAt: NOW }],
      purchaseHistory: [
        { id: "h1", userId: "u1", listId: "l1", storeId: "s", purchasedAt: NOW, total: 12.5, itemCount: 3 },
      ],
    },
    NOW,
  );

  it("includes account, lists, items, saved products and history", () => {
    expect(out.format).toBe("aislepilot-export");
    expect(out.account).toEqual({ email: "me@x.com", displayName: "Me", createdAt: NOW });
    expect(out.lists[0]).toMatchObject({ name: "Weekly", budget: 75 });
    expect(out.lists[0].items).toHaveLength(2);
    expect(out.lists[0].items[0]).toMatchObject({ text: "Milk", quantity: 2, status: "matched" });
    expect(out.lists[0].items[0].product).toMatchObject({ name: "Whole Milk", price: 3.5 });
    expect(out.lists[0].items[1].product).toBeNull();
    expect(out.savedProducts[0].name).toBe("Whole Milk");
    expect(out.purchaseHistory[0]).toMatchObject({ itemCount: 3, total: 12.5 });
  });

  it("leaves out internal fields and never reports an expired price", () => {
    const item = out.lists[0].items[0].product as Record<string, unknown>;
    expect(item).not.toHaveProperty("description");
    expect(item).not.toHaveProperty("metadata");

    const expired = buildUserExport({
      profile: null,
      lists: [makeList([makeItem({ status: "matched", product: withoutPrices(makeProduct()) })])],
      savedProducts: [],
      purchaseHistory: [],
    });
    expect(expired.lists[0].items[0].product?.price).toBeNull();
    expect(expired.account).toBeNull();
  });
});

describe("itemsToCsv", () => {
  it("writes a header and one row per item, with quoting", () => {
    const csv = itemsToCsv([
      makeList(
        [
          makeItem({ rawText: 'Milk, 2%', notes: 'the "good" one', status: "matched", product: fresh() }),
          makeItem({ id: "b", rawText: "Eggs" }),
        ],
        { name: "Weekly" },
      ),
    ]);
    const lines = csv.trim().split("\r\n");
    expect(lines[0]).toBe("List,Item,Quantity,Status,Product,Brand,Size,Price,Notes");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('"Milk, 2%"');
    expect(lines[1]).toContain('"the ""good"" one"');
    expect(lines[1]).toContain(",3.50,");
    expect(lines[2]).toBe("Weekly,Eggs,1,unmatched,,,,,");
  });

  it("neutralises spreadsheet formulas in user text", () => {
    const csv = itemsToCsv([makeList([makeItem({ rawText: "=HYPERLINK(\"http://evil\")" })])]);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).not.toMatch(/,=HYPERLINK/);
  });
});

describe("exportFilename", () => {
  it("is dated", () => {
    expect(exportFilename("json", new Date("2026-09-25T12:00:00Z"))).toBe("aislepilot-export-2026-09-25.json");
  });
});
