const { updateGui } = require('../discord/interactionCreate');

module.exports = {
    name: "playerSkip",
    execute() {
        console.log("SKIP EVENT");
        updateGui('something random', 'pause', 'music skip', true);
    }
}