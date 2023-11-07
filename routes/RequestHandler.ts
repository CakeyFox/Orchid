import express from 'express';
import fs from 'fs';
import { database } from '..';
import { lylist, masks, bglist } from '../structures/json/profileAssets.json';

const router = express.Router();
router.get("/", (req, res) => {
    res.sendFile("index.html", { root: "./pages/" })
});

router.get("/user/get/:id", async (req, res) => {
    const { id } = req.params;
    const token = req.header("Authorization");

    if (token === process.env.AUTHORIZATION) {
        const user = await database.getUser(id);
        res.send(user);
    } else {
        res.status(401).send({ error: "Invalid key" });
    }
});


router.get("/images/:commandName", (req, res) => {
    const { commandName } = req.params;
    const key = req.header("Authorization");
    if (key === process.env.AUTHORIZATION) {
        try {
            const commandFiles = fs.readdirSync(`./assets/commands/images/${commandName}`);
            const asset = commandFiles[(Math.floor(Math.random() * commandFiles.length))]
            res.send({ url: `${process.env.API_URL}/images/${commandName}/${asset}` });
        } catch (e) {
            res.status(404);
            console.error(e)
        }
    } else {
        res.status(401).send({ error: "Invalid key" });
    }
});


router.get("/guild/get/:id", async (req, res) => {
    const { id } = req.params;
    const key = req.header("Authorization");
    if (key === process.env.AUTHORIZATION) {
        const guild = await database.getGuild(id);
        res.send(guild);
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

export = router;