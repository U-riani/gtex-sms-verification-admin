import Layout from "../components/Layout/Layout";
import PrivateRoute from "./PrivateRoute";

export default function LayoutRoute({ children }) {
  return (
    <PrivateRoute>
      <Layout>{children}</Layout>
    </PrivateRoute>
  );
}
