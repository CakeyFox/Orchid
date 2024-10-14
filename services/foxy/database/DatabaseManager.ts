import mongoose from 'mongoose';
import { logger } from '../../../utils/logger';
import { User } from 'discordeno/transformers';
import { RestManager } from '../RestManager';
import { Schemas } from './Schemas';
import { Background, Decoration, Layout } from '../../../utils/types/profile';
import cron from 'node-cron';
import { database } from '../../..';
const { v4: uuidv4 } = require('uuid');
const rest = new RestManager();

export default class DatabaseConnection {
    public key: any;
    public user: any;
    public commands: any;
    public guilds: any;
    public riotAccount: any;
    public backgrounds: any;
    public decorations: any;
    public layouts: any;
    public minecraft: any;
    public store: any;

    constructor() {
        mongoose.set("strictQuery", true)
        mongoose.connect(process.env.MONGODB_URI).catch((error) => {
            logger.error(`Failed to connect to database: `, error);
        });
        logger.info(`[DATABASE] Connected to database!`);

        this.user = mongoose.model('user', Schemas.userSchema);
        this.commands = mongoose.model('commands', Schemas.commandsSchema);
        this.guilds = mongoose.model('guilds', Schemas.guildSchema);
        this.key = mongoose.model('key', Schemas.keySchema);
        this.riotAccount = mongoose.model('riotAccount', Schemas.riotAccountSchema);
        this.backgrounds = mongoose.model('backgrounds', Schemas.backgroundSchema);
        this.decorations = mongoose.model('decorations', Schemas.avatarDecorationSchema);
        this.layouts = mongoose.model('layouts', Schemas.layoutsSchema);
        this.minecraft = mongoose.model('minecraft', Schemas.minecraftSchema, 'MinecraftAccounts');
        this.store = mongoose.model('dailyStore', Schemas.dailyStoreSchema);

        cron.schedule('0 0 * * *', async () => {
            await this.updateStore();
        });

    }

    async updateStore() {
        const backgrounds = await database.getAllBackgrounds();
        const randomBackgrounds = backgrounds.sort(() => Math.random() - Math.random()).slice(0, 6);
        this.store.findOneAndUpdate({}, {
            itens: randomBackgrounds,
            lastUpdate: new Date()
        }, { upsert: true }).then(() => {
            logger.info(`[DATABASE] Updated store!`);
        });
    }

    async getUser(userId: String): Promise<any> {
        if (!userId) null;
        const user: User = await rest.getUser(userId);
        let document = await this.user.findOne({ _id: user.id });

        if (!document) {
            document = new this.user({
                _id: user.id,
                userCreationTimestamp: new Date(),
                isBanned: false,
                banDate: null,
                banReason: null,
                userCakes: {
                    balance: 0,
                    lastDaily: null,
                },
                marryStatus: {
                    marriedWith: null,
                    marriedDate: null,
                    cantMarry: false,
                },
                userProfile: {
                    decoration: null,
                    decorationList: [],
                    background: "default",
                    backgroundList: ["default"],
                    repCount: 0,
                    lastRep: null,
                    layout: "default",
                    aboutme: null,
                },
                userPremium: {
                    premium: false,
                    premiumDate: null,
                    premiumType: null,
                },
                userSettings: {
                    language: 'pt-br'
                },
                petInfo: {
                    name: null,
                    type: null,
                    rarity: null,
                    level: 0,
                    hungry: 100,
                    happy: 100,
                    health: 100,
                    lastHungry: null,
                    lastHappy: null,
                    isDead: false,
                    isClean: true,
                    food: []
                },
                userTransactions: [],
                riotAccount: {
                    isLinked: false,
                    puuid: null,
                    isPrivate: false,
                    region: null
                },
                premiumKeys: [],
                roulette: {
                    availableSpins: 5,
                }
            }).save();
        }

        return document;
    }

    async getAllCommands(): Promise<void> {
        let commandsData = await this.commands.find({});
        return commandsData.map(command => command.toJSON());
    }

    async getCode(code: string): Promise<any> {
        const riotAccount = this.riotAccount.findOne({ authCode: code });
        if (!riotAccount) return null;
        return riotAccount;
    }

    async getAllUsageCount(): Promise<Number> {
        let commandsData = await this.commands.find({});
        let usageCount = 0;
        commandsData.map(command => usageCount += command.commandUsageCount);
        return usageCount;

    }

    async getMinecraftUser(username: string) {
        let document = await this.minecraft.findOne({ username });
        if (!document) {
            return null;
        }

        return document;
    }

    async getGuild(guildId: BigInt): Promise<any> {
        let document = await this.guilds.findOne({ _id: guildId });
        return document;
    }

    async addGuild(guildId: BigInt): Promise<any> {
        let document = await this.guilds.findOne({ _id: guildId });

        if (!document) {
            document = new this.guilds({
                _id: guildId,
                GuildJoinLeaveModule: {
                    isEnabled: false,
                    joinMessage: null,
                    alertWhenUserLeaves: false,
                    leaveMessage: null,
                    joinChannel: null,
                    leaveChannel: null,
                },
                valAutoRoleModule: {
                    isEnabled: false,
                    unratedRole: null,
                    ironRole: null,
                    bronzeRole: null,
                    silverRole: null,
                    goldRole: null,
                    platinumRole: null,
                    diamondRole: null,
                    ascendantRole: null,
                    immortalRole: null,
                    radiantRole: null,
                },
                premiumKeys: []

            }).save()
        }

        return document;
    }

    async removeGuild(guildId: BigInt): Promise<any> {
        let document = await this.guilds.findOne({ _id: guildId });

        if (document) {
            document.delete();
        } else {
            return null;
        }

        return document;
    }

    async getAllUsers(): Promise<void> {
        let usersData = await this.user.find({});
        return usersData.map(user => user.toJSON());
    }

    async getAllGuilds(): Promise<void> {
        let guildsData = await this.guilds.find({});
        return guildsData.length;
    }

    async deleteUser(userId: any) {
        try {
            await this.user.findOneAndDelete({ _id: userId });
        } catch (error) {
            console.log(error)
            return null;
        }
    }

    async deleteGuild(guildId: any) {
        try {
            await this.guilds.findOneAndDelete({ _id: guildId });
        } catch (error) {
            console.log(error)
            return null;
        }
    }

    async addAccount(puuid: string, authCode: string) {
        let document = await this.riotAccount.findOne({ puuid: puuid });

        if (document) {
            document.authCode = authCode;
            document.save();
        } else {
            document = new this.riotAccount({
                puuid: puuid,
                authCode: authCode,
            }).save();
        }
        return document;
    }

    async registerKey(user: String, expiresAt: Date, pType: Number): Promise<Key> {
        const key = uuidv4();
        const userDocument = await this.getUser(user);

        userDocument.premiumKeys.push({
            key: key,
            used: false,
            expiresAt: expiresAt,
            pType: pType,
            guild: null,
        });

        await userDocument.save();
        return userDocument.premiumKeys[userDocument.premiumKeys.length - 1];
    }

    async getKey(key: string) {
        var document = await this.user.findOne({ premiumKeys: { $elemMatch: { key: key } } });

        if (!document) {
            return null;
        } else {
            return document;
        }
    }

    async createKey(userId, pType: string): Promise<void> {
        const key = uuidv4();
        const userDocument = await this.getUser(userId);

        userDocument.premiumKeys.push({
            key: key,
            used: false,
            expiresAt: new Date(Date.now() + 2592000000),
            pType: pType,
            guild: null,
        });
        await userDocument.save();
        return key;
    }


    async getAllBackgrounds(): Promise<Background[]> {
        const backgroundsData = await this.backgrounds.find({});
        return backgroundsData.map(background => background.toJSON());
    }

    async getAllDecorations(): Promise<Decoration[]> {
        const decorationsData = await this.decorations.find({});
        return decorationsData.map(decoration => decoration.toJSON());
    }

    async getBackground(backgroundId: string): Promise<Background> {
        return await this.backgrounds.findOne({ id: backgroundId });
    }

    async getDecoration(decorationId: string): Promise<Decoration> {
        return await this.decorations.findOne({ id: decorationId });
    }

    async getLayout(layoutId: string): Promise<Layout> {
        return await this.layouts.findOne({ id: layoutId });
    }

    async getAllLayouts(): Promise<Layout[]> {
        const layoutsData = await this.layouts.find({});
        return layoutsData.map(layout => layout.toJSON());
    }
}

interface Key {
    key: string;
    used: boolean;
    expiresAt: Date;
    pType: number;
    guild: string;
}