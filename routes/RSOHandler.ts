import fetch from 'node-fetch-commonjs';
import { randomUUID } from 'crypto';
import express from 'express';
import { database } from '../index';

const router = express.Router();

router.get("/rso/auth/callback", async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send({ error: "Missing authorization code" });
    }

    try {
        const tokenResponse: any = await fetch("https://auth.riotgames.com/token", {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${process.env.RSO_CLIENT_ID}:${process.env.RSO_CLIENT_SECRET}`).toString('base64')
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code as string,
                redirect_uri: process.env.RSO_REDIRECT_URI
            })
        });

        if (!tokenResponse.ok) {
            throw new Error(`Failed to retrieve token, status: ${tokenResponse.status}`);
        }

        const { access_token } = await tokenResponse.json();

        const accountResponse = await fetch("https://americas.api.riotgames.com/riot/account/v1/accounts/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${access_token}`,
                'Accept-Encoding': 'gzip',
            }
        });

        if (!accountResponse.ok) {
            const errorBody = await tokenResponse.text();
            console.error(`Failed to retrieve token, status: ${tokenResponse.status}, body: ${errorBody}`);
            throw new Error(`Failed to retrieve token, status: ${tokenResponse.status}`);
        }

        const jsonData: any = await accountResponse.json();
        const key = randomUUID();

        const uuidData: any = await fetch(`https://api.henrikdev.xyz/valorant/v1/account/${jsonData.gameName}/${jsonData.tagLine}`, {
            headers: {
                "Authorization": process.env.VALORANT_API
            }
        }).then(res => res.json());

        const puuid = uuidData.data.puuid;

        await database.addAccount(puuid, key);

        const queryStringParams = new URLSearchParams({
            "puuid": puuid,
            "gameName": jsonData.gameName,
            "tagLine": jsonData.tagLine,
            "key": key
        });

        res.redirect(`https://foxybot.win/br/rso/login?${queryStringParams}`);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).redirect('https://foxybot.win/riot/connection/status=500');
    }
});

export = router;
