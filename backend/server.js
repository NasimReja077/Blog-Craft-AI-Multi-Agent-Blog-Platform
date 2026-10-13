import { config } from 'dotenv';
config();

import connectDB from './config/db.js';
import app from './app.js';

connectDB();

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  // Change "listen" to "app.listen" here:
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`AI Provider: Groq (${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'})`);
  });
}

export default app;
