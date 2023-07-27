const { SlashCommandBuilder } = require("discord.js");
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fetchanddeleteping')
		.setDescription('Replies Pong! after 4 seconds'),
	category: 'test',
	async execute(interaction) {
		await interaction.reply('Pong!');
		const message = await interaction.fetchReply();
		console.log(message);
		await interaction.deleteReply();
	},
};