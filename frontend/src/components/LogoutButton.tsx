import { useRouter } from "next/router";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      // Call your backend logout route
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include", // Make sure cookies are sent
      });

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        padding: "0.5rem 1rem",
        background: "#d33",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginTop: "1rem",
      }}
    >
      {loading ? "Logging out..." : "Log out"}
    </button>
  );
}
