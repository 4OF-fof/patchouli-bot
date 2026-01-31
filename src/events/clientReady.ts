import type { Client } from "discord.js";
import type { Event } from "../types";

export const clientReady: Event<"clientReady"> = {
	name: "clientReady",
	once: true,
	execute(_client: Client, readyClient: Client<true>) {
		console.log(`Logged in as ${readyClient.user.tag}`);
	},
};
