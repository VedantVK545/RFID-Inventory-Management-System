document.getElementById('chatInput').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

let isChatOpen = false;

function toggleChatWidget() {
    const chatMessages = document.getElementById('chatMessages');
    const chatInputContainer = document.getElementById('chatInputContainer');
    const dropdownIcon = document.querySelector('.dropdown-icon');
    isChatOpen = !isChatOpen;

    if (isChatOpen) {
        chatMessages.classList.add('visible');
        chatInputContainer.classList.add('visible');
        dropdownIcon.classList.remove('fa-chevron-down');
        dropdownIcon.classList.add('fa-chevron-up');
    } else {
        chatMessages.classList.remove('visible');
        chatInputContainer.classList.remove('visible');
        dropdownIcon.classList.remove('fa-chevron-up');
        dropdownIcon.classList.add('fa-chevron-down');
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    const userMessage = input.value.trim();

    if (userMessage) {
        // Clear the input field immediately after capturing the message
        input.value = '';

        // Display user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user';
        userMessageDiv.textContent = userMessage;
        messages.appendChild(userMessageDiv);

        // Show loading spinner while waiting for bot response
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot';
        loadingDiv.innerHTML = '<i class="fa-solid fa-circle-notch loading-icon"></i> Loading...';
        messages.appendChild(loadingDiv);

        // Send message to the bot
        try {
            const response = await fetch('/ask-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: userMessage, userId: 'guest' }),
            });

            const data = await response.json();

            // Remove loading and show bot response
            loadingDiv.remove();

            const botResponseDiv = document.createElement('div');
            botResponseDiv.className = 'message bot';
            botResponseDiv.textContent = typeof data.aiResponse === 'string' 
                ? data.aiResponse 
                : JSON.stringify(data.aiResponse.result.response, null, 2) || "I couldn't process that!";
            messages.appendChild(botResponseDiv);
        } catch (error) {
            loadingDiv.remove();
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message bot';
            errorDiv.textContent = 'Error connecting to the bot. Please try again later.';
            messages.appendChild(errorDiv);
        }

        // Scroll to the bottom of the chat
        messages.scrollTop = messages.scrollHeight;
    }
}