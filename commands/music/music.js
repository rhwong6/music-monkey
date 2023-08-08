const { SlashCommandBuilder } = require("discord.js");
const { useQueue, useMainPlayer } = require('discord-player');
const { commandResponse } = require('../../utility/interaction-response');

/*
const testEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('Some title')
    .setURL('https://discord.js.org/')
    .setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
    .setDescription('Some description here')
    .setThumbnail('https://i.imgur.com/AfFp7pu.png')
    .addFields(
        { name: 'Regular field title', value: 'Some value here' },
        { name: '\u200B', value: '\u200B' },
        { name: 'Inline field title', value: 'Some value here', inline: true },
        { name: 'Inline field title', value: 'Some value here', inline: true },
    )
    .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
    .setImage('https://i.imgur.com/AfFp7pu.png')
    .setTimestamp()
    .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
*/

module.exports = {
    category: 'music',
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Plays music')
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Plays music using a Youtube link/song name, or resumes music that is paused')
                .addStringOption(option => option.setName('song').setDescription('The Youtube link/song name to play')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('pause')
                .setDescription('Pauses current song'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('skip')
                .setDescription('Skips current track'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stops playing music')),
    async execute(interaction, queue) {
        await interaction.deferReply();
        if (interaction.options.getSubcommand() === 'play') {
            
            if (interaction.options.getString('link') !== null) {
                const link = interaction.options.getString('link');

                const player = useMainPlayer();
                const channel = interaction.member.voice.channel;

                try {
                    const { track } = await player.play(channel, link, {
                        nodeOptions: {
                            metadata: interaction
                        }
                    });

                    const currQueue = useQueue(interaction.guild.id);
                    if (currQueue.size !== 0) {
                        currQueue.node.move(currQueue.size - 1, 0);
                        queue.node.skip();
                    }


                } catch (e) {
                    await interaction.editReply(`Something went wrong: ${e}`);
                }

            } else {
                queue.node.resume();
                //await interaction.editReply('Resuming song!');
            }
        }
        else if (interaction.options.getSubcommand() === 'pause') {
            queue.node.pause();
            //await interaction.reply('Pauses current song!');
        }
        else if (interaction.options.getSubcommand() === 'skip') {
            queue.node.skip();
            //await interaction.reply('Current song skipped!');
        }
        else if (interaction.options.getSubcommand() === 'stop') {
            queue.delete();
            //await interaction.reply('Stops playing music');
        }
    },
};