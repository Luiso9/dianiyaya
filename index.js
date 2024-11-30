const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const token = 'BOTTOKEN';
const clientId = 'CLIENTID';
const guildId = 'GUILDID';
const authorizedRoleId = 'ROLEID';

client.commands = new Collection();
const commandCooldowns = new Map();

// Load commands from the commands folder
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
    commands.push(command.data);
}

// Register slash commands with Discord
const rest = new REST({ version: '10' }).setToken(token);
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Helper to check cooldowns
function checkCooldown(userId, commandName, cooldownTime) {
    const now = Date.now();
    const userCooldowns = commandCooldowns.get(userId) || {};

    if (userCooldowns[commandName] && now - userCooldowns[commandName] < cooldownTime) {
        return cooldownTime - (now - userCooldowns[commandName]);
    }

    // Update the cooldown map
    userCooldowns[commandName] = now;
    commandCooldowns.set(userId, userCooldowns);
    return 0;
}

// Handle interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Check user permissions
    const member = interaction.guild.members.cache.get(interaction.user.id);
    const hasRole = member && member.roles.cache.has(authorizedRoleId);

    if (!hasRole) {
        return interaction.reply('You are not authorized to use this command.');
    }

    // Handle cooldowns
    const cooldownTime = command.cooldown || 0;
    const remainingCooldown = checkCooldown(interaction.user.id, interaction.commandName, cooldownTime);
    if (remainingCooldown > 0) {
        return interaction.reply(`Please wait ${Math.ceil(remainingCooldown / 1000)} seconds before using this command again.`);
    }

    try {
        await command.execute(interaction, exec);
    } catch (error) {
        console.error(error);
        interaction.reply('There was an error executing that command.');
    }
});

client.login(token);
