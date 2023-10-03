const { EmbedBuilder } = require("discord.js");
const wait = require('node:timers/promises').setTimeout;

const commandResponse = async (interaction, message, thumbnail) => {

    // Calculates a timestamp for when the message should be deleted
    const deleteTime = Date.now() + 5000;
    const expiredTimestamp = Math.round(deleteTime / 1000);

    // Creates an embed response to command
    const responseEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(message)
    .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
    .setThumbnail(thumbnail)
    .setDescription(`Message will be deleted <t:${expiredTimestamp}:R>`);

    // Edits reply with embed response
    interaction.editReply( {
        embeds: [responseEmbed],
        ephemeral: true
    });

    // Deletes response after 5 seconds
    await wait((expiredTimestamp - (Date.now()/1000)) * 1000);
    interaction.deleteReply();

}

const buttonPressResponse = async (interaction, message, thumbnail) => {

    // Calculates a timestamp for when the message should be deleted
    const deleteTime = Date.now() + 5000;
    const expiredTimestamp = Math.round(deleteTime / 1000);

    // Creates an embed response to command
    const responseEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(message)
    .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
    .setThumbnail(thumbnail)
    .setDescription(`Message will be deleted <t:${expiredTimestamp}:R>`);
    
    // Edits reply with embed response
    interaction.editReply( {
        embeds: [responseEmbed],
        ephemeral: true
    });

    // Deletes response after 5 seconds
    await wait((expiredTimestamp - (Date.now()/1000)) * 1000);
    interaction.deleteReply();

}

const errorResponse = async (interaction, message, thumbnail) => {

    // Calculates a timestamp for when the message should be deleted
    const deleteTime = Date.now() + 5000;
    const expiredTimestamp = Math.round(deleteTime / 1000);

    // Creates an embed response to command
    const responseEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(message)
    .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
    .setThumbnail(thumbnail)
    .setDescription(`Message will be deleted <t:${expiredTimestamp}:R>`);

    // Edits reply with embed response
    interaction.reply( {
        embeds: [responseEmbed],
        ephemeral: true
    });

    // Deletes response after 5 seconds
    await wait((expiredTimestamp - (Date.now()/1000)) * 1000);
    interaction.deleteReply();

}

module.exports = {
    commandResponse,
    buttonPressResponse,
    errorResponse
}