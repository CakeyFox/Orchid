import { createBotConstants, createRestManager } from "discordeno";
import { BigString } from "discordeno/types";
import { logger } from "../../utils/logger";
require("dotenv").config();

export class RestManager {
    public rest = createRestManager({
        // @ts-ignore
        token: process.env.FOXY_TOKEN,
        version: 10
    });
    public constants = createBotConstants();
    constructor() {
    }

    async sendDirectMessage(userId: BigString, data: Object) {
        try {
            const userDM: any = this.rest.runMethod(this.rest, "POST", this.constants.routes.USER_DM(), {
                recipient_id: userId,
            });
    
            return this.rest.runMethod(this.rest, "POST", this.constants.routes.CHANNEL_MESSAGES((await userDM).id), {
                ...data
            });
        } catch (error) {
            logger.error("Error sending direct message to user. Is DM closed?", error)
        }
    }

    async getUser(userId: String) {
        // Using toString() because for some reason the USER method requires a BigString
        return this.rest.runMethod(this.rest, "GET", this.constants.routes.USER(userId.toString()));
    }
}