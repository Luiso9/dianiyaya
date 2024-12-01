module.exports = {
    data: {
        name: "stop",
        description: "Stop the Minecraft server",
    },
    cooldown: 5000, // 5 seconds
    async execute(interaction, exec) {
        try {
            // Defer the reply to allow time for the pkill command
            await interaction.deferReply();
            await interaction.editReply("Stopping the Minecraft server...");

            // Execute the pkill command
            exec("pkill -f java", { cwd: "/home/driannsa/Downloads/CRPG" }, (err, stdout, stderr) => {
                if (err) {
                    // Handle specific exit codes for pkill
                    if (err.code === 1) {
                        return interaction.editReply("⚠️ No running Minecraft server found to stop.");
                    }

                    // Handle other errors
                    console.error("Error stopping the server:", err);
                    return interaction.editReply("❌ Error stopping the Minecraft server.");
                }

                // Successful stop
                interaction.editReply("✅ Minecraft server stopped successfully!");
            });
        } catch (error) {
            console.error("Unexpected error:", error);
            interaction.editReply("❌ An unexpected error occurred while stopping the server.");
        }
    },
};
