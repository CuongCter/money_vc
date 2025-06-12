"use client";

import { BrowserRouter as Router } from "react-router-dom";

import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import { onAuthStateChanged } from "./api/authService";
import AppRoutes from "./routers";
import NotificationContainer from "./components/ui/Notification";

function App() {
  const { setUser, setLoading } = useAuthStore();

 useEffect(() => {
    // Set initial loading state
    setLoading(true)

    const unsubscribe = onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        setUser(user)
      } else {
        // User is signed out
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setLoading])

  return (
    <Router>
      <AppRoutes />
      <NotificationContainer />
    </Router>
  );
}

export default App;
