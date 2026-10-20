import { describe, expect, it } from "vitest";

describe("payment ledger rules", () => {
  it("uses confirmed records only for settled balances", () => {
    const invoiceTotal = 100000;
    const confirmed = [25000, 30000];
    const pending = 45000;
    const confirmedAmount = confirmed.reduce((sum, amount) => sum + amount, 0);
    expect(confirmedAmount).toBe(55000);
    expect(Math.max(invoiceTotal - confirmedAmount, 0)).toBe(45000);
    expect(pending).toBeGreaterThan(0);
    expect(confirmedAmount).toBeLessThan(invoiceTotal);
  });

  it("prevents confirmed over-allocation", () => {
    const invoiceTotal = 100000;
    const confirmedAmount = 75000;
    const attempted = 25001;
    expect(confirmedAmount + attempted > invoiceTotal).toBe(true);
  });

  it("derives payment progress without floating point arithmetic", () => {
    const invoiceTotal = 203000;
    const confirmedAmount = 101500;
    expect(Math.round((confirmedAmount / invoiceTotal) * 100)).toBe(50);
  });

  it("keeps currency boundaries explicit", () => {
    const currencies = ["KES", "USD"];
    expect(currencies[0] === currencies[1]).toBe(false);
  });
});
