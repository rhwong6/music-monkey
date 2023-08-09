const { SlashCommandBuilder, ApplicationCommandOptionType } = require("discord.js");
const { useQueue, useMainPlayer, useHistory } = require('discord-player');
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
                .setDescription('Stops playing music'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('volume')
                .setDescription('Sets volume of current player')
                .addNumberOption(option => option.setName('amount').setDescription('Volume amount to set (1-100)').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('back')
                .setDescription('Plays previous song'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Info on current song')),
    async execute(interaction, queue) {
        if (interaction.options.getSubcommand() === 'play') {
            if (interaction.options.getString('song') !== null) {
                const link = interaction.options.getString('song');

                const player = useMainPlayer();
                const channel = interaction.member.voice.channel;

                await interaction.deferReply();

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
                await interaction.deferReply();
            }
        }
        else if (interaction.options.getSubcommand() === 'pause') {
            queue.node.pause();
            await interaction.deferReply();
        }
        else if (interaction.options.getSubcommand() === 'skip') {
            queue.node.skip();
            await interaction.deferReply();
        } 
        else if (interaction.options.getSubcommand() === 'back') {
            const history = useHistory(interaction.guildId);

            if (history.isEmpty()) {
                await interaction.reply('History is empty');
            } else {
                await history.previous();
                await interaction.reply('Playing previous song');
            }
        }
        else if (interaction.options.getSubcommand() === 'stop') {
            queue.delete();
            await interaction.deferReply();
        }
        else if (interaction.options.getSubcommand() === 'volume') {
            var volume = interaction.options.getNumber('amount');

            if (volume > 100) {
                volume = 100;
            } else if (volume < 0) {
                volume = 0;
            }
            
            queue.node.setVolume(volume * 2);
            await interaction.editReply('VOLUME SET TO: ' + volume);
        }
        else if (interaction.options.getSubcommand() === 'info') {
            await interaction.editReply(queue.currentTrack.title);
        }
    },
};