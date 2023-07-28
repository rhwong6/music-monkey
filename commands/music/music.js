const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Plays music')
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Plays music'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('pause')
                .setDescription('Pauses current song'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stops playing current song')),
    category: 'music',
    async execute(interaction) {
        await interaction.reply('Plays music!');
    },
};