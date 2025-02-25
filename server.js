import mongoose from "mongoose";

import app from "./app.js";

const { DB_HOST, PORT = 3000 } = process.env;

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Database connection successful. Server running. Use our API on port: ${PORT}`
      );
    });
  })
  .catch(() => {
    console.log(error.message);
    process.exit(1);
  });
