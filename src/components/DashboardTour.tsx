"use client";

import { useEffect } from "react";
import { X } from "@phosphor-icons/react";

type DashboardTour = {
  onClose: () => void;
};

export default function DashboardTour({ onClose }: DashboardTour) {
  useEffect(() => {
    // Tour overlay backdrop
    const backdrop = document.createElement("div");
    backdrop.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 1000;
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    document.body.appendChild(backdrop);

    // Tour card
    const card = document.createElement("div");
    card.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 12px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      text-align: center;
      z-index: 1001;
      animation: fadeIn 0.3s ease;
    `;
    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.25rem; font-weight: 600; color: #1f2937;">Welcome to your Dashboard</h3>
        <button
          onClick={() => {
            document.body.removeChild(backdrop);
            document.body.removeChild(card);
            onClose();
          }}
          style="
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.25rem;
            color: #6b7280;
            padding: 0.5rem;
          "
        >
          <X className="h-5 w-5" style="width: 1.5rem; height: 1.5rem;" />
        </button>
      </div>
      <p style="color: #6b7280; font-size: 0.875rem; line-height: 1.5;">
        You've skipped onboarding, but you can set up your profile, services, and business details anytime from the Settings page. <strong>Resume setup</strong> to get started.
      </p>
    `;
    document.body.appendChild(card);

    // Animation keyframes
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);

    // Cleanup on unmount
    return () => {
      document.body.removeChild(backdrop);
      document.body.removeChild(card);
      document.head.removeChild(style);
    };
  }, [onClose]);

  return null;
}