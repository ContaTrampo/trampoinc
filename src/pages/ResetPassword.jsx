import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) setMsg(error.message);
    else setMsg("Senha atualizada 🔥");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleUpdate} className="bg-gray-900 p-6 rounded-xl">
        <h1 className="text-xl mb-4">Nova senha</h1>

        <input
          type="password"
          placeholder="Nova senha"
          className="p-2 w-full mb-3 text-black"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-blue-500 p-2 w-full">
          Atualizar senha
        </button>

        <p className="mt-3">{msg}</p>
      </form>
    </div>
  );
}