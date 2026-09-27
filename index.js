require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes,
    ActivityType
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ==============================
// CLIENT
// ==============================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// ==============================
// COMMAND COLLECTION
// ==============================

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");

if (!fs.existsSync(commandsPath)) {
    fs.mkdirSync(commandsPath);
}

const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith(".js"));

const commands = [];

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (!command.data || !command.execute) {
        console.log(` Skipping ${file} - invalid command file.`);
        continue;
    }

    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());

    console.log(`Loaded command: /${command.data.name}`);
}

// ==============================
// READY
// ==============================

client.once("ready", async () => {
    console.log("");
    console.log("================================");
    console.log(`Bot ONLINE`);
    console.log(`Logged in as: ${client.user.tag}`);
    console.log(`Servers: ${client.guilds.cache.size}`);
    console.log("================================");
    console.log("");

    client.user.setActivity("/ping | 67", {
        type: ActivityType.Watching
    });

    // ==============================
    // REGISTER SLASH COMMANDS
    // ==============================

    const rest = new REST({ version: "10" })
        .setToken(process.env.TOKEN);

    try {
        console.log("Registering slash commands...");

        await rest.put(
            Routes.applicationCommands(client.user.id),
            {
                body: commands
            }
        );

        console.log(
            `Successfully registered ${commands.length} slash command(s).`
        );
    } catch (error) {
        console.error("Failed to register slash commands:", error);
    }
});

// ==============================
// INTERACTIONS
// ==============================

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        return interaction.reply({
            content: "This command does not exist.",
            ephemeral: true
        });
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: "Something went wrong while running this command.",
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: "Something went wrong while running this command.",
                ephemeral: true
            });
        }
    }
});

// ==============================
// LOGIN
// ==============================

if (!process.env.TOKEN) {
    console.error("ERROR: TOKEN is missing from your .env file.");
    process.exit(1);
}

client.login(process.env.TOKEN);
