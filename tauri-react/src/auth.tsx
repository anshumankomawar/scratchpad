import * as React from "react";
import { Store } from "@tauri-apps/plugin-store";

export interface StoreContext {
  store: Store;
}

const StoreContext = React.createContext<StoreContext | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = new Store("config.json");
  return (
    <StoreContext.Provider value={{ store }}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within an StoreProvider");
  }
  return context;
}
