import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PackList from "./pages/PackList";
import PackDetails from "./pages/PackDetails";
import CreatePack from "./pages/CreatePack";
import PayoutHistory from "./pages/PayoutHistory";
import ManageMembers from "./pages/ManageMembers";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PaymentSuccess from "./pages/PaymentSuccess";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { routes } from "./utils/constants";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.login} element={<Login />} />
        <Route path={routes.register} element={<Register />} />
        <Route path={routes.paymentStatus} element={<PaymentSuccess />} />

        <Route
          path={routes.dashboard}
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path={routes.packs}
          element={
            <ProtectedRoute>
              <PackList />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.packCreate}
          element={
            <ProtectedRoute>
              <CreatePack />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.packDetails}
          element={
            <ProtectedRoute>
              <PackDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.packManage}
          element={
            <ProtectedRoute>
              <ManageMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path={routes.payouts}
          element={
            <ProtectedRoute>
              <PayoutHistory />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
