const { spawn } = require("child_process");
const axios = require("axios");

module.exports = {
	data: {
		name: "start",
		description: "Start the Minecraft server",
	},
	cooldown: 10000, // 10 seconds
	async execute(interaction) {
		try {
			const serverPath =
				process.env.SERVER_PATH || "/home/driannsa/Downloads/CRPG";
			const serverStartScript = "./start.sh";

			await interaction.deferReply();
			await interaction.editReply(
				"🔄 Checking if the Minecraft server is already running..."
			);

			// Check for any running Minecraft server processes
			const checkProcess = spawn("pgrep", ["-fl", "java -Dlog4j2"]);
			let checkOutput = "";

			checkProcess.stdout.on("data", (data) => {
				checkOutput += data.toString();
			});

			checkProcess.stderr.on("data", (data) => {
				console.error(`Error during process check: ${data.toString()}`);
			});

			checkProcess.on("close", async () => {
				if (checkOutput.trim()) {
					return interaction.editReply(
						"🟢 The Minecraft server is already running."
					);
				}

				await interaction.editReply(
					"⚙️ No running server detected. Starting the Minecraft server..."
				);
				const serverProcess = spawn(serverStartScript, {
					cwd: serverPath,
					shell: true,
				});

				const logBuffer = [];
				let lastLogUpdateTime = Date.now();

				// Capture server logs
				serverProcess.stdout.on("data", (data) => {
					const logLine = data.toString().trim();
					// console.log(`Server Output: ${logLine}`);

					logBuffer.push(logLine);
					if (logBuffer.length > 2) logBuffer.shift(); // Keep last 20 lines

					// Update the interaction at most every 10 seconds
					if (Date.now() - lastLogUpdateTime > 10000) {
						lastLogUpdateTime = Date.now();
						interaction
							.editReply(
								`⚙️ Starting Minecraft server...\n\`\`\`\n${logBuffer.join(
									"\n"
								)}\n\`\`\``
							)
							.catch(console.error);
					}
				});

				serverProcess.stderr.on("data", (data) => {
					console.error(`Server Error: ${data.toString()}`);
				});

				serverProcess.on("close", async (code) => {
					if (code !== 0) {
						console.error(`Server exited with code ${code}`);
						return interaction.editReply(
							"❌ Failed to start the Minecraft server."
						);
					}

					const serverOnline = await confirmServerStatus();
					if (serverOnline) {
						await interaction.followUp(
							"✅ Minecraft server started successfully and is now online!"
						);
					} else {
						await interaction.followUp(
							"⚠️ Minecraft server started but is not responding. Check the server logs."
						);
					}
				});
			});
		} catch (error) {
			console.error(error);
			interaction.editReply(
				"❌ An unexpected error occurred while executing the command."
			);
		}
	},
};

const confirmServerStatus = async () => {
	for (let i = 0; i < 6; i++) {
		// Retry up to 6 times (30 seconds)
		try {
			const response = await axios.get(
				"https://api.mcsrvstat.us/3/147.185.221.21:34650"
			);
			if (response.data.online) {
				return true;
			}
		} catch (err) {
			console.error("Error confirming server status:", err);
		}
		await new Promise((resolve) => setTimeout(resolve, 5000));
	}
	return false;
};
