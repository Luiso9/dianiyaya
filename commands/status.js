const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

// Cache object
let cachedData = null;
let lastFetched = 0;
const CACHE_DURATION = 60000; // 60 seconds

module.exports = {
    data: {
        name: 'status',
        description: 'Check detailed status of the Minecraft server',
    },
    cooldown: 3000, // 3 seconds
    async execute(interaction) {
        const apiUrl = 'https://api.mcsrvstat.us/3/147.185.221.21:34650';

        try {
            // Cache Validation
            const now = Date.now();
            if (cachedData && now - lastFetched < CACHE_DURATION) {
                console.log('Using cached server status.');
            } else {
                console.log('Fetching server status from API.');
                const response = await axios.get(apiUrl);
                cachedData = response.data;
                lastFetched = now;
            }

            const serverData = cachedData;

            if (!serverData.online) {
                return interaction.reply('The Minecraft server is currently offline.');
            }

            const motd = serverData.motd.clean.join('\n');
            const playersOnline = serverData.players.online;
            const maxPlayers = serverData.players.max;
            const version = serverData.version;
            const ip = serverData.ip;
            const port = serverData.port;

            // Build an embed message
            const embed = new EmbedBuilder()
                .setColor('#00FF00') // Green for online
                .setTitle('Minecraft Server Status')
                .setDescription('Here are the details of the Minecraft server:')
                .addFields(
                    { name: 'MOTD', value: motd || 'N/A', inline: false },
                    { name: 'Version', value: version || 'N/A', inline: true },
                    { name: 'Players Online', value: `${playersOnline}/${maxPlayers}`, inline: true },
                    { name: 'IP', value: `${ip}:${port}`, inline: false }
                )
                .setFooter({ text: 'Last updated' })
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching server status:', error);
            interaction.reply('Failed to retrieve server status. Please try again later.');
        }
    },
};
