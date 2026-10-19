
"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type SplitViewContextType = {
  content: ReactNode | null;
  setContent: (content: ReactNode | null) => void;
};

const SplitViewContext = createContext<SplitViewContextType | undefined>(
  undefined
);

export function SplitViewProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [content, setContent] = useState<ReactNode | null>(null);

  return (
    <SplitViewContext.Provider value={{ content, setContent }}>
      {children}
    </SplitViewContext.Provider>
  );
}

export function useSplitView() {
  const context = useContext(SplitViewContext);

  if (context === undefined) {
    throw new Error(
      "useSplitView must be used within a SplitViewProvider"
    );
  }

  return context;
}
