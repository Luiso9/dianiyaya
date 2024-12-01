const {
	Client,
	GatewayIntentBits,
	REST,
	Routes,
	Collection,
	ActivityType,
} = require("discord.js");

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config(); // Load environment variables

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
	],
});

const token = process.env.TOKEN; // Use environment variables
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const authorizedRoleId = process.env.AUTHORIZED_ROLE_ID;
const serverApiUrl = "https://api.mcsrvstat.us/3/147.185.221.21:34650";

client.commands = new Collection();
const commandCooldowns = new Map();

// Load commands from the commands folder
const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(path.join(commandsPath, file));
	client.commands.set(command.data.name, command);
	commands.push(command.data);
}

// Register slash commands with Discord
const rest = new REST({ version: "10" }).setToken(token);
(async () => {
	try {
		console.log("Started refreshing application (/) commands.");
		await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
			body: commands,
		});
		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}
})();

client.once("ready", async () => {
	console.log(`Logged in as ${client.user.tag}!`);

	// Function to fetch server status and update activity
	const updateServerStatus = async () => {
		try {
			const response = await axios.get(serverApiUrl);
			const serverData = response.data;
			if (serverData.online) {
				const motd = serverData.motd?.clean?.join("\n") || "N/A";
				const ip = serverData.ip || "Unknown";

				client.user.setPresence({
					activities: [{ name: motd, type: ActivityType.Playing }],
					status: "online", // Set status as online
				});
			} else {
				console.log("Server is offline");
				client.user.setPresence({
					activities: [
						{ name: "Server Offline", type: ActivityType.Watching },
					],
					status: "idle", // Set status as idle when the server is offline
				});
			}
		} catch (error) {
			console.error("Failed to fetch server status:", error);
			client.user.setPresence({
				activities: [
					{ name: "Server Status Unknown", type: ActivityType.Watching },
				],
				status: "dnd",
			});
		}
	};

	updateServerStatus();
	// Update status every 30 seconds
	setInterval(updateServerStatus, 30000);
});

// Helper to check cooldowns
function checkCooldown(userId, commandName, cooldownTime) {
	const now = Date.now();
	const userCooldowns = commandCooldowns.get(userId) || {};

	if (
		userCooldowns[commandName] &&
		now - userCooldowns[commandName] < cooldownTime
	) {
		return cooldownTime - (now - userCooldowns[commandName]);
	}

	// Update the cooldown map
	userCooldowns[commandName] = now;
	commandCooldowns.set(userId, userCooldowns);
	return 0;
}

// Handle interactions
client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	// Check user permissions
	const member = interaction.guild.members.cache.get(interaction.user.id);
	const hasRole = member && member.roles.cache.has(authorizedRoleId);

	if (!hasRole) {
		return interaction.reply("You are not authorized to use this command.");
	}

	// Handle cooldowns
	const cooldownTime = command.cooldown || 0;
	const remainingCooldown = checkCooldown(
		interaction.user.id,
		interaction.commandName,
		cooldownTime
	);
	if (remainingCooldown > 0) {
		return interaction.reply(
			`Please wait ${Math.ceil(
				remainingCooldown / 1000
			)} seconds before using this command again.`
		);
	}

	try {
		await command.execute(interaction, exec);
	} catch (error) {
		console.error(error);
		interaction.reply("There was an error executing that command.");
	}
});

client.login(token);
