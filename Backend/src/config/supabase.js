const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;

if (!supabaseUrl || !supabaseKey) {
  console.warn("[supabase] Missing SUPABASE_URL or SUPABASE_KEY — using in-memory stub storage");
  supabase = {
    storage: {
      from: () => ({
        upload: async (fileName, fileBuffer) => ({
          data: { path: fileName },
          error: null,
        }),
        getPublicUrl: (fileName) => ({
          data: { publicUrl: `/uploads/${fileName}` },
        }),
        remove: async () => ({
          error: null,
        }),
      }),
    },
  };
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

module.exports = supabase;
