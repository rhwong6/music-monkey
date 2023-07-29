const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Plays music')
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Plays music')
                .addStringOption(option => option.setName('link').setDescription('The Youtube link to play')))
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
        if (interaction.options.getSubcommand() === 'play') {
            const link = interaction.options.getString('link');
            await interaction.reply('Plays ' + link);
        }
        else if (interaction.options.getSubcommand() === 'pause') {
            await interaction.reply('Pauses current song!')
        }
        else if (interaction.options.getSubcommand() === 'stop') {
            await interaction.reply('Stops current song!')
        }
    },
};