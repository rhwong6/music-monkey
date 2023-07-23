const { Events, Collection } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // If the interaction is not a chat command
        if (!interaction.isChatInputCommand()) {
            return;
        }

        // Stores the matching command from the interaction
        const command = interaction.client.commands.get(interaction.commandName);

        // Stores the cooldowns from the interaction
        const { cooldowns } = interaction.client;

        // Checks if the cooldowns Collection has a cooldown for the command, if not, add a new entry, where the value is initialised as an empty Collection
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        // Constants for handling cooldown times
        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = 3;
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;
        
        // If there is a timestamp for the commands cooldown
        if (timestamps.has(interaction.user.id)) {
            // Set a constant that displays the expiration time of the cooldown
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
            
            // If the command is used before the cooldown, send a message informing user
            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
            }
        }

        // Causes the entry for the user under the specified command to be deleted after the commands cooldown time has expired
        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

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