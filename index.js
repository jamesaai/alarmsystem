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
const { title, send } = require("process");
const rest = new REST({
	version: '10'
}).setToken(process.env.DISCORD_TOKEN);
const client = new Discord.Client({
	intents: [
		"Guilds"
	]
});

app.use(express.json());

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

function sendDemo(accountNumber, transaction, placeName, systemName, zoneNumber, zoneName, event, placeId) {
	return new Promise((resolve, reject) => {
		if (handledTransactions.includes(transaction)) {
			resolve(); // Duplicate transaction
		} else {
			handledTransactions.push(transaction);
			// Check if the account exists and is verified
			// Account exists and is verified
			// Send the alert
			runCommand(`flite -t "Hello. This is an automated call from KCA SecuriNet Monitoring. ${systemName} has reported a ${event}, ZONE ${zoneNumber}, ${zoneName}, at ${placeName}" -o /tmp/${transaction}.wav`).then((output) => {
				runCommand(`ffmpeg -y -i /tmp/${transaction}.wav -ar 8000 -ac 1 -c:a pcm_s16le /tmp/${transaction}-alert.wav`).then(() => {
					runCommand(`rm /tmp/${transaction}.wav`)
					// strip extension from filename

					client.channels.cache.get("1269078717552922745").send({
						embeds: [{
							title: "Demo Alert",
							description: `Place: [${placeName}](https://roblox.com/games/${placeId}/linkgenerator)\nSystem: ${systemName}\nZone: ${zoneNumber} - ${zoneName}\nEvent: ${event}`
						}],
						files: [{
							attachment: `/tmp/${transaction}-alert.wav`,
							name: `${transaction}-alert.wav`
						}]
					}).then(() => {
						resolve();
					}).catch((error) => {
						console.error(error);
						reject(error);
					});
				}).catch((error) => {
					console.error(error);
					reject(error);
				});
			}).catch((error) => {
				console.error(error);
				reject(error);
			});
		}
	});
}

function sendAlert(accountNumber, transaction, placeName, systemName, zoneNumber, zoneName, event) {
	return new Promise((resolve, reject) => {
		if (handledTransactions.includes(transaction)) {
			resolve(); // Duplicate transaction
		} else {
			handledTransactions.push(transaction);
			// Check if the account exists and is verified
			db.get("SELECT * FROM accounts WHERE id = ? AND verified = 1", accountNumber, (err, row) => {
				if (err) {
					console.error(err);
					reject(err);
				} else if (row) {
					// Account exists and is verified
					// Send the alert
					runCommand(`flite -t "Hello. This is an automated call from KCA SecuriNet Monitoring. ${systemName} has reported a ${event}, ZONE ${zoneNumber}, ${zoneName}, at ${placeName}" -o /tmp/${transaction}.wav`).then((output) => {
						runCommand(`ffmpeg -y -i /tmp/${transaction}.wav -ar 8000 -ac 1 -c:a pcm_s16le /tmp/${transaction}-alert.wav`).then(() => {
							runCommand(`rm /tmp/${transaction}.wav`)
							// strip extension from filename

							runCommand(`/var/lib/asterisk/bin/originate ${row.phone} roblox.s.1 0 0 /tmp/${transaction}-alert "IktDQSBTZWN1cmlOZXQiIDwxNDQ3MjAwNDQ4OD4="`).then(() => {
								console.log(`Alert sent to ${row.phone}`);
								resolve();
							}).catch((error) => {
								console.error(error);
								reject(error);
							});
						}).catch((error) => {
							console.error(error);
							reject(error);
						});
					}).catch((error) => {
						console.error(error);
						reject(error);
					});
				} else {
					resolve();
					// Account does not exist or is not verified
				}
			});
		}
	});
}

function sendTTS(accountNumber, text) {
	return new Promise((resolve, reject) => {
		if (handledTransactions.includes(transaction)) {
			resolve(); // Duplicate transaction
		} else {
			handledTransactions.push(transaction);
			// Check if the account exists and is verified
			db.get("SELECT * FROM accounts WHERE id = ? AND verified = 1", accountNumber, (err, row) => {
				if (err) {
					console.error(err);
					reject(err);
				} else if (row) {
					// Account exists and is verified
					// Send the alert
					runCommand(`flite -t "Hello. This is an automated call from KCA SecuriNet Monitoring. ${text}" -o /tmp/${transaction}.wav`).then((output) => {
						runCommand(`ffmpeg -y -i /tmp/${transaction}.wav -ar 8000 -ac 1 -c:a pcm_s16le /tmp/${transaction}-tts.wav`).then(() => {
							runCommand(`rm /tmp/${transaction}.wav`)
							// strip extension from filename

							runCommand(`/var/lib/asterisk/bin/originate ${row.phone} roblox.s.1 0 0 /tmp/${transaction}-tts "IktDQSBTZWN1cmlOZXQiIDwxNDQ3MjAwNDQ4OD4="`).then(() => {
								console.log(`TTS sent to ${row.phone}`);
								resolve();
							}).catch((error) => {
								console.error(error);
								reject(error);
							});
						}).catch((error) => {
							console.error(error);
							reject(error);
						});
					}).catch((error) => {
						console.error(error);
						reject(error);
					});
				} else {
					resolve();
					// Account does not exist or is not verified
				}
			});
		}
	});
}

function sendVerificationCode(account) {
	// Get verification code from database
	db.get("SELECT * FROM accounts WHERE id = ?", account, (err, row) => {
		if (err) {
			console.error(err);
		} else if (row) {
			// Send verification code to phone number
			runCommand(`flite -t "Hello. This is an automated call from KCA SecuriNet Monitoring. Your verification code is ${row.verification_code.split("").join(", ")}. Repeating, your code is ${row.verification_code}. Once again, your code is ${row.verification_code}" -o /tmp/${account}-code.wav`).then((output) => {
				runCommand(`ffmpeg -y -i /tmp/${account}-code.wav -ar 8000 -ac 1 -c:a pcm_s16le /tmp/${account}-verification.wav`).then(() => {
					runCommand(`rm /tmp/${account}-code.wav`)
					// strip extension from filename

					runCommand(`/var/lib/asterisk/bin/originate ${row.phone} roblox.s.1 0 0 /tmp/${account}-verification "IktDQSBTZWN1cmlOZXQiIDwxNDQ3MjAwNDQ4OD4="`).then(() => {
						console.log(`Verification code sent to ${row.phone}`);
					})
				})
			})
		} else {
			return;
			// Account does not exist or is not verified
		}
	});
}

function generatePhoneCode() {
	// generate 6 digit
	return Math.floor(100000 + Math.random() * 900000).toString();
}

client.on("ready", async () => {
	//sendDemo("6371787150", generateTransactionNumber(), "KCA Product Showcase", "Building Security", 1, "Front Door", "alarm");
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
			phone_number = interaction.options.getString("phone_number");
			// Check that phone_number is either a 4 digit number starting with 1, a 7 digit number, a 10 digit number, or an 11 digit number starting with 1
			if (!/^(1\d{3}|\d{7}|\d{10}|1\d{10})$/.test(phone_number)) {
				interaction.reply({ ephemeral: true, content: "Invalid phone number. Please enter one of the following:\n- A 4 digit LiteNet extension.\n- A 7 digit TandmX number\n- An 10 digit US phone number.\n- An 11 digit US phone number" });
				return;
			}
			// check that the user doesnt have any unverified accounts already (check discord_id and verified)
			db.get("SELECT * FROM accounts WHERE discord_id = ? AND verified = 0", interaction.user.id, (err, row) => {
				if (err) {
					console.error(err);
				} else if (row) {
					interaction.reply({ ephemeral: true, content: "You already have an unverified account. Please verify it before creating a new one." });
				} else {
					accountNumber = generateAccountNumber();
					verification_code = generatePhoneCode();
					db.run("INSERT INTO accounts (id, discord_id, verification_code, phone) VALUES (?, ?, ?, ?)", accountNumber, interaction.user.id, verification_code, phone_number, (err) => {
						if (err) {
							console.error(err);
						} else {
							interaction.reply({
								content: `Account created. Our system will call you shortly with a verification code. Please enter that code into \`/verify\``,
								ephemeral: true
							}).then(() => {
								setTimeout(() => {
									sendVerificationCode(accountNumber);
								}, 5000); // Wait 5 seconds before calling so user has time to read message
							});
						}
					});
				}
			});
			break;
		case "verify":
			verification_code = interaction.options.getString("verification_code");
			db.get("SELECT * FROM accounts WHERE verification_code = ? AND verified = 0", verification_code, (err, row) => {
				if (err) {
					console.error(err);
				} else if (row) {
					db.run("UPDATE accounts SET verified = 1 WHERE verification_code = ?", verification_code, (err) => {
						if (err) {
							console.error(err);
						} else {
							interaction.reply({
								content: `Account Verified! Your account number is \`${row.id}\`.\nFor help setting up the dialer, feel free to contact a member of staff!`,
								ephemeral: true
							})
						}
					});
				} else {
					interaction.reply({ ephemeral: true, content: "Invalid verification code." });
				}
			});
			break;
		case "resend":
			// Find the account thats unverified owned by the user
			db.get("SELECT * FROM accounts WHERE discord_id = ? AND verified = 0", interaction.user.id, (err, row) => {
				if (err) {
					console.error(err);
				} else if (row) {
					sendVerificationCode(row.id);
					interaction.reply({
						content: `Verification code resent to ${row.phone}`,
						ephemeral: true
					});
				} else {
					interaction.reply({ ephemeral: true, content: "You don't have an unverified account." });
				}
			});
			break;
		case "list":
			// list all active accounts owned by the user
			db.all("SELECT * FROM accounts WHERE discord_id = ? AND verified = 1", interaction.user.id, (err, rows) => {
				if (err) {
					console.error(err);
				} else if (rows) {
					let accountList = "";
					rows.forEach((row) => {
						accountList += `\`${row.id}\` - \`${row.phone}\`\n`;
					});
					interaction.reply({
						content: `Active accounts:\n${accountList}`,
						ephemeral: true
					});
				} else {
					interaction.reply({ ephemeral: true, content: "You don't have any active accounts." });
				}
			});
			break;
		case "deactivate": // Deactivate an account
			// Check that account_number is owned by the user, if it is, delete the row
			accountNumber = interaction.options.getString("account_number");
			db.get("SELECT * FROM accounts WHERE discord_id = ? AND id = ?", interaction.user.id, accountNumber, (err, row) => {
				if (err) {
					console.error(err);
				} else if (row) {
					db.run("DELETE FROM accounts WHERE id = ?", accountNumber, (err) => {
						if (err) {
							console.error(err);
						} else {
							interaction.reply({
								content: `Account \`${accountNumber}\` deactivated.`,
								ephemeral: true
							});
						}
					});
				} else {
					interaction.reply({ ephemeral: true, content: "You don't own that account." });
				}
			});
			break;
		case "update": // If the account is owned by the user and verified, update the phone number, unverify it, and send verification to the new number. Do the same checks as register
			accountNumber = interaction.options.getString("account_number");
			phone_number = interaction.options.getString("phone_number");
			db.get("SELECT * FROM accounts WHERE discord_id = ? AND id = ? AND verified = 1", interaction.user.id, accountNumber, (err, row) => {
				if (err) {
					console.error(err);
				} else if (row) {
					if (!/^(1\d{3}|\d{7}|\d{10}|1\d{10})$/.test(phone_number)) {
						interaction.reply({ ephemeral: true, content: "Invalid phone number. Please enter one of the following:\n- A 4 digit LiteNet extension.\n- A 7 digit TandmX number\n- An 10 digit US phone number.\n- An 11 digit US phone number" });
						return;
					}
					verification_code = generatePhoneCode();
					db.run("UPDATE accounts SET phone = ?, verified = 0, verification_code = ? WHERE id = ?", phone_number, verification_code, accountNumber, (err) => {
						if (err) {
							console.error(err);
						} else {
							sendVerificationCode(accountNumber);
							interaction.reply({
								content: `Account updated. Please verify your account by entering the verification code sent to ${phone_number}`,
								ephemeral: true
							});
						}
					});
				} else {
					interaction.reply({ content: "You don't own that account.", ephemeral: true });
				}
			});
			break;
	}
});


app.post("/api/v1/alert", (req, res) => { // Legacy alert endpoint
	console.log(req.body);
	// send no content response
	sendAlert(req.body.accountNumber, req.body.transaction, req.body.placeName, req.body.systemName, req.body.zoneNumber, req.body.zoneName, req.body.event).then(() => {
		res.status(204).send();
	}).catch((error) => {
		res.status(500).send(error);
	});
})

app.post("/api/v1/webhook/:brand/:accountNumber", (req, res) => {
	switch (req.params.brand) {
		case "kca":
			if (req.params.accountNumber == "DEMOTEST") {
				// Generate the audio files, then post it to discord
				sendDemo(req.params.accountNumber, req.body.transaction, req.body.placeName, req.body.systemName, req.body.zoneNumber, req.body.zoneName, req.body.event, req.body.placeId).then(() => {
					res.status(204).send();
				}).catch((error) => {
					res.status(500).send(error);
				});
			} else {

				// send alert to accountNumber
				sendAlert(req.params.accountNumber, req.body.transaction, req.body.placeName, req.body.systemName, req.body.zoneNumber, req.body.zoneName, req.body.event).then(() => {
					res.status(204).send();
				}).catch((error) => {
					res.status(500).send(error);
				});
			}
			break;
		default:
			res.status(400).send("Brand not found");
			break;
	}
});

app.post("/api/v1/tts", (req, res) => {
	console.log(req.body);
	// send no content response
	sendTTS(req.body.accountNumber, req.body.text).then(() => {
		res.status(204).send();
	}).catch((error) => {
		res.status(500).send(error);
	});
});

startTime = new Date();
client.login(process.env.DISCORD_TOKEN);