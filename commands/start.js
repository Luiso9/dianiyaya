module.exports = {
    data: {
        name: 'start',
        description: 'Start the Minecraft server',
    },
    cooldown: 10000, // 10 seconds
    async execute(interaction, exec) {
        interaction.reply('Checking if the Minecraft server is already running...');

        // Check for any running Java process
        exec('pgrep -f java', (err, stdout) => {
            if (stdout) {
                // If there is any output, a Java process is running
                return interaction.followUp('The Minecraft server is already running.');
            }

            // If no Java process found, start the server
            interaction.followUp('Starting the Minecraft server...');
            exec('nohup ./start.sh &', { cwd: '/home/driannsa/Downloads/CRPG' }, (err) => {
                if (err) {
                    interaction.followUp('Error starting Minecraft server.');
                    console.error(err);
                    return;
                }
                interaction.followUp('Minecraft server started in the background!');
            });
        });
    },
};
