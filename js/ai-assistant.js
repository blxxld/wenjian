// AI助手功能
function sendMessage() {
    console.log('sendMessage函数被调用');
    var chatBody = document.getElementById('chat-body');
    var chatInput = document.getElementById('chat-input');
    var message = chatInput.value.trim();
    
    if (message) {
        // 显示用户消息
        var userDiv = document.createElement('div');
        userDiv.className = 'user-message';
        userDiv.innerHTML = '<div class="user-message-content">' + message + '</div><div class="user-avatar">你</div>';
        chatBody.appendChild(userDiv);
        
        // 清空输入框
        chatInput.value = '';
        
        // 显示AI响应
        setTimeout(function() {
            var aiDiv = document.createElement('div');
            aiDiv.className = 'ai-message';
            aiDiv.innerHTML = '<div class="ai-avatar">AI</div><div class="ai-message-content">这是AI的回复，你刚才说: ' + message + '</div>';
            chatBody.appendChild(aiDiv);
        }, 1000);
    }
}

// 清空聊天记录
function clearChat() {
    var chatBody = document.getElementById('chat-body');
    if (chatBody) {
        // 保留AI欢迎消息
        const welcomeMessage = chatBody.querySelector('.ai-message');
        chatBody.innerHTML = '';
        if (welcomeMessage) {
            chatBody.appendChild(welcomeMessage);
        }
    }
}

// 快速提问功能
function askQuickQuestion(question) {
    var chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = question;
        sendMessage();
    }
}

// 页面加载完成后绑定事件
window.onload = function() {
    console.log('AI助手页面加载完成');
    
    // 绑定发送按钮点击事件
    var sendBtn = document.getElementById('send-btn');
    if (sendBtn) {
        sendBtn.onclick = sendMessage;
    }
    
    // 绑定表单提交事件
    var chatForm = document.querySelector('.ai-chat-form');
    if (chatForm) {
        chatForm.onsubmit = function(e) {
            e.preventDefault();
            sendMessage();
            return false;
        };
    }
    
    // 绑定快速提问按钮事件
    var quickQuestionBtns = document.querySelectorAll('.quick-question-btn');
    quickQuestionBtns.forEach(function(btn) {
        btn.onclick = function() {
            var question = this.getAttribute('data-question');
            var chatInput = document.getElementById('chat-input');
            if (chatInput) {
                chatInput.value = question;
                sendMessage();
            }
        };
    });
    
    // 绑定清空聊天按钮事件
    var clearBtn = document.querySelector('.clear-chat-btn');
    if (clearBtn) {
        clearBtn.onclick = clearChat;
    }
};