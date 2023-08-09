const { EmbedBuilder } = require("discord.js");
const wait = require('node:timers/promises').setTimeout;
const util = require('util');

const commandResponse = async (interaction, message, thumbnail) => {
    const deleteTime = Date.now() + 5000;
    const expiredTimestamp = Math.round(deleteTime / 1000);

    const testEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(message)
    .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
    .setThumbnail(thumbnail)
    .setDescription(`Message will be deleted <t:${expiredTimestamp}:R>`);

    interaction.editReply( {
        embeds: [testEmbed],
        ephemeral: true
    });

    await wait((expiredTimestamp - (Date.now()/1000)) * 1000);
    interaction.deleteReply();

}

const buttonPressResponse = async (interaction, message, thumbnail) => {
    const deleteTime = Date.now() + 5000;
    const expiredTimestamp = Math.round(deleteTime / 1000);

    const testEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(message)
    .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
    .setThumbnail(thumbnail)
    .setDescription(`Message will be deleted <t:${expiredTimestamp}:R>`);
    
    interaction.editReply( {
        embeds: [testEmbed],
        ephemeral: true
    });

    await wait((expiredTimestamp - (Date.now()/1000)) * 1000);
    interaction.deleteReply();

}

module.exports = {
    commandResponse,
    buttonPressResponse
}