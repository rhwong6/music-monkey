const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // If the interaction is not a chat command
        if (!interaction.isChatInputCommand()) {
            return;
        }

        // Stores the matching command from the interaction
        const command = interaction.client.commands.get(interaction.commandName);

        // If command is not found, return error
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        // Tries to executes the command or responds with an error
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
}