const { Events } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log('Music monkey is ready!');
    }
}