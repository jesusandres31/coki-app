import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { NotFound, SignIn, Unauthorized } from "src/pages";
import {
  Dashboard,
  GlobalSnackbar,
  Loading,
  ProtectedRoute,
} from "src/components/common";
import { AppRoutes, conf } from "src/config";
import { useAuth, useRouter } from "src/hooks";
import { Box } from "@mui/material";

const Expenses = lazy(() =>
  import("src/pages").then((module) => ({ default: module.Expenses }))
);
const ExpenseConcepts = lazy(() =>
  import("src/pages").then((module) => ({ default: module.ExpenseConcepts }))
);
const Clients = lazy(() =>
  import("src/pages").then((module) => ({ default: module.Clients }))
);
const Rentals = lazy(() =>
  import("src/pages").then((module) => ({ default: module.Rentals }))
);
const Invoices = lazy(() =>
  import("src/pages").then((module) => ({ default: module.Invoices }))
);
const Products = lazy(() =>
  import("src/pages").then((module) => ({ default: module.Products }))
);
const ProductsCanteens = lazy(() =>
  import("src/pages").then((module) => ({ default: module.ProductsCanteens }))
);
const StatsClients = lazy(() =>
  import("src/pages").then((module) => ({ default: module.StatsClients }))
);
const StatsIncomes = lazy(() =>
  import("src/pages").then((module) => ({ default: module.StatsIncomes }))
);
const StatsProducts = lazy(() =>
  import("src/pages").then((module) => ({ default: module.StatsProducts }))
);
const Fields = lazy(() =>
  import("src/pages").then((module) => ({ default: module.Fields }))
);
const Balls = lazy(() =>
  import("src/pages").then((module) => ({ default: module.Balls }))
);
const Profile = lazy(() =>
  import("src/pages").then((module) => ({ default: module.Profile }))
);

const privateRoutes = [
  {
    route: AppRoutes.Profile,
    render: <Profile />,
  },
  {
    route: AppRoutes.Expenses,
    render: <Expenses />,
  },
  {
    route: AppRoutes.ExpenseConcepts,
    render: <ExpenseConcepts />,
  },
  {
    route: AppRoutes.Clients,
    render: <Clients />,
  },
  {
    route: AppRoutes.Rentals,
    render: <Rentals />,
  },
  {
    route: AppRoutes.Invoices,
    render: <Invoices />,
  },
  {
    route: AppRoutes.Products,
    render: <Products />,
  },
  {
    route: AppRoutes.ProductsCanteens,
    render: <ProductsCanteens />,
  },
  {
    route: AppRoutes.Fields,
    render: <Fields />,
  },
  {
    route: AppRoutes.Balls,
    render: <Balls />,
  },
  {
    route: AppRoutes.StatsClients,
    render: <StatsClients />,
  },
  {
    route: AppRoutes.StatsIncomes,
    render: <StatsIncomes />,
  },
  {
    route: AppRoutes.StatsProducts,
    render: <StatsProducts />,
  },
];

function App(): JSX.Element {
  const { isLoggedIn } = useAuth();
  const { isLayoutRoutes } = useRouter();

  return (
    <React.Fragment>
      <Suspense
        fallback={
          <Box sx={{ position: "absolute", top: "50%", left: "50%" }}>
            <Loading />
          </Box>
        }
      >
        <Routes>
          {/* login routes */}
          <Route
            path={AppRoutes.Index}
            element={<Navigate to={AppRoutes.Login} />}
          />
          <Route
            path={AppRoutes.Login}
            element={
              isLoggedIn ? <Navigate to={conf.LANDING_PAGE} /> : <SignIn />
            }
          />

          {/* protected routes */}
          <Route
            path={AppRoutes.Index}
            element={isLayoutRoutes && <Dashboard />}
          >
            {privateRoutes.map((privateRoute) => (
              <Route
                key={privateRoute.route}
                path={privateRoute.route}
                element={<ProtectedRoute>{privateRoute.render}</ProtectedRoute>}
              />
            ))}
          </Route>

          {/* error routes */}
          <Route path={AppRoutes.Unauthorized} element={<Unauthorized />} />
          <Route path={AppRoutes.Wildcard} element={<NotFound />} />
        </Routes>
      </Suspense>
      <GlobalSnackbar />
    </React.Fragment>
  );
}

export default App;
