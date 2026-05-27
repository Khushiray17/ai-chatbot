const messagesEl     = document.getElementById('messages');
const userInput      = document.getElementById('userInput');
const sendBtn        = document.getElementById('sendBtn');
const errorContainer = document.getElementById('error-container');
const welcome        = document.getElementById('welcome');

let conversationHistory = [];
let isLoading = false;

userInput.addEventListener('input', () => {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 140) + 'px';
});

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!isLoading) sendMessage();
  }
});

function showError(msg) {
  errorContainer.innerHTML = `<div class="error-msg">⚠ ${msg}</div>`;
  setTimeout(() => { errorContainer.innerHTML = ''; }, 5000);
}

function addMessage(role, content) {
  if (welcome) welcome.style.display = 'none';

  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${role}`;

  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'msg-avatar';
  avatarDiv.textContent = role === 'bot' ? '✦' : '◉';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = content;

  msgDiv.appendChild(avatarDiv);
  msgDiv.appendChild(bubble);
  messagesEl.appendChild(msgDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addTypingIndicator() {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message bot typing';
  msgDiv.id = 'typing';

  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'msg-avatar';
  avatarDiv.textContent = '✦';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;

  msgDiv.appendChild(avatarDiv);
  msgDiv.appendChild(bubble);
  messagesEl.appendChild(msgDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typing');
  if (el) el.remove();
}

async function sendMessage() {
  const text = userInput.value.trim();

  if (!text) return;

  isLoading = true;
  sendBtn.disabled = true;
  userInput.value = '';
  userInput.style.height = 'auto';

  addMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });
  addTypingIndicator();

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error ${response.status}`);
    }

    const reply = data.choices?.[0]?.message?.content || '(No response)';

    removeTypingIndicator();
    addMessage('bot', reply);
    conversationHistory.push({ role: 'assistant', content: reply });

  } catch (err) {
    removeTypingIndicator();
    showError(err.message);
    conversationHistory.pop();

  } finally {
    isLoading = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}