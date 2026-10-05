import {
  useEffect,
  useState,
} from "react";

import { supabase } from "./lib/supabase";

export default function App() {
  const [status, setStatus] =
    useState("Testing connection...");

  const [serverTime, setServerTime] =
    useState("");

  useEffect(() => {
    async function testConnection() {
      const { data, error } =
        await supabase.rpc(
          "health_check"
        );

      if (error) {
        console.error(error);

        setStatus(
          `Connection failed: ${error.message}`
        );

        return;
      }

      setStatus(
        `Connected to ${data.project}`
      );

      setServerTime(
        new Date(
          data.server_time
        ).toLocaleString()
      );
    }

    testConnection();
  }, []);

  const connected =
    status.startsWith("Connected");

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
            connected
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {connected ? "✓" : "…"}
        </div>

        <h1 className="mt-6 text-3xl font-bold text-blue-900">
          Supabase Connection Test
        </h1>

        <p
          className={`mt-4 font-semibold ${
            connected
              ? "text-green-700"
              : "text-slate-600"
          }`}
        >
          {status}
        </p>

        {serverTime && (
          <p className="mt-2 text-sm text-slate-500">
            Supabase server time:{" "}
            {serverTime}
          </p>
        )}
      </section>
    </main>
  );
}