const dotenv = require('dotenv');
const { Client, Events, GatewayIntentBits } = require('discord.js');

dotenv.config()

const TOKEN = process.env.TOKEN;

// Creates new instance of Client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Logs in console when client is ready
client.once(Events.ClientReady, c => {
    console.log('Music monkey is ready!');
});

// Logs into discord with clients token
client.login(TOKEN);