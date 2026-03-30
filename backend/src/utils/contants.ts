const getEnv = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is not defined in environment variables`);
    }
    return value;
};

const POCKETHOST_URL = getEnv('POCKETHOST_URL');
const SECRET_TOKEN = getEnv('SECRET_TOKEN');
const JWT_SECRET = getEnv('JWT_SECRET');
const USERID = getEnv('USER_ID');

export { POCKETHOST_URL, SECRET_TOKEN, USERID, JWT_SECRET };