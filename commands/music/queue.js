const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer } = require('discord-player');

module.exports = {
    category: 'music',
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Actions to modify the music queue')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Plays music using a Youtube link, or resumes music that is paused')
                .addStringOption(option => option.setName('link').setDescription('The Youtube link to add to queue')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Removes track from queue'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clears queue')),
    async execute(interaction, queue) {
        if (interaction.options.getSubcommand() === 'add') {
            await interaction.deferReply();

            const link = interaction.options.getString('link');

            const player = useMainPlayer();
            const channel = interaction.member.voice.channel;

            try {
                const { track } = await player.play(channel, link, {
                    nodeOptions: {
                        metadata: interaction
                    }
                });
                
                await interaction.editReply(`Added ${track.title} to queue!`);
            } catch (e) {
                await interaction.editReply(`Something went wrong: ${e}`);
            }
        }
        else if (interaction.options.getSubcommand() === 'remove') {
            await interaction.reply('todo remove track from queue')
        }
        else if (interaction.options.getSubcommand() === 'clear') {
            queue.clear();
            await interaction.reply('Tracks cleared from queue')
        }
    },
};