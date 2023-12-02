import express from 'express';
import fs from 'fs';
import { database } from '..';
import { lylist, masks, bglist } from '../structures/json/profileAssets.json';
import fetch from 'node-fetch-commonjs';
import crypto from 'crypto';

const request = require('request');

const router = express.Router();
router.get("/", (req, res) => {
    res.sendFile("index.html", { root: "./pages/" })
});

router.get("/images/:commandName", (req, res) => {
    const { commandName } = req.params;
    const token = req.header("Authorization");
    const timingSafeEqual = (a, b) => {
        const bufferA = Buffer.from(a);
        const bufferB = Buffer.from(b);

        return crypto.timingSafeEqual(bufferA, bufferB);
    };

    if (timingSafeEqual(token, process.env.AUTHORIZATION)) {
        const commandFiles = fs.readdirSync(`./assets/commands/images/${commandName}`);
        const asset = commandFiles[(Math.floor(Math.random() * commandFiles.length))]
        res.send({ url: `${process.env.API_URL}/images/${commandName}/${asset}` });
    } else {
        res.status(401).send({ error: "Invalid key" });
    }
});

router.get("/backgrounds/:id", (req, res): void => {
    const id = req.params.id;
    const background = bglist.find(bg => bg.id === id);
    if (background) {
        res.sendFile(background.filename, { root: "./assets/backgrounds" });
    } else {
        res.sendFile("404.png", { root: "./assets/" });
    }
    if (res.statusCode === 404) {
        console.warn("Background not found")
    }
});

router.get("/layouts/:id", (req, res) => {
    const id = req.params.id;
    const layout = lylist.find(ly => ly.id === id);
    if (layout) {
        res.sendFile(layout.filename, { root: "./assets/layouts" });
    } else {
        res.sendFile("default.png", { root: "./assets/layouts" });
    }
    if (res.statusCode === 404) {
        console.warn("Layout not found")
    }
});

router.get("/masks/:id", (req, res) => {
    const id = req.params.id;
    const mask = masks.find(msk => msk.id === id);
    if (mask) {
        res.sendFile(mask.filename, { root: "./assets/masks" });
    }
    if (res.statusCode === 404) {
        console.warn("Mask not found")
    }
});

router.get("/profileAssets", (req, res) => {
    res.send({ masks, bglist, lylist });
});

router.get("/keys/:id", async (req, res) => {
    const { id } = req.params;
    const key = req.header("Authorization");
    if (key === process.env.AUTHORIZATION) {
        const keyInfo = await database.getKey(id);
        if (keyInfo) {
            return res.send({ status: 200, keyInfo });
        } else {
            return res.status(404).send({ status: 404, error: "Can't find any user with this key" })
        }
    } else {
        return res.status(401).send({ error: "Invalid key" });
    }
});

router.get("/rso/auth/callback", async (req, res) => {
    const code = req.query.code;
    request.post({
        url: "https://auth.riotgames.com/token",
        auth: {
            user: process.env.RSO_CLIENT_ID,
            pass: process.env.RSO_CLIENT_SECRET
        },
        form: {
            grant_type: "authorization_code",
            code: code,
            redirect_uri: process.env.RSO_REDIRECT_URI
        }
    }, async function (err, httpResponse, body) {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: "Internal server error" });
        }
        fetch("https://americas.api.riotgames.com/riot/account/v1/accounts/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${JSON.parse(body).access_token}`,
                'Accept-Encoding': 'gzip',
            }
        })
            .then(async (response) => {

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const jsonData: any = await response.json();

                const userData = await database.getUser(req.query.state);
                async function getUUID(): Promise<any> {
                    return fetch(`https://api.henrikdev.xyz/valorant/v1/account/${jsonData.gameName}/${jsonData.tagLine}`, {
                        headers: {
                            "Authentication": process.env.VALORANT_API
                        }
                    }).then(res => res.json());

                }
                userData.riotAccount = {
                    isLinked: true,
                    puuid: (await getUUID()).data.puuid,
                    isPrivate: false,
                    region: null,
                    access_token: JSON.parse(body).access_token,
                }

                await userData.save();
                res.status(200).redirect('https://foxybot.win/riot/connection/status=200')
            })
            .catch((error) => {
                console.error('Error:', error);
                res.status(500).redirect('https://foxybot.win/riot/connection/status=500');
            });

    });
});

router.get("/rso/logout", async (req, res) => {
    // todo
});
export = router;