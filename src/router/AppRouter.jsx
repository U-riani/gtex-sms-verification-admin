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
// import SmsCampaigns from "../pages/SmsCampaigns";
import SmsTemplateEdit from "../pages/SmsTemplateEdit";
import SmsCampaignDetails from "../pages/SmsCampaignDetails";

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
          path="/clients/:id"
          element={
            <LayoutRoute>
              <UserDetails />
            </LayoutRoute>
          }
        />

        <Route
          path="/clients/:id/edit"
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
          path="/sms-templates/:id/edit"
          element={
            <LayoutRoute>
              <SmsTemplateEdit />
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
          path="/sms-campaigns/:id"
          element={
            <LayoutRoute>
              <SmsCampaignDetails />
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
