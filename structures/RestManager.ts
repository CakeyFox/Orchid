import { Bot } from "discordeno/*";
import { BigString } from "discordeno/types";

export class FoxyRestManager {
    public bot: Bot;
    constructor(bot) {
        this.bot = bot;
    }

    async sendDirectMessage(userId: BigString, data: Object) {
        const DMChannel = await this.bot.rest.runMethod(this.bot.rest, "POST", this.bot.constants.routes.USER_DM(), {
            recipient_id: userId
        });

        this.bot.helpers.sendMessage(DMChannel.id, data);
    }
}