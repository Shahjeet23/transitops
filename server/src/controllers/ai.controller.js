'use strict';

const aiService = require('../services/ai.service');

/**
 * @desc    Generate AI insight
 * @route   POST /api/ai/ask
 * @access  Private
 */
exports.askAssistant = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const responseText = await aiService.generateInsight(prompt);
    
    res.status(200).json({
      success: true,
      data: responseText,
    });
  } catch (error) {
    if (error.message.includes('GEMINI_API_KEY')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    next(error);
  }
};
