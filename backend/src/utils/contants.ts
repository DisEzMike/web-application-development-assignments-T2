import { assert } from "node:console";

const POCKETHOST_URL = process.env.POCKETHOST_URL;
assert(POCKETHOST_URL, 'POCKETHOST_URL is not defined in environment variables');

const SECRET_TOKEN = process.env.SECRET_TOKEN;
assert(SECRET_TOKEN, 'SECRET_TOKEN is not defined in environment variables');

export { POCKETHOST_URL, SECRET_TOKEN };