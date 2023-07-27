const { SlashCommandBuilder } = require("discord.js");
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deferping')
		.setDescription('Replies Pong! after 4 seconds'),
	category: 'test',
	async execute(interaction) {
		await interaction.deferReply()
		await wait(4000);
		await interaction.editReply('Pong!');
	},
};