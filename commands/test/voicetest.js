const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { joinVoiceChannel, AudioPlayer, VoiceConnectionStatus, NoSubscriberBehavior, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const wait = require('node:timers/promises').setTimeout;
const fs = require('node:fs');
const path = require('node:path')

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

        const audioPlayer = new AudioPlayer({
            behaviors: {
                noSubscribers: NoSubscriberBehavior.Pause,
            },
        });

        /*
        const foldersPath = path.join(__dirname, 'resources');
        console.log(foldersPath);
        */

        const audioPath = 'C:\\Users\\Raymond\\Desktop\\Discord bots\\music-monkey\\resources\\monkey-bomb-song.mp3';
        
        const audioResource = createAudioResource(audioPath);
        audioPlayer.play(audioResource);
        
        /*
        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('Voice connection ready');
        });
        */

        audioPlayer.on(AudioPlayerStatus.Playing, () => {
            console.log('Audio player is playing music');
        });

        audioPlayer.on('error', error => {
            console.log('Error: ' + error.message);
        });

        await interaction.reply('Joining channel: ' + channel.name);

        connection.subscribe(audioPlayer);

        /*
        await wait(2000);
        connection.destroy();
        await interaction.followUp('Disconnecting connection');
        */

        //audioPlayer.stop();
	},
};