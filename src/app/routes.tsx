import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import LicensingOfficerDashboard from "./pages/LicensingOfficerDashboard";
import TrafficOfficerDashboard from "./pages/TrafficOfficerDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/licensing-officer",
    Component: LicensingOfficerDashboard,
  },
  {
    path: "/traffic-officer",
    Component: TrafficOfficerDashboard,
  },
]);
