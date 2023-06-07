import express from 'express';
import session from 'express-session';
import fs  from 'fs';
import https from 'https';
import path from 'path';
import genFunc from 'connect-pg-simple';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import dotenv from 'dotenv';
import { getPassword, createUser } from './db';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';

dotenv.config();

interface CustomSession extends session.Session  {
    test: string;
}

interface User extends Express.User {
    id: string;
    test: string;
}


const PostgresqlStore = genFunc(session);

const sessionStore = new PostgresqlStore({
  conString: process.env.DB_URL,
});

const app = express();

app.set("trust proxy", 1);
app.use(bodyParser.json());

app.use(session({
    secret: 'QlvlmTbyc1HziUCVd51v',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 172800000, secure: false, sameSite: "none" },
    })
);
app.use(passport.initialize());
app.use(passport.session());

// app.use(
//     cors({
//       origin: "https://localhost:3000",
//       credentials: true,
//     })
// );

passport.use(new LocalStrategy(async function (username, password, done){
    try { 
        let passwordFromDB = await getPassword(username);
        const matchPassword = await bcrypt.compare(password, passwordFromDB);
        if (matchPassword) {
            return done(null, {id: username});
        }
        return done(null, false);
    } catch (err) {
        return done(err, false);
    }
}));

passport.serializeUser((user, done) => {
        const customUser = user as User;
        customUser.test = "test";
        done(null, customUser);
    }
);

passport.deserializeUser((user: User, done) => {
    done(null, user);
});

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.post("/register", async (req, res)=>{
    const {username, password} = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    try {
        const user = await createUser(username, hash);
        res.status(203).json({msg: "sucess"});
    } catch (err) {
        res.status(500).json({msg: "Error"});
    }
});

app.post("/login", passport.authenticate("local", {failureRedirect: "/login"}), (req, res) => {
    const token = jwt.sign({ ...req.user}, 'your_jwt_secret', {expiresIn:  '24h'});
      // Send token back to client
    res.status(200).json({msg: "sucess",  user: req.user, token: token});
});

app.get("/logout", (req, res) => {
    req.logout((err)=> {
        if (err) {
            res.status(500).json({msg: "Error"});
        } else {
            res.status(200).json({msg: "sucess"});
        }
    });
});

app.get("/profile", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, 'your_jwt_secret', (err, user) => {
            if (err) {
                // Return authentication failure
                console.log(err);
                return res.status(403).json({msg: "Unauthorized"});
            }
            res.status(200).json({msg: "sucess", user: user});
        });
    } else {
        // Return authentication failure
        res.status(401).json({msg: "Unauthorized"});
    }
    // if (req.isAuthenticated()) {
    //     res.status(200).json({msg: "sucess", user: req.user});
    // } else {
    //     res.status(401).json({msg: "Unauthorized"});
    // }
});


app.get("/validateJWT", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) {
            // Return authentication failure
            return res.status(403).json({msg: "Unauthorized"});
        }
        req.user = user;
        });
        res.status(200).json({msg: "sucess", user: req.user});
    } else {
        // Return authentication failure
        res.status(401).json({msg: "Unauthorized"});
    }
});


https.createServer({
  key: fs.readFileSync(path.resolve(__dirname, './my-service.key')),
  cert: fs.readFileSync(path.resolve(__dirname, './my-service.crt')),
}, app).listen(9999, '0.0.0.0', () => {
  console.log('Listening...')
});
