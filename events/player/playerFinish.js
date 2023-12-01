const { updateGui } = require('../discord/interactionCreate');
const { useQueue } = require('discord-player');
const { getGuildId } = require('../discord/interactionCreate');

module.exports = {
    name: "playerFinish",
    execute() {
        var currQueue = useQueue(getGuildId());

        // If player finish event is run on the last song, updates gui for when player is complete
        if (currQueue.tracks.toArray().length === 0) {
            updateGui('player finish', true, true);
        } else {
            updateGui(null, true, true);
        }
    }
}