import express from 'express';
import fs from 'fs';
import { database } from '..';
import bodyParser from 'body-parser';

const router = express.Router();
router.get("/", (req, res) => {
    res.sendFile("index.html", { root: "./pages/" })
});

// router.get("/commands/get/:commandName", async (req, res) => {

// });

// router.get("/user/get/:id", async (req, res) => {
//     const { id } = req.params;
//     const token = req.header("Authorization");

//     if (token === process.env.AUTHORIZATION) {
//         const user = await database.getUser(id);
//         res.send(user);
//     } else {
//         res.status(401).send({ error: "Invalid key" });
//     }
// });


// router.get("/images/:commandName", (req, res) => {
//     const { commandName } = req.params;
//     const key = req.header("Authorization");
//     if (key === process.env.AUTHORIZATION) {
//         try {
//             const commandFiles = fs.readdirSync(`./assets/commands/images/${commandName}`);
//             const asset = commandFiles[(Math.floor(Math.random() * commandFiles.length))]
//             res.send({ url: `https://api.foxybot.win/images/${commandName}/${asset}` });
//         } catch (e) {
//             res.status(404);
//             console.error(e)
//         }
//     } else {
//         res.status(401).send({ error: "Invalid key" });
//     }
// });


// router.get("/guild/get/:id", async (req, res) => {
//     const { id } = req.params;
//     const key = req.header("Authorization");
//     if (key === process.env.AUTHORIZATION) {
//         const guild = await database.getGuild(id);
//         res.send(guild);
//     } else {
//         res.status(401).send({ error: "Invalid key" });
//     }
// });

// router.get('/backgrounds/get/:id', async (req, res) => {

// });

// router.get('/layouts/get/:id', async (req, res) => {

// });

// router.get('/masks/get/:id', async (req, res) => {

// });

export = router;