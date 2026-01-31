import type { Command } from "../../types";
import { executePing } from "./executePing.js";

export const ping: Command = {
  name: "ping",
  description: "Botの応答を確認します",
  slash: { execute: executePing },
  messageContext: { execute: executePing },
  message: { keywords: ["ping"], execute: executePing },
};
