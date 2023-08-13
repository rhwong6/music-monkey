const { playerDisconnect } = require('../discord/interactionCreate');

module.exports = {
    name: "disconnect",
    execute() {
        playerDisconnect();
    }
}