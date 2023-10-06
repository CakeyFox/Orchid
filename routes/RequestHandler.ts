import express from 'express';
import fs from 'fs';
const router = express.Router();

/* Public API  */

router.get("/images/:commandName", (req, res) => {
    const { commandName } = req.params;

    try {
        const commandFiles = fs.readdirSync(`./assets/commands/images/${commandName}`);
        const asset = commandFiles[(Math.floor(Math.random() * commandFiles.length))]
        res.send({ url: `https://api.foxybot.win/images/${commandName}/${asset}` });
    } catch (e) {
        res.status(404);
        console.error(e)
    }
});

router.get("/commands/get/:commandName", async (req, res) => {
    
});

router.get("/", (req, res) => {
    res.sendFile("index.html", { root: "./pages/" })
})

/* Private API */

router.get("/user/get/:id/auth=:key", async (req, res) => {
    const { id, key } = req.params;

    if (key === process.env.AUTHORIZATION) {
        res.send({ id: id, username: "WinG4merBR", discriminator: "000" })
    } else {
        res.send({ error: "Invalid key" })
    }
});

router.get("/guild/get/:id/auth=:key", async (req, res) => {
    const { id, key } = req.params;

    if (key === process.env.AUTHORIZATION) {
        res.send({ id: id, name: "FoxyBot", icon: "https://cdn.discordapp.com/avatars/743020107474745344/5a5c2b4d4a2a5b1c6f3c9d9c5d3b0e3e.png" })
    } else {
        res.send({ error: "Invalid key" })
    }
});

router.get('/backgrounds/get/:id/auth=:key', async (req, res) => {

});

router.get('/layouts/get/:id/auth=:key', async (req, res) => {

});

router.get('/masks/get/:id/auth=:key', async (req, res) => {

});

export = router;