const { ButtonBuilder, ButtonStyle } = require("discord.js");

const previousButton = new ButtonBuilder()
    .setCustomId('previous')
    .setLabel('Previous')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji({ name: '⏮️' });
        

const playButton = new ButtonBuilder()
    .setCustomId('play')
    .setLabel('Play')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji({ name: '▶️' });

const pauseButton = new ButtonBuilder()
    .setCustomId('pause')
    .setLabel('Pause')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji({ name: '⏸️' });

const stopButton = new ButtonBuilder()
    .setCustomId('stop')
    .setLabel('Stop')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji({ name: '⏹️' });
    
const skipButton = new ButtonBuilder()
    .setCustomId('skip')
    .setLabel('Skip')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji({ name: '⏩' });

const clearButton = new ButtonBuilder()
    .setCustomId('clear')
    .setLabel('Clear Queue')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji({ name: '🗑️' });

const volumeDown = new ButtonBuilder()
    .setCustomId('volumeDown')
    .setLabel('Vol down')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji({ name: '🔉' });
    
const volumeUp = new ButtonBuilder()
    .setCustomId('volumeUp')
    .setLabel('Vol up')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji({ name: '🔊' });

module.exports = {
    previousButton,
    playButton,
    pauseButton,
    stopButton,
    skipButton,
    clearButton,
    volumeDown,
    volumeUp
}