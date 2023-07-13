const dotenv = require('dotenv');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');

const fs = require('node:fs');
const path = require('node:path')

dotenv.config()

const TOKEN = process.env.TOKEN;

// Creates new instance of Client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Uses a collection to store commands
client.commands = new Collection();

// Stores the path of folders containing commands
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// For each folder, loop through command files, and dynamically sets each command into the client.commands Collection
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Checks if it has data and execute properties, if it does, set a new item in the Collection with the key as the command name and value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}


// Logs in console when client is ready
client.once(Events.ClientReady, c => {
    console.log('Music monkey is ready!');
});

// Listener for interactions
client.on(Events.InteractionCreate, async interaction => {
	// If the interaction is not a chat command
	if (!interaction.isChatInputCommand()) {
		return;
	}

	// Stores the matching command from the interaction
	const command = interaction.client.commands.get(interaction.commandName);
	
	// If command is not found, return error
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	// Tries to executes the command or responds with an error
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});



// Logs into discord with clients token
client.login(TOKEN);