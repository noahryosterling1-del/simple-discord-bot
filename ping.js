const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check Bot's latency"),

    async execute(interaction) {
        const sent = await interaction.reply({
            content: "Pinging...",
            fetchReply: true
        });

        const botLatency =
            sent.createdTimestamp - interaction.createdTimestamp;

        const apiLatency = Math.round(interaction.client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor("#ff69b4")
            .setTitle(" Bot Pong!")
            .addFields(
                {
                    name: "Bot Latency",
                    value: `${botLatency}ms`,
                    inline: true
                },
                {
                    name: "API Latency",
                    value: `${apiLatency}ms`,
                    inline: true
                }
            )
            .setFooter({
                text: "Bot • Ping"
            })
            .setTimestamp();

        await interaction.editReply({
            content: "",
            embeds: [embed]
        });
    }
};
