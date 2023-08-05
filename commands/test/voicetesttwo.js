const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { useMainPlayer } = require('discord-player');

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

        const player = useMainPlayer();

        player.events.on('playerStart', (queue, track) => {
            queue.metadata.channel.send(`Started playing **${track.title}**!`);
        });

        try {
            const { track } = await player.play(channel, 'https://www.youtube.com/watch?v=9zEl-FQLI4A&ab_channel=SunRai', {
                nodeOptions: {
                    metadata: interaction
                }
            });
    
            return interaction.followUp(`**${track.title}** enqueued!`);
        } catch (e) {
            return interaction.followUp(`Something went wrong: ${e}`);
        }

	},
};