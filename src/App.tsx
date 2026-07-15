import { BrowserRouter, Route, Routes } from "react-router";
import { lazy, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { PAGES } from "./constants";

import { TooltipProvider } from "./components/ui/tooltip";
import ErrorBoundary from "./components/Common/ErrorBoundary";
import Logout from "./pages/logout";
import Auth from "./pages/auth|register|verify|init";
import { SidebarProvider } from "./components/ui/sidebar";
import { NavigationTracker } from "./components/NavigationTracker";
import { AuthProvider } from "./providers/AuthProvider";

const AuthGuard = lazy(() => import("@/components/Common/AuthProvider"));
const RootLayout = lazy(() => import("@/pages/layout"));

const App = () => {
  useEffect(() => {
    // Only target iOS devices (Safari specific issue)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const edgeThreshold = window.innerWidth * 0.1; // 10% from edges

        // Check if the touch starts near the left or right edge
        if (
          touch.clientX < edgeThreshold ||
          touch.clientX > window.innerWidth - edgeThreshold
        ) {
          e.preventDefault();
        }
      }
    };

    // 'passive: false' is mandatory to allow e.preventDefault()
    window.addEventListener("touchstart", handleTouchStart, { passive: false });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <NavigationTracker />
            <Routes>
              <Route
                path="*"
                element={
                  <ErrorBoundary>
                    <AuthGuard>
                      <SidebarProvider open={false}>
                        <RootLayout />
                      </SidebarProvider>
                    </AuthGuard>
                  </ErrorBoundary>
                }
              />
              <Route path={PAGES.LOGOUT} element={<Logout />} />
              <Route path={PAGES.LOGIN} element={<Auth />} />
              <Route path={PAGES.VERIFY} element={<Auth />} />
              <Route path={PAGES.REGISTER} element={<Auth />} />
              <Route path={PAGES.INIT} element={<Auth />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </Provider>
  );
};

export default App;
