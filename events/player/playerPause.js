const { updateGui } = require('../discord/interactionCreate');

module.exports = {
    name: "playerPause",
    execute() {
        updateGui('music pause', true);
    }
}