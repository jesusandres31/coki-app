import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { NotFound, SignIn, Unauthorized } from "src/pages";
import {
  Drawer,
  GlobalSnackbar,
  Loading,
  ProtectedRoute,
} from "src/components/common";
import { AppRoutes, configKey } from "src/config";
import { useAuth, useRouter } from "src/hooks";
import { Box } from "@mui/material";

const Profile = lazy(() =>
  import("src/pages").then((module) => ({ default: module.Profile })),
);
const Invoices = lazy(() =>
  import("src/pages").then((module) => ({ default: module.Invoices })),
);
const InvoicesNew = lazy(() =>
  import("src/pages").then((module) => ({ default: module.InvoicesNew })),
);
const InvoiceDetail = lazy(() =>
  import("src/pages").then((module) => ({ default: module.InvoiceDetail })),
);
const Clients = lazy(() =>
  import("src/pages").then((module) => ({ default: module.Clients })),
);
const Products = lazy(() =>
  import("src/pages").then((module) => ({ default: module.Products })),
);

const privateRoutes = [
  {
    route: AppRoutes.Profile,
    render: <Profile />,
  },
  {
    route: AppRoutes.Invoices,
    render: <Invoices />,
  },
  {
    route: AppRoutes.InvoicesNew,
    render: <InvoicesNew />,
  },
  {
    route: AppRoutes.InvoicesDetail,
    render: <InvoiceDetail />,
  },
  {
    route: AppRoutes.Clients,
    render: <Clients />,
  },
  {
    route: AppRoutes.Products,
    render: <Products />,
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
              isLoggedIn ? <Navigate to={configKey.LANDING_PAGE} /> : <SignIn />
            }
          />

          {/* protected routes */}
          <Route
            path={AppRoutes.Index}
            element={isLayoutRoutes && <Drawer noTable />}
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
