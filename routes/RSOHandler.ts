import fetch from 'node-fetch-commonjs';
import crypto, { randomUUID } from 'crypto';
import express from 'express';
import { database } from '../index';

const request = require('request');
const router = express.Router();

router.get("/rso/auth/callback", async (req, res) => {
    const code = await req.query.code;
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
                const key = randomUUID();

                async function getUUID(): Promise<any> {
                    return fetch(`https://api.henrikdev.xyz/valorant/v1/account/${jsonData.gameName}/${jsonData.tagLine}`, {
                        headers: {
                            "Authentication": process.env.VALORANT_API
                        }
                    }).then(res => res.json());

                }
                await database.addAccount((await getUUID()).data.puuid, key);
                const queryStringParams = new URLSearchParams({
                    "puuid": (await getUUID()).data.puuid,
                    "gameName": jsonData.gameName,
                    "tagLine": jsonData.tagLine,
                    "key": key
                });

                res.redirect(`https://foxybot.win/br/rso/login?=${queryStringParams}`)
            })
            .catch((error) => {
                console.error('Error:', error);
                res.status(500).redirect('https://foxybot.win/riot/connection/status=500');
            });

    });
});

export = router;