// utils/__tests__/formatDate.test.ts
import { fmtDateTime, fmtDateRange } from "../formatDate";

describe("fmtDateTime", () => {
  it("formats a valid ISO date string into a readable string", () => {
    const result = fmtDateTime("2026-09-25T09:00:00");
    // Don't assert an exact locale string (that depends on the test
    // machine's locale) — just check it actually formatted the date
    // instead of falling back to the raw ISO string.
    expect(result).not.toBe("2026-09-25T09:00:00");
    expect(result.length).toBeGreaterThan(0);
  });

  it("falls back to the raw value for an invalid date string", () => {
    expect(fmtDateTime("not-a-date")).toBe("not-a-date");
  });
});

describe("fmtDateRange", () => {
  it("joins two formatted dates with an arrow", () => {
    const result = fmtDateRange("2026-09-25T09:00:00", "2026-09-25T17:00:00");
    expect(result).toContain("→");
  });

  it("falls back to the raw values when both dates are invalid", () => {
    expect(fmtDateRange("bad-start", "bad-end")).toBe("bad-start → bad-end");
  });
});
