// components/GlobalLoaderProvider.tsx
"use client";

import { createContext, useContext, useState } from "react";
import GlobalLoader from "./GlobalLoader";

const GlobalLoaderContext = createContext<{
  showLoader: () => void;
  hideLoader: () => void;
}>({
  showLoader: () => {},
  hideLoader: () => {},
});

export const useGlobalLoader = () => useContext(GlobalLoaderContext);

export const GlobalLoaderProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoader = () => setIsLoading(true);
  const hideLoader = () => setIsLoading(false);

  return (
    <GlobalLoaderContext.Provider value={{ showLoader, hideLoader }}>
      {isLoading && <GlobalLoader />}
      {children}
    </GlobalLoaderContext.Provider>
  );
};
