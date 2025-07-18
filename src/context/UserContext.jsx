import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);
  const logout = () => signOut(auth);
  return <UserContext.Provider value={{ user, logout }}>{children}</UserContext.Provider>;
}
export function useUser() {
  return useContext(UserContext);
}
