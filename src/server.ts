import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
