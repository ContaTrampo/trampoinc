import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://trampoinc.vercel.app/reset-password",
    });

    if (error) setMsg(error.message);
    else setMsg("Email enviado 🚀");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleReset} className="bg-gray-900 p-6 rounded-xl">
        <h1 className="text-xl mb-4">Recuperar senha</h1>

        <input
          type="email"
          placeholder="Seu email"
          className="p-2 w-full mb-3 text-black"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="bg-green-500 p-2 w-full">
          Enviar link
        </button>

        <p className="mt-3">{msg}</p>
      </form>
    </div>
  );
}