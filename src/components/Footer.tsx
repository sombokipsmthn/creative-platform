import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-muted/20 text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] lg:gap-12">
          <div className="max-w-sm space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 rounded-md font-semibold tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
                K
              </span>
              <span className="text-sm">KIPSMTHN <span className="font-normal text-muted-foreground">Creative OS</span></span>
            </Link>
            <p className="text-sm leading-6 text-muted-foreground">
              Creative operating infrastructure for photographers, filmmakers, and studios — from client enquiry to private gallery delivery.
            </p>
            <div>
              <Button asChild variant="outline" size="sm" className="h-9 gap-2 rounded-lg">
                <Link href="/admin">
                  Open Workspace <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/#platform" className="rounded-sm transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Features & Tools
                </Link>
              </li>
              <li>
                <Link href="/#workflow" className="hover:text-foreground transition-colors">
                  Production Workflow
                </Link>
              </li>
              <li>
                <Link href="/equipment" className="hover:text-foreground transition-colors">
                  Equipment Kit
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-foreground transition-colors">
                  Services Catalog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Studio
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About KIPSMTHN
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact & Inquiries
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground/70">Nairobi, Kenya</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Workspace
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/admin" className="hover:text-foreground transition-colors">
                  Admin Overview
                </Link>
              </li>
              <li>
                <Link href="/admin/quotes" className="hover:text-foreground transition-colors">
                  Production Quotes
                </Link>
              </li>
              <li>
                <Link href="/admin/invoices" className="hover:text-foreground transition-colors">
                  Invoices & eTIMS
                </Link>
              </li>
              <li>
                <Link href="/admin/galleries" className="hover:text-foreground transition-colors">
                  Client Delivery Galleries
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:mt-12 sm:flex-row sm:items-center sm:pt-7">
          <p>© {new Date().getFullYear()} KIPSMTHN. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <span aria-hidden="true">·</span>
            <span>Creative Platform</span>
            <span aria-hidden="true">·</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
