const { Events, Collection, ActionRowBuilder, EmbedBuilder, ComponentType, Bold } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { useQueue, useMainPlayer, useHistory } = require('discord-player');
const { previousButton, playButton, pauseButton, stopButton,
    skipButton, clearButton, volumeDown, volumeUp } = require('../../utility/button-gui');
const { commandResponse, buttonPressResponse } = require('../../utility/interaction-response');

var buttonCollector;
var guiMessage;

var currentInteraction;

var guiInit = false;
var previousTitle;
var previousActionFooter;
var previousActionAvatar;

var previousTrackNumText;
var previousTrackTitles;

var addedByArray = [];

var guildId;

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

                    guildId = interaction.guild.id;

                    // Gets the current queue for the music command execution
                    const queue = useQueue(guildId);
                    await command.execute(interaction, queue);

                    // Only runs when there currently is a queue
                    const currQueue = useQueue(interaction.guild.id);
                    if (currQueue !== null) {

                        // If this is the first song played by the player, initialise GUI
                        if (queue === null) {

                            await interaction.editReply('Player started by: ' + interaction.user.globalName);

                            // Enables all buttons and creates GUI
                            previousButton.setDisabled(false);
                            pauseButton.setDisabled(false);
                            stopButton.setDisabled(false);
                            skipButton.setDisabled(false);

                            volumeDown.setDisabled(false);
                            clearButton.setDisabled(false);
                            volumeUp.setDisabled(false);

                            var guiParts = createGui(interaction, currQueue, "music play", true);

                            var trackEmbed = guiParts[0];
                            var firstRowPause = guiParts[2];
                            var secondRow = guiParts[3];

                            guiMessage = await interaction.editReply( {
                                embeds: [trackEmbed],
                                components: [firstRowPause, secondRow]
                            });

                            // Sets button collector for components
                            buttonCollector = guiMessage.createMessageComponentCollector({ componentType: ComponentType.Button });
                        } 
                        else {

                            // Sets the action of a command
                            var action;
                            if (interaction.options.getSubcommand() === 'play' && interaction.options.getString('song') === null) {
                                action = interaction.commandName + ' resume';
                            } else {
                                action = interaction.commandName + ' ' + interaction.options.getSubcommand();
                            }

                            // Updates GUI depending on action
                            updateGui(action, true);

                            // Replies to command appropriately depending on action
                            if (action === 'music play') {
                                commandResponse(interaction, 'Playing ' + currQueue.currentTrack.title, 'https://static.toiimg.com/thumb/resizemode-4,width-1280,height-720,msid-58833617/58833617.jpg');
                            } else if (action === 'music resume') {
                                commandResponse(interaction, 'Music resuming', 'https://cdn.pixabay.com/photo/2018/06/30/09/29/monkey-3507317_1280.jpg');
                            } else if (action === 'music pause') {
                                commandResponse(interaction, 'Music paused', 'https://cdn.openart.ai/stable_diffusion/186063089c7f244b162ad0015b6e54f8ad311548_2000x2000.webp');
                            } else if (action === 'music skip') {
                                commandResponse(interaction, 'Track skipped', 'https://www.rd.com/wp-content/uploads/2020/12/GettyImages-78777891-scaled.jpg');
                            } else if (action === 'queue add') {
                                commandResponse(interaction, 'Added ' + currQueue.tracks.toArray()[currQueue.size - 1].title + ' to queue', 'https://images.news18.com/ibnlive/uploads/2023/01/untitled-design-24-10-16740223394x3.png');
                            } else if (action === 'queue remove') {
                                commandResponse(interaction, 'FEATURE NOT AVAILABLE YET SORRY', null);
                            } else if (action === 'queue clear') {
                                commandResponse(interaction, 'Queue cleared', 'https://live.staticflickr.com/2489/3863612958_b191130bb4_b.jpg');
                            } else if (action === 'music volume') {
                                commandResponse(interaction, 'Volume set to ' + currQueue.node.volume/2, 'https://eventective-media.azureedge.net/389158.jpg');
                            }

                            // Resets button collector for components
                            buttonCollector.stop();
                            buttonCollector = guiMessage.createMessageComponentCollector({ componentType: ComponentType.Button });
                        }

                        // Updates GUI and does action on different button press
                        buttonCollector.on('collect', async i => {
                            if (i.customId === 'play') {
                                currQueue.node.resume();
                                await i.deferReply();
                                //updateGui('music resume', true);
                                buttonPressResponse(i, 'Music resuming', 'https://cdn.pixabay.com/photo/2018/06/30/09/29/monkey-3507317_1280.jpg');
                            } else if (i.customId === 'pause') {
                                currQueue.node.pause();
                                await i.deferReply();
                                //updateGui('music pause', true);
                                buttonPressResponse(i, 'Music paused', 'https://cdn.openart.ai/stable_diffusion/186063089c7f244b162ad0015b6e54f8ad311548_2000x2000.webp');
                            } else if (i.customId === 'stop') {
                                updateGui('music stop', true);
                                await i.deferReply();
                                buttonPressResponse(i, 'Music stopped', 'https://www.carlverstraelen.com/WPAG016/wp-content/uploads/2016/08/carl_verstraelen_nature_wildlife_travel_photography_zambia-12-800x600.jpg');
                                currQueue.node.stop();
                            } else if (i.customId === 'previous') {
                                const history = useHistory(interaction.guildId);
                                if (history.isEmpty()) {
                                    await i.deferReply();
                                    buttonPressResponse(i, 'No previous song', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRY8tb0MddJY1oi1MZwOcmo_mzxtcgQPwL5aQ&usqp=CAU');
                                } else {
                                    await history.previous();
                                    await i.deferReply();
                                    updateGui('music back', true);
                                    buttonPressResponse(i, 'Playing previous track: ' + history.currentTrack.title, null);
                                }
                            } else if (i.customId === 'skip') {
                                if (currQueue.size === 0) {
                                    updateGui('music stop', true);
                                    await i.deferReply();
                                    currQueue.node.stop();
                                    buttonPressResponse(i, 'Track skipped', 'https://www.rd.com/wp-content/uploads/2020/12/GettyImages-78777891-scaled.jpg');
                                } else {
                                    currQueue.node.skip()
                                    currQueue.node.resume();
                                    await i.deferReply();
                                    updateGui('music skip', true , true);
                                    buttonPressResponse(i, 'Track skipped', 'https://www.rd.com/wp-content/uploads/2020/12/GettyImages-78777891-scaled.jpg');
                                }

                            } else if (i.customId === 'clear') {
                                currQueue.clear();
                                await i.deferReply();
                                updateGui('queue clear', true);
                                buttonPressResponse(i, 'Queue cleared', 'https://live.staticflickr.co/3863612958_b191130bb4_b.');
                            } else if (i.customId === 'volumeDown') {
                                currQueue.node.setVolume(currQueue.node.volume - 20);
                                await i.deferReply();
                                updateGui('volume down', true);
                                buttonPressResponse(i, 'Volume down to: ' + (currQueue.node.volume/2), 'https://static.angloinfo.com/blogs/files/sites/149/zich-een-aap-lachen.jpg');
                            } else if (i.customId === 'volumeUp') {
                                currQueue.node.setVolume(currQueue.node.volume + 20);
                                await i.deferReply();
                                updateGui('volume up', true);
                                buttonPressResponse(i, 'Volume up to: ' + (currQueue.node.volume/2), 'https://i.ytimg.com/vi/gvj5dmlc20I/hqdefault.jpg');
                            }
                        });
                    }

                } else {
                    // Else if not music command (no non music command yet)
                    await command.execute(interaction);
                }

            } catch (error) {
                // Catches error and displays in console and as reply (to help debug)
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
    playerDisconnect,
    getGuildId
}

function createGui(interaction, currQueue, action, buttonEnabled, forcePlayButton) {

    const history = useHistory(interaction.guildId);

    var trackNum = currQueue.size + history.size;
    var trackNumText;

    var historyTracks = history.tracks.toArray();
    var queueTracks = currQueue.tracks.toArray();

    var trackTitles = '';
    var addedByText = '';

    // If the player is stopped or finished, display tracks that were played and disables all buttons
    if (action === 'music stop' || (action === 'player finish' && currQueue.isEmpty())) {
        trackNumText = previousTrackNumText;
        trackTitles = previousTrackTitles;

        previousButton.setDisabled(true);
        pauseButton.setDisabled(true);
        stopButton.setDisabled(true);
        skipButton.setDisabled(true);

        volumeDown.setDisabled(true);
        clearButton.setDisabled(true);
        volumeUp.setDisabled(true);
    } else {
        //Creates the track number text including tracks from the history and current queue
        if (history.isEmpty()) {
            trackNumText = '**1** ➤';
        } else {
            trackNumText = '1';
        }
        
        for (let i = 1; i < trackNum + 1; i++) {
            if (i === history.size) {
                trackNumText += `\n**${(i + 1)}** ➤`;
            } else {
                trackNumText += '\n' + (i + 1);
            }
        }
        
        // Adds track titled depending on if there is tracks in the history or  current queue
        if (history.isEmpty()) {
            trackTitles = `\n**${currQueue.currentTrack.title}**`;
    
            for (let i = 0; i < currQueue.size; i++) {
                trackTitles += '\n' + queueTracks[i].title;
            }
        } else if (!history.isEmpty() && !currQueue.isEmpty()) {
            for (let i = history.size - 1; i >= 0; i--) {
                trackTitles += '\n' + historyTracks[i].title;
            }
    
            trackTitles += `\n**${currQueue.currentTrack.title}**`;
    
            for (let i = 0; i < currQueue.size; i++) {
                trackTitles += '\n' + queueTracks[i].title;
            }
        } else if (!history.isEmpty() && currQueue.isEmpty()) {
            for (let i = history.size - 1; i >= 0; i--) {
                trackTitles += '\n' + historyTracks[i].title;
            }
    
            trackTitles += `\n**${currQueue.currentTrack.title}**`;
        }

        previousTrackNumText = trackNumText;
        previousTrackTitles = trackTitles;
    }

    // Updates the array storing who added which track
    if (action === 'music play' && !guiInit) {
        addedByArray.push(`<@${interaction.user.id}>`);
    } else if (action === 'music play' && guiInit) {
        for (let i = addedByArray.length - 1; i > history.size; i--) {
            addedByArray[i + 1] = addedByArray[i];
        }
        addedByArray[history.size + 1] = `<@${interaction.user.id}>`;
    } else if (action === 'queue add') {
        addedByArray.push(`<@${interaction.user.id}>`);
    } else if (action === 'queue clear') {
        var newArray = [];
        for (let i = 0; i < history.size + 1; i++) {
            newArray.push(addedByArray[i]);
        }
        addedByArray = newArray;
    }

    // Formats the added by array into text
    for (let i = 0; i < addedByArray.length; i++) {
        addedByText += '\n' + addedByArray[i]
    }

    // Stores what the title of the GUI should say depending on the action
    var title;
    if (action === 'player start') {
        title = 'Playing: ' + currQueue.currentTrack.title;
    } else if (action === 'player finish') {
        if (currQueue.tracks.toArray().length === 0) {
            title = 'Player finished'
        } else {
            title = previousTitle;
        }
    } else if (currQueue.node.isPlaying() || forcePlayButton) {
        title = ' Playing: ' + currQueue.currentTrack.title + ' ';
    } else if (!currQueue.node.isPlaying()) {
        title = ' Paused: ' + currQueue.currentTrack.title + ' ';
    }

    previousTitle = title;

    // Centres the title by adding '-' characters (not currently perfect)
    var spacing = '';
    var totalCharacters = 0;

    if (title.length < 20) {
        totalCharacters = 38;
    } else if (title.length < 35) {
        totalCharacters = 48;
    } else {
        totalCharacters = 58;
    }

    for (let i = 0; i < (totalCharacters - title.length); i++) {
        spacing += '-';
    }

    // Stores what the footer should say depending on action
    if (action !== null) {
        previousActionAvatar = interaction.member.displayAvatarURL();
        if (action === 'music play' && !guiInit) {
            previousActionFooter = 'Started the player';
        } else if (action === 'music play' && guiInit) {
            previousActionFooter = 'Played: ' + currQueue.currentTrack.title;
        }else if (action === 'music resume') {
            previousActionFooter = 'Resumed the player';
        } else if (action === 'music pause') {
            previousActionFooter = 'Paused the player'
        } else if (action === 'music skip') {
            previousActionFooter = 'Skipped: ' + useHistory(interaction.guildId).tracks.toArray()[0].title;
        } else if (action === 'music back') {
            previousActionFooter = 'Replayed: ' + currQueue.currentTrack.title;
        }
        else if (action === 'music stop') {
            previousActionFooter = 'Stopped the player';
        } else if (action === 'queue add') {
            previousActionFooter = 'Added: ' + currQueue.tracks.toArray()[currQueue.size - 1].title + ' to the queue';
        } else if (action === 'queue remove') {
            //title = ' ' + interaction.user.globalName + ' removed - ' + 'INSERT REMOVED SONG HERE' + ' ';
        } else if (action === 'queue clear') {
            previousActionFooter = 'Cleared the queue';
        } else if (action === 'music volume') {
            previousActionFooter = 'Set the volume to ' + (currQueue.node.volume/2);
        } else if (action === 'volume down') {
            previousActionFooter = 'Lowered the volume to ' + (currQueue.node.volume/2);
        } else if (action === 'volume up') {
            previousActionFooter = 'Increased the volume to ' + (currQueue.node.volume/2);
        }
        guiInit = true;
    }

    // Creates an embed containing title, track numbers, track names, footer etc.
    const trackEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setAuthor({ name: spacing + title + spacing + '\n💿 ' + currQueue.node.createProgressBar() })
    .addFields(
        { name: '#', value: trackNumText, inline: true },
        { name: 'Track Name', value: trackTitles, inline: true },
        { name: 'Added By', value: addedByText, inline: true }
    )
    .setFooter({ text: previousActionFooter, iconURL: previousActionAvatar });

    // Includes user buttons
    const firstRowPlay = new ActionRowBuilder().addComponents(previousButton, playButton, stopButton, skipButton);
    const firstRowPause = new ActionRowBuilder().addComponents(previousButton, pauseButton, stopButton, skipButton);
    const secondRow = new ActionRowBuilder().addComponents(volumeDown, clearButton, volumeUp);

    // Returns final GUI
    return [trackEmbed, firstRowPlay, firstRowPause, secondRow];
}

function updateGui(action, buttonEnabled, forcePlayButton) {
    
    // If the gui has been initialised already, then it will update it
    if (guiInit) {

        // Stores return from createGui 
        const currQueue = useQueue(currentInteraction.guild.id);
        var guiParts = createGui(currentInteraction, currQueue, action, buttonEnabled, forcePlayButton);

        var trackEmbed = guiParts[0];
        var firstRowPlay = guiParts[1];
        var firstRowPause = guiParts[2];
        var secondRow = guiParts[3];

        var firstRow;
        var secondRow = new ActionRowBuilder().addComponents(volumeDown, clearButton, volumeUp);

        // If a song is currently playing, pause button will be used for GUI, otherwise play button will beused
        if (currQueue.node.isPlaying() || forcePlayButton) {
            firstRow = firstRowPause;
        } else {
            firstRow = firstRowPlay;
        }

        // Updates GUI
        guiMessage.edit( {
            embeds: [trackEmbed],
            components: [firstRow, secondRow]
        });
    }
}

function playerDisconnect() {
    // When player disconnects, stops button collector and resets variables
    buttonCollector.stop();
    guiInit = false;
    addedByArray = [];
}

function getGuildId() {
    return guildId;
}