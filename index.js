const dotenv = require('dotenv');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');

const { Player } = require('discord-player');

dotenv.config();

const TOKEN = process.env.TOKEN;

// Creates new instance of Client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

// Uses a collection to store commands
client.commands = new Collection();

// Uses a collection to store cooldowns
client.cooldowns = new Collection();

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

// Stores the path of files containing events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

// For each event file, load each event
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Create new Player
const player = new Player(client);

// Loads all extractor from @discord-player/extractor package
player.extractors.loadDefault();

// Logs into discord with clients token
client.login(TOKEN);