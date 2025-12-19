import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import UserDetails from "../pages/UserDetails";
import EditUser from "../pages/EditUser";
import Login from "../pages/Login";
import LayoutRoute from "./LayoutRoute";
import SmsTemplates from "../pages/SmsTemplates";
import SmsHistory from "../pages/SmsHistory";
import SmsCampaigns from "../pages/SmsCampaigns";
import SmsTemplateAnalytics from "../pages/SmsTemplateAnalytics";

export default function AppRouter() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />

      {/* PROTECTED */}
      <Route
        path="/"
        element={
          <LayoutRoute>
            <Dashboard />
          </LayoutRoute>
        }
      />

      <Route
        path="/users"
        element={
          <LayoutRoute>
            <Users />
          </LayoutRoute>
        }
      />

      <Route
        path="/users/:id"
        element={
          <LayoutRoute>
            <UserDetails />
          </LayoutRoute>
        }
      />

      <Route
        path="/users/:id/edit"
        element={
          <LayoutRoute>
            <EditUser />
          </LayoutRoute>
        }
      />
      <Route
        path="/sms-templates"
        element={
          <LayoutRoute>
            <SmsTemplates />
          </LayoutRoute>
        }
      />
      <Route
        path="/sms-history"
        element={
          <LayoutRoute>
            <SmsHistory />
          </LayoutRoute>
        }
      />
      <Route
        path="/sms-campaigns"
        element={
          <LayoutRoute>
            <SmsCampaigns />
          </LayoutRoute>
        }
      />
      <Route
        path="/sms-template-analytics"
        element={
          <LayoutRoute>
            <SmsTemplateAnalytics  />
          </LayoutRoute>
        }
      />
    </Routes>
  );
}
