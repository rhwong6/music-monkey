const dotenv = require('dotenv');
const { REST, Routes } = require('discord.js');

if (process.argv[2] == null) {
    console.log('Command ID not defined:');
    console.log('node delete-command.js <commandID>');
} else {
    dotenv.config();

    const TOKEN = process.env.TOKEN;
    const CLIENT_ID = process.env.CLIENT_ID;
    const GUILD_ID = process.env.GUILD_ID;

    const rest = new REST().setToken(TOKEN);

    const commandID = process.argv[2];

    rest.delete(Routes.applicationGuildCommand(CLIENT_ID, GUILD_ID, commandID))
        .then(() => console.log('Successfully deleted guild command'))
        .catch(console.error);
}