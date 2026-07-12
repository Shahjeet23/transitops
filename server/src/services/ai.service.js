'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const reportService = require('./report.service');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

/**
 * Gather high-level context about the fleet for the AI prompt
 */
async function getFleetContext() {
  const [vehiclesCount, tripsCount, financial, roi, efficiency] = await Promise.all([
    Vehicle.countDocuments(),
    Trip.countDocuments(),
    reportService.getFinancialSummary(), // All time
    reportService.getVehicleROI(), // All time
    reportService.getFuelEfficiency(), // All time
  ]);

  return {
    overview: `The fleet currently consists of ${vehiclesCount} vehicles. A total of ${tripsCount} trips have been logged.`,
    financial: `Total Revenue: ₹${financial.revenue}, Total Costs: ₹${financial.costs.total}, Net Profit: ₹${financial.netProfit} (${financial.profitMargin.toFixed(1)}% margin).`,
    topVehicles: roi.slice(0, 3).map(v => `${v.vehicle.plateNumber}: ₹${v.netProfit} profit`).join(', '),
    bottomVehicles: roi.slice(-3).map(v => `${v.vehicle.plateNumber}: ₹${v.netProfit} profit`).join(', '),
    efficiency: efficiency.slice(0, 3).map(v => `${v.vehicle.plateNumber}: ${v.efficiency.toFixed(2)} km/L`).join(', '),
  };
}

/**
 * Generate an insight using Gemini AI
 * @param {string} prompt - The user's natural language question
 */
async function generateInsight(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is missing or invalid in the .env file. Please add your actual Google Gemini API key and restart the server.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Gather live database context
    const context = await getFleetContext();

    const systemPrompt = `
You are the TransitOps AI Fleet Assistant, an expert in logistics and fleet management. 
You are answering a question from a fleet manager.
Here is the real-time data context from their database:
Overview: ${context.overview}
Financials: ${context.financial}
Top 3 Most Profitable Vehicles: ${context.topVehicles}
Bottom 3 Least Profitable Vehicles: ${context.bottomVehicles}
Top 3 Most Fuel-Efficient Vehicles: ${context.efficiency}

Keep your answers concise, professional, and directly address the user's question using the provided context. Do not invent data outside of this context unless speaking generally about industry practices.
`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-8b',
      systemInstruction: systemPrompt 
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Return the actual error message so the user can debug (e.g. invalid API key)
    throw new Error(`AI Error: ${error.message}`);
  }
}

module.exports = {
  generateInsight,
};
