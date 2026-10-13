const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const app = require('./app');

connectDB();

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`AI Provider: Groq (${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'})`);
  });
}

module.exports = app;
