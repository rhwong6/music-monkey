const { updateGui } = require('../discord/interactionCreate');

module.exports = {
    name: "playerResume",
    execute() {
        updateGui('something random', 'pause', 'music resume', true);
    }
}