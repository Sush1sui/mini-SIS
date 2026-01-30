"use client";
import React from "react";
import { useRouter } from "next/navigation";
import useAuth from "../lib/useAuth";
import Loading from "./loading";

export const Protected: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading)
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loading message="Fetching data…" />
      </div>
    );
  if (!user) return null;
  return <>{children}</>;
};

export default Protected;
