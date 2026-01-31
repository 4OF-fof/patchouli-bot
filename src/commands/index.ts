import { Collection } from "discord.js";
import type { Command } from "../types";
import { promptMessage } from "./promptMessage";

export const commandList: Command[] = [promptMessage];

export const commandOrder = new Map(commandList.map((cmd, i) => [cmd.name, i]));

export const commands = new Collection<string, Command>(commandList.map((cmd) => [cmd.name, cmd]));
