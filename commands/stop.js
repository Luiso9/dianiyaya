module.exports = {
    data: {
        name: 'stop',
        description: 'Stop the Minecraft server',
    },
    cooldown: 5000, // 5 seconds
    async execute(interaction, exec) {
        interaction.reply('Stopping the Minecraft server...');
        exec('pkill -f ./start.sh', { cwd: '/home/driannsa/Downloads/CRPG' }, (err) => {
            if (err) {
                interaction.followUp('Error stopping Minecraft server.');
                console.error(err);
                return;
            }
            interaction.followUp('Minecraft server stopped!');
        });
    },
};
