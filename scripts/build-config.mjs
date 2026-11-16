import { writeFileSync } from "node:fs";

const config = {
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
};

writeFileSync("public/config.js", `window.APP_CONFIG = ${JSON.stringify(config)};\n`);
console.log(config.supabaseUrl ? "config.js written (Supabase enabled)" : "config.js written (no Supabase: offline mode)");
