import React from "react";
import Container from "../components/dashboard/Container";
import Auth from "./Auth";
import { useAuthStore } from "../store/authStore";

function Dashboard() {
  const { session, isAdmin } = useAuthStore();

  // Only allow admin access
  if (!session || !isAdmin()) {
    return <Auth />;
  }

  return <Container />;
}

export default Dashboard;
