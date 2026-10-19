import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";

export default function Footer() {
  return (
    <footer className="">
      <div className="">
        <div className="">
          <div className="">
            <Link href="/" className="">
              <span className="">
                K
              </span>
              <span>KIPSMTHN</span>
            </Link>
            <p className="">
              Creative operating infrastructure for photographers, filmmakers, and studios — from client enquiry to private gallery delivery.
            </p>
            <div>
              <Button asChild variant="outline" size="sm" className="">
                <Link href="/admin">
                  Open Workspace <ArrowRight className="" />
                </Link>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="">
              Platform
            </h3>
            <ul className="">
              <li>
                <Link href="/#platform" className="">
                  Features & Tools
                </Link>
              </li>
              <li>
                <Link href="/workflow" className="">
                  Production Workflow
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="">
              Studio
            </h3>
            <ul className="">
              <li>
                <Link href="/about" className="">
                  About KIPSMTHN
                </Link>
              </li>
              <li>
                <Link href="/contact" className="">
                  Contact & Inquiries
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <span className="">Nairobi, Kenya</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="">
              Workspace
            </h3>
            <ul className="">
              <li>
                <Link href="/admin" className="">
                  Admin Overview
                </Link>
              </li>
              <li>
                <Link href="/admin/quotes" className="">
                  Production Quotes
                </Link>
              </li>
              <li>
                <Link href="/admin/invoices" className="">
                  Invoices & eTIMS
                </Link>
              </li>
              <li>
                <Link href="/admin/galleries" className="">
                  Client Delivery Galleries
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="">
          <p>© {new Date().getFullYear()} KIPSMTHN. All rights reserved.</p>
          <div className="">
            <Link href="/privacy" className="">
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
