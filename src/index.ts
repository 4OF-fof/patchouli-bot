import { env } from "./env";
import { Client, type ClientEvents, GatewayIntentBits } from "discord.js";
import { commands } from "./commands";
import type { Event } from "./types";
import { clientReady } from "./events/clientReady.js";
import { messageCreate } from "./events/messageCreate.js";
import { createInteractionHandler } from "./events/interactionCreate.js";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

function registerEvent<K extends keyof ClientEvents>(event: Event<K>) {
	const handler = (...args: ClientEvents[K]) => event.execute(client, ...args);
	if (event.once) {
		client.once(event.name, handler);
	} else {
		client.on(event.name, handler);
	}
}

function registerEvents() {
	registerEvent(clientReady);
	registerEvent(messageCreate);
	registerEvent(createInteractionHandler(commands));
}

async function main() {
	registerEvents();
	await client.login(env.discordToken);
}

main().catch(console.error);
