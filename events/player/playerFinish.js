const { updateGui } = require('../discord/interactionCreate');

module.exports = {
    name: "playerFinish",
    execute() {
        updateGui('player finish', true, true);
    }
}