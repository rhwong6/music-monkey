const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ephping')
		.setDescription('Replies with ephemeral Pong!'),
	category: 'test',
	async execute(interaction) {
		await interaction.reply({ content: 'Pong!', ephemeral: true });
	},
};