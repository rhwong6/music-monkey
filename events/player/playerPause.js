const { updateGui } = require('../discord/interactionCreate');

module.exports = {
    name: "playerPause",
    execute() {
        updateGui('something random', 'play', 'music pause', true);
    }
}