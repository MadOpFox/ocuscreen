import { Skeleton } from "@/components/ui/skeleton";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import Layout from "./components/Layout";
import { ScreeningContext, useScreeningState } from "./hooks/use-screening";

// Lazy page imports
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AnalysisPage = lazy(() => import("./pages/AnalysisPage"));
const ResultsPage = lazy(() => import("./pages/ResultsPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const HistoryDetailPage = lazy(() => import("./pages/HistoryDetailPage"));

function PageLoader() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-lg" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

// Root layout route
const rootRoute = createRootRoute({
  component: function Root() {
    const screeningValue = useScreeningState();
    return (
      <ScreeningContext.Provider value={screeningValue}>
        <Layout>
          <Outlet />
        </Layout>
      </ScreeningContext.Provider>
    );
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function Index() {
    return (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    );
  },
});

const analyzeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analyze",
  component: function Analyze() {
    return (
      <Suspense fallback={<PageLoader />}>
        <AnalysisPage />
      </Suspense>
    );
  },
});

const resultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/results",
  component: function Results() {
    return (
      <Suspense fallback={<PageLoader />}>
        <ResultsPage />
      </Suspense>
    );
  },
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: function History() {
    return (
      <Suspense fallback={<PageLoader />}>
        <HistoryPage />
      </Suspense>
    );
  },
});

const historyDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history/$screeningId",
  component: function HistoryDetail() {
    return (
      <Suspense fallback={<PageLoader />}>
        <HistoryDetailPage />
      </Suspense>
    );
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  analyzeRoute,
  resultsRoute,
  historyRoute,
  historyDetailRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
