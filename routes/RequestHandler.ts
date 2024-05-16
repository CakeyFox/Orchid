import express from 'express';
import fs from 'fs';
import { database } from '../index';
import { lylist, masks, bglist } from '../json/profileAssets.json';
import { RestManager } from 'discordeno/rest';

const router = express.Router();
router.get("/", (req, res) => {
    res.sendFile("index.html", { root: "./pages/" })
});

router.get("/images/:commandName", (req, res) => {
    const { commandName } = req.params;
    const commandFiles = fs.readdirSync(`./assets/commands/images/${commandName}`);
    const asset = commandFiles[(Math.floor(Math.random() * commandFiles.length))]
    res.send({ url: `${process.env.API_URL}/images/${commandName}/${asset}` });
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

export = router;