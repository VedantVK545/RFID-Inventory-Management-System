const axios = require('axios');
const Inventory = require('../models/inventory'); // Import the Inventory model

// In-memory conversation history (for demonstration purposes; use a database for production)
const conversationHistory = {};

async function useCloudflareAI(req, res, next) {
    try {
        const { query, userId } = req.body; // Assume the user query and userId are sent in the request body

        // Initialize conversation history for the user if not already present
        if (!conversationHistory[userId]) {
            conversationHistory[userId] = [];
        }

        // Fetch inventory data in advance to provide context to the AI
        const inventoryItems = await Inventory.find({});
        const inventorySummary = inventoryItems.map(item => `${item.name}: ${item.quantity}`).join(', ');

        // Build the conversation history as part of the prompt
        const history = conversationHistory[userId]
            .map(entry => `User: ${entry.query}\nAI: ${entry.response}`)
            .join('\n');

        // Refine the prompt to include conversation history and inventory context
        // Refine the prompt to include conversation history and inventory context
const refinedPrompt = `
You are an AI assistant specialized in inventory management. 
The current inventory includes the following items: ${inventorySummary}.
Here is the conversation history so far:
${history}
Now, answer the following query based on the inventory data: "${query}".
Provide a concise and to-the-point response. Avoid unnecessary details.
If the query is unrelated to inventory, politely inform the user that you can only assist with inventory-related questions.
Don't include any text formatting like qutetions and /n stuff in your response.
`;

        // Send the refined prompt to the AI API
        const response = await axios.post('https://api.cloudflare.com/client/v4/accounts/d70309112b38620a8088887096488f49/ai/run/@cf/meta/llama-3-8b-instruct', {
            prompt: refinedPrompt,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`, // Use your Cloudflare API key
                'Content-Type': 'application/json',
            },
        });

        // Process the AI response
        const aiResponse = response.data;

        // Save the current query and response to the conversation history
        conversationHistory[userId].push({ query, response: aiResponse });

        // Send the AI response back to the client
        res.json({ aiResponse });
    } catch (error) {
        console.error('Cloudflare AI API error:', error.message);
        return res.status(500).json({ error: 'Cloudflare AI integration failed.' });
    }
}

module.exports = { useCloudflareAI };