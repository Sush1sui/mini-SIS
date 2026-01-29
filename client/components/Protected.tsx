"use client";
import React from "react";
import { useRouter } from "next/navigation";
import useAuth from "../lib/useAuth";

export const Protected: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) return <div>Loading…</div>;
  if (!user) return null;
  return <>{children}</>;
};

export default Protected;
