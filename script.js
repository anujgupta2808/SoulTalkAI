const chatBox = document.querySelector('.chat-box');
const input = document.querySelector('.input input');
const sendBtn = document.querySelector('.input button');
const startBtn = document.querySelector('.start-btn');
let messageCount = 0;

/* =======================
   EMOTION REACTIONS
======================= */

const emotionalResponses = {
    sad: {
        acknowledge: [
            "That sounds really painful.",
            "I can hear how hurt you are.",
            "Yeah… that’s heavy."
        ],
        validate: [
            "Anyone would feel this way.",
            "It makes sense that this hurts.",
            "Your feelings are valid."
        ],
        support: [
            "I’m here with you.",
            "You’re not alone right now.",
            "Talk to me, I’m listening."
        ],
        followUp: [
            "What happened?",
            "What part hurts the most?",
            "When did this start?"
        ]
    },

    happy: {
        acknowledge: [
            "I can feel your happiness!",
            "That’s such a good vibe!",
            "Wow, that’s exciting!"
        ],
        celebrate: [
            "You deserve this moment.",
            "That’s a real win!",
            "I’m genuinely happy for you."
        ],
        engage: [
            "Tell me more!",
            "How did it happen?",
            "What was your first thought?"
        ]
    },

    angry: {
        acknowledge: [
            "Yeah no, I’d be mad too.",
            "That’s really frustrating.",
            "I get why you’re angry."
        ],
        validate: [
            "That wasn’t fair at all.",
            "You had every right to feel this.",
            "Anyone would snap."
        ],
        release: [
            "Do you want to vent?",
            "What annoyed you the most?",
            "What do you wish you’d said?"
        ]
    },

    anxious: {
        acknowledge: [
            "That anxious feeling is awful.",
            "I know that tight feeling.",
            "Yeah… anxiety can be loud."
        ],
        calm: [
            "You’re safe right now.",
            "Let’s slow this down together.",
            "Take a breath with me."
        ],
        guide: [
            "What’s worrying you most?",
            "Is something coming up?",
            "What usually helps a little?"
        ]
    },

    lonely: {
        acknowledge: [
            "Feeling alone like that hurts.",
            "Loneliness can feel heavy.",
            "I’m really glad you reached out."
        ],
        reassure: [
            "You’re not alone right now.",
            "I’m here with you.",
            "You matter."
        ],
        connect: [
            "When did this start?",
            "Do you miss someone?",
            "Do you want company or advice?"
        ]
    },

    grateful: {
        acknowledge: [
            "That means a lot to hear.",
            "Aww, that’s really sweet.",
            "That made me smile."
        ],
        respond: [
            "I’m always here for you.",
            "You don’t need to thank me.",
            "I care about you."
        ]
    },

    neutral: {
        acknowledge: [
            "Okay, I’m listening.",
            "Alright.",
            "I hear you."
        ],
        engage: [
            "Tell me more.",
            "What happened next?",
            "How do you feel about it?"
        ]
    }
};

/* =======================
   EMOTION DETECTION
======================= */

function detectEmotion(text) {
    const t = text.toLowerCase();

    if (/(sad|depressed|cry|hurt|pain|lost|empty)/i.test(t)) return 'sad';
    if (/(happy|excited|great|amazing|love|awesome)/i.test(t)) return 'happy';
    if (/(angry|mad|furious|hate|annoyed|frustrated)/i.test(t)) return 'angry';
    if (/(anxious|worried|scared|panic|stress)/i.test(t)) return 'anxious';
    if (/(lonely|alone|nobody|isolated)/i.test(t)) return 'lonely';
    if (/(thank|thanks|grateful|appreciate)/i.test(t)) return 'grateful';

    return 'neutral';
}

/* =======================
   RESPONSE GENERATOR
======================= */

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateEmotionReaction(emotion) {
    const group = emotionalResponses[emotion] || emotionalResponses.neutral;
    let reply = "";

    if (group.acknowledge) reply += randomFrom(group.acknowledge);

    if (group.validate && Math.random() > 0.4)
        reply += " " + randomFrom(group.validate);

    if (group.support && Math.random() > 0.4)
        reply += " " + randomFrom(group.support);

    if (group.calm && Math.random() > 0.4)
        reply += " " + randomFrom(group.calm);

    if (group.followUp && Math.random() > 0.5)
        reply += " " + randomFrom(group.followUp);

    if (group.engage && Math.random() > 0.5)
        reply += " " + randomFrom(group.engage);

    if (group.connect && Math.random() > 0.5)
        reply += " " + randomFrom(group.connect);

    if (group.respond && Math.random() > 0.5)
        reply += " " + randomFrom(group.respond);

    if (group.release && Math.random() > 0.5)
        reply += " " + randomFrom(group.release);

    return reply;
}

/* =======================
   UI HELPERS
======================= */

function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typing;
}

function addMessage(text, isUser) {
    const msg = document.createElement('div');
    msg.className = isUser ? 'msg-user' : 'msg-ai';
    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;

    if (!isUser) {
        messageCount++;
        updateStats();
    }
}

/* =======================
   SEND MESSAGE
======================= */

function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, true);
    input.value = '';

    const emotion = detectEmotion(text);
    const typing = showTyping();

    setTimeout(() => {
        typing.remove();
        const reply = generateEmotionReaction(emotion);
        addMessage(reply, false);
    }, 800 + Math.random() * 1000);
}

/* =======================
   STATS + EVENTS
======================= */

function updateStats() {
    const counter = document.getElementById('conversations');
    if (counter) counter.textContent = messageCount;
}

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});

startBtn?.addEventListener('click', () => {
    chatBox.scrollIntoView({ behavior: 'smooth' });
    input.focus();
});

/* =======================
   INITIAL MESSAGE
======================= */

addMessage("Hey… I’m here with you 💙 What’s on your mind?", false);
