const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction } = require("discord.js");

module.exports = {
    category: 'guitest',
    cooldown: 0.5,
    data: new SlashCommandBuilder()
        .setName('guitest')
        .setDescription('Test command for action rows'),
    async execute(interaction) {
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

        const firstRowPlay = new ActionRowBuilder().addComponents(previousButton, playButton, stopButton, skipButton);
        const firstRowPause = new ActionRowBuilder().addComponents(previousButton, pauseButton, stopButton, skipButton);

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

        const secondRow = new ActionRowBuilder().addComponents(volumeDown, clearButton, volumeUp);

        /*
        await interaction.editReply({ 
            content: 'QUEUE HERE',
            components: [firstRow, secondRow]
        });
        */

        const response = await interaction.reply( {
            content: 'QUEUE HERE',
            components: [firstRowPlay, secondRow]
        });

        const collector = response.createMessageComponentCollector();

        collector.on('collect', async i => {
            if (i.customId === 'play') {
                await interaction.editReply({
                    content: 'QUEUE HERE',
                    components: [firstRowPause, secondRow]
                });
                i.reply('PLAYING MUSIC');
            } else if (i.customId === 'pause') {
                await interaction.editReply({
                    content: 'QUEUE HERE',
                    components: [firstRowPlay, secondRow]
                });
                i.reply('PAUSING MUSIC');
            }
        });
    },
};