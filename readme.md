# DIANIYAYA

A feature-rich Discord bot built with [Discord.js](https://discord.js.org) for managing a Minecraft server.

## Features

- Start, stop, and check the status of a Minecraft server.
- Role-based authorization to control command access.
- Detailed status updates via embeds.
- Efficient API integration for real-time server status.

---

## Prerequisites

- Node.js (v16.6.0 or newer)
- NPM or Yarn
- A Discord bot token (get it from [Discord Developer Portal](https://discord.com/developers/applications))
- Minecraft server running on your machine or hosted externally
- The following API endpoint for server status: `https://api.mcsrvstat.us/`

---

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone git@github.com:Luiso9/dianiyaya.git
   cd your-repository
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure the Bot**:
   - Replace `your-bot-token`, `your-client-id`, `your-guild-id`, and `authorized-role-id` with your actual values.

4. **Run the Bot**:
   ```bash
   node bot.js
   ```

---

## Available Commands

| Command       | Description                            |
|---------------|----------------------------------------|
| `/start`      | Starts the Minecraft server.           |
| `/stop`       | Stops the Minecraft server.            |
| `/status`     | Checks the status of the Minecraft server and displays detailed info. |

---

## Project Structure

```
.
├── bot.js           # Main bot script
├── commands/        # Folder containing command definitions
│   ├── start.js     # Start command
│   ├── stop.js      # Stop command
│   ├── status.js    # Status command with API integration
├── .env             # Environment variables (ignored by Git)
├── .gitignore       # Files to ignore in version control
├── package.json     # Project metadata and dependencies
```

---

## Notes

- Ensure the Minecraft server's start and stop scripts are correctly configured in `commands/start.js` and `commands/stop.js`.
- API integration for server status relies on `https://api.mcsrvstat.us/`.
- Only users with the authorized role can execute commands.

---

## Troubleshooting

1. **Bot Fails to Start**:
   - Ensure Node.js and NPM are installed.
   - Check that `.env` contains valid configurations.
   - Verify your bot token and permissions in the Discord Developer Portal.

2. **Commands Not Responding**:
   - Ensure the bot has the `Applications Commands` permission in your server.
   - Verify that the bot is added to the correct guild with `/start`, `/stop`, and `/status` commands registered.

---

## Contribution

Feel free to fork the project and submit pull requests. Suggestions and feedback are welcome!

```

---
