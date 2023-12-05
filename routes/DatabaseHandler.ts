import express from 'express';
import { database } from '..';
import crypto from 'crypto';

const router = express.Router();

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

router.post("/user/update/:id", async (req, res) => {
    const { id } = req.params;
    const token = req.header("Authorization");
    const data = req.body;
    const timingSafeEqual = (a, b) => {
        const bufferA = Buffer.from(a);
        const bufferB = Buffer.from(b);

        return crypto.timingSafeEqual(bufferA, bufferB);
    };

    if (timingSafeEqual(token, process.env.AUTHORIZATION)) {
        const user = await database.updateUser(id, data);
        res.send(user);
    } else {
        res.status(401).send({ error: "Invalid key" });
    }
});

router.post("/guild/update/:id", async (req, res) => {
    const { id } = req.params;
    const token = req.header("Authorization");
    const data = req.body;
    const timingSafeEqual = (a, b) => {
        const bufferA = Buffer.from(a);
        const bufferB = Buffer.from(b);

        return crypto.timingSafeEqual(bufferA, bufferB);
    };

    if (timingSafeEqual(token, process.env.AUTHORIZATION)) {
        const guild = await database.updateGuild(id, data);
        res.send(guild);
    } else {
        res.status(401).send({ error: "Invalid key" });
    }
});

router.get("/users", async (req, res) => {
    const token = req.header("Authorization");
    const timingSafeEqual = (a, b) => {
        const bufferA = Buffer.from(a);
        const bufferB = Buffer.from(b);

        return crypto.timingSafeEqual(bufferA, bufferB);
    };

    if (timingSafeEqual(token, process.env.AUTHORIZATION)) {
        const guilds = await database.getAllUsers();
        res.send(guilds);
    } else {
        res.status(401).send({ error: "Invalid key" });
    }
});

router.get("/guilds", async (req, res) => {
    const token = req.header("Authorization");
    const timingSafeEqual = (a, b) => {
        const bufferA = Buffer.from(a);
        const bufferB = Buffer.from(b);

        return crypto.timingSafeEqual(bufferA, bufferB);
    };

    if (timingSafeEqual(token, process.env.AUTHORIZATION)) {
        const guilds = await database.getAllGuilds();
        res.send(guilds);
    } else {
        res.status(401).send({ error: "Invalid key" });
    }
});

router.get('/commands', async (req, res) => {
    const token = req.header("Authorization");
    const timingSafeEqual = (a, b) => {
        const bufferA = Buffer.from(a);
        const bufferB = Buffer.from(b);

        return crypto.timingSafeEqual(bufferA, bufferB);
    };

    if (timingSafeEqual(token, process.env.AUTHORIZATION)) {
        const commands = await database.getAllCommands();
        res.send(commands);
    } else {
        res.status(401).send({ error: "Invalid key" });
    }
});

router.post('/keys/create/:id/:pType', async (req, res) => {
    const { id, pType } = req.params;
    const token = req.header("Authorization");
    const timingSafeEqual = (a, b) => {
        const bufferA = Buffer.from(a);
        const bufferB = Buffer.from(b);

        return crypto.timingSafeEqual(bufferA, bufferB);
    };

    if (timingSafeEqual(token, process.env.AUTHORIZATION)) {
        const key = await database.createKey(id, pType);
        res.send(key);
    } else {
        res.status(401).send({ error: "Invalid key" });
    }
});

router.post('/user/delete/:id', async (req, res) => {
    const { id } = req.params;
    const token = req.header("Authorization");
    const timingSafeEqual = (a, b) => {
        const bufferA = Buffer.from(a);
        const bufferB = Buffer.from(b);

        return crypto.timingSafeEqual(bufferA, bufferB);
    };

    if (timingSafeEqual(token, process.env.AUTHORIZATION)) {
        await database.deleteUser(id);
        res.send({ success: true });
    } else {
        res.status(401).send({ error: "Invalid key" });
    }
});

router.post('/guild/delete/:id', async (req, res) => {
    const { id } = req.params;
    const token = req.header("Authorization");
    const timingSafeEqual = (a, b) => {
        const bufferA = Buffer.from(a);
        const bufferB = Buffer.from(b);

        return crypto.timingSafeEqual(bufferA, bufferB);
    };

    if (timingSafeEqual(token, process.env.AUTHORIZATION)) {
        await database.deleteGuild(id);
        res.send({ success: true });
    } else {
        res.status(401).send({ error: "Invalid key" });
    }
});

router.get('/guild/delete/:id', async (req, res) => {
    const { id } = req.params;
    const token = req.header("Authorization");
    const timingSafeEqual = (a, b) => {
        const bufferA = Buffer.from(a);
        const bufferB = Buffer.from(b);
        return crypto.timingSafeEqual(bufferA, bufferB);
    };

    if (timingSafeEqual(token, process.env.AUTHORIZATION)) {
        await database.deleteGuild(id);
        res.send({ success: true });
    } else {
        res.status(401).send({ error: "Invalid key" });
    }
});

export = router;