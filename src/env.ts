import "dotenv/config";

function requireEnv(key: string): string {
	const value = process.env[key];
	if (!value) {
		throw new Error(`${key} must be set in environment variables`);
	}
	return value;
}

export const env = {
	discordToken: requireEnv("DISCORD_TOKEN"),
	discordClientId: requireEnv("DISCORD_CLIENT_ID"),
	ownerUserId: process.env.OWNER_USERID,
	guildId: process.env.GUILD_ID,
};
