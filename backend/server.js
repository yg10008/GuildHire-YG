import { config } from 'dotenv';
import { server } from './app.js';
import { connectDB } from  './db/db.js';

config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  });
});
