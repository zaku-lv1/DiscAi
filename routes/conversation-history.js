const express = require("express");
const conversationHistory = require("../services/conversation-history");
const aiConfigStore = require("../services/ai-config-store");

const router = express.Router();

// Clear conversation history for a specific channel
router.post("/clear", async (req, res) => {
  try {
    const { channelId } = req.body;

    // Validate channelId
    if (!channelId || typeof channelId !== 'string' || channelId.trim() === '') {
      return res.status(400).json({ 
        error: "Validation error",
        message: "channelId is required and must be a non-empty string" 
      });
    }

    // Validate channelId format (Discord channel IDs are 17-19 digit numbers)
    if (!/^\d{17,19}$/.test(channelId.trim())) {
      return res.status(400).json({ 
        error: "Validation error",
        message: "channelId must be a valid Discord channel ID (17-19 digits)" 
      });
    }

    // Get bot name from config
    const config = await aiConfigStore.getConfig();
    const webhookName = config.botName || "AI Assistant";

    // Clear conversation history
    await conversationHistory.clearHistory(channelId.trim(), webhookName);

    console.log(`[INFO] Conversation history cleared for channel ${channelId} via dashboard`);

    res.status(200).json({ 
      message: "Conversation history cleared successfully",
      channelId: channelId.trim(),
      webhookName
    });
  } catch (error) {
    console.error("[ERROR] Failed to clear conversation history:", error);
    res.status(500).json({ 
      error: "Server error",
      message: "Failed to clear conversation history" 
    });
  }
});

// Get all conversation histories (for debugging/management)
router.get("/list", async (req, res) => {
  try {
    const { channelId } = req.query;

    if (!channelId || typeof channelId !== 'string') {
      return res.status(400).json({ 
        error: "Validation error",
        message: "channelId query parameter is required" 
      });
    }

    // Validate channelId format (Discord channel IDs are 17-19 digit numbers)
    if (!/^\d{17,19}$/.test(channelId.trim())) {
      return res.status(400).json({ 
        error: "Validation error",
        message: "channelId must be a valid Discord channel ID (17-19 digits)" 
      });
    }

    const conversations = await conversationHistory.getChannelConversations(channelId.trim());

    res.status(200).json({ 
      channelId: channelId.trim(),
      conversations 
    });
  } catch (error) {
    console.error("[ERROR] Failed to list conversations:", error);
    res.status(500).json({ 
      error: "Server error",
      message: "Failed to list conversations" 
    });
  }
});

module.exports = router;
