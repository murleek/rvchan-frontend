import { BrowserRouter, Route, Routes } from "react-router";
import { lazy } from "react";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { PAGES } from "./constants";

import { TooltipProvider } from "./components/ui/tooltip";
import ErrorBoundary from "./components/Common/ErrorBoundary";
import Logout from "./pages/logout";
import Auth from "./pages/auth|register|verify|init";
import { SidebarProvider } from "./components/ui/sidebar";
import { NavigationTracker } from "./components/NavigationTracker";

const AuthProvider = lazy(() => import("@/components/Common/AuthProvider"));
const RootLayout = lazy(() => import("@/pages/layout"));

const App = () => {
  return (
    <Provider store={store}>
      <TooltipProvider>
        <BrowserRouter>
          <NavigationTracker />
          <Routes>
            <Route
              path="*"
              element={
                // <Suspense fallback={<PageLoader label={t("loader.page")} />}>
                <ErrorBoundary>
                  <AuthProvider>
                    <SidebarProvider open={false}>
                      <RootLayout />
                    </SidebarProvider>
                  </AuthProvider>
                </ErrorBoundary>
                // </Suspense>
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
    </Provider>
  );
};

export default App;
