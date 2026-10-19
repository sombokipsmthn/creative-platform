import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs text-primary-foreground font-mono">
                K
              </span>
              <span>KIPSMTHN</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Creative operating infrastructure for photographers, filmmakers, and studios — from client enquiry to private gallery delivery.
            </p>
            <div>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/admin">
                  Open Workspace <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/#platform" className="hover:text-foreground transition-colors">
                  Features & Tools
                </Link>
              </li>
              <li>
                <Link href="/workflow" className="hover:text-foreground transition-colors">
                  Production Workflow
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

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} KIPSMTHN. All rights reserved.</p>
          <div className="flex items-center gap-4">
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
