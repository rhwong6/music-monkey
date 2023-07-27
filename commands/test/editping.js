const { SlashCommandBuilder } = require("discord.js");
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('editping')
		.setDescription('Replies Pong!, then, Pong again! after 2 seconds'),
	category: 'test',
	async execute(interaction) {
		await interaction.reply('Pong!');
		await wait(2000);
		await interaction.editReply('Pong again!');
	},
};