import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
// import Users from "../pages/Users";
import UserDetails from "../pages/UserDetails";
import EditUser from "../pages/EditUser";
import Login from "../pages/Login";
import LayoutRoute from "./LayoutRoute";
import SmsTemplates from "../pages/SmsTemplates";
import SmsHistory from "../pages/SmsHistory";
import SmsCampaigns from "../pages/SmsCampaigns";
import SmsTemplateAnalytics from "../pages/SmsTemplateAnalytics";
import Clients from "../pages/Clients";
// import Segment from "../pages/Segment";
import Segments from "../pages/Segments";
import SegmentUsers from "../pages/SegmentUsers";
import UndoSnackbar from "../components/UndoSnackbar";

export default function AppRouter() {
  return (
    <>
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
          path="/clients"
          element={
            <LayoutRoute>
              <Clients />
            </LayoutRoute>
          }
        />
        <Route
          path="/clients/segments"
          element={
            <LayoutRoute>
              <Segments />
            </LayoutRoute>
          }
        />
        <Route
          path="/clients/segments/:id"
          element={
            <LayoutRoute>
              <SegmentUsers />
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
              <SmsTemplateAnalytics />
            </LayoutRoute>
          }
        />
      </Routes>
      <UndoSnackbar />
    </>
  );
}
