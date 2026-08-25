import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [prefill, setPrefill] = useState("");
  const [activeJob, setActiveJob] = useState(null);

  const value = {
    isAuthed,
    login: () => setIsAuthed(true),
    logout: () => setIsAuthed(false),
    prefill,
    setPrefill,
    activeJob,
    setActiveJob,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}
