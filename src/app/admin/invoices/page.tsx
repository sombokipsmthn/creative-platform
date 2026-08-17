"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Client = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
};

type InvoiceItem = {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  title: string;
  status: string;
  issueDate: string;
  dueDate: string | null;
  notes: string | null;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  client: Client | null;
  items: InvoiceItem[];
};

type NewItem = {
  description: string;
  quantity: string;
  unitPrice: string;
};

const emptyItem = (): NewItem => ({
  description: "",
  quantity: "1",
  unitPrice: "",
});

function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  const [clientId, setClientId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [title, setTitle] = useState("Invoice");
  const [status, setStatus] = useState("draft");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [tax, setTax] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<NewItem[]>([emptyItem()]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Math.round(
        (Number(item.unitPrice) || 0) * 100
      );

      return sum + quantity * unitPrice;
    }, 0);
  }, [items]);

  const taxAmount = Math.round((Number(tax) || 0) * 100);
  const total = subtotal + taxAmount;

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [invoiceResponse, clientResponse] = await Promise.all([
        fetch("/api/invoices", {
          cache: "no-store",
        }),
        fetch("/api/clients", {
          cache: "no-store",
        }),
      ]);

      if (!invoiceResponse.ok) {
        throw new Error("Could not load invoices.");
      }

      const invoiceData = await invoiceResponse.json();
      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);

      if (clientResponse.ok) {
        const clientData = await clientResponse.json();

        if (Array.isArray(clientData)) {
          setClients(clientData);
        } else if (Array.isArray(clientData.clients)) {
          setClients(clientData.clients);
        }
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not load invoice data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  function updateItem(
    index: number,
    field: keyof NewItem,
    value: string
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addItem() {
    setItems((current) => [...current, emptyItem()]);
  }

  function removeItem(index: number) {
    setItems((current) => {
      if (current.length === 1) {
        return [emptyItem()];
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function resetForm() {
    setClientId("");
    setInvoiceNumber("");
    setTitle("Invoice");
    setStatus("draft");
    setIssueDate(new Date().toISOString().slice(0, 10));
    setDueDate("");
    setCurrency("USD");
    setTax("");
    setNotes("");
    setItems([emptyItem()]);
  }

  async function createInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!clientId) {
      setError("Please select a client.");
      return;
    }

    if (!invoiceNumber.trim()) {
      setError("Please enter an invoice number.");
      return;
    }

    const validItems = items.filter(
      (item) => item.description.trim()
    );

    if (validItems.length === 0) {
      setError("Add at least one invoice item.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          invoiceNumber: invoiceNumber.trim(),
          title: title.trim() || "Invoice",
          status,
          issueDate,
          dueDate: dueDate || null,
          currency,
          tax: taxAmount,
          notes: notes.trim() || null,
          items: validItems.map((item) => ({
            description: item.description.trim(),
            quantity: Number(item.quantity) || 1,
            unitPrice: Math.round(
              (Number(item.unitPrice) || 0) * 100
            ),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Could not create invoice."
        );
      }

      resetForm();
      setShowCreate(false);

      await loadData();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not create invoice."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-zinc-500">
              Admin
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              Invoices
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Create and manage invoices for your clients.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setShowCreate(true);
            }}
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            + New invoice
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm text-zinc-500">
              Loading invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-2xl">
                $
              </div>

              <h2 className="text-lg font-semibold">
                No invoices yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                Create your first invoice and start keeping track
                of your client billing.
              </p>

              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-6 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-700"
              >
                Create your first invoice
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-200">
                <thead className="border-b border-zinc-200 bg-zinc-50">
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                    <th className="px-6 py-4">Invoice</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Issue date</th>
                    <th className="px-6 py-4">Due date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="transition hover:bg-zinc-50"
                    >
                      <td className="px-6 py-5">
                        <div className="font-medium">
                          {invoice.invoiceNumber}
                        </div>

                        <div className="mt-1 text-xs text-zinc-500">
                          {invoice.title}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="font-medium">
                          {invoice.client?.name || "Unknown client"}
                        </div>

                        {invoice.client?.company && (
                          <div className="mt-1 text-xs text-zinc-500">
                            {invoice.client.company}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-5 text-sm text-zinc-600">
                        {formatDate(invoice.issueDate)}
                      </td>

                      <td className="px-6 py-5 text-sm text-zinc-600">
                        {formatDate(invoice.dueDate)}
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium capitalize text-zinc-700">
                          {invoice.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right font-semibold">
                        {formatMoney(
                          invoice.total,
                          invoice.currency
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto my-8 max-w-4xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold">
                  New invoice
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Create an invoice for a client.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  setError("");
                }}
                className="rounded-lg px-3 py-2 text-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={createInvoice}
              className="space-y-6 p-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Client
                  </span>

                  <select
                    value={clientId}
                    onChange={(event) =>
                      setClientId(event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-900"
                    required
                  >
                    <option value="">
                      Select a client
                    </option>

                    {clients.map((client) => (
                      <option
                        key={client.id}
                        value={client.id}
                      >
                        {client.name}
                        {client.company
                          ? ` — ${client.company}`
                          : ""}
                      </option>
                    ))}
                  </select>

                  {clients.length === 0 && (
                    <span className="mt-2 block text-xs text-amber-600">
                      No clients found. Create a client first.
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Invoice number
                  </span>

                  <input
                    value={invoiceNumber}
                    onChange={(event) =>
                      setInvoiceNumber(event.target.value)
                    }
                    placeholder="INV-0001"
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Title
                  </span>

                  <input
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="Invoice"
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Status
                  </span>

                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-900"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Issue date
                  </span>

                  <input
                    type="date"
                    value={issueDate}
                    onChange={(event) =>
                      setIssueDate(event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Due date
                  </span>

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) =>
                      setDueDate(event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Currency
                  </span>

                  <select
                    value={currency}
                    onChange={(event) =>
                      setCurrency(event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-900"
                  >
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="KES">KES — Kenyan Shilling</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Tax
                  </span>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                      $
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tax}
                      onChange={(event) =>
                        setTax(event.target.value)
                      }
                      placeholder="0.00"
                      className="w-full rounded-xl border border-zinc-300 py-3 pl-8 pr-4 text-sm outline-none focus:border-zinc-900"
                    />
                  </div>
                </label>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      Line items
                    </h3>

                    <p className="mt-1 text-xs text-zinc-500">
                      Add the services or products included in
                      this invoice.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                  >
                    + Add item
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-zinc-200">
                  <div className="grid grid-cols-[1fr_90px_130px_110px_44px] gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    <span>Description</span>
                    <span>Qty</span>
                    <span>Unit price</span>
                    <span>Amount</span>
                    <span />
                  </div>

                  <div className="divide-y divide-zinc-100">
                    {items.map((item, index) => {
                      const quantity =
                        Number(item.quantity) || 0;

                      const unitPrice =
                        Number(item.unitPrice) || 0;

                      const amount =
                        quantity * unitPrice;

                      return (
                        <div
                          key={index}
                          className="grid grid-cols-[1fr_90px_130px_110px_44px] gap-3 px-4 py-3"
                        >
                          <input
                            value={item.description}
                            onChange={(event) =>
                              updateItem(
                                index,
                                "description",
                                event.target.value
                              )
                            }
                            placeholder="Website design"
                            className="min-w-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          />

                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(event) =>
                              updateItem(
                                index,
                                "quantity",
                                event.target.value
                              )
                            }
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          />

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(event) =>
                              updateItem(
                                index,
                                "unitPrice",
                                event.target.value
                              )
                            }
                            placeholder="0.00"
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          />

                          <div className="flex items-center text-sm font-medium">
                            {formatMoney(
                              Math.round(amount * 100),
                              currency
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(index)
                            }
                            className="rounded-lg text-lg text-zinc-400 hover:bg-zinc-100 hover:text-red-600"
                            aria-label="Remove item"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Notes
                  </span>

                  <textarea
                    value={notes}
                    onChange={(event) =>
                      setNotes(event.target.value)
                    }
                    rows={5}
                    placeholder="Payment terms, thank you message, bank details..."
                    className="w-full resize-none rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                  />
                </label>

                <div className="rounded-xl bg-zinc-50 p-5">
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-zinc-500">
                      Subtotal
                    </span>

                    <span className="font-medium">
                      {formatMoney(
                        subtotal,
                        currency
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-zinc-500">
                      Tax
                    </span>

                    <span className="font-medium">
                      {formatMoney(
                        taxAmount,
                        currency
                      )}
                    </span>
                  </div>

                  <div className="my-2 border-t border-zinc-200" />

                  <div className="flex justify-between py-2">
                    <span className="font-semibold">
                      Total
                    </span>

                    <span className="text-xl font-semibold">
                      {formatMoney(
                        total,
                        currency
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setError("");
                  }}
                  className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-medium hover:bg-zinc-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || clients.length === 0}
                  className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Create invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}