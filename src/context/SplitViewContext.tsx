import { createContext, useContext, useState, ReactNode } from 'react';

type SplitViewContextType = {
  content: ReactNode | null;
  setContent: (content: ReactNode | null) => void;
};

const SplitViewContext = createContext<SplitViewContextType>({
  content: null,
  setContent: () => null,
});

export const SplitViewProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ReactNode | null>(null);

  return (
    <SplitViewContext.Provider value={{ content, setContent }}>
      {children}
    </SplitViewContext.Provider>
  );
};

export const useSplitView = () => {
  const context = useContext(SplitViewContext);
  if (!context) {
    throw new Error('useSplitView must be used within a SplitViewProvider');
  }
  return context;
};
