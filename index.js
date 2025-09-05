import { Client, GatewayIntentBits, Partials, PermissionsBitField } from "discord.js";
import dotenv from "dotenv";
import { runAutomod } from "./automod.js";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  // Self-ping loop
  setInterval(() => {
    console.log("Self-ping sent");
  }, 2 * 60 * 1000); // every 2 minutes
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Automod system
  await runAutomod(message);

  // Command handling
  const prefix = "!";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  // --- MUTE ---
  if (command === "mute") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply("❌ You don’t have permission to mute.");
    }

    const userId = args[0];
    const time = args[1];
    const reason = args.slice(2).join(" ") || "No reason provided";

    if (!userId || !time) {
      return message.reply("Usage: `!mute {id} {time} {reason}`");
    }

    const ms = parseTime(time);
    if (!ms) return message.reply("❌ Invalid time format. Use `10m`, `2h`, `1d`, etc.`");

    try {
      const member = await message.guild.members.fetch(userId);

      // DM the user
      try {
        await member.send(
          `🔇 You have been muted in **${message.guild.name}**\n` +
          `**Duration:** ${time}\n` +
          `**Reason:** ${reason}`
        );
      } catch {
        console.log(`⚠️ Could not DM ${member.user.tag}`);
      }

      await member.timeout(ms, reason);

      message.reply(`✅ Muted **${member.user.username}** for ${time}. Reason: ${reason}`);

      const logChannel = await client.channels.fetch("1413315665766383627");
      logChannel.send(
        `🔇 **Mute Issued**
        **User:** ${member.user.tag} (${userId})
        **Moderator:** ${message.author.tag}
        **Duration:** ${time}
        **Reason:** ${reason}`
      );
    } catch (err) {
      console.error(err);
      message.reply("❌ Could not mute the user. Check ID/permissions.");
    }
  }

  // --- UNMUTE ---
  if (command === "unmute") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply("❌ You don’t have permission to unmute.");
    }

    const userId = args[0];
    const reason = args.slice(1).join(" ") || "No reason provided";

    if (!userId) {
      return message.reply("Usage: `!unmute {id} {reason}`");
    }

    try {
      const member = await message.guild.members.fetch(userId);

      // DM the user
      try {
        await member.send(
          `🔊 You have been unmuted in **${message.guild.name}**\n` +
          `**Reason:** ${reason}`
        );
      } catch {
        console.log(`⚠️ Could not DM ${member.user.tag}`);
      }

      await member.timeout(null, reason); // removes timeout

      message.reply(`✅ Unmuted **${member.user.username}**. Reason: ${reason}`);

      const logChannel = await client.channels.fetch("1413315665766383627");
      logChannel.send(
        `🔊 **Unmute Issued**
        **User:** ${member.user.tag} (${userId})
        **Moderator:** ${message.author.tag}
        **Reason:** ${reason}`
      );
    } catch (err) {
      console.error(err);
      message.reply("❌ Could not unmute the user. Check ID/permissions.");
    }
  }
});

client.login(process.env.TOKEN);

// Helper: Parse time like "10m", "2h", "1d"
function parseTime(str) {
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s": return value * 1000;
    case "m": return value * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    case "d": return value * 24 * 60 * 60 * 1000;
    default: return null;
  }
}
client.login(process.env.token)