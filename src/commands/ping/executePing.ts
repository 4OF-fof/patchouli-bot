import type { BaseContext } from "../../types";

export const executePing = async (ctx: BaseContext) => {
  await ctx.reply({ content: "Pong!" });
};
