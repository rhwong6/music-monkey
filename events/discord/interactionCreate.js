const { Events, Collection, ActionRowBuilder, EmbedBuilder, ComponentType, InteractionCollector } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { useQueue, useMainPlayer, useHistory } = require('discord-player');
const { previousButton, playButton, pauseButton, stopButton,
    skipButton, clearButton, volumeDown, volumeUp } = require('../../utility/button-gui');
const { commandResponse, buttonPressResponse } = require('../../utility/interaction-response');

var buttonCollector;
var guiMessage;

var currentInteraction;

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // If the interaction is not a chat command
        if (interaction.isChatInputCommand()) {
            currentInteraction = interaction;

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
                    interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
                    await wait((expiredTimestamp - (Date.now()/1000)) * 1000);
                    interaction.deleteReply();
                    return;
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
                    await command.execute(interaction, queue);

                    if (interaction.commandName === 'music' && interaction.options.getSubcommand() === 'stop') {
                        commandResponse(interaction, 'Music stopped', 'https://pbs.twimg.com/media/CqZvlC4WIAAbgQp.jpg');
                    }

                    //
                    const currQueue = useQueue(interaction.guild.id);
                    
                    if (currQueue !== null) {

                        if (queue === null) {
                            var guiParts = createGui(interaction, currQueue, "music play", true);

                            var trackEmbed = guiParts[0];
                            var firstRowPause = guiParts[2];
                            var secondRow = guiParts[3];

                            guiMessage = await interaction.editReply( {
                                embeds: [trackEmbed],
                                components: [firstRowPause, secondRow]
                            });

                            buttonCollector = guiMessage.createMessageComponentCollector({ componentType: ComponentType.Button });
                        } 
                        else {
                            var action;

                            if (interaction.options.getSubcommand() === 'play') {
                                action = interaction.commandName + ' resume';
                            } else {
                                action = interaction.commandName + ' ' + interaction.options.getSubcommand();
                            }

                            updateGui(interaction, "pause", action, true);

                            if (action === 'music resume') {
                                commandResponse(interaction, 'Music resuming', 'https://cdn.pixabay.com/photo/2018/06/30/09/29/monkey-3507317_1280.jpg');
                            } else if (action === 'music pause') {
                                commandResponse(interaction, 'Music paused', 'https://cdn.openart.ai/stable_diffusion/186063089c7f244b162ad0015b6e54f8ad311548_2000x2000.webp');
                            } else if (action === 'music skip') {
                                commandResponse(interaction, 'Track skipped', 'https://www.rd.com/wp-content/uploads/2020/12/GettyImages-78777891-scaled.jpg');
                            } else if (action === 'music stop') {
                                commandResponse(interaction, 'Music stopped', 'https://pbs.twimg.com/media/CqZvlC4WIAAbgQp.jpg');
                            } else if (action === 'queue add') {
                                commandResponse(interaction, 'Added ' + currQueue.tracks.toArray()[currQueue.size - 1].title + ' to queue', 'https://images.news18.com/ibnlive/uploads/2023/01/untitled-design-24-10-16740223394x3.png');
                            } else if (action === 'queue remove') {
                                commandResponse(interaction, 'TODO', null);
                            } else if (action === 'queue clear') {
                                commandResponse(interaction, 'Queue cleared', 'https://live.staticflickr.com/2489/3863612958_b191130bb4_b.jpg');
                            } else if (action === 'music volume') {
                                commandResponse(interaction, 'Volume set to ' + currQueue.node.volume/2, null);
                            }

                            buttonCollector.stop();
                            buttonCollector = guiMessage.createMessageComponentCollector({ componentType: ComponentType.Button });
                        }

                        buttonCollector.on('collect', async i => {
                            if (i.customId === 'play') {
                                currQueue.node.resume();
                                await i.deferReply();
                                //updateGui(i, "pause", 'music resume', true);
                                buttonPressResponse(i, 'Music resuming', 'https://cdn.pixabay.com/photo/2018/06/30/09/29/monkey-3507317_1280.jpg');
                            } else if (i.customId === 'pause') {
                                currQueue.node.pause();
                                await i.deferReply();
                                //updateGui(i, "play", 'music pause', true);
                                buttonPressResponse(i, 'Music paused', 'https://cdn.openart.ai/stable_diffusion/186063089c7f244b162ad0015b6e54f8ad311548_2000x2000.webp');
                            } else if (i.customId === 'stop') {
                                currQueue.node.stop();
                                await i.deferReply();
                                updateGui(i, "play", 'music stop', true);
                                buttonPressResponse(i, 'Music stopped', 'https://pbs.twimg.com/media/CqZvlC4WIAAbgQp.jpg');
                            } else if (i.customId === 'previous') {
                                const history = useHistory(interaction.guildId);
                                if (history.isEmpty()) {
                                    await i.deferReply();
                                    buttonPressResponse(i, 'No previous song', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRY8tb0MddJY1oi1MZwOcmo_mzxtcgQPwL5aQ&usqp=CAU');
                                } else {
                                    history.previous();
                                    await i.deferReply();
                                    updateGui(i, "play", 'music back', true);
                                    buttonPressResponse(i, 'Playing previous track: ' + history.currentTrack.title, null);
                                }
                            } else if (i.customId === 'skip') {
                                currQueue.node.skip();
                                await i.deferReply();
                                //updateGui(i, "play", 'music skip', true);
                                buttonPressResponse(i, 'Track skipped', 'https://www.rd.com/wp-content/uploads/2020/12/GettyImages-78777891-scaled.jpg');
                            } else if (i.customId === 'clear') {
                                currQueue.node.clear();
                                await i.deferReply();
                                updateGui(i, "play", 'queue clear', true);
                                buttonPressResponse(i, 'Queue cleared', 'https://live.staticflickr.co/3863612958_b191130bb4_b.');
                            } else if (i.customId === 'volumeDown') {
                                currQueue.node.setVolume(currQueue.node.volume - 20);
                                await i.deferReply();
                                updateGui(i, "play", 'volume down', true);
                                buttonPressResponse(i, 'Volume down to: ' + (currQueue.node.volume/2), 'https://static.angloinfo.com/blogs/files/sites/149/zich-een-aap-lachen.jpg');
                            } else if (i.customId === 'volumeUp') {
                                currQueue.node.setVolume(currQueue.node.volume + 20);
                                await i.deferReply();
                                updateGui(i, "play", 'volume up', true);
                                buttonPressResponse(i, 'Volume up to: ' + (currQueue.node.volume/2), 'https://i.ytimg.com/vi/gvj5dmlc20I/hqdefault.jpg');
                            }
                        });

                        const player = useMainPlayer();


                        player.events.on('playerSkip', async () => {
                            console.log('SKIP EVENT HAS ACTIVATED');
                        });

                        /*
                        player.events.on('disconnect', async () => {
                            previousButton.setDisabled(true);
                            pauseButton.setDisabled(true);
                            stopButton.setDisabled(true);
                            skipButton.setDisabled(true);

                            volumeDown.setDisabled(true);
                            clearButton.setDisabled(true);
                            volumeUp.setDisabled(true);

                            buttonCollector.stop();

                            const firstRowPlay = new ActionRowBuilder().addComponents(previousButton, pauseButton, stopButton, skipButton);
                            const secondRow = new ActionRowBuilder().addComponents(volumeDown, clearButton, volumeUp);

                            await guiMessage.edit({
                                components: [firstRowPlay, secondRow]
                            });
                        });
                        */

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
    },
    updateGui,
    currentInteraction
}

function createGui(interaction, currQueue, action, buttonEnabled) {
    var trackNum = 1 + currQueue.size;
    var trackTitles = currQueue.currentTrack.title;
    var trackNumText = '1';
    var addedByText = `<@${interaction.user.id}>`;

    // Adds track names in queue to trackNames
    if (trackNum !== 1) {
        var queueTracks = currQueue.tracks.toArray();

        for (let i = 0; i < trackNum - 1; i++) {
            trackTitles += '\n' + queueTracks[i].title;
            trackNumText += '\n' + (i + 2);
            addedByText += `\n<@${interaction.user.id}>`
        }
    }

    var title;

    if (action === 'music play') {
        title = ' ' + interaction.user.globalName + ' played - ' + currQueue.currentTrack.title + ' ';
    } else if (action === 'music resume') {
        title = ' ' + interaction.user.globalName + ' resumed - ' + currQueue.currentTrack.title + ' ';
    } else if (action === 'music pause') {
        title = ' ' + interaction.user.globalName + ' paused - ' + currQueue.currentTrack.title + ' ';
    } else if (action === 'music skip') {
        title = ' ' + interaction.user.globalName + ' skipped - ' + useHistory(interaction.guildId).currentTrack.title + ' ';
    } else if (action === 'music back') {
        title = ' ' + interaction.user.globalName + ' replaying - ' + currQueue.currentTrack.title + ' ';
    }
    else if (action === 'music stop') {
        title = ' ' + interaction.user.globalName + ' stopped the player' + ' ';
    } else if (action === 'queue add') {
        title = ' ' + interaction.user.globalName + ' added - ' + currQueue.tracks.toArray()[currQueue.size - 1].title + ' to the queue ';
    } else if (action === 'queue remove') {
        title = ' ' + interaction.user.globalName + ' added - ' + 'INSERT REMOVED SONG HERE' + ' ';
    } else if (action === 'queue clear') {
        title = ' ' + interaction.user.globalName + ' cleared the queue ';
    } else if (action === 'music volume') {
        title = ' ' + interaction.user.globalName + ' set the volume to ' + (currQueue.node.volume/2);
    } else if (action === 'volume down') {
        title = ' ' + interaction.user.globalName + ' lowered the volume to ' + (currQueue.node.volume/2);
    } else if (action === 'volume up') {
        title = ' ' + interaction.user.globalName + ' increased the volume to ' + (currQueue.node.volume/2);
    } else if (action === 'player next track') {
        if (currQueue.size < 1) {
            title = ' Player finished ';
        } else {
            title = ' Now playing - ' + currQueue.currentTrack.title + ' ';
        }
    }

    var spacing = '';
    for (let i = 0; i < (43 - title.length); i++) {
        spacing += '-';
    }

    const trackEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setAuthor({ name: spacing + title + spacing + '\n💿 ' + currQueue.node.createProgressBar() , iconURL: interaction.member.displayAvatarURL() })
        .addFields(
            { name: '#', value: trackNumText, inline: true },
            { name: 'Track Name', value: trackTitles, inline: true },
            { name: 'Added By', value: addedByText, inline: true }
        )

    if (buttonEnabled) {
        previousButton.setDisabled(false);
        pauseButton.setDisabled(false);
        stopButton.setDisabled(false);
        skipButton.setDisabled(false);

        volumeDown.setDisabled(false);
        clearButton.setDisabled(false);
        volumeUp.setDisabled(false);
    } else {
        previousButton.setDisabled(true);
        pauseButton.setDisabled(true);
        stopButton.setDisabled(true);
        skipButton.setDisabled(true);

        volumeDown.setDisabled(true);
        clearButton.setDisabled(true);
        volumeUp.setDisabled(true);
    }

    const firstRowPlay = new ActionRowBuilder().addComponents(previousButton, playButton, stopButton, skipButton);
    const firstRowPause = new ActionRowBuilder().addComponents(previousButton, pauseButton, stopButton, skipButton);
    const secondRow = new ActionRowBuilder().addComponents(volumeDown, clearButton, volumeUp);

    return [trackEmbed, firstRowPlay, firstRowPause, secondRow];
}

function updateGui(interaction, mainButton, action, buttonEnabled) {
    const currQueue = useQueue(currentInteraction.guild.id);
    var guiParts = createGui(currentInteraction, currQueue, action, buttonEnabled);

    var trackEmbed = guiParts[0];
    var firstRowPlay = guiParts[1];
    var firstRowPause = guiParts[2];
    var secondRow = guiParts[3];

    var firstRow;
    var secondRow = new ActionRowBuilder().addComponents(volumeDown, clearButton, volumeUp);
    
    if (mainButton === 'pause') {
        firstRow = firstRowPause;
    } else {
        firstRow = firstRowPlay;
    }

    guiMessage.edit( {
        embeds: [trackEmbed],
        components: [firstRow, secondRow]
    });
}