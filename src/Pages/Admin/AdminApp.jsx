import React from "react";
import { Loader } from "lucide-react";
import NoIndex from "../../Components/NoIndex";
import { useAuth } from "../../AuthContext";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";

// Main App Component
const AdminApp = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <Loader className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <NoIndex>
      <div>
        {user && isAdmin ? (
          <AdminDashboard />
        ) : (
          <AdminLogin />
        )}
      </div>
    </NoIndex>
  );
};

export default AdminApp;
