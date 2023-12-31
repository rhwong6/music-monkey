const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer, useQueue } = require('discord-player');
const { errorResponse } = require('../../utility/interaction-response');

module.exports = {
    category: 'music',
    // Uses slash command builder to set command name, description and options
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
                .setDescription('Clears queue'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('insert')
                .setDescription('Clears queue')
                .addNumberOption(option => option.setName('position').setDescription('The position in the queue to insert').setRequired(true))
                .addStringOption(option => option.setName('link').setDescription('The Youtube link to add to queue').setRequired(true))),
    async execute(interaction, queue) {

        // Checks if user is currently in a voice channel, if not will send a reply informing them that they need to be in order to run music commands
        if (interaction.member.voice.channel !== null) {
            if (interaction.options.getSubcommand() === 'add') {

                // Adds song to the queue (or plays song if no songs currently in queue) NEED TO MAKE SURE A STRING IS PRESENT IN OPTIONS
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
                } catch (e) {
                    await interaction.editReply(`Something went wrong: ${e}`);
                }
            }
            else if (interaction.options.getSubcommand() === 'remove') {
                await interaction.reply('FEATURE NOT IMPLEMENTED YET SORRY')
            }
            else if (interaction.options.getSubcommand() === 'clear') {
                queue.clear();
                await interaction.reply('Tracks cleared from queue')
            } else if (interaction.options.getSubcommand() === 'insert') {
                //TODO CHECK IF THERE IS A CURRENT QUEUE FIRST

                // Inserts a track into a position in the queue
                await interaction.deferReply();

                const position = interaction.options.getNumber('position');
                const link = interaction.options.getString('link');

                /*
                console.log(`Inserting: ${link} at position ${position}`);
                await interaction.editReply(`Inserting: ${link} at position ${position}`);
                */

                const player = useMainPlayer();
                search = await player.search(link);

                // CURRENTLY ONLY INSERTS THE FIRST TRACK (NEED TO MAKE IT WORK FOR PLAYLISTS TOO WITH FOR LOOP)
                track = search.tracks[0];

                const currQueue = useQueue(interaction.guild.id);
                currQueue.insertTrack(track, position);

                await interaction.editReply('test');
            }
        } else {
            await errorResponse(interaction, 'You must be in a channel to run music commands', 'https://external-preview.redd.it/Mf0VbcxbAKQWcOgwGyFGVOWf6ecES43hZum1zRLMdw4.jpg?width=640&crop=smart&auto=webp&s=fd486c949b72c1d568044907c6fb3b52571282ab');
        }
    },
};