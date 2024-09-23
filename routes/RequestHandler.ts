import express from 'express';
import fs from 'fs';
import { database } from '../index';
const router = express.Router();
router.get("/", (req, res) => {
    res.sendFile("index.html", { root: "./pages/" })
});

router.get("/roleplay/:commandName", (req, res) => {
    const { commandName } = req.params;
    let commandFiles;
    try {
        commandFiles = fs.readdirSync(`./assets/commands/roleplay/${commandName}`);
    } catch (err) {
        return res.status(404).send({ error: "Command not found" });
    }
    const asset = commandFiles[(Math.floor(Math.random() * commandFiles.length))]
    res.send({ url: `${process.env.API_URL}/assets/commands/roleplay/${commandName}/${asset}` });
});

router.get("/backgrounds/:id", async (req, res): Promise<void> => {
    const background = await database.getBackground(req.params.id);

    if (background) {
        res.sendFile(background.filename, { root: "./assets/backgrounds" });
    } else {
        res.sendFile("404.png", { root: "./assets/" });
    }
    if (res.statusCode === 404) {
        console.warn("Background not found")
    }
});

router.get("/layouts/:id", async (req, res) => {
    const id = req.params.id;
    const layout = await database.getLayout(id);
    if (layout) {
        res.sendFile(layout.filename, { root: "./assets/layouts" });
    } else {
        res.sendFile("default.png", { root: "./assets/layouts" });
    }
    if (res.statusCode === 404) {
        console.warn("Layout not found")
    }
});

router.get("/masks/:id", async (req, res) => {
    const id = req.params.id;
    const mask = await database.getDecoration(id);
    if (mask) {
        res.sendFile(mask.filename, { root: "./assets/masks" });
    }
    if (res.statusCode === 404) {
        console.warn("Mask not found")
    }
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

router.get("/user/minecraft/:username", async (req, res) => {
    const { username } = req.params;
    const auth = req.header("Authorization");
    if (auth === process.env.AUTHORIZATION) {
        const minecraftUser = await database.getMinecraftUser(username);
        if (!minecraftUser) { return res.status(404).send({ error: "User not found" }) }
        const userFromFoxy = await database.getUser(minecraftUser.discordId);

        return res.send({ status: 200, user: {
            minecraft: {
                username: minecraftUser.username
            },
            foxy: {
                id: userFromFoxy._id,
                isBanned: userFromFoxy.isBanned,
                banReason: userFromFoxy.banReason,
                banDate: userFromFoxy.banDate,
            }
        }})

    } else {
        return res.status(401).send({ error: "Invalid key" });
    }
});

export = router;