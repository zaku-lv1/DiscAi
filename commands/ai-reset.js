const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const conversationHistory = require("../services/conversation-history");
const aiConfigStore = require("../services/ai-config-store");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ai-reset")
    .setDescription("AIの会話履歴をリセットします"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.channel;

    try {
      // Load AI config to get bot name
      const config = await aiConfigStore.getConfig();
      const webhookName = config.botName || "AI Assistant";

      // Clear conversation history for this channel
      await conversationHistory.clearHistory(channel.id, webhookName);

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setDescription(`✅ **${webhookName}** の会話履歴をリセットしました。`)
        .addFields(
          { name: "チャンネル", value: `<#${channel.id}>`, inline: true }
        );

      await interaction.editReply({ embeds: [embed] });
      
      console.log(`[INFO] Conversation history reset for channel ${channel.id} by ${interaction.user.username}`);
    } catch (error) {
      console.error("[AI_RESET_ERROR]", error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setDescription("❌ 会話履歴のリセット中にエラーが発生しました。");

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
};
