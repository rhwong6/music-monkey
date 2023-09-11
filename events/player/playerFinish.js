const { updateGui } = require('../discord/interactionCreate');
const { useQueue } = require('discord-player');
const { getGuildId } = require('../discord/interactionCreate');

module.exports = {
    name: "playerFinish",
    execute() {
        var currQueue = useQueue(getGuildId());

        console.log("TEST");
        //console.log(currQueue);

        if (currQueue.tracks.toArray().length === 0) {
            console.log("PLAYERFINISH EVENT")
            updateGui('player finish', true, true);
        }
    }
}