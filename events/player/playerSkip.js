const { updateGui } = require('../discord/interactionCreate');

module.exports = {
    name: "playerSkip",
    execute() {
        updateGui('music skip', true);
    }
}