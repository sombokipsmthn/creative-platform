"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/* =========================================================
   TYPES
========================================================= */

type Equipment = {
  id: string;
  name: string;
  dailyRate: number;
  category: string;
  subcategory?: string | null;
  brand?: string | null;
  specs?: string | null;
};

type DescriptionOption = {
  id: string;
  label: string;
  type: "equipment" | "service";
  equipmentId?: string;
  category: string;
  subcategory?: string | null;
  brand?: string | null;
  rate: number;
  unit: string;
};

type QuoteItem = {
  id: string;
  type: "equipment" | "custom";
  equipmentId?: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  notes: string;
};

type Client = {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  kraPin?: string | null;
};

/* =========================================================
   QUOTE CATEGORIES

   These are quote-builder categories.

   IMPORTANT:
   These do NOT have to match the raw equipment DB categories.
   getDescriptionOptions() maps them to the correct catalogue
   records.
========================================================= */

const QUOTE_CATEGORIES = [
  "Equipment",
  "Camera",
  "Audio",
  "Lighting",
  "Grip",
  "Crew",
  "Production",
  "Post Production",
  "Transport",
  "Other",
] as const;

/* =========================================================
   CREW CATALOGUE

   Crew is not stored in the equipment table, so it lives
   here as selectable quote-builder services.
========================================================= */

const CREW_OPTIONS: Array<
  [string, string, number]
> = [
    ["Camera Operator", "day", 12000],
    ["Director", "day", 20000],
    ["Producer", "day", 18000],
    ["Director of Photography", "day", 18000],
    ["1st Assistant Camera", "day", 10000],
    ["2nd Assistant Camera", "day", 7000],
    ["Gaffer", "day", 12000],
    ["Sound Recordist", "day", 12000],
    ["Boom Operator", "day", 8000],
    ["Production Assistant", "day", 5000],
    ["Editor", "day", 15000],
    ["Photographer", "day", 12000],
  ];

/* =========================================================
   PRODUCTION SERVICES
========================================================= */

const PRODUCTION_OPTIONS: Array<
  [string, string, number]
> = [
    ["Production Management", "project", 15000],
    ["Pre-production", "project", 12000],
    ["Location Scouting", "project", 8000],
    ["Production Coordination", "project", 10000],
    ["Production Day", "day", 15000],
    ["Set Catering", "day", 8000],
    ["Production Insurance", "project", 0],
  ];

/* =========================================================
   POST PRODUCTION SERVICES
========================================================= */

const POST_PRODUCTION_OPTIONS: Array<
  [string, string, number]
> = [
    ["Video Editing", "project", 25000],
    ["Color Grading", "project", 15000],
    ["Sound Mix", "project", 15000],
    ["Motion Graphics", "project", 20000],
    ["Subtitles / Captions", "project", 8000],
    ["Photo Retouching", "project", 12000],
    ["Photo Editing", "project", 10000],
    ["SFX / VFX", "project", 25000],
    ["Rendering / Encoding", "project", 5000],
  ];

/* =========================================================
   TRANSPORT SERVICES
========================================================= */

const TRANSPORT_OPTIONS: Array<
  [string, string, number]
> = [
    ["Production Transport", "day", 8000],
    ["Crew Transport", "day", 6000],
    ["Equipment Transport", "day", 6000],
    ["Fuel / Mileage", "trip", 0],
  ];

/* =========================================================
   OTHER SERVICES
========================================================= */

const OTHER_OPTIONS: Array<
  [string, string, number]
> = [
    ["Miscellaneous Expense", "unit", 0],
    ["Location Fee", "day", 0],
    ["Permit", "project", 0],
    ["Other Service", "unit", 0],
  ];

/* =========================================================
   HELPERS
========================================================= */

function normalize(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function createItem(
  type: "equipment" | "custom" = "custom"
): QuoteItem {
  return {
    id: crypto.randomUUID(),
    type,
    equipmentId: "",
    category: "Equipment",
    description: "",
    quantity: 1,
    unit: type === "equipment" ? "day" : "unit",
    rate: 0,
    amount: 0,
    notes: "",
  };
}

function formatAmount(
  amount: number,
  currency = "KES"
) {
  return `${currency} ${Number(
    amount || 0
  ).toLocaleString("en-KE")}`;
}

/* =========================================================
   PAGE
========================================================= */

export default function NewQuotePage() {
  const router = useRouter();

  /* =======================================================
     DATA
  ======================================================= */

  const [equipment, setEquipment] =
    useState<Equipment[]>([]);

  const [services, setServices] =
    useState<Array<{ id: string; label: string; category: string; unit: string; rate: number }>>([]);

  const [clients, setClients] =
    useState<Client[]>([]);

  const [loadingEquipment, setLoadingEquipment] =
    useState(true);

  const [loadingClients, setLoadingClients] =
    useState(true);

  /* =======================================================
     QUOTE DETAILS
  ======================================================= */

  const [title, setTitle] =
    useState("");

  const [projectName, setProjectName] =
    useState("");

  const [clientId, setClientId] =
    useState("");

  const [currency, setCurrency] =
    useState("KES");

  const [paymentTerms, setPaymentTerms] =
    useState("");

  const [validUntil, setValidUntil] =
    useState("");

  const [productionDays, setProductionDays] =
    useState(1);

  const [location, setLocation] =
    useState("");

  const [clientContact, setClientContact] =
    useState("");

  const [depositPercentage, setDepositPercentage] =
    useState(50);

  const [notes, setNotes] =
    useState("");

  /* =======================================================
     PRICING
  ======================================================= */

  const [discountType, setDiscountType] =
    useState<
      "none" | "percentage" | "fixed"
    >("none");

  const [discountValue, setDiscountValue] =
    useState(0);

  const [tax, setTax] =
    useState(0);

  /* =======================================================
     LINE ITEMS
  ======================================================= */

  const [items, setItems] =
    useState<QuoteItem[]>([
      createItem(),
    ]);

  /*
   * Search text is kept independently for every
   * description field.
   */
  const [descriptionSearch, setDescriptionSearch] =
    useState<Record<string, string>>({});

  /*
   * Only one description dropdown is open at a time.
   */
  const [openDescriptionSearch, setOpenDescriptionSearch] =
    useState<string | null>(null);

  /* =======================================================
     UI
  ======================================================= */

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD EQUIPMENT
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadEquipment() {
      try {
        setLoadingEquipment(true);

        const response = await fetch(
          "/api/equipment",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load equipment"
          );
        }

        const data =
          await response.json();

        const equipmentData: Equipment[] =
          Array.isArray(data)
            ? data
            : Array.isArray(
              data.equipment
            )
              ? data.equipment
              : [];

        if (!cancelled) {
          setEquipment(
            equipmentData
          );
        }
      } catch (err) {
        console.error(
          "Failed to load equipment:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load equipment. Custom line items are still available."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingEquipment(false);
        }
      }
    }

    async function loadServices() {
      try {
        // Load all service categories
        const categories = ["crew", "production", "post production", "transport", "other"];
        const allServices: typeof services = [];

        for (const category of categories) {
          const response = await fetch(
            `/api/services?category=${encodeURIComponent(category)}`,
            { cache: "no-store" }
          );

          if (response.ok) {
            const categoryServices = await response.json();
            allServices.push(...categoryServices);
          }
        }

        if (!cancelled) {
          setServices(allServices);
        }
      } catch (err) {
        console.error("Failed to load services:", err);
        // Services are optional, fall back to empty
        if (!cancelled) {
          setServices([]);
        }
      }
    }

    loadEquipment();
    loadServices();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     LOAD CLIENTS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadClients() {
      try {
        setLoadingClients(true);

        const response =
          await fetch(
            "/api/clients",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load clients"
          );
        }

        const data =
          await response.json();

        const clientData: Client[] =
          Array.isArray(data)
            ? data
            : Array.isArray(
              data.clients
            )
              ? data.clients
              : [];

        if (!cancelled) {
          setClients(
            clientData
          );
        }
      } catch (err) {
        console.error(
          "Failed to load clients:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load clients."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingClients(false);
        }
      }
    }

    loadClients();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     CATEGORY-AWARE EQUIPMENT MATCHING

     THIS IS THE IMPORTANT PART.

     The selected quote category controls the catalogue.

     Description selection NEVER changes category.
  ======================================================= */

  function equipmentMatchesQuoteCategory(
    item: Equipment,
    category: string
  ) {
    const dbCategory = normalize(item.category ?? "");
    const subcategory = normalize(item.subcategory ?? "");
    const searchable = [
      item.name,
      item.category,
      item.subcategory,
      item.specs,
    ]
      .filter(Boolean)
      .join(" ");

    const selected = normalize(category);

    if (!selected) {
      return false;
    }

    /*
     * Equipment and Camera intentionally both point
     * to camera equipment.
     */
    if (
      selected === "equipment" ||
      selected === "camera"
    ) {
      return (
        dbCategory === "cameras" ||
        dbCategory === "camera" ||
        subcategory.includes("camera") ||
        searchable.includes("camera")
      );
    }

    /*
     * Audio -> Sound catalogue.
     */
    if (selected === "audio") {
      return (
        dbCategory === "sound" ||
        dbCategory.includes("audio") ||
        subcategory.includes("audio") ||
        subcategory.includes("sound") ||
        searchable.includes("microphone") ||
        searchable.includes("recorder") ||
        searchable.includes("boom mic") ||
        searchable.includes("lapel") ||
        searchable.includes("wireless audio")
      );
    }

    /*
     * Lighting -> Lights + Modifiers.
     */
    if (selected === "lighting") {
      return (
        dbCategory === "lights" ||
        dbCategory === "light" ||
        dbCategory === "lighting" ||
        dbCategory === "modifiers" ||
        subcategory.includes("light") ||
        subcategory.includes("lighting") ||
        subcategory.includes("modifier") ||
        searchable.includes("led") ||
        searchable.includes("light")
      );
    }

    /*
     * Grip -> physical grip/motion/support gear.
     */
    if (selected === "grip") {
      return (
        dbCategory === "stands" ||
        dbCategory === "stabilizers" ||
        dbCategory === "motion" ||
        dbCategory === "grip" ||
        dbCategory === "modifiers" ||
        subcategory.includes("stand") ||
        subcategory.includes("support") ||
        subcategory.includes("stabilizer") ||
        subcategory.includes("gimbal") ||
        subcategory.includes("dolly") ||
        subcategory.includes("slider") ||
        searchable.includes("tripod") ||
        searchable.includes("gimbal") ||
        searchable.includes("dolly") ||
        searchable.includes("slider")
      );
    }

    return false;
  }

  /* =======================================================
     DESCRIPTION OPTIONS

     Returns ONLY options belonging to item.category.
  ======================================================= */

  function getDescriptionOptions(
    item: QuoteItem
  ): DescriptionOption[] {
    const category =
      item.category;

    const selectedCategory =
      normalize(category);

    const search =
      normalize(
        descriptionSearch[item.id]
      );

    const options: DescriptionOption[] =
      [];

    /*
     * -------------------------------------------------------
     * EQUIPMENT CATEGORIES
     * -------------------------------------------------------
     */

    const equipmentCategories =
      new Set([
        "equipment",
        "camera",
        "audio",
        "lighting",
        "grip",
      ]);

    if (
      equipmentCategories.has(
        selectedCategory
      )
    ) {
      equipment.forEach(
        (equipmentItem) => {
          if (
            !equipmentMatchesQuoteCategory(
              equipmentItem,
              category
            )
          ) {
            return;
          }

          const searchable =
            normalize(
              [
                equipmentItem.name,
                equipmentItem.brand,
                equipmentItem.category,
                equipmentItem.subcategory,
                equipmentItem.specs,
              ]
                .filter(Boolean)
                .join(" ")
            );

          if (
            search &&
            !searchable.includes(
              search
            )
          ) {
            return;
          }

          options.push({
            id: `equipment-${equipmentItem.id}`,
            label:
              equipmentItem.name,
            type: "equipment",
            equipmentId:
              equipmentItem.id,
            category:
              equipmentItem.category,
            subcategory:
              equipmentItem.subcategory,
            brand:
              equipmentItem.brand,
            rate:
              Number(
                equipmentItem.dailyRate
              ) || 0,
            unit: "day",
          });
        }
      );

      return options
        .sort((a, b) =>
          a.label.localeCompare(
            b.label
          )
        )
        .slice(0, 50);
    }

    /*
     * -------------------------------------------------------
     * SERVICES (Crew, Production, Post-Production, etc)
     * -------------------------------------------------------
     */

    const serviceCategories = new Set([
      "crew",
      "production",
      "post production",
      "transport",
      "other",
    ]);

    if (serviceCategories.has(selectedCategory)) {
      services.forEach((service) => {
        if (
          normalize(service.category) !==
          selectedCategory
        ) {
          return;
        }

        if (
          search &&
          !(
            normalize(service.label).includes(
              search
            ) ||
            normalize(
              service.category
            ).includes(search)
          )
        ) {
          return;
        }

        options.push({
          id: service.id,
          label: service.label,
          type: "service",
          category: service.category,
          subcategory:
            service.category,
          rate: service.rate,
          unit: service.unit,
        });
      });

      return options
        .sort((a, b) =>
          a.label.localeCompare(
            b.label
          )
        );
    }

    return options;
  }

  /* =======================================================
     TOTALS

     IMPORTANT:
     Amount is the authoritative line-item value.

     We do NOT calculate subtotal from rate anymore.
     This allows Amount to be manually edited.
  ======================================================= */

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          Math.max(
            0,
            Number(item.amount) ||
            0
          ),
        0
      ),
    [items]
  );

  const discountAmount =
    useMemo(() => {
      const value =
        Math.max(
          0,
          Number(
            discountValue
          ) || 0
        );

      if (
        discountType ===
        "percentage"
      ) {
        return Math.round(
          subtotal *
          (Math.min(
            value,
            100
          ) /
            100)
        );
      }

      if (
        discountType ===
        "fixed"
      ) {
        return Math.min(
          value,
          subtotal
        );
      }

      return 0;
    }, [
      subtotal,
      discountType,
      discountValue,
    ]);

  const taxableSubtotal =
    subtotal -
    discountAmount;

  const total =
    taxableSubtotal +
    Math.max(
      0,
      Number(tax) || 0
    );

  /* =======================================================
     CATEGORY CHANGE

     Category is authoritative.

     Changing it clears the previous description because
     the old description may not belong to the new category.
  ======================================================= */

  function handleCategoryChange(
    itemId: string,
    category: string
  ) {
    const normalized =
      normalize(category);

    let defaultUnit =
      "unit";

    if (
      normalized ===
      "crew" ||
      normalized ===
      "camera" ||
      normalized ===
      "equipment" ||
      normalized ===
      "audio" ||
      normalized ===
      "lighting" ||
      normalized ===
      "grip"
    ) {
      defaultUnit = "day";
    }

    if (
      normalized ===
      "post production"
    ) {
      defaultUnit =
        "project";
    }

    if (
      normalized ===
      "production"
    ) {
      defaultUnit =
        "project";
    }

    if (
      normalized ===
      "transport"
    ) {
      defaultUnit =
        "day";
    }

    setItems(
      (current) =>
        current.map(
          (item) =>
            item.id === itemId
              ? {
                ...item,

                /*
                 * Category is ONLY changed here.
                 */
                category,

                type: "custom",

                equipmentId:
                  "",

                description:
                  "",

                quantity:
                  Math.max(
                    1,
                    Number(
                      item.quantity
                    ) || 1
                  ),

                unit:
                  defaultUnit,

                rate: 0,

                amount: 0,
              }
              : item
        )
    );

    setDescriptionSearch(
      (current) => ({
        ...current,
        [itemId]: "",
      })
    );

    setOpenDescriptionSearch(
      itemId
    );
  }

  /* =======================================================
     DESCRIPTION SELECTION

     IMPORTANT:
     item.category is NEVER changed here.
  ======================================================= */

  function handleDescriptionChange(
    itemId: string,
    option: DescriptionOption
  ) {
    setItems(
      (current) =>
        current.map(
          (item) => {
            if (
              item.id !==
              itemId
            ) {
              return item;
            }

            const quantity =
              Math.max(
                1,
                Number(
                  item.quantity
                ) || 1
              );

            const rate =
              Math.max(
                0,
                Number(
                  option.rate
                ) || 0
              );

            return {
              ...item,

              /*
               * DO NOT CHANGE category.
               */
              category:
                item.category,

              type:
                option.type ===
                  "equipment"
                  ? "equipment"
                  : "custom",

              equipmentId:
                option.type ===
                  "equipment"
                  ? option.equipmentId ||
                  ""
                  : "",

              description:
                option.label,

              unit:
                option.unit,

              rate,

              /*
               * Populate the single editable
               * Amount field.
               */
              amount:
                quantity * rate,
            };
          }
        )
    );

    setDescriptionSearch(
      (current) => ({
        ...current,
        [itemId]:
          option.label,
      })
    );

    setOpenDescriptionSearch(
      null
    );
  }

  /* =======================================================
     AMOUNT

     This is the only amount editor displayed to the user.
  ======================================================= */

  function updateAmount(
    itemId: string,
    value: number
  ) {
    const amount =
      Math.max(
        0,
        Number(value) || 0
      );

    setItems(
      (current) =>
        current.map(
          (item) =>
            item.id === itemId
              ? {
                ...item,
                amount,
              }
              : item
        )
    );
  }

  /* =======================================================
     QUANTITY
  ======================================================= */

  function updateQuantity(
    itemId: string,
    value: number
  ) {
    const quantity =
      Math.max(
        1,
        Number(value) || 1
      );

    setItems(
      (current) =>
        current.map(
          (item) => {
            if (
              item.id !==
              itemId
            ) {
              return item;
            }

            /*
             * When quantity changes, use the catalogue rate
             * to rebuild the amount.
             *
             * The user can then manually override Amount.
             */
            const rate =
              Math.max(
                0,
                Number(
                  item.rate
                ) || 0
              );

            return {
              ...item,
              quantity,
              amount:
                quantity *
                rate,
            };
          }
        )
    );
  }

  /* =======================================================
     GENERIC ITEM UPDATE

     Used for Unit and Notes and manual description text.
  ======================================================= */

  function updateItem(
    itemId: string,
    field: keyof QuoteItem,
    value: string
  ) {
    setItems(
      (current) =>
        current.map(
          (item) =>
            item.id === itemId
              ? {
                ...item,
                [field]:
                  value,
              }
              : item
        )
    );
  }

  /* =======================================================
     ADD ITEM
  ======================================================= */

  function addEquipmentItem() {
    const item =
      createItem(
        "equipment"
      );

    setItems(
      (current) => [
        ...current,
        item,
      ]
    );

    setDescriptionSearch(
      (current) => ({
        ...current,
        [item.id]: "",
      })
    );

    setOpenDescriptionSearch(
      item.id
    );
  }

  function addCustomItem() {
    const item =
      createItem(
        "custom"
      );

    setItems(
      (current) => [
        ...current,
        item,
      ]
    );

    setDescriptionSearch(
      (current) => ({
        ...current,
        [item.id]: "",
      })
    );
  }

  /* =======================================================
     REMOVE ITEM
  ======================================================= */

  function removeItem(
    itemId: string
  ) {
    setItems(
      (current) => {
        if (
          current.length ===
          1
        ) {
          return [
            createItem(),
          ];
        }

        return current.filter(
          (item) =>
            item.id !==
            itemId
        );
      }
    );

    setDescriptionSearch(
      (current) => {
        const next = {
          ...current,
        };

        delete next[itemId];

        return next;
      }
    );

    if (
      openDescriptionSearch ===
      itemId
    ) {
      setOpenDescriptionSearch(
        null
      );
    }
  }

  /* =======================================================
     SAVE
  ======================================================= */

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");

    if (
      !title.trim()
    ) {
      setError(
        "Quote title is required."
      );

      return;
    }

    if (
      items.length ===
      0
    ) {
      setError(
        "Add at least one line item."
      );

      return;
    }

    const invalidItem =
      items.find(
        (item) =>
          !item.description.trim()
      );

    if (invalidItem) {
      setError(
        "Every line item needs a description."
      );

      return;
    }

    setSaving(true);

    try {
      const response =
        await fetch(
          "/api/quotes",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              {
                clientId:
                  clientId ||
                  null,

                title:
                  title.trim(),

                projectName:
                  projectName.trim() ||
                  null,

                currency,

                paymentTerms:
                  paymentTerms.trim() ||
                  null,

                validUntil:
                  validUntil ||
                  null,

                productionDays,

                location:
                  location.trim() ||
                  null,

                clientContact:
                  clientContact.trim() ||
                  null,

                depositPercentage,

                notes:
                  notes.trim() ||
                  null,

                status:
                  "draft",

                discountType,

                discountValue,

                tax,

                items:
                  items.map(
                    (item) => ({
                      category:
                        item.category,

                      description:
                        item.description.trim(),

                      quantity:
                        item.quantity,

                      unit:
                        item.unit,

                      rate:
                        item.rate,

                      /*
                       * IMPORTANT:
                       * Save the editable Amount,
                       * not quantity * rate.
                       */
                      amount:
                        Math.max(
                          0,
                          Number(
                            item.amount
                          ) || 0
                        ),

                      notes:
                        item.notes.trim() ||
                        null,

                      ...(item.equipmentId
                        ? {
                          equipmentId:
                            item.equipmentId,
                        }
                        : {}),
                    })
                  ),
              }
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
          "Failed to create quote"
        );
      }

      router.push(
        `/admin/quotes/${data.id}`
      );
    } catch (err) {
      console.error(
        "Failed to create quote:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create quote."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     INPUT CLASSES
  ======================================================= */

  const inputClass =
    "mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500";

  const labelClass =
    "text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600";

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-8"
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <Link
                href="/admin/quotes"
                className="text-[10px] font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400"
              >
                ← Quotes
              </Link>

              <p className="mt-5 text-[10px] font-mono uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400 font-semibold">
                Sales & Production
              </p>

              <h1 className="mt-2 text-4xl font-light tracking-tight text-slate-900 dark:text-white">
                New Quote
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-zinc-500">
                Build a production
                estimate from
                equipment, crew
                and production
                services.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/admin/quotes"
                className="px-5 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-mono uppercase tracking-widest text-slate-600 dark:text-zinc-400"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-mono uppercase tracking-widest font-semibold"
              >
                {saving
                  ? "Saving..."
                  : "Save Draft"}
              </button>
            </div>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-5 py-4">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* =================================================
              QUOTE DETAILS
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                Quote Details
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-500">
                Client and project
                information.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* TITLE */}

              <label className="block">
                <span
                  className={
                    labelClass
                  }
                >
                  Quote Title *
                </span>

                <input
                  value={title}
                  onChange={(
                    event
                  ) =>
                    setTitle(
                      event.target
                        .value
                    )
                  }
                  placeholder="Production Quote"
                  className={
                    inputClass
                  }
                />
              </label>

              {/* CLIENT */}

              <label className="block">
                <span
                  className={
                    labelClass
                  }
                >
                  Client
                </span>

                <select
                  value={
                    clientId
                  }
                  onChange={(
                    event
                  ) => {
                    const id =
                      event.target
                        .value;

                    setClientId(
                      id
                    );

                    if (id) {
                      const client =
                        clients.find(
                          (
                            item
                          ) =>
                            item.id ===
                            id
                        );

                      if (client) {
                        const contactParts =
                          [
                            client.name,
                            client.phone,
                            client.email,
                          ].filter(
                            Boolean
                          );

                        setClientContact(
                          contactParts.join(
                            " • "
                          )
                        );

                        if (
                          !paymentTerms
                        ) {
                          setPaymentTerms(
                            "50% deposit, balance on completion"
                          );
                        }
                      }
                    } else {
                      setClientContact(
                        ""
                      );
                    }
                  }}
                  disabled={
                    loadingClients
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="">
                    {loadingClients
                      ? "Loading clients..."
                      : "Select client"}
                  </option>

                  {clients.map(
                    (
                      client
                    ) => (
                      <option
                        key={
                          client.id
                        }
                        value={
                          client.id
                        }
                      >
                        {client.company
                          ? `${client.company} — ${client.name}`
                          : client.name}
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* PROJECT */}

              <label className="block">
                <span
                  className={
                    labelClass
                  }
                >
                  Project
                </span>

                <input
                  value={
                    projectName
                  }
                  onChange={(
                    event
                  ) =>
                    setProjectName(
                      event.target
                        .value
                    )
                  }
                  placeholder="Project name"
                  className={
                    inputClass
                  }
                />
              </label>

              {/* CURRENCY */}

              <label className="block">
                <span
                  className={
                    labelClass
                  }
                >
                  Currency
                </span>

                <select
                  value={
                    currency
                  }
                  onChange={(
                    event
                  ) =>
                    setCurrency(
                      event.target
                        .value
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="KES">
                    KES
                  </option>

                  <option value="USD">
                    USD
                  </option>

                  <option value="EUR">
                    EUR
                  </option>

                  <option value="GBP">
                    GBP
                  </option>
                </select>
              </label>

              {/* VALID UNTIL */}

              <label className="block">
                <span
                  className={
                    labelClass
                  }
                >
                  Valid Until
                </span>

                <input
                  type="date"
                  value={
                    validUntil
                  }
                  onChange={(
                    event
                  ) =>
                    setValidUntil(
                      event.target
                        .value
                    )
                  }
                  className={
                    inputClass
                  }
                />
              </label>

              {/* PRODUCTION DAYS */}

              <label className="block">
                <span
                  className={
                    labelClass
                  }
                >
                  Production Days
                </span>

                <input
                  type="number"
                  min="1"
                  value={
                    productionDays
                  }
                  onChange={(
                    event
                  ) =>
                    setProductionDays(
                      Math.max(
                        1,
                        Number(
                          event
                            .target
                            .value
                        ) || 1
                      )
                    )
                  }
                  className={
                    inputClass
                  }
                />
              </label>

              {/* LOCATION */}

              <label className="block">
                <span
                  className={
                    labelClass
                  }
                >
                  Location
                </span>

                <input
                  value={
                    location
                  }
                  onChange={(
                    event
                  ) =>
                    setLocation(
                      event.target
                        .value
                    )
                  }
                  placeholder="Nairobi, Kenya"
                  className={
                    inputClass
                  }
                />
              </label>

              {/* CLIENT CONTACT */}

              <label className="block">
                <span
                  className={
                    labelClass
                  }
                >
                  Client Contact
                </span>

                <input
                  value={
                    clientContact
                  }
                  onChange={(
                    event
                  ) =>
                    setClientContact(
                      event.target
                        .value
                    )
                  }
                  placeholder="Primary client contact"
                  className={
                    inputClass
                  }
                />
              </label>
            </div>
          </section>

          {/* =================================================
              LINE ITEMS
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-visible">
            {/* HEADER */}

            <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                    Line Items
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-zinc-500">
                    Select a category
                    first. The
                    description
                    search will only
                    show items from
                    that category.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={
                      addEquipmentItem
                    }
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-mono uppercase tracking-widest font-semibold"
                  >
                    + Equipment
                  </button>

                  <button
                    type="button"
                    onClick={
                      addCustomItem
                    }
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-mono uppercase tracking-widest"
                  >
                    + Custom Item
                  </button>
                </div>
              </div>
            </div>

            {/* LINE ITEM ROWS */}

            <div className="divide-y divide-slate-100 dark:divide-zinc-900">
              {items.map(
                (
                  item,
                  index
                ) => {
                  const options =
                    getDescriptionOptions(
                      item
                    );

                  const isOpen =
                    openDescriptionSearch ===
                    item.id;

                  const searchValue =
                    descriptionSearch[
                    item.id
                    ] ??
                    "";

                  return (
                    <div
                      key={
                        item.id
                      }
                      className="p-6"
                    >
                      {/* ITEM HEADER */}

                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-mono">
                            {index +
                              1}
                          </span>

                          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                            {item.category ||
                              "Line Item"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              item.id
                            )
                          }
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>

                      {/* GRID */}

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* =================================================
                            CATEGORY
                        ================================================= */}

                        <div className="lg:col-span-3">
                          <label className="block">
                            <span
                              className={
                                labelClass
                              }
                            >
                              Category
                            </span>

                            <select
                              value={
                                item.category ||
                                ""
                              }
                              onChange={(
                                event
                              ) =>
                                handleCategoryChange(
                                  item.id,
                                  event
                                    .target
                                    .value
                                )
                              }
                              disabled={
                                loadingEquipment
                              }
                              className={
                                inputClass
                              }
                            >
                              <option value="">
                                {loadingEquipment
                                  ? "Loading..."
                                  : "Select category"}
                              </option>

                              {QUOTE_CATEGORIES.map(
                                (
                                  category
                                ) => (
                                  <option
                                    key={
                                      category
                                    }
                                    value={
                                      category
                                    }
                                  >
                                    {
                                      category
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </label>
                        </div>

                        {/* =================================================
                            DESCRIPTION

                            Category controls this list.
                        ================================================= */}

                        <div className="lg:col-span-5">
                          <label className="block">
                            <span
                              className={
                                labelClass
                              }
                            >
                              Description
                            </span>

                            <div className="relative mt-2">
                              <input
                                type="text"
                                value={
                                  isOpen
                                    ? searchValue
                                    : item.description
                                }
                                onFocus={() => {
                                  if (
                                    item.category
                                  ) {
                                    setDescriptionSearch(
                                      (
                                        current
                                      ) => ({
                                        ...current,
                                        [item.id]:
                                          "",
                                      })
                                    );

                                    setOpenDescriptionSearch(
                                      item.id
                                    );
                                  }
                                }}
                                onChange={(
                                  event
                                ) => {
                                  setDescriptionSearch(
                                    (
                                      current
                                    ) => ({
                                      ...current,
                                      [item.id]:
                                        event
                                          .target
                                          .value,
                                    })
                                  );

                                  setOpenDescriptionSearch(
                                    item.id
                                  );
                                }}
                                disabled={
                                  !item.category
                                }
                                placeholder={
                                  !item.category
                                    ? "Select a category first"
                                    : `Search ${item.category.toLowerCase()}...`
                                }
                                className={`w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white outline-none ${!item.category
                                  ? "opacity-60 cursor-not-allowed"
                                  : "focus:border-purple-500"
                                  }`}
                              />

                              {/* DROPDOWN */}

                              {isOpen &&
                                item.category && (
                                  <div className="absolute z-[100] mt-2 left-0 right-0 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-900 flex items-center justify-between">
                                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                                        {
                                          item.category
                                        }{" "}
                                        options
                                      </p>

                                      <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-600">
                                        {
                                          options.length
                                        }{" "}
                                        found
                                      </span>
                                    </div>

                                    <div className="max-h-80 overflow-y-auto">
                                      {options.length ===
                                        0 ? (
                                        <div className="px-4 py-8 text-center">
                                          <p className="text-xs text-slate-500 dark:text-zinc-500">
                                            No matching{" "}
                                            {item.category.toLowerCase()}{" "}
                                            items found.
                                          </p>

                                          <p className="mt-1 text-[10px] text-slate-400 dark:text-zinc-600">
                                            Try another search term.
                                          </p>
                                        </div>
                                      ) : (
                                        options.map(
                                          (
                                            option
                                          ) => (
                                            <button
                                              key={
                                                option.id
                                              }
                                              type="button"
                                              onClick={() =>
                                                handleDescriptionChange(
                                                  item.id,
                                                  option
                                                )
                                              }
                                              className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-900 border-b border-slate-100 dark:border-zinc-900 last:border-b-0 transition"
                                            >
                                              <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                    {
                                                      option.label
                                                    }
                                                  </p>

                                                  <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-600">
                                                    {option.type ===
                                                      "equipment"
                                                      ? `${option.category}${option.subcategory
                                                        ? ` · ${option.subcategory}`
                                                        : ""
                                                      }${option.brand
                                                        ? ` · ${option.brand}`
                                                        : ""
                                                      }`
                                                      : option.category}
                                                  </p>
                                                </div>

                                                {option.rate >
                                                  0 && (
                                                    <span className="shrink-0 text-xs font-mono text-slate-600 dark:text-zinc-400">
                                                      {formatAmount(
                                                        option.rate,
                                                        currency
                                                      )}
                                                      /
                                                      {
                                                        option.unit
                                                      }
                                                    </span>
                                                  )}
                                              </div>
                                            </button>
                                          )
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </label>
                        </div>

                        {/* =================================================
                            QUANTITY
                        ================================================= */}

                        <div className="lg:col-span-1">
                          <label className="block">
                            <span
                              className={
                                labelClass
                              }
                            >
                              Qty
                            </span>

                            <input
                              type="number"
                              min="1"
                              value={
                                item.quantity
                              }
                              onChange={(
                                event
                              ) =>
                                updateQuantity(
                                  item.id,
                                  Number(
                                    event
                                      .target
                                      .value
                                  )
                                )
                              }
                              className="mt-2 w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
                            />
                          </label>
                        </div>

                        {/* =================================================
                            UNIT
                        ================================================= */}

                        <div className="lg:col-span-1">
                          <label className="block">
                            <span
                              className={
                                labelClass
                              }
                            >
                              Unit
                            </span>

                            <input
                              value={
                                item.unit
                              }
                              onChange={(
                                event
                              ) =>
                                updateItem(
                                  item.id,
                                  "unit",
                                  event
                                    .target
                                    .value
                                )
                              }
                              className="mt-2 w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
                            />
                          </label>
                        </div>

                        {/* =================================================
                            AMOUNT

                            THIS IS THE ONLY AMOUNT FIELD.
                        ================================================= */}

                        <div className="lg:col-span-2">
                          <label className="block">
                            <span
                              className={
                                labelClass
                              }
                            >
                              Amount
                            </span>

                            <div className="relative mt-2">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 dark:text-zinc-600">
                                {
                                  currency
                                }
                              </span>

                              <input
                                type="number"
                                min="0"
                                value={
                                  item.amount ===
                                    0
                                    ? ""
                                    : item.amount
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateAmount(
                                    item.id,
                                    Number(
                                      event
                                        .target
                                        .value
                                    ) || 0
                                  )
                                }
                                placeholder="0"
                                className="w-full px-4 py-3 pl-14 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-purple-500"
                              />
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* NOTES */}

                      <div className="mt-4">
                        <label className="block">
                          <span
                            className={
                              labelClass
                            }
                          >
                            Notes
                          </span>

                          <input
                            value={
                              item.notes
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                item.id,
                                "notes",
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Optional notes"
                            className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
                          />
                        </label>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* ADD BUTTONS */}

            <div className="p-6 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={
                  addEquipmentItem
                }
                className="px-4 py-3 rounded-xl border border-purple-200 dark:border-purple-900/50 text-purple-600 dark:text-purple-400 text-xs font-mono uppercase tracking-widest"
              >
                + Add Equipment
              </button>

              <button
                type="button"
                onClick={
                  addCustomItem
                }
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 text-xs font-mono uppercase tracking-widest"
              >
                + Add Custom Line
              </button>
            </div>
          </section>

          {/* =================================================
              TERMS + PRICING
          ================================================= */}

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* TERMS */}

            <div className="border-t border-slate-200 dark:border-zinc-800 pt-6">
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                Terms
              </h2>

              <div className="mt-5 space-y-5">
                {/* PAYMENT TERMS */}

                <label className="block">
                  <span
                    className={
                      labelClass
                    }
                  >
                    Payment Terms
                  </span>

                  <div className="relative">
                    <input
                      value={
                        paymentTerms
                      }
                      onChange={(
                        event
                      ) =>
                        setPaymentTerms(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="e.g. 50% deposit, balance on completion"
                      className="mt-2 w-full px-4 py-3 pr-32 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
                    />

                    <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-1">
                      <select
                        className="bg-transparent text-xs text-slate-500 dark:text-zinc-400 px-1 py-1 outline-none"
                        onChange={(
                          event
                        ) => {
                          if (
                            event
                              .target
                              .value
                          ) {
                            setPaymentTerms(
                              event
                                .target
                                .value
                            );
                          }

                          event.target.value =
                            "";
                        }}
                      >
                        <option value="">
                          Templates...
                        </option>

                        <option value="50% upfront, 50% on completion">
                          50% upfront,
                          50% on
                          completion
                        </option>

                        <option value="100% upfront">
                          100% upfront
                        </option>

                        <option value="Net 30">
                          Net 30
                        </option>
                      </select>
                    </div>
                  </div>
                </label>

                {/* DEPOSIT */}

                <label className="block">
                  <span
                    className={
                      labelClass
                    }
                  >
                    Deposit %
                  </span>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={
                      depositPercentage
                    }
                    onChange={(
                      event
                    ) =>
                      setDepositPercentage(
                        Math.min(
                          100,
                          Math.max(
                            0,
                            Number(
                              event
                                .target
                                .value
                            ) || 0
                          )
                        )
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </label>

                {/* NOTES */}

                <label className="block">
                  <span
                    className={
                      labelClass
                    }
                  >
                    Notes
                  </span>

                  <textarea
                    value={
                      notes
                    }
                    onChange={(
                      event
                    ) =>
                      setNotes(
                        event.target
                          .value
                      )
                    }
                    rows={5}
                    placeholder="Additional quote notes..."
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500 resize-none"
                  />
                </label>
              </div>
            </div>

            {/* PRICING */}

            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                Pricing
              </h2>

              <div className="mt-5 space-y-5">
                {/* SUBTOTAL */}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-zinc-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatAmount(
                      subtotal,
                      currency
                    )}
                  </span>
                </div>

                {/* DISCOUNT */}

                <div>
                  <span
                    className={
                      labelClass
                    }
                  >
                    Discount
                  </span>

                  <div className="mt-2 flex gap-2">
                    <select
                      value={
                        discountType
                      }
                      onChange={(
                        event
                      ) =>
                        setDiscountType(
                          event
                            .target
                            .value as
                          | "none"
                          | "percentage"
                          | "fixed"
                        )
                      }
                      className="px-3 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white outline-none"
                    >
                      <option value="none">
                        None
                      </option>

                      <option value="percentage">
                        %
                      </option>

                      <option value="fixed">
                        Fixed
                      </option>
                    </select>

                    <input
                      type="number"
                      min="0"
                      value={
                        discountValue
                      }
                      onChange={(
                        event
                      ) =>
                        setDiscountValue(
                          Math.max(
                            0,
                            Number(
                              event
                                .target
                                .value
                            ) || 0
                          )
                        )
                      }
                      disabled={
                        discountType ===
                        "none"
                      }
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                {/* DISCOUNT AMOUNT */}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-zinc-500">
                    Discount amount
                  </span>

                  <span className="text-slate-900 dark:text-white">
                    -{" "}
                    {formatAmount(
                      discountAmount,
                      currency
                    )}
                  </span>
                </div>

                {/* TAX */}

                <div>
                  <span
                    className={
                      labelClass
                    }
                  >
                    Tax
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={
                      tax
                    }
                    onChange={(
                      event
                    ) =>
                      setTax(
                        Math.max(
                          0,
                          Number(
                            event
                              .target
                              .value
                          ) || 0
                        )
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </div>

                {/* TOTAL */}

                <div className="pt-5 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Total
                  </span>

                  <span className="text-2xl font-light text-purple-600 dark:text-purple-400">
                    {formatAmount(
                      total,
                      currency
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              BOTTOM SAVE
          ================================================= */}

          <div className="flex justify-end pb-10">
            <button
              type="submit"
              disabled={
                saving
              }
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-mono uppercase tracking-widest font-semibold"
            >
              {saving
                ? "Saving..."
                : "Save Quote Draft"}
            </button>
          </div>
        </form>
      </div>

      {/* =====================================================
          CLOSE DESCRIPTION DROPDOWN WHEN CLICKING OUTSIDE
      ===================================================== */}

      {openDescriptionSearch && (
        <button
          type="button"
          aria-label="Close description search"
          onClick={() =>
            setOpenDescriptionSearch(
              null
            )
          }
          className="fixed inset-0 z-[90] cursor-default bg-transparent"
        />
      )}
    </div>
  );
}