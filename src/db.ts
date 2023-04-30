import { Pool } from 'pg';
import dotenv from 'dotenv';


dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER, 
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT as string),
    max: 20}
);

export function getUsers() {
    return pool.query('SELECT * FROM public.session');
}

export async function getPassword(username: string) {
    try {
        let res = await pool.query('SELECT password FROM public.users WHERE username = $1', [username]);
        return res.rows[0].password;
    } catch (error) {
        throw error;
    }
};

export async function createUser(username: string, password: string) {
    try {
        await pool.query('INSERT INTO public.users (username, password) VALUES ($1, $2)', [username, password]);
        const resUser = await pool.query('SELECT * FROM public.users WHERE username = $1', [username]);
        return {id: resUser.rows[0].id, username: resUser.rows[0].username};
    } catch (error) {
        throw new Error("Create user error");
    }
};