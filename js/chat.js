document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const chatContainer = document.getElementById('chatContainer');
    const typingIndicator = document.getElementById('typingIndicator');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const chatSidebar = document.getElementById('chatSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const newChatBtn = document.getElementById('newChatBtn');
    const chatHistoryList = document.getElementById('chatHistoryList');
    
    // Get the additional action buttons
    const summarizeBtn = document.getElementById('summarizeBtn');
    const riskAssessmentBtn = document.getElementById('riskAssessmentBtn');
    
    // Chat history for current session
    let currentChatHistory = [];
    let currentChatId = null;
    
    // Load chat history on page load
    loadChatHistoryList();
    
    // Add initial welcome message if there's no current chat
    if (chatContainer.children.length === 0) {
        addAIMessage("👋 Hello! I'm MOM (My Own Medic). How are you feeling today?");
        
        // Add initial assistant message to chat history
        currentChatHistory.push({
            role: 'assistant',
            content: "👋 Hello! I'm MOM (My Own Medic). How are you feeling today?"
        });
    }
    
    // Mobile sidebar toggle functionality
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            chatSidebar.classList.toggle('show');
            sidebarOverlay.classList.toggle('show');
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            chatSidebar.classList.remove('show');
            sidebarOverlay.classList.remove('show');
        });
    }
    
    // New chat button functionality
    newChatBtn.addEventListener('click', function() {
        // Save current chat if it has messages
        if (currentChatHistory.length > 1) {
            saveCurrentChatToHistory();
        }
        
        // Reset current chat history
        currentChatHistory = [];
        currentChatId = null;
        
        // Clear current chat
        clearChat();
        
        // Add welcome message
        addAIMessage("👋 Hello! I'm MOM (My Own Medic).  How are you feeling today?");
        
        // Add initial assistant message to chat history
        currentChatHistory.push({
            role: 'assistant',
            content: "👋 Hello! I'm MOM (My Own Medic).  How are you feeling today?"
        });
        
        // Update active chat
        setActiveChatItem('current');
        
        // Close sidebar on mobile
        chatSidebar.classList.remove('show');
        if (sidebarOverlay) {
            sidebarOverlay.classList.remove('show');
        }
    });
    
    // Handle form submission
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = messageInput.value.trim();
        
        if (message) {
            // Add user message to UI
            addUserMessage(message);
            
            // Store in current chat history
            currentChatHistory.push({
                role: 'user',
                content: message
            });
            
            // Clear input
            messageInput.value = '';
            
            // Show typing indicator
            typingIndicator.style.display = 'flex';
            
            // Scroll to bottom
            scrollToBottom();
            
            // Send message to backend
            fetch('api/chat.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message
                })
            })
            .then(response => response.json())
            .then(data => {
                // Hide typing indicator
                typingIndicator.style.display = 'none';
                
                if (data.success) {
                    // Add AI response to UI
                    addAIMessage(data.message);
                    
                    // Store in current chat history
                    currentChatHistory.push({
                        role: 'assistant',
                        content: data.message
                    });
                    
                    // Save to chat history if this is the first exchange
                    if (currentChatHistory.length === 3) { // Welcome message + user message + AI response
                        saveCurrentChatToHistory();
                    }
                    
                    // Scroll to bottom
                    scrollToBottom();
                } else {
                    addAIMessage("I'm sorry, I encountered an error. Please try again later.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                typingIndicator.style.display = 'none';
                addAIMessage("I'm sorry, I'm having trouble connecting. Please check your internet connection and try again.");
                scrollToBottom();
            });
        }
    });
    
// Update the summarize button functionality
summarizeBtn.addEventListener('click', function() {
    // Predefined summary content
    const summaryContent = `
        <div class="summary-container">
            <p>Based on your provided medical information, here is a summary of your current medical status:</p>
            <ul>
                <li><strong>Medical Conditions:</strong> You have active type 2 diabetes mellitus and hypertension, which are both chronic conditions requiring ongoing management.</li>
                <li><strong>Current Medications:</strong> You are currently taking metformin for your diabetes and lisinopril for your hypertension. Metformin helps control blood sugar levels, while lisinopril is used to lower blood pressure and protect the kidneys.</li>
                <li><strong>Recent Lab Results:</strong>
                    <ul>
                        <li><strong>Hemoglobin A1c:</strong> Your most recent A1c level is 7.2%, which indicates that your average blood sugar over the past 2-3 months has been relatively well-controlled, but still slightly above the target range for optimal diabetes management. The target A1c for many adults with diabetes is often set at less than 7%.</li>
                        <li><strong>LDL Cholesterol:</strong> Your LDL cholesterol level is 145 mg/dL, which is considered high. This level is above the desirable range for individuals with diabetes, which is typically recommended to be less than 100 mg/dL to reduce the risk of cardiovascular disease.</li>
                    </ul>
                </li>
                <li><strong>Next Steps:</strong> It would be advisable to discuss with your healthcare provider the possibility of adjusting your current medications or adding additional treatments to better control your LDL cholesterol levels. Additionally, maintaining a healthy diet, regular exercise, and regular monitoring of your blood glucose levels are important aspects of managing your conditions.</li>
            </ul>
            <p>This summary highlights the importance of ongoing medical follow-up to ensure your conditions are well-managed and to prevent potential complications. Please consult with your healthcare provider for specific recommendations and to address any concerns you may have about your treatment plan.</p>
        </div>
    `;
    
    // Set the content in the modal
    document.getElementById('summaryContent').innerHTML = summaryContent;
    
    // Open the modal
    const summaryModal = new bootstrap.Modal(document.getElementById('summaryModal'));
    summaryModal.show();
});

// Risk Assessment button functionality
riskAssessmentBtn.addEventListener('click', function() {
    // Create risk assessment items from the predefined content
    const risks = [
        "Given your medical conditions and current medications, it's important to be aware of potential long-term risks like cardiovascular disease and kidney issues, which can arise from uncontrolled diabetes and hypertension.",
        'Keep an eye out for signs like persistent fatigue, changes in vision, or swelling in your legs, as these could indicate complications.',
        'Staying active, managing stress, and maintaining a healthy diet can support your overall health and help control your conditions.',
        "Regular check-ups are key to monitoring your health and adjusting treatments as needed. Let's keep a close watch on your progress together."
    ];
    
    // Format the risk assessment for display
    let formattedHtml = '<div class="risk-assessment-container">';
    formattedHtml += '<h4 class="mb-4"><i class="fas fa-exclamation-triangle text-warning me-2"></i>Future Health Risks</h4>';
    formattedHtml += '<div class="risk-items">';
    
    risks.forEach((risk, index) => {
        formattedHtml += `
            <div class="risk-item">
                <div class="risk-number">${index + 1}</div>
                <div class="risk-content">${risk}</div>
            </div>
        `;
    });
    
    formattedHtml += '</div></div>';
    
    // Set the content in the modal
    document.getElementById('riskAssessmentContent').innerHTML = formattedHtml;
    
    // Open the modal
    const riskModal = new bootstrap.Modal(document.getElementById('riskAssessmentModal'));
    riskModal.show();
});

    // Function to save current chat to history
    function saveCurrentChatToHistory() {
        if (currentChatHistory.length === 0) return;
        
        // Get the user's first message as title
        const firstUserMessage = currentChatHistory.find(msg => msg.role === 'user');
        const title = firstUserMessage ? firstUserMessage.content : 'New Chat';
        
        // Check if we're updating an existing chat or creating a new one
        const method = currentChatId ? 'PUT' : 'POST';
        const url = currentChatId ? 
            `api/chat-history.php?id=${currentChatId}` : 
            'api/chat-history.php';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                messages: currentChatHistory
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentChatId = data.chatId;
                // Refresh the sidebar
                loadChatHistoryList();
            }
        })
        .catch(error => console.error('Error saving chat history:', error));
    }
    
    // Function to load chat history list
    function loadChatHistoryList() {
        fetch('api/chat-history.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Find the "Current Chat" item
                    const currentItem = document.querySelector('.chat-history-item[data-id="current"]');
                    
                    // Clear the list but keep the current chat item
                    chatHistoryList.innerHTML = '';
                    if (currentItem) {
                        chatHistoryList.appendChild(currentItem);
                    } else {
                        // Create current chat item if it doesn't exist
                        const newCurrentItem = document.createElement('div');
                        newCurrentItem.className = 'chat-history-item active';
                        newCurrentItem.setAttribute('data-id', 'current');
                        newCurrentItem.innerHTML = `
                            <p>Current Chat</p>
                            <small class="chat-date">Today</small>
                        `;
                        chatHistoryList.appendChild(newCurrentItem);
                    }
                    
                    // Add chat history items
                    if (data.chats && data.chats.length > 0) {
                        data.chats.forEach(chat => {
                            if (chat.id === currentChatId) return; // Skip current chat
                            
                            const item = document.createElement('div');
                            item.className = 'chat-history-item';
                            item.setAttribute('data-id', chat.id);
                            
                            // Fix for date parsing - ensure we have a valid timestamp
                            let formattedDate = "Unknown date";
                            if (chat.date && !isNaN(chat.date)) {
                                // Convert timestamp to date - make sure it's treated as milliseconds if needed
                                const timestamp = chat.date.toString().length > 10 ? 
                                    parseInt(chat.date) : 
                                    parseInt(chat.date) * 1000;
                                
                                if (!isNaN(timestamp)) {
                                    const date = new Date(timestamp);
                                    formattedDate = formatDate(date);
                                }
                            }
                            
                            item.innerHTML = `
                                <p>${escapeHtml(chat.title)}</p>
                                <small class="chat-date">${formattedDate}</small>
                                <button class="delete-chat-btn" data-id="${chat.id}">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            `;
                            
                            chatHistoryList.appendChild(item);
                            
                            // Add click event to load this chat
                            item.addEventListener('click', function(e) {
                                if (e.target.closest('.delete-chat-btn')) return; // Don't trigger if delete button was clicked
                                loadChat(chat.id);
                            });
                        });
                        
                        // Add delete button event listeners
                        document.querySelectorAll('.delete-chat-btn').forEach(btn => {
                            btn.addEventListener('click', function(e) {
                                e.stopPropagation();
                                const chatId = this.getAttribute('data-id');
                                deleteChat(chatId);
                            });
                        });
                    }
                }
            })
            .catch(error => console.error('Error loading chat history:', error));
    }
    
    // Function to load a specific chat
    function loadChat(chatId) {
        fetch(`api/chat-history.php?id=${chatId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Save current chat if needed
                    if (currentChatHistory.length > 1 && currentChatId !== chatId) {
                        saveCurrentChatToHistory();
                    }
                    
                    // Update current chat ID and history
                    currentChatId = chatId;
                    currentChatHistory = data.chat.messages;
                    
                    // Clear chat container
                    clearChat();
                    
                    // Add messages to UI
                    currentChatHistory.forEach(msg => {
                        if (msg.role === 'user') {
                            addUserMessage(msg.content);
                        } else if (msg.role === 'assistant') {
                            addAIMessage(msg.content);
                        }
                    });
                    
                    // Update active chat item
                    setActiveChatItem(chatId);
                    
                    // Close sidebar on mobile
                    chatSidebar.classList.remove('show');
                    if (sidebarOverlay) {
                        sidebarOverlay.classList.remove('show');
                    }
                }
            })
            .catch(error => console.error('Error loading chat:', error));
    }
    
    // Function to delete a chat
    function deleteChat(chatId) {
        if (confirm('Are you sure you want to delete this conversation?')) {
            fetch(`api/chat-history.php?id=${chatId}`, {
                method: 'DELETE'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // If we're deleting the current chat, start a new one
                        if (chatId === currentChatId) {
                            currentChatId = null;
                            currentChatHistory = [];
                            clearChat();
                            addAIMessage("👋 Hello! I'm MOM (My Own Medic). How are you feeling today?");
                            
                            // Add initial assistant message to chat history
                            currentChatHistory.push({
                                role: 'assistant',
                                content: "👋 Hello! I'm MOM (My Own Medic). How are you feeling today?"
                            });
                        }
                        
                        // Reload chat history
                        loadChatHistoryList();
                    }
                })
                .catch(error => console.error('Error deleting chat:', error));
        }
    }
    
    // Function to clear chat container
    function clearChat() {
        chatContainer.innerHTML = '';
    }
    
    // Function to set active chat item
    function setActiveChatItem(id) {
        document.querySelectorAll('.chat-history-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeItem = document.querySelector(`.chat-history-item[data-id="${id}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
    
    // Function to add user message to UI
    function addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <p class="mb-0">${escapeHtml(message)}</p>
            </div>
            <div class="avatar user-avatar">
                <i class="fas fa-user"></i>
            </div>
        `;
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Function to add AI message to UI
    function addAIMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        messageDiv.innerHTML = `
            <div class="avatar ai-avatar">
                <i class="fas fa-user-md"></i>
            </div>
            <div class="message-content">
                <p class="mb-0">${message}</p>
            </div>
        `;
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Function to scroll the chat container to the bottom
    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Helper function to show notifications
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.zIndex = '2000';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.innerHTML = message;
        document.body.appendChild(notification);
        
        // Remove notification after 2 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }, 2000);
    }
    
    // Format date for display
    function formatDate(date) {
        // Check if date is valid
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return "Unknown date";
        }
        
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        
        // Check if date is today
        if (date.toDateString() === now.toDateString()) {
            return 'Today';
        }
        
        // Check if date is yesterday
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        
        // Format date as MM/DD/YYYY
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        
        return `${month}/${day}/${year}`;
    }
    
    // Function to escape HTML (prevent XSS)
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});