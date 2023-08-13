const { updateGui } = require('../discord/interactionCreate');

module.exports = {
    name: "playerStart",
    execute() {
        updateGui('player start', true);
    }
}