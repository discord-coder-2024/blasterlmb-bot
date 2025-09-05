import discord
from discord.ext import commands
import os

intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"✅ Logged in as {bot.user}")

@bot.command()
async def ping(ctx):
    # WebSocket latency in ms
    ws_latency = round(bot.latency * 1000)

    # API latency: measure message round-trip time
    msg = await ctx.send("Pinging... 🏓")
    api_latency = round((msg.created_at.timestamp() - ctx.message.created_at.timestamp()) * 1000)

    await msg.edit(content=f"Pong! 🏓\nWebSocket: {ws_latency}ms\nAPI: {api_latency}ms")

bot.run(os.getenv("DISCORD_TOKEN"))
