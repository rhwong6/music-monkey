const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { Player } = require('discord-player');

module.exports = {
    category: 'test',
	data: new SlashCommandBuilder()
		.setName('voicetesttwo')
		.setDescription('Joins specified voice channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel the bot joins')
                .addChannelTypes(ChannelType.GuildVoice)),
	async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        //const channel = interaction.member.voice.channel;
        await interaction.reply('Joining channel: ' + channel.name);

        const player = new Player(interaction.client);
        await player.extractors.loadDefault();

        player.events.on('playerStart', (queue, track) => {
            queue.metadata.channel.send(`Started playing **${track.title}**!`);
        });

        try {
            const { track } = await player.play(channel, 'https://www.youtube.com/watch?v=5syUvHEQcv8&list=RD_sOKkON_UnQ&index=3&ab_channel=Yasuha-Topic', {
                nodeOptions: {
                    // nodeOptions are the options for guild node (aka your queue in simple word)
                    metadata: interaction // we can access this metadata object using queue.metadata later on
                }
            });
    
            return interaction.followUp(`**${track.title}** enqueued!`);
        } catch (e) {
            // let's return error if something failed
            return interaction.followUp(`Something went wrong: ${e}`);
        }

	},
};