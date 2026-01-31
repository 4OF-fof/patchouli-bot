import type {
	ChatInputCommandInteraction,
	Client,
	ClientEvents,
	InteractionReplyOptions,
	Message,
	MessageContextMenuCommandInteraction,
	MessagePayload,
	MessageReplyOptions,
	User,
	UserContextMenuCommandInteraction,
} from "discord.js";

export interface BaseContext {
	executor: User;
	reply: (
		options: string | MessagePayload | MessageReplyOptions | InteractionReplyOptions,
	) => Promise<unknown>;
}

export interface SlashContext extends BaseContext {
	type: "slash";
	interaction: ChatInputCommandInteraction;
}

export interface UserContextMenuContext extends BaseContext {
	type: "userContext";
	interaction: UserContextMenuCommandInteraction;
	targetUser: User;
}

export interface MessageContextMenuContext extends BaseContext {
	type: "messageContext";
	interaction: MessageContextMenuCommandInteraction;
	message: Message;
}

export interface MessageContext extends BaseContext {
	type: "message";
	message: Message;
}

export type CommandContext =
	| SlashContext
	| UserContextMenuContext
	| MessageContextMenuContext
	| MessageContext;

type Handler<T> = { execute: (context: T) => Promise<void> };

export interface Command {
	name: string;
	description: string;
	slash?: Handler<SlashContext>;
	userContext?: Handler<UserContextMenuContext>;
	messageContext?: Handler<MessageContextMenuContext>;
	message?: Handler<MessageContext> & { keywords: string[] };
}

export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
	name: K;
	once?: boolean;
	execute: (client: Client, ...args: ClientEvents[K]) => void | Promise<void>;
}
