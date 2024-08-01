const colors = require("colors");
require("dotenv").config();
const fs = require("fs");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const { exec } = require("child_process");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");
// Find all migrations .sql files in ./migrations, execute them in order
db.on("open", () => {
	console.log(`${colors.cyan("[DB]")} Connected to the database`);
	fs.readdirSync("./migrations").forEach((file) => {
		if (file.endsWith(".sql")) {
			const migration = fs.readFileSync(`./migrations/${file}`, "utf8");
			db.run(migration);
			console.log(`${colors.cyan("[DB]")} ${file} ${colors.green("executed")}`);
		}
	});
});

const Discord = require("discord.js");
const {
	REST,
	Routes
} = require('discord.js');
const { title } = require("process");
const rest = new REST({
	version: '10'
}).setToken(process.env.DISCORD_TOKEN);
const client = new Discord.Client({
	intents: [
		"Guilds"
	]
});

// Vars

var handledTransactions = [];

// Funcs

// runCommand(command) // Run a shell command and return the output
function runCommand(command) {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				reject(error);
			} else {
				resolve(stdout);
			}
		});
	});
}



// generateAccountNumber() // Returns a random 10 digit number, checks if it already exists in the database, and loops until it gets one that doesn't exist
function generateAccountNumber() {
	let accountNumber = Math.floor(Math.random() * 10000000000);
	db.get("SELECT * FROM accounts WHERE id = ?", accountNumber, (err, row) => {
		if (err) {
			console.error(err);
		} else if (row) {
			accountNumber = generateAccountNumber();
		}
	});
	return accountNumber;
}

// generateTransactionNumber() // Returns a random 10 digit number
function generateTransactionNumber() {
	return Math.floor(Math.random() * 10000000000);
}

function sendAlert(accountNumber, transaction, placeName, systemName, zoneNumber, zoneName, event) {
	if (handledTransactions.includes(transaction)) {
		return; // Duplicate transaction
	}
	handledTransactions.push(transaction);
	// Check if the account exists and is verified
	db.get("SELECT * FROM accounts WHERE id = ? AND verified = 1", accountNumber, (err, row) => {
		if (err) {
			console.error(err);
		} else if (row) {
			// Account exists and is verified
			// Send the alert
			runCommand(`flite -t "Hello. This is an automated call from KCA SecuriNet Monitoring. ${systemName} has reported an ${event}, ZONE ${zoneNumber}, ${zoneName} at ${placeName}" -o /tmp/${transaction}.wav`).then((output) => {
				runCommand(`ffmpeg -y -i /tmp/${transaction}.wav -ar 8000 -ac 1 -c:a pcm_s16le /tmp/${transaction}-ast.wav`).then(() => {
					runCommand(`rm /tmp/${transaction}.wav`)
					// strip extension from filename

					runCommand(`/var/lib/asterisk/bin/originate ${row.phone} roblox.s.1 0 0 /tmp/${transaction}-ast "Ik5vb24gQ2hpbWUiIDw+"`).then(() => {
						console.log(`Alert sent to ${row.phone}`);
					})
				})
			})
		} else {
			return;
			// Account does not exist or is not verified
		}
	});
}
sendAlert(1961600249, generateTransactionNumber(), "KCA Product Showcase", "Building Security", 1, "Front Door", "alarm");
client.on("ready", async () => {
	console.log(`${colors.cyan("[Discord]")} Logged in as ${client.user.tag}`);

	const commands = require("./commands.json");
	//Register commands
	await (async () => {
		try {
			console.log(`${colors.cyan("[Discord]")} Registering Commands...`)
			//Global
			await rest.put(Routes.applicationCommands(client.user.id), { body: commands })
			console.log(`${colors.cyan("[Discord]")} Successfully registered commands. Took ${colors.green((Date.now() - startTime) / 1000)} seconds.`);
		} catch (error) {
			console.error(error);
		}
	})();
	app.listen(port, () => {
		console.log(`${colors.cyan("[EXPRESS]")} Listening on ${port}`);
	});
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	switch (interaction.commandName) {
		case "register":
			// check that the user doesnt have any unverified accounts already (check discord_id and verified)
			db.get("SELECT * FROM accounts WHERE discord_id = ? AND verified = 0", interaction.user.id, (err, row) => {
				if (err) {
					console.error(err);
				} else if (row) {
					interaction.reply("You already have an unverified account. Please verify it before creating a new one.");
				} else {
					const accountNumber = generateAccountNumber();
					db.run("INSERT INTO accounts (id, discord_id) VALUES (?, ?)", accountNumber, interaction.user.id, (err) => {
						if (err) {
							console.error(err);
						} else {
							interaction.reply(`Account created with number ${accountNumber}`);
						}
					});
				}
			});
	}
});


startTime = new Date();
client.login(process.env.DISCORD_TOKEN);