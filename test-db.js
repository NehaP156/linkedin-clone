const pool = require("./db");

(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL at:", result.rows[0].now);
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
})();
