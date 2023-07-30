const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { joinVoiceChannel } = require('@discordjs/voice');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    category: 'test',
	data: new SlashCommandBuilder()
		.setName('voicetest')
		.setDescription('Joins specified voice channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel the bot joins')
                .addChannelTypes(ChannelType.GuildVoice)),
	async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        /*
        console.log('channelID: ' + channel.id);
        console.log('guildID: ' + channel.guild.id);
        console.log('adapterCreator: ' + channel.guild.voiceAdapterCreator);
        */

        await interaction.reply('Joining channel: ' + channel.name);

        await wait(2000);
        
        connection.destroy();
        await interaction.followUp('Disconnecting connection');
	},
};