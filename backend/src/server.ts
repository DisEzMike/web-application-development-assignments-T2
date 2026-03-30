import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Hello, SecureNote API!' });
});

app.use('/api', require('./routes/app.route').default);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/`);
});
