const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('followupping')
		.setDescription('Replies with ephemeral Pong!'),
	category: 'test',
	async execute(interaction) {
		await interaction.reply('Pong!');
		await interaction.followUp('Pong again!');
	},
};