const { updateGui } = require('../discord/interactionCreate');

module.exports = {
    name: "playerResume",
    execute() {
        updateGui('music resume', true);
    }
}