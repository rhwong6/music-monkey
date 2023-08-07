const { Events, Collection, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { useQueue, useMainPlayer } = require('discord-player');
const { previousButton, playButton, pauseButton, stopButton,
    skipButton, clearButton, volumeDown, volumeUp } = require('../button-gui');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // If the interaction is not a chat command
        if (interaction.isChatInputCommand()) {
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
                if (command.category === "music") {
                    const queue = useQueue(interaction.guild.id);

                    //await interaction.deferReply();

                    await command.execute(interaction, queue);

                    //
                    const currQueue = useQueue(interaction.guild.id);

                    if (currQueue !== null) {

                        var trackNum = 1 + currQueue.size;
                        var trackTitles = currQueue.currentTrack.title;
                        var trackNumText = '1';

                        // Adds track names in queue to trackNames
                        if (trackNum !== 1) {
                            var queueTracks = currQueue.tracks.toArray();

                            for (let i = 0; i < trackNum - 1; i++) {
                                trackTitles += '\n' + queueTracks[i].title;
                                trackNumText += '\n' + (i + 2);
                            }
                        }

                        const trackEmbed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setAuthor({ name: '💿 ' + currQueue.node.createProgressBar() + ' ' , iconURL: interaction.member.displayAvatarURL() })
                            .addFields(
                                { name: '#', value: trackNumText, inline: true },
                                { name: 'Track Name', value: trackTitles, inline: true },
                                { name: 'Added By', value: '@Hodinii', inline: true }
                            )

                        const firstRowPlay = new ActionRowBuilder().addComponents(previousButton, playButton, stopButton, skipButton);
                        const firstRowPause = new ActionRowBuilder().addComponents(previousButton, pauseButton, stopButton, skipButton);
                        const secondRow = new ActionRowBuilder().addComponents(volumeDown, clearButton, volumeUp);

                        const response = await interaction.editReply( {
                            embeds: [trackEmbed],
                            components: [firstRowPause, secondRow]
                        });

                        const collector = response.createMessageComponentCollector();

                        collector.on('collect', async i => {
                            if (i.customId === 'play') {
                                await interaction.editReply({
                                    embeds: [trackEmbed],
                                    components: [firstRowPause, secondRow]
                                });
                                i.reply('PLAYING MUSIC');
                            } else if (i.customId === 'pause') {
                                await interaction.editReply({
                                    embeds: [trackEmbed],
                                    components: [firstRowPlay, secondRow]
                                });
                                i.reply('PAUSING MUSIC');
                            }
                        });

                        const player = useMainPlayer();
                        
                        player.events.on('disconnect', async (queue) => {
                            collector.stop();
                            previousButton.setDisabled(true);
                            pauseButton.setDisabled(true);
                            stopButton.setDisabled(true);
                            skipButton.setDisabled(true);

                            volumeDown.setDisabled(true);
                            clearButton.setDisabled(true);
                            volumeUp.setDisabled(true);

                            const firstRowPlay = new ActionRowBuilder().addComponents(previousButton, pauseButton, stopButton, skipButton);
                            const secondRow = new ActionRowBuilder().addComponents(volumeDown, clearButton, volumeUp);

                            await interaction.editReply({
                                embeds: [trackEmbed],
                                components: [firstRowPlay, secondRow]
                            });
                        });
                    }
                    //

                } else {
                    await command.execute(interaction);
                }
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
}