module.exports = {
    data: {
        name: 'start',
        description: 'Start the Minecraft server',
    },
    cooldown: 10000, // 10 seconds
    async execute(interaction, exec) {
        interaction.reply('Starting the Minecraft server...');
        exec('nohup ./start.sh &', { cwd: '/home/driannsa/Downloads/CRPG' }, (err) => {
            if (err) {
                interaction.followUp('Error starting Minecraft server.');
                console.error(err);
                return;
            }
            interaction.followUp('Minecraft server started in the background!');
        });
    },
};
