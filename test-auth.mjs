import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing env. Check .env.local for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const email = "testuser@example.com";
const password = "Test1234!";

const main = async () => {
  // Try sign up (won't error if user already exists; it will return "User already registered")
  const { data: signup, error: signUpErr } = await supabase.auth.signUp({ email, password });
  if (signUpErr) console.log("signUp:", signUpErr.message); else console.log("signUp ok");

  // Then sign in with password
  const { data: signin, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signInErr) {
    console.error("signIn:", signInErr.message);
    process.exit(1);
  }
  console.log("signIn ok, user:", signin.user?.email);
};

main();
