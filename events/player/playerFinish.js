const { updateGui } = require('../discord/interactionCreate');

module.exports = {
    name: "playerFinish",
    execute() {
        updateGui('something random', 'play', 'player next track', true);
    }
}