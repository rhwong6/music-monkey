const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Plays music')
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Plays music using a Youtube link, or resumes music that is paused')
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
    async execute(interaction, queue) {
        if (interaction.options.getSubcommand() === 'play') {
            /*
            const link = interaction.options.getString('link');
            await interaction.deferReply()

            const player = useMainPlayer();
            const channel = interaction.member.voice.channel;

            try {
                const { track } = await player.play(channel, link, {
                    nodeOptions: {
                        metadata: interaction
                    }
                });
                
                await interaction.editReply(`Playing ${track.title}`);
            } catch (e) {
                await interaction.editReply(`Something went wrong: ${e}`);
            }
            */

            if (interaction.options.getString('link') !== null) {
                const link = interaction.options.getString('link');
                await interaction.deferReply()

                const player = useMainPlayer();
                const channel = interaction.member.voice.channel;

                try {
                    const { track } = await player.play(channel, link, {
                        nodeOptions: {
                            metadata: interaction
                        }
                    });
                    
                    await interaction.editReply(`Playing ${track.title}`);
                } catch (e) {
                    await interaction.editReply(`Something went wrong: ${e}`);
                }
            } else {
                queue.node.resume();
                await interaction.reply('Resuming song!');
            }
        }
        else if (interaction.options.getSubcommand() === 'pause') {
            queue.node.pause();
            await interaction.reply('Pauses current song!')
        }
        else if (interaction.options.getSubcommand() === 'stop') {
            await interaction.reply('Stops current song!')
        }
    },
};