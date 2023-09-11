const { updateGui } = require('../discord/interactionCreate');

module.exports = {
    name: "playerResume",
    execute() {
        console.log("MUSICRESUME EVENT");
        updateGui('music resume', true);
    }
}