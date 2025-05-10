const { Pool } = require("pg");
const pool = new Pool({
  user: "linkedin_clone_db_user",
  host: "dpg-d09nusjuibrs73fh6l60-a.ohio-postgres.render.com",
  database: "linkedin_clone_db",
  password: "mCzneSYl3GXyPvQiZTHCw5rpWsAZoiK8",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
