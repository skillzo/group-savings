import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PackList from "./pages/PackList";
import PackDetails from "./pages/PackDetails";
import CreatePack from "./pages/CreatePack";
import PayoutHistory from "./pages/PayoutHistory";
import ManageMembers from "./pages/ManageMembers";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/packs"
          element={
            <ProtectedRoute>
              <PackList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/packs/create"
          element={
            <ProtectedRoute>
              <CreatePack />
            </ProtectedRoute>
          }
        />
        <Route
          path="/packs/:id"
          element={
            <ProtectedRoute>
              <PackDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/packs/:packId/manage"
          element={
            <ProtectedRoute>
              <ManageMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payouts"
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
