// contexts/FeedContext.jsx
import { createContext, useContext } from "react";
import useFeed from "../hooks/useFeed";
import api from "../api";

// 1. Buat Context
const FeedContext = createContext();

// 2. Buat Provider (yang membungkus komponen lain)
export const FeedProvider = ({ children }) => {
  // Panggil useFeed SEKALI di sini
  const feedData = useFeed(api);
  
  return (
    <FeedContext.Provider value={feedData}>
      {children}
    </FeedContext.Provider>
  );
};

// 3. Buat custom hook untuk akses context (biar gampang)
export const useFeedContext = () => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error("useFeedContext harus dipakai di dalam FeedProvider");
  }
  return context;
};