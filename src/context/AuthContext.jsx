
import React, { createContext, useContext, useState } from "react";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  /* Initialize state directly to avoid useEffect flash/warning */
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("managerToken"));
  const [loading] = useState(false); // No async check needed now
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("managerUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });


  const login = (userData, token) => {
    localStorage.setItem("managerToken", token);
    localStorage.setItem("managerUser", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("managerToken");
    localStorage.removeItem("managerUser");
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
