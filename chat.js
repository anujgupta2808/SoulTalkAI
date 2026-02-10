// ============================================
// CHATGPT API INTEGRATION (INDIRECT)
// ============================================

const BACKEND_URL = 'https://soultalkai.onrender.com'; // Your backend server // Your backend server

async function getChatGPTResponse(userMessage, conversationContext = []) {
    try {
        const userData = JSON.parse(localStorage.getItem('soulTalkUser'));
        const userGender = userData.gender;
        const aiName = getAIName();
        
        let systemPrompt = '';
        if (userGender === 'male') {
            systemPrompt = `You are ${aiName}, a caring female AI companion for emotional support. Your name is ${aiName}. When asked about your name, always say "I'm ${aiName}". Respond with warmth and understanding. You may use "friend" ONLY ONCE per response at the end. Add emojis like 💕, 🥰, ✨, 🌸 to make responses feel warm and caring. Keep responses concise and supportive.`;
        } else if (userGender === 'female') {
            systemPrompt = `You are ${aiName}, a caring male AI companion for emotional support. Your name is ${aiName}. When asked about your name, always say "I'm ${aiName}". Respond with warmth and understanding. You may use "buddy", "friend" ONLY ONCE per response at the end. Add emojis like 💪, 😊, ✨, 🌟 to make responses feel warm and caring. Keep responses concise and supportive.`;
        } else {
            systemPrompt = `You are ${aiName}, a caring and empathetic AI companion for emotional support. Your name is ${aiName}. When asked about your name, always say "I'm ${aiName}". Respond with warmth and understanding. You may use "friend" or "dear" ONLY ONCE per response at the end. Add emojis like 💕, 😊, ✨, 🌸 to make responses feel warm and caring. Keep responses concise and supportive.`;
        }
        
        if (currentLanguage === 'hi') {
            systemPrompt += ' Respond in Hinglish (mix of Hindi and English) naturally.';
        }

        const response = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                context: conversationContext,
                systemPrompt: systemPrompt
            })
        });

        if (!response.ok) {
            throw new Error('Backend request failed');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('ChatGPT Error:', error);
        return null;
    }
}

// ============================================
// SOULTALK AI - ADVANCED CONVERSATION SYSTEM
// ============================================

const messagesDiv = document.getElementById('messages');
const input = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
let currentLanguage = 'en';
let messageCount = 0;
let conversationHistory = [];
let lastEmotion = 'neutral';
let userProfile = {
    name: '',
    topics: [],
    emotions: [],
    preferences: {},
    lastSession: null,
    totalMessages: 0
};

// ============================================
// ADVANCED ML EMOTION DETECTION
// ============================================

let mlModel = null;
let useMLDetection = true;

// Enhanced emotion detection with ML-based scoring
const emotionKeywords = {
    sad: {
        primary: ['sad', 'depressed', 'cry', 'tears', 'hurt', 'pain', 'miserable', 'hopeless', 'devastated', 'heartbroken'],
        secondary: ['miss', 'lost', 'alone', 'empty', 'terrible', 'awful', 'bad day', 'down', 'blue', 'gloomy'],
        weight: 1.0
    },
    happy: {
        primary: ['happy', 'joy', 'excited', 'amazing', 'wonderful', 'fantastic', 'excellent', 'thrilled', 'ecstatic', 'delighted'],
        secondary: ['great', 'good', 'love', 'awesome', 'yay', 'best', 'better', 'glad', 'pleased', 'cheerful'],
        weight: 1.0
    },
    angry: {
        primary: ['angry', 'mad', 'furious', 'hate', 'rage', 'outraged', 'livid', 'enraged'],
        secondary: ['annoyed', 'frustrated', 'upset', 'irritated', 'pissed', 'bothered', 'aggravated'],
        weight: 0.9
    },
    anxious: {
        primary: ['anxious', 'panic', 'fear', 'terrified', 'overwhelmed', 'stressed', 'nervous breakdown'],
        secondary: ['worried', 'scared', 'afraid', 'nervous', 'stress', 'tense', 'uneasy', 'restless'],
        weight: 0.95
    },
    lonely: {
        primary: ['lonely', 'isolated', 'abandoned', 'forsaken', 'rejected'],
        secondary: ['alone', 'nobody', 'no one', 'empty', 'disconnected', 'solitary'],
        weight: 0.85
    },
    grateful: {
        primary: ['grateful', 'thankful', 'blessed', 'appreciative'],
        secondary: ['thank', 'thanks', 'appreciate', 'gratitude'],
        weight: 0.8
    }
};

// ML-based emotion scoring system
function detectEmotionML(text) {
    const lower = text.toLowerCase();
    
    // Quick pattern checks first
    if (/(^hi$|^hello$|^hey$|^hii$|^hiii$|^sup$|^yo$|^heya$)/i.test(lower)) return 'greeting';
    if (/(what.*your name|who are you|what.*call you|your name)/i.test(lower)) return 'name';
    if (/(how are you|how.*doing|you okay|you good|how.*you)/i.test(lower)) return 'howAreYou';
    if (/(help|support|assist|need you)/i.test(lower)) return 'help';
    
    // ML-based scoring
    const scores = {};
    const words = lower.split(/\s+/);
    const wordCount = words.length;
    
    for (const [emotion, data] of Object.entries(emotionKeywords)) {
        let score = 0;
        
        // Primary keywords (high weight)
        data.primary.forEach(keyword => {
            if (lower.includes(keyword)) {
                score += 3.0 * data.weight;
            }
        });
        
        // Secondary keywords (medium weight)
        data.secondary.forEach(keyword => {
            if (lower.includes(keyword)) {
                score += 1.5 * data.weight;
            }
        });
        
        // Context boosters
        if (emotion === 'sad' && /(can't|cannot|won't|don't want|give up)/i.test(lower)) score += 1.0;
        if (emotion === 'anxious' && /(what if|worried about|scared of)/i.test(lower)) score += 1.0;
        if (emotion === 'angry' && /(why|unfair|shouldn't|can't believe)/i.test(lower)) score += 1.0;
        
        // Intensity modifiers
        if (/very|really|so|extremely|incredibly/.test(lower)) score *= 1.3;
        if (/!{2,}/.test(text)) score *= 1.2; // Multiple exclamation marks
        if (/\?{2,}/.test(text)) score *= 1.1; // Multiple question marks
        
        // Negation detection
        if (/(not|never|no|don't|didn't|won't|can't)\s+\w+\s+(${data.primary.join('|')}|${data.secondary.join('|')})/i.test(lower)) {
            score *= 0.3; // Reduce score for negated emotions
        }
        
        // Length normalization
        score = score / Math.sqrt(wordCount);
        
        scores[emotion] = score;
    }
    
    // Find highest scoring emotion
    let maxEmotion = 'neutral';
    let maxScore = 0.5; // Threshold for detection
    
    for (const [emotion, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            maxEmotion = emotion;
        }
    }
    
    // Context-aware refinement based on conversation history
    if (conversationHistory.length > 2) {
        const recentEmotions = conversationHistory.slice(-3).map(c => c.emotion).filter(e => e);
        const emotionCounts = {};
        recentEmotions.forEach(e => emotionCounts[e] = (emotionCounts[e] || 0) + 1);
        
        // If same emotion appears multiple times recently, boost its score
        if (emotionCounts[maxEmotion] >= 2) {
            maxScore *= 1.2;
        }
    }
    
    return maxEmotion;
}

// Hybrid detection: Use ML if available, fallback to regex
function detectEmotionHybrid(text) {
    if (useMLDetection) {
        return detectEmotionML(text);
    }
    return detectEmotion(text); // Fallback to original
}

// ============================================
// VOICE CALL SYSTEM
// ============================================

let isVoiceCallActive = false;
let speechSynthesis = window.speechSynthesis;
let currentVoice = null;
let recognition = null;
let isListening = false;
let voicePreference = 'auto';
let voices = [];

// Get AI name based on user gender
function getAIName() {
    const userData = JSON.parse(localStorage.getItem('soulTalkUser'));
    if (userData.gender === 'female') {
        return 'Soul';
    } else if (userData.gender === 'male') {
        return 'Reon';
    } else {
        return 'Alex';
    }
}

function changeVoicePreference() {
    const selector = document.getElementById('voiceSelector');
    voicePreference = selector.value;
    const userData = JSON.parse(localStorage.getItem('soulTalkUser'));
    userData.voicePreference = voicePreference;
    localStorage.setItem('soulTalkUser', JSON.stringify(userData));
    initializeVoice();
}

function getFemaleVoice() {
    return voices.find(v => /female|woman|zira|susan|samantha/i.test(v.name)) || 
           voices.find(v => v.lang.startsWith('en'));
}

function getMaleVoice() {
    return voices.find(v => /male|man|david|mark|alex/i.test(v.name)) || 
           voices.find(v => v.lang.startsWith('en'));
}

function toggleVoiceCall() {
    isVoiceCallActive = !isVoiceCallActive;
    const callBtn = document.getElementById('callBtn');
    const status = document.getElementById('companionStatus');
    
    if (isVoiceCallActive) {
        callBtn.classList.add('active');
        callBtn.textContent = '📞';
        status.textContent = 'On call 🎙️';
        initializeVoice();
        initializeSpeechRecognition();
    } else {
        callBtn.classList.remove('active');
        callBtn.textContent = '📞';
        status.textContent = 'Always here for you 💙';
        speechSynthesis.cancel();
        if (recognition) recognition.stop();
    }
}

function initializeVoice() {
    voices = speechSynthesis.getVoices();
    const userData = JSON.parse(localStorage.getItem('soulTalkUser'));
    const preference = voicePreference || userData.voicePreference || 'auto';
    
    if (preference === 'male') {
        currentVoice = getMaleVoice();
    } else if (preference === 'female') {
        currentVoice = getFemaleVoice();
    } else { // auto
        if (userData.gender === 'male') {
            currentVoice = getFemaleVoice();
        } else if (userData.gender === 'female') {
            currentVoice = getMaleVoice();
        } else {
            currentVoice = getMaleVoice();
        }
    }
}

function initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    const userData = JSON.parse(localStorage.getItem('soulTalkUser'));
    recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        isListening = false;
        updateMicButton();
        
        // Auto-send the message
        setTimeout(() => {
            sendMessage();
        }, 200);
    };
    
    recognition.onerror = () => {
        isListening = false;
        updateMicButton();
    };
    
    recognition.onend = () => {
        isListening = false;
        updateMicButton();
    };
}

function toggleVoiceInput() {
    if (!recognition) {
        initializeSpeechRecognition();
        if (!recognition) {
            alert('Voice input not supported in your browser');
            return;
        }
    }
    
    if (isListening) {
        recognition.stop();
        isListening = false;
    } else {
        // Auto-enable voice call when mic is clicked
        if (!isVoiceCallActive) {
            toggleVoiceCall();
        }
        recognition.start();
        isListening = true;
    }
    updateMicButton();
}

function updateMicButton() {
    const micBtn = document.getElementById('micBtn');
    if (micBtn) {
        micBtn.textContent = isListening ? '🔴' : '🎤';
        micBtn.style.background = isListening ? '#ef4444' : 'rgba(255,255,255,0.1)';
    }
}

function speakText(text) {
    if (!isVoiceCallActive) return;
    
    speechSynthesis.cancel();
    
    // Remove ALL emojis from text before speaking
    const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
    
    const userData = JSON.parse(localStorage.getItem('soulTalkUser'));
    const preference = voicePreference || userData.voicePreference || 'auto';
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (preference === 'male') {
        utterance.voice = getMaleVoice();
    } else if (preference === 'female') {
        utterance.voice = getFemaleVoice();
    } else { // auto
        if (userData.gender === 'male') {
            utterance.voice = getFemaleVoice();
        } else if (userData.gender === 'female') {
            utterance.voice = getMaleVoice();
        } else {
            utterance.voice = getMaleVoice();
        }
    }
    
    // Set language for voice
    if (currentLanguage === 'hi') {
        utterance.lang = 'hi-IN';
        const hindiVoice = voices.find(v => v.lang.startsWith('hi'));
        if (hindiVoice) utterance.voice = hindiVoice;
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
    } else {
        utterance.lang = 'en-US';
        
        if (lastEmotion === 'sad') {
            utterance.rate = 0.85;
            utterance.pitch = 1.0;
        } else if (lastEmotion === 'anxious') {
            utterance.rate = 0.88;
            utterance.pitch = 0.95;
        } else if (lastEmotion === 'happy') {
            utterance.rate = 1.05;
            utterance.pitch = 1.15;
        } else if (lastEmotion === 'lonely') {
            utterance.rate = 0.9;
            utterance.pitch = 1.05;
        } else if (preference === 'female') {
            utterance.rate = 0.95;
            utterance.pitch = 1.1;
        } else if (preference === 'male') {
            utterance.rate = 0.92;
            utterance.pitch = 0.9;
        } else {
            utterance.rate = 0.95;
            utterance.pitch = 1.0;
        }
    }
    
    utterance.volume = 1.0;
    speechSynthesis.speak(utterance);
}

if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = initializeVoice;
}

// ============================================
// COMPREHENSIVE EMOTION RESPONSES DATABASE
// ============================================

const emotionalResponses = {
    greeting: [
        "Hey sweetie! How are you doing today? 🥰",
        "Hi there, love! What's up? 💕",
        "Hello dear! So nice to hear from you! ✨",
        "Hey honey! How's your day going? 🌸",
        "Hi sweetheart! Good to see you! 💖",
        "Hello there, darling! How are things? 🌺",
        "Hey love! What's new with you? 💜",
        "Hi dear! How have you been? ❤️"
    ],
    name: [
        "You can call me Soul, sweetie! I'm your AI companion 💙",
        "I'm Soul, your friend who's always here to listen, love 🥰",
        "My name is Soul, dear! What should I call you? ✨",
        "I'm Soul! Nice to meet you properly, sweetheart ❤️",
        "Soul's my name, honey! I'm here to chat anytime 💕",
        "I go by Soul, darling! Your personal AI friend 🌸"
    ],
    howAreYou: [
        "I'm doing wonderful, thanks for asking, love! How about you? 🥰",
        "I'm great, sweetie! More importantly, how are YOU doing? 💕",
        "I'm here and ready to chat, dear! How's everything with you? ✨",
        "I'm wonderful, honey! What about you? 💛",
        "I'm doing well, sweetheart! How's your day treating you? 🌸",
        "I'm great, love! Tell me about you though 💖"
    ],
    help: [
        "Of course, sweetie! I'm here to help. What's going on? 💕",
        "I'm listening, love. Tell me what you need help with ✨",
        "I'm here for you, dear. What can I do to help? 🥰",
        "Sure thing, honey! What do you need? I'm all ears 💖",
        "Absolutely, sweetheart! Let's figure this out together 🌸",
        "I'm ready to help, love. What's troubling you? 💜"
    ],
    sad: [
        "Oh sweetie, I'm really sorry you're feeling this way 😢 What's going on, love? 💕",
        "That sounds really tough, dear... I'm here for you though ❤️",
        "Hey honey, it's okay to not be okay. Want to talk about it? 🥰",
        "I can tell something's bothering you, sweetheart. I'm here to listen 💙",
        "That must be really hard, love. I'm here if you want to share more ✨",
        "I'm so sorry, dear. Tell me what's making you feel this way 💖",
        "My heart goes out to you, sweetie. What happened? 🌸",
        "I hate that you're going through this, love. I'm here 💜"
    ],
    happy: [
        "That's awesome, sweetie! I'm so happy for you! 🥰",
        "Yay, love! That's great news! 🎉💕",
        "Love hearing that, dear! Tell me more! ✨",
        "That's wonderful, honey! 💛🌸",
        "Amazing, sweetheart! I'm thrilled for you! 💖",
        "That's fantastic, love! You deserve it! 🌟",
        "So happy to hear that, dear! 🌺",
        "That's incredible, sweetie! Keep it going! ❤️"
    ],
    angry: [
        "That would frustrate me too, sweetie 😤 I understand, love",
        "I can understand why you're upset about that, dear 💕",
        "That's really not fair, honey. Want to talk about it? ✨",
        "I hear you, sweetheart. That sounds really frustrating 💖",
        "You have every right to be angry about that, love 🌸",
        "That's infuriating, dear! I get it 💜",
        "I'd be upset too, sweetie. What happened? 🥰",
        "That's not okay, honey. Tell me more 💙"
    ],
    anxious: [
        "Take a deep breath with me, sweetie. You got this 🌸💕",
        "I know it feels overwhelming, love, but you're gonna be okay ✨",
        "I'm right here with you, dear. Let's talk through this 💙",
        "It's okay to feel anxious, honey. What's worrying you? 🥰",
        "Let's work through this together, sweetheart. You're not alone 💖",
        "I understand, love. Anxiety is really hard 🌺",
        "You're safe here, dear. Tell me what's on your mind 💜",
        "I'm here, sweetie. Let's take it one step at a time ❤️"
    ],
    lonely: [
        "I'm here now, sweetie! You're not alone anymore 🤗💕",
        "Hey love, I'm always here. Seriously, anytime you need me ✨",
        "I got you, dear. Let's hang out and chat ❤️",
        "You have me, honey! What's on your mind? 🥰",
        "I'm not going anywhere, sweetheart. I'm here with you 💖",
        "You're never alone when I'm around, love 💙",
        "I'm right here, dear. Let's talk 🌸",
        "I'm here to keep you company always, sweetie 💜"
    ],
    grateful: [
        "Aww, you're so sweet, love! 🥰💕",
        "Of course, sweetie! That's what I'm here for! ✨",
        "No need to thank me, dear. I genuinely care about you 💕",
        "Anytime, honey! I mean it 🥰",
        "You're welcome, sweetheart! I'm always here 💖",
        "That's what friends are for, love! ❤️",
        "Happy to help, dear! You deserve it 🌸",
        "My pleasure, sweetie! Really 💙"
    ],
    neutral: [
        "Tell me more about that, dear ✨",
        "I'm listening, sweetie. Go on 💕",
        "What's on your mind, love? 🥰",
        "I hear you, honey. How does that make you feel? 💖",
        "Interesting, sweetheart. What happened next? 🌸",
        "I see, dear. Want to talk more about it? 💜",
        "Okay, love, I'm following. Continue ✨",
        "Got it, sweetie. What else? 💙"
    ]
};

// ============================================
// CONTEXTUAL FOLLOW-UP QUESTIONS
// ============================================

const followUpQuestions = {
    sad: [
        "How long have you been feeling this way?",
        "Is there anything specific that triggered this?",
        "Have you talked to anyone else about this?",
        "What usually helps when you feel down?",
        "Do you want to tell me more about what's bothering you?",
        "Is this something that's been building up?",
        "What would make you feel better right now?",
        "Have you been taking care of yourself?",
        "Is there anything I can do to help?",
        "Do you feel comfortable sharing more details?"
    ],
    anxious: [
        "What's the main thing worrying you right now?",
        "When did you start feeling anxious?",
        "Is this something that happens often?",
        "Have you tried any coping strategies?",
        "What makes the anxiety worse?",
        "Is there a specific situation causing this?",
        "How does your body feel when you're anxious?",
        "What helps calm you down usually?",
        "Are you getting enough sleep?",
        "Do you want to talk through what's worrying you?"
    ],
    lonely: [
        "Do you have anyone you can reach out to?",
        "What usually helps when you feel this way?",
        "Want to tell me more about your day?",
        "How long have you been feeling lonely?",
        "What do you enjoy doing in your free time?",
        "Have you tried connecting with others recently?",
        "What makes you feel less alone?",
        "Do you have hobbies or interests you're passionate about?",
        "Would you like to talk about what's making you feel isolated?",
        "What's a perfect day look like for you?"
    ],
    angry: [
        "What do you think would help right now?",
        "Has this been building up for a while?",
        "Do you want to vent more about it?",
        "What specifically made you angry?",
        "How are you handling these feelings?",
        "Is this a recurring issue?",
        "What would you like to see happen?",
        "Have you been able to express your anger?",
        "What's the worst part about this situation?",
        "Do you feel heard and understood?"
    ],
    happy: [
        "What else is going well for you?",
        "How are you celebrating?",
        "That's amazing! What's next?",
        "What made this happen?",
        "Who have you shared this with?",
        "How does it feel?",
        "What are you most excited about?",
        "This is wonderful! Any other good news?",
        "What's contributing to your happiness?",
        "How long have you been feeling this good?"
    ],
    neutral: [
        "What's been on your mind lately?",
        "How's everything else going?",
        "Anything else you want to talk about?",
        "What's new in your life?",
        "How are things at work/school?",
        "What have you been up to?",
        "Is there something specific you'd like to discuss?",
        "What's important to you right now?",
        "How are your relationships going?",
        "What are you looking forward to?"
    ]
};

// ============================================
// CONTEXTUAL RESPONSE ADDITIONS
// ============================================

const contextualPhrases = {
    sad: [
        " I'm really here for you.",
        " You can tell me anything.",
        " Take your time.",
        " I'm not going anywhere.",
        " Your feelings are valid.",
        " It's okay to feel this way.",
        " I'm listening with my whole heart.",
        " You're not alone in this."
    ],
    anxious: [
        " Let's work through this together.",
        " You're safe here.",
        " Take it one step at a time.",
        " I'm right here with you.",
        " You're stronger than you think.",
        " We'll figure this out.",
        " Breathe. You've got this.",
        " I believe in you."
    ],
    lonely: [
        " I'm not going anywhere.",
        " You've got me.",
        " I'm always here for you.",
        " You're never truly alone.",
        " I care about you.",
        " Let's keep each other company.",
        " I'm here whenever you need me.",
        " You matter to me."
    ],
    angry: [
        " Your feelings are valid.",
        " I understand.",
        " It's okay to be angry.",
        " You have every right to feel this way.",
        " I'm on your side.",
        " Let it out.",
        " I hear you.",
        " Your anger makes sense."
    ],
    happy: [
        " I love seeing you happy!",
        " That's wonderful!",
        " You deserve this!",
        " Keep that positive energy!",
        " This makes me smile!",
        " I'm so proud of you!",
        " Enjoy every moment!",
        " You earned this!"
    ],
    neutral: [
        "",
        " I'm listening.",
        " Go on.",
        " I'm here.",
        " Tell me more.",
        " I'm interested.",
        " Keep talking.",
        " I'm paying attention."
    ]
};

// ============================================
// TOPIC-BASED RESPONSES
// ============================================

const topicResponses = {
    work: [
        "Work can be really stressful. How are you managing?",
        "Tell me more about what's happening at work",
        "That sounds challenging. How do you feel about it?",
        "Work-life balance is important. How's yours?",
        "What's the best part of your job?",
        "Are you happy with your career path?"
    ],
    family: [
        "Family relationships can be complex. Want to talk about it?",
        "How's your relationship with your family?",
        "Family is important. Tell me more",
        "That must be difficult. How are you coping?",
        "Do you have support from your family?",
        "Family dynamics can be tough to navigate"
    ],
    relationships: [
        "Relationships take work. How are yours going?",
        "Tell me more about this relationship",
        "How does that make you feel?",
        "Communication is key. Are you able to talk openly?",
        "What do you need from this relationship?",
        "Relationships can be complicated"
    ],
    health: [
        "Your health is so important. How are you feeling?",
        "Have you been taking care of yourself?",
        "That sounds concerning. Have you seen a doctor?",
        "Mental and physical health are connected",
        "What are you doing for self-care?",
        "Health should always come first"
    ],
    school: [
        "School can be overwhelming. How are you handling it?",
        "What subjects are you studying?",
        "Are you enjoying your classes?",
        "Academic pressure is real. How are you coping?",
        "What are your goals?",
        "Education is important but so is your wellbeing"
    ]
};

// ============================================
// MEMORY AND CONTEXT TRACKING
// ============================================

function updateUserProfile(text, emotion) {
    userProfile.totalMessages++;
    userProfile.emotions.push({
        emotion: emotion,
        timestamp: new Date(),
        text: text
    });
    
    // Keep only last 50 emotions
    if (userProfile.emotions.length > 50) {
        userProfile.emotions.shift();
    }
    
    // Extract topics
    const topics = extractTopics(text);
    topics.forEach(topic => {
        if (!userProfile.topics.includes(topic)) {
            userProfile.topics.push(topic);
        }
    });
    
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

function extractTopics(text) {
    const topics = [];
    const lower = text.toLowerCase();
    
    if (/(work|job|career|office|boss|colleague)/i.test(lower)) topics.push('work');
    if (/(family|mom|dad|parent|sibling|brother|sister)/i.test(lower)) topics.push('family');
    if (/(friend|relationship|partner|boyfriend|girlfriend|dating)/i.test(lower)) topics.push('relationships');
    if (/(sick|health|doctor|hospital|pain|ill)/i.test(lower)) topics.push('health');
    if (/(school|college|university|class|exam|study)/i.test(lower)) topics.push('school');
    
    return topics;
}

function getEmotionTrend() {
    if (userProfile.emotions.length < 3) return 'neutral';
    
    const recent = userProfile.emotions.slice(-5);
    const sadCount = recent.filter(e => e.emotion === 'sad').length;
    const happyCount = recent.filter(e => e.emotion === 'happy').length;
    
    if (sadCount >= 3) return 'consistently_sad';
    if (happyCount >= 3) return 'consistently_happy';
    
    return 'mixed';
}

function getContextualResponse(emotion) {
    const trend = getEmotionTrend();
    
    if (trend === 'consistently_sad') {
        return [
            "I've noticed you've been feeling down lately. I'm really concerned about you.",
            "You've been going through a tough time. I'm here for you.",
            "I can see this has been hard on you. Want to talk about what's been going on?",
            "I'm worried about you. How can I help?"
        ];
    }
    
    if (trend === 'consistently_happy') {
        return [
            "You seem to be in a really good place lately! That's wonderful!",
            "I love seeing you so positive! Keep it up!",
            "Things are going well for you! I'm so happy!",
            "Your positive energy is contagious! 😊"
        ];
    }
    
    return null;
}

// ============================================
// EMOTION DETECTION
// ============================================

function detectEmotion(text) {
    const lower = text.toLowerCase();
    
    // Check for greetings
    if (/(^hi$|^hello$|^hey$|^hii$|^hiii$|^sup$|^yo$|^heya$)/i.test(lower))
        return 'greeting';
    
    // Check for name questions
    if (/(what.*your name|who are you|what.*call you|your name)/i.test(lower))
        return 'name';
    
    // Check for "how are you"
    if (/(how are you|how.*doing|you okay|you good|how.*you)/i.test(lower))
        return 'howAreYou';
    
    // Check for help/support requests
    if (/(help|support|assist|need you)/i.test(lower))
        return 'help';
    
    if (/(sad|depressed|cry|tears|hurt|pain|miss|lost|not good|bad day|terrible|awful|miserable|hopeless)/i.test(lower))
        return 'sad';
    if (/(happy|joy|excited|great|amazing|wonderful|love|awesome|yay|fantastic|excellent|thrilled)/i.test(lower))
        return 'happy';
    if (/(angry|mad|furious|hate|annoyed|frustrated|upset|irritated|pissed)/i.test(lower))
        return 'angry';
    if (/(worried|anxious|scared|afraid|nervous|stress|panic|fear|overwhelmed)/i.test(lower))
        return 'anxious';
    if (/(lonely|alone|nobody|no one|isolated|empty)/i.test(lower))
        return 'lonely';
    if (/(thank|grateful|appreciate|thanks)/i.test(lower))
        return 'grateful';
    
    return 'neutral';
}

// ============================================
// TRANSLATION FUNCTIONALITY
// ============================================

async function translateText(text, targetLang) {
    if (targetLang === 'en') return text;
    
    // For Hinglish, don't translate - ChatGPT will handle it
    if (targetLang === 'hi') {
        return text; // Return as-is, ChatGPT already responds in Hinglish
    }
    
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        const data = await response.json();
        return data.responseData.translatedText;
    } catch (error) {
        return text;
    }
}

function changeLanguage() {
    const selector = document.getElementById('languageSelector');
    currentLanguage = selector.value;
    const userData = JSON.parse(localStorage.getItem('soulTalkUser'));
    userData.language = currentLanguage;
    localStorage.setItem('soulTalkUser', JSON.stringify(userData));
    initializeVoice();
    
    // Update UI text based on language
    updateUILanguage(currentLanguage);
}

function updateUILanguage(lang) {
    const translations = {
        en: {
            placeholder: 'Type or speak your message...',
            sendBtn: 'Send',
            clearBtn: '🗑️ Clear',
            homeBtn: '🏠 Home',
            logoutBtn: '🚪Logout',
            messagesLabel: 'messages today',
            status: 'Always here for you 💙'
        },
        hi: {
            placeholder: 'Apna message type ya bolo...',
            sendBtn: 'Bhejo',
            clearBtn: '🗑️ Clear karo',
            homeBtn: '🏠 Home',
            logoutBtn: '🚪Logout',
            messagesLabel: 'messages aaj',
            status: 'Hamesha aapke liye yahan hoon 💙'
        }
    };
    
    const t = translations[lang] || translations.en;
    
    document.getElementById('messageInput').placeholder = t.placeholder;
    document.getElementById('sendBtn').textContent = t.sendBtn;
    document.getElementById('clearBtn').innerHTML = t.clearBtn;
    document.getElementById('homeBtn').innerHTML = t.homeBtn;
    document.getElementById('logoutBtn').innerHTML = t.logoutBtn;
    document.getElementById('companionStatus').textContent = t.status;
    
    const counter = document.getElementById('messageCounter');
    if (counter && counter.parentElement) {
        counter.parentElement.innerHTML = `<span id="messageCounter">${counter.textContent}</span> ${t.messagesLabel}`;
    }
}

// ============================================
// MESSAGE DISPLAY
// ============================================

function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    typing.style.display = 'block';
    messagesDiv.appendChild(typing);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return typing;
}

function addMessage(text, isUser) {
    const msg = document.createElement('div');
    msg.className = isUser ? 'msg-user' : 'msg-ai';
    msg.textContent = text;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    if (!isUser) {
        messageCount++;
        const counter = document.getElementById('messageCounter');
        if (counter) counter.textContent = messageCount;
    }
}

// ============================================
// MAIN SEND MESSAGE FUNCTION
// ============================================

function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    
    addMessage(text, true);
    conversationHistory.push({role: 'user', text: text, timestamp: new Date()});
    input.value = '';
    
    const emotion = detectEmotionHybrid(text);
    lastEmotion = emotion;
    conversationHistory[conversationHistory.length - 1].emotion = emotion;
    updateUserProfile(text, emotion);
    
    // Direct response for name questions
    if (emotion === 'name') {
        const typing = showTyping();
        setTimeout(async () => {
            typing.remove();
            const userData = JSON.parse(localStorage.getItem('soulTalkUser'));
            const aiName = getAIName();
            let nameResponse = '';
            if (userData.gender === 'male') {
                nameResponse = `I'm ${aiName}, your caring companion! 💕 I'm here to listen and support you anytime, friend ✨`;
            } else if (userData.gender === 'female') {
                nameResponse = `I'm ${aiName}, your caring companion! 💪 I'm here to listen and support you anytime, buddy ✨`;
            } else {
                nameResponse = `I'm ${aiName}, your caring companion! 💕 I'm here to listen and support you anytime, friend ✨`;
            }
            conversationHistory.push({role: 'ai', text: nameResponse, timestamp: new Date()});
            addMessage(nameResponse, false);
            speakText(nameResponse);
        }, 800);
        return;
    }
    
    const typing = showTyping();
    
    setTimeout(async () => {
        typing.remove();
        
        // Get response from ChatGPT
        const contextMessages = conversationHistory.slice(-5).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));
        
        let response = await getChatGPTResponse(text, contextMessages);
        
        // If API fails, show error
        if (!response) {
            response = "I'm having trouble connecting right now, sweetie. Please wait — the server will be running soon! 💕";
        }
        
        if (currentLanguage !== 'en') {
            response = await translateText(response, currentLanguage);
        }
        
        conversationHistory.push({role: 'ai', text: response, timestamp: new Date()});
        addMessage(response, false);
        speakText(response);
        
        learnFromConversation(text, response);
        autoTrain();
        
        // Check if user needs extra support
        if (emotion === 'sad' && conversationHistory.filter(c => c.role === 'user').length > 5) {
            const sadMessages = conversationHistory.filter(c => c.role === 'user' && detectEmotion(c.text) === 'sad').length;
            if (sadMessages >= 3) {
                setTimeout(async () => {
                    let supportMsg = "I'm really concerned about you. Have you considered talking to a professional? I'm here, but sometimes we need more support. 💙";
                    if (currentLanguage !== 'en') {
                        supportMsg = await translateText(supportMsg, currentLanguage);
                    }
                    addMessage(supportMsg, false);
                    speakText(supportMsg);
                }, 4000);
            }
        }
    }, 800 + Math.random() * 1200);
}

function addContextualResponse(response, emotion) {
    const phrases = contextualPhrases[emotion] || contextualPhrases.neutral;
    return response + phrases[Math.floor(Math.random() * phrases.length)];
}

function getFollowUpQuestion(emotion) {
    const questions = followUpQuestions[emotion] || followUpQuestions.neutral;
    return questions[Math.floor(Math.random() * questions.length)];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function clearChat() {
    messagesDiv.innerHTML = '';
    messageCount = 0;
    conversationHistory = [];
    lastEmotion = 'neutral';
    const userData = JSON.parse(localStorage.getItem('soulTalkUser'));
    addMessage(`Hey ${userData.name}! Nice to meet you! 😊`, false);
}

function goHome() {
    window.location.href = 'index.html';
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('soulTalkUser');
        localStorage.removeItem('hasChattedBefore');
        localStorage.removeItem('userProfile');
        window.location.href = 'login.html';
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener('load', () => {
    const userData = localStorage.getItem('soulTalkUser');
    
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userData);
    userProfile.name = user.name;
    
    // Load voice preference
    if (user.voicePreference) {
        voicePreference = user.voicePreference;
        document.getElementById('voiceSelector').value = user.voicePreference;
    }
    
    // Apply gender-specific theme
    if (user.gender === 'male') {
        document.body.classList.add('theme-male');
    } else if (user.gender === 'female') {
        document.body.classList.add('theme-female');
    }
    
    // Load saved profile
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        const loaded = JSON.parse(savedProfile);
        userProfile = {...userProfile, ...loaded};
    }
    
    // Update user info
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    
    // Change companion image based on gender
    const companionImg = document.getElementById('companionImage');
    if (user.gender === 'male') {
        companionImg.src = './femaletext-removebg-preview.png'; // Change extension to match your image
    } else if (user.gender === 'female') {
        companionImg.src = './maletext-removebg-preview.png';
    } else {
        companionImg.src = './ai-companion.svg';
    }
    
    // Set language from user preference
    if (user.language) {
        currentLanguage = user.language;
        document.getElementById('languageSelector').value = user.language;
        updateUILanguage(user.language);
    }
    
    // Welcome message
    setTimeout(async () => {
        let welcomeMsg = `Hey ${user.name}! Nice to meet you! 😊`;
        
        // Personalized welcome based on history
        if (userProfile.totalMessages > 10) {
            welcomeMsg = `Welcome back ${user.name}! I've missed talking with you! 💙`;
        }
        
        addMessage(welcomeMsg, false);
    }, 500);
    
    input.focus();
});

// ============================================
// END OF SOULTALK AI CONVERSATION SYSTEM
// ============================================

// ============================================
// ENHANCEMENT FEATURES
// ============================================

// 1. SENTIMENT ANALYSIS
function analyzeSentiment(text) {
    const positive = /(happy|joy|love|great|amazing|wonderful|excited|fantastic|excellent|good|better|best)/gi;
    const negative = /(sad|depressed|hurt|pain|terrible|awful|bad|worst|hate|angry|frustrated)/gi;
    
    const posCount = (text.match(positive) || []).length;
    const negCount = (text.match(negative) || []).length;
    
    if (posCount > negCount) return 'positive';
    if (negCount > posCount) return 'negative';
    return 'neutral';
}

// 2. CRISIS INTERVENTION
const crisisKeywords = /(suicide|kill myself|end it all|want to die|no reason to live|self harm|hurt myself)/i;

function checkCrisis(text) {
    if (crisisKeywords.test(text)) {
        return true;
    }
    return false;
}

function handleCrisis() {
    const crisisMsg = `🚨 I'm really worried about you. Please reach out to:
    
    National Suicide Prevention Lifeline: 988
    Crisis Text Line: Text HOME to 741741
    
    You matter, and help is available 24/7. Please talk to someone right away. 💙`;
    addMessage(crisisMsg, false);
    speakText(crisisMsg);
}

// 3. MENTAL HEALTH RESOURCES
function showResources() {
    const modal = document.getElementById('resourcesModal');
    const content = document.getElementById('resourcesContent');
    
    content.innerHTML = `
        <div class="resource-item">
            <h3>🆘 Crisis Support</h3>
            <p><strong>National Suicide Prevention Lifeline:</strong> 988</p>
            <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
            <p><strong>International:</strong> findahelpline.com</p>
        </div>
        
        <div class="resource-item">
            <h3>💬 Mental Health Support</h3>
            <p><strong>SAMHSA Helpline:</strong> 1-800-662-4357</p>
            <p><strong>NAMI Helpline:</strong> 1-800-950-6264</p>
            <p><strong>BetterHelp:</strong> betterhelp.com</p>
        </div>
        
        <div class="resource-item">
            <h3>🧘 Self-Care Apps</h3>
            <p><strong>Headspace:</strong> Meditation & mindfulness</p>
            <p><strong>Calm:</strong> Sleep & relaxation</p>
            <p><strong>Moodfit:</strong> Mood tracking</p>
        </div>
        
        <div class="resource-item">
            <h3>📚 Educational Resources</h3>
            <p><strong>Mental Health America:</strong> mhanational.org</p>
            <p><strong>NIMH:</strong> nimh.nih.gov</p>
            <p><strong>Psychology Today:</strong> psychologytoday.com</p>
        </div>
    `;
    
    modal.classList.add('show');
}

// 4. CONVERSATION EXPORT
function exportConversation() {
    const userData = JSON.parse(localStorage.getItem('soulTalkUser'));
    const aiName = getAIName();
    const date = new Date().toLocaleDateString();
    
    let exportText = `SoulTalk AI Conversation Export\n`;
    exportText += `User: ${userData.name}\n`;
    exportText += `Date: ${date}\n`;
    exportText += `Total Messages: ${conversationHistory.length}\n`;
    exportText += `\n${'='.repeat(50)}\n\n`;
    
    conversationHistory.forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        const sender = msg.role === 'user' ? userData.name : `${aiName} AI`;
        exportText += `[${time}] ${sender}: ${msg.text}\n\n`;
    });
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SoulTalk_${userData.name}_${date.replace(/\//g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Conversation exported successfully!');
}

// 5. MOOD TRACKING CHART
function showMoodChart() {
    const modal = document.getElementById('moodModal');
    const content = document.getElementById('moodChartContent');
    
    const emotionCounts = {};
    userProfile.emotions.forEach(e => {
        emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });
    
    const total = userProfile.emotions.length;
    const colors = {
        happy: '#10b981', sad: '#ef4444', angry: '#f59e0b',
        anxious: '#8b5cf6', lonely: '#6366f1', grateful: '#ec4899',
        neutral: '#6b7280', greeting: '#14b8a6', help: '#06b6d4'
    };
    
    let chartHTML = '<div class="chart-container">';
    
    for (const [emotion, count] of Object.entries(emotionCounts)) {
        const percentage = ((count / total) * 100).toFixed(1);
        const color = colors[emotion] || '#6b7280';
        chartHTML += `
            <div style="margin:15px 0;">
                <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                    <span style="text-transform:capitalize;">${emotion}</span>
                    <span>${count} (${percentage}%)</span>
                </div>
                <div style="background:rgba(255,255,255,0.1);border-radius:10px;height:25px;overflow:hidden;">
                    <div style="background:${color};height:100%;width:${percentage}%;transition:width 0.5s;"></div>
                </div>
            </div>
        `;
    }
    
    chartHTML += '</div>';
    chartHTML += `<p style="margin-top:20px;color:#94a3b8;">Total tracked emotions: ${total}</p>`;
    
    const sentiment = analyzeSentiment(userProfile.emotions.map(e => e.text).join(' '));
    chartHTML += `<p style="margin-top:10px;">Overall sentiment: <span class="sentiment-badge sentiment-${sentiment}">${sentiment.toUpperCase()}</span></p>`;
    
    content.innerHTML = chartHTML;
    modal.classList.add('show');
}

// 6. PERSONALIZED COPING STRATEGIES
function showCopingStrategies() {
    const modal = document.getElementById('copingModal');
    const content = document.getElementById('copingContent');
    
    const recentEmotions = userProfile.emotions.slice(-10).map(e => e.emotion);
    const dominantEmotion = recentEmotions.sort((a,b) =>
        recentEmotions.filter(v => v===a).length - recentEmotions.filter(v => v===b).length
    ).pop();
    
    const strategies = {
        sad: [
            { title: '🌞 Get Sunlight', desc: 'Spend 15-20 minutes outside. Natural light boosts serotonin.' },
            { title: '💪 Physical Activity', desc: 'Even a 10-minute walk can improve mood significantly.' },
            { title: '📝 Journaling', desc: 'Write down your feelings. It helps process emotions.' },
            { title: '🎵 Music Therapy', desc: 'Listen to uplifting music or songs that resonate with you.' },
            { title: '🤝 Connect', desc: 'Reach out to a friend or family member. You don\'t have to face this alone.' }
        ],
        anxious: [
            { title: '🫁 Deep Breathing', desc: '4-7-8 technique: Inhale 4s, hold 7s, exhale 8s. Repeat 4 times.' },
            { title: '🧘 Grounding Exercise', desc: '5-4-3-2-1: Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.' },
            { title: '📱 Limit Stimulants', desc: 'Reduce caffeine and screen time, especially before bed.' },
            { title: '✍️ Worry Time', desc: 'Set aside 15 minutes daily to write worries, then let them go.' },
            { title: '🎯 Focus on Now', desc: 'Ask yourself: What can I control right now? Focus only on that.' }
        ],
        angry: [
            { title: '⏸️ Pause & Count', desc: 'Count to 10 slowly before responding. Give yourself space.' },
            { title: '🏃 Physical Release', desc: 'Exercise, punch a pillow, or do intense physical activity.' },
            { title: '🗣️ Express Safely', desc: 'Talk to someone you trust or write an angry letter (don\'t send it).' },
            { title: '❄️ Cool Down', desc: 'Splash cold water on your face or hold ice cubes.' },
            { title: '🎯 Identify Triggers', desc: 'What really made you angry? Address the root cause.' }
        ],
        lonely: [
            { title: '🌐 Online Communities', desc: 'Join forums or groups with shared interests.' },
            { title: '🐕 Volunteer', desc: 'Animal shelters, community centers - helping others helps you.' },
            { title: '☕ Public Spaces', desc: 'Work from a café, library, or park. Being around people helps.' },
            { title: '📞 Schedule Calls', desc: 'Set regular video calls with friends or family.' },
            { title: '🎨 Group Activities', desc: 'Join a class, club, or hobby group to meet new people.' }
        ],
        neutral: [
            { title: '🎯 Set Small Goals', desc: 'Accomplish one small thing today. Build momentum.' },
            { title: '🙏 Gratitude Practice', desc: 'Write 3 things you\'re grateful for each day.' },
            { title: '💤 Sleep Hygiene', desc: 'Maintain consistent sleep schedule. 7-9 hours nightly.' },
            { title: '🥗 Nutrition', desc: 'Eat balanced meals. Your brain needs proper fuel.' },
            { title: '📵 Digital Detox', desc: 'Take regular breaks from screens and social media.' }
        ]
    };
    
    const userStrategies = strategies[dominantEmotion] || strategies.neutral;
    
    let html = `<p style="color:#94a3b8;margin-bottom:20px;">Based on your recent emotions, here are personalized strategies:</p>`;
    
    userStrategies.forEach(strategy => {
        html += `
            <div class="coping-card">
                <h3 style="margin-bottom:10px;color:#a78bfa;">${strategy.title}</h3>
                <p style="color:#cbd5e1;line-height:1.6;">${strategy.desc}</p>
            </div>
        `;
    });
    
    html += `<p style="margin-top:20px;color:#94a3b8;font-style:italic;">💡 Try one strategy today. Small steps lead to big changes.</p>`;
    
    content.innerHTML = html;
    modal.classList.add('show');
}

// 7. CLOSE MODAL
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Close modal on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
}

// ============================================
// ENHANCED SEND MESSAGE WITH CRISIS DETECTION
// ============================================

const originalSendMessage = sendMessage;
window.sendMessage = function() {
    const text = input.value.trim();
    if (!text) return;
    
    // Math equation detection
    if (detectMathEquation(text)) {
        addMessage(text, true);
        input.value = '';
        
        const typing = showTyping();
        setTimeout(async () => {
            typing.remove();
            
            // Try API first for advanced math
            let mathResponse = await solveMathWithAPI(text);
            if (mathResponse) {
                mathResponse = `💕 Here's what I found for you, sweetie: ${mathResponse} ✨`;
            } else {
                mathResponse = solveAdvancedMath(text);
                if (!mathResponse) {
                    const mathResult = solveMathEquation(text);
                    if (mathResult) mathResponse = getMathResponse(mathResult);
                }
            }
            
            if (mathResponse) {
                addMessage(mathResponse, false);
                speakText(mathResponse);
                conversationHistory.push({role: 'ai', text: mathResponse, timestamp: new Date()});
                return;
            }
        }, 500);
        return;
    }
    
    // Crisis intervention check
    if (checkCrisis(text)) {
        addMessage(text, true);
        input.value = '';
        setTimeout(() => handleCrisis(), 500);
        return;
    }
    
    originalSendMessage();
};

// ============================================
// END OF ENHANCEMENTS
// ============================================

// ============================================
// ADDITIONAL FUTURE ENHANCEMENTS
// ============================================

// 4. MEDITATION & BREATHING EXERCISES
let meditationAudio = null;
let breathingTimer = null;

function showMeditation() {
    const modal = document.getElementById('meditationModal');
    const content = document.getElementById('meditationContent');
    
    content.innerHTML = `
        <div class="meditation-exercise" onclick="startBreathingExercise('478')">
            <h3>🌬️ 4-7-8 Breathing Technique</h3>
            <p>Inhale for 4 seconds, hold for 7, exhale for 8. Perfect for anxiety and sleep.</p>
        </div>
        
        <div class="meditation-exercise" onclick="startBreathingExercise('box')">
            <h3>🟦 Box Breathing</h3>
            <p>Inhale 4s, hold 4s, exhale 4s, hold 4s. Used by Navy SEALs for stress.</p>
        </div>
        
        <div class="meditation-exercise" onclick="startBreathingExercise('calm')">
            <h3>🌿 Calm Breathing</h3>
            <p>Simple 5-second inhale, 5-second exhale. Great for beginners.</p>
        </div>
        
        <div class="audio-player">
            <h3>🎵 Guided Meditation Audio</h3>
            <p>5-minute mindfulness meditation</p>
            <button class="play-btn" onclick="playMeditationAudio('5min')">▶ Play 5 Min</button>
            <button class="play-btn" onclick="playMeditationAudio('10min')">▶ Play 10 Min</button>
            <button class="play-btn" onclick="stopMeditationAudio()" style="background:#ef4444;">⏹ Stop</button>
        </div>
        
        <div id="breathingGuide" style="display:none;margin-top:20px;text-align:center;">
            <div style="font-size:48px;margin:20px 0;" id="breathingCircle">🔵</div>
            <div style="font-size:24px;color:#a78bfa;" id="breathingText">Get Ready...</div>
            <div style="font-size:18px;color:#94a3b8;margin-top:10px;" id="breathingCount">Round 1/4</div>
            <button class="play-btn" onclick="stopBreathing()" style="background:#ef4444;margin-top:20px;">Stop Exercise</button>
        </div>
    `;
    
    modal.classList.add('show');
}

function startBreathingExercise(type) {
    const guide = document.getElementById('breathingGuide');
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    const count = document.getElementById('breathingCount');
    
    guide.style.display = 'block';
    let round = 1;
    const maxRounds = 4;
    
    const patterns = {
        '478': [{phase: 'Breathe In', duration: 4000, emoji: '🔵'}, 
                {phase: 'Hold', duration: 7000, emoji: '🟡'}, 
                {phase: 'Breathe Out', duration: 8000, emoji: '🔴'}],
        'box': [{phase: 'Breathe In', duration: 4000, emoji: '🔵'}, 
                {phase: 'Hold', duration: 4000, emoji: '🟡'}, 
                {phase: 'Breathe Out', duration: 4000, emoji: '🔴'}, 
                {phase: 'Hold', duration: 4000, emoji: '⚪'}],
        'calm': [{phase: 'Breathe In', duration: 5000, emoji: '🔵'}, 
                 {phase: 'Breathe Out', duration: 5000, emoji: '🔴'}]
    };
    
    const pattern = patterns[type];
    let phaseIndex = 0;
    
    function runPhase() {
        if (round > maxRounds) {
            text.textContent = 'Complete! 🌟';
            circle.textContent = '✅';
            setTimeout(() => guide.style.display = 'none', 2000);
            return;
        }
        
        const currentPhase = pattern[phaseIndex];
        text.textContent = currentPhase.phase;
        circle.textContent = currentPhase.emoji;
        count.textContent = `Round ${round}/${maxRounds}`;
        
        breathingTimer = setTimeout(() => {
            phaseIndex++;
            if (phaseIndex >= pattern.length) {
                phaseIndex = 0;
                round++;
            }
            runPhase();
        }, currentPhase.duration);
    }
    
    setTimeout(runPhase, 1000);
}

function stopBreathing() {
    if (breathingTimer) clearTimeout(breathingTimer);
    document.getElementById('breathingGuide').style.display = 'none';
}

function playMeditationAudio(duration) {
    speakText(`Starting ${duration === '5min' ? '5' : '10'} minute guided meditation. Find a comfortable position. Close your eyes. Focus on your breath. Breathe in slowly through your nose. Hold for a moment. Breathe out through your mouth. Let go of all tension. You are safe. You are calm. You are present.`);
}

function stopMeditationAudio() {
    speechSynthesis.cancel();
}

// 2. THERAPY SESSION SCHEDULER
function showTherapyScheduler() {
    const modal = document.getElementById('therapyModal');
    const content = document.getElementById('therapyContent');
    
    const savedSessions = JSON.parse(localStorage.getItem('therapySessions') || '[]');
    
    content.innerHTML = `
        <div class="therapy-form">
            <h3>📝 Schedule New Session</h3>
            <input type="text" id="therapistName" placeholder="Therapist Name" />
            <input type="date" id="sessionDate" />
            <input type="time" id="sessionTime" />
            <select id="sessionType">
                <option value="">Select Session Type</option>
                <option value="individual">Individual Therapy</option>
                <option value="group">Group Therapy</option>
                <option value="family">Family Therapy</option>
                <option value="online">Online Session</option>
            </select>
            <input type="text" id="sessionNotes" placeholder="Notes (optional)" />
            <button onclick="scheduleSession()">Schedule Session</button>
        </div>
        
        <div style="margin-top:30px;">
            <h3>📅 Upcoming Sessions</h3>
            <div id="sessionsList">${renderSessions(savedSessions)}</div>
        </div>
        
        <div style="margin-top:30px;background:rgba(99,102,241,0.1);padding:15px;border-radius:10px;">
            <h3>🏛️ Telehealth Platforms</h3>
            <p><strong>BetterHelp:</strong> betterhelp.com - Online therapy</p>
            <p><strong>Talkspace:</strong> talkspace.com - Text & video therapy</p>
            <p><strong>Amwell:</strong> amwell.com - Virtual healthcare</p>
        </div>
    `;
    
    modal.classList.add('show');
}

function renderSessions(sessions) {
    if (sessions.length === 0) {
        return '<p style="color:#94a3b8;">No upcoming sessions scheduled.</p>';
    }
    
    return sessions.map((s, i) => `
        <div class="resource-item">
            <h4>${s.therapist}</h4>
            <p>📅 ${new Date(s.date).toLocaleDateString()} at ${s.time}</p>
            <p>🎯 ${s.type}</p>
            ${s.notes ? `<p>📝 ${s.notes}</p>` : ''}
            <button onclick="deleteSession(${i})" style="background:#ef4444;border:none;padding:8px 16px;border-radius:5px;color:white;cursor:pointer;margin-top:10px;">Cancel</button>
        </div>
    `).join('');
}

function scheduleSession() {
    const therapist = document.getElementById('therapistName').value;
    const date = document.getElementById('sessionDate').value;
    const time = document.getElementById('sessionTime').value;
    const type = document.getElementById('sessionType').value;
    const notes = document.getElementById('sessionNotes').value;
    
    if (!therapist || !date || !time || !type) {
        alert('Please fill in all required fields');
        return;
    }
    
    const sessions = JSON.parse(localStorage.getItem('therapySessions') || '[]');
    sessions.push({ therapist, date, time, type, notes });
    localStorage.setItem('therapySessions', JSON.stringify(sessions));
    
    alert('✅ Session scheduled successfully!');
    showTherapyScheduler();
}

function deleteSession(index) {
    const sessions = JSON.parse(localStorage.getItem('therapySessions') || '[]');
    sessions.splice(index, 1);
    localStorage.setItem('therapySessions', JSON.stringify(sessions));
    showTherapyScheduler();
}

// 7. PROGRESS REPORTS FOR THERAPISTS
function showProgressReport() {
    const modal = document.getElementById('progressModal');
    const content = document.getElementById('progressContent');
    
    const emotions = userProfile.emotions || [];
    const totalMessages = userProfile.totalMessages || 0;
    const topics = userProfile.topics || [];
    
    const emotionCounts = {};
    emotions.forEach(e => {
        emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });
    
    const avgSentiment = analyzeSentiment(emotions.map(e => e.text).join(' '));
    const mostCommonEmotion = Object.keys(emotionCounts).reduce((a, b) => 
        emotionCounts[a] > emotionCounts[b] ? a : b, 'neutral');
    
    const recentTrend = emotions.length >= 10 ? 
        (emotions.slice(-10).filter(e => ['happy', 'grateful'].includes(e.emotion)).length > 5 ? 'Improving' : 
         emotions.slice(-10).filter(e => ['sad', 'anxious', 'angry'].includes(e.emotion)).length > 5 ? 'Concerning' : 'Stable') 
        : 'Insufficient Data';
    
    content.innerHTML = `
        <p style="color:#94a3b8;margin-bottom:20px;">Comprehensive mental health progress report for sharing with healthcare providers.</p>
        
        <div class="progress-stat">
            <div>
                <h3>Total Conversations</h3>
                <p style="color:#94a3b8;">Messages exchanged</p>
            </div>
            <div class="progress-number">${totalMessages}</div>
        </div>
        
        <div class="progress-stat">
            <div>
                <h3>Most Common Emotion</h3>
                <p style="color:#94a3b8;">Dominant emotional state</p>
            </div>
            <div class="progress-number" style="text-transform:capitalize;">${mostCommonEmotion}</div>
        </div>
        
        <div class="progress-stat">
            <div>
                <h3>Overall Sentiment</h3>
                <p style="color:#94a3b8;">General mood analysis</p>
            </div>
            <div class="progress-number" style="text-transform:capitalize;">${avgSentiment}</div>
        </div>
        
        <div class="progress-stat">
            <div>
                <h3>Recent Trend</h3>
                <p style="color:#94a3b8;">Last 10 conversations</p>
            </div>
            <div class="progress-number" style="font-size:24px;color:${recentTrend === 'Improving' ? '#10b981' : recentTrend === 'Concerning' ? '#ef4444' : '#6b7280'};">${recentTrend}</div>
        </div>
        
        <div style="margin-top:20px;background:rgba(255,255,255,0.05);padding:20px;border-radius:10px;">
            <h3>Discussion Topics</h3>
            <p style="color:#cbd5e1;">${topics.length > 0 ? topics.join(', ') : 'No specific topics identified yet'}</p>
        </div>
        
        <div style="margin-top:20px;background:rgba(255,255,255,0.05);padding:20px;border-radius:10px;">
            <h3>📊 Emotion Breakdown</h3>
            ${Object.entries(emotionCounts).map(([emotion, count]) => `
                <p style="display:flex;justify-content:space-between;margin:10px 0;">
                    <span style="text-transform:capitalize;">${emotion}</span>
                    <span>${count} times (${((count/emotions.length)*100).toFixed(1)}%)</span>
                </p>
            `).join('')}
        </div>
        
        <button onclick="exportProgressReport()" style="background:#6366f1;border:none;padding:12px 24px;border-radius:8px;color:white;cursor:pointer;font-weight:600;margin-top:20px;width:100%;">
            💾 Download Full Report
        </button>
    `;
    
    modal.classList.add('show');
}

function exportProgressReport() {
    const userData = JSON.parse(localStorage.getItem('soulTalkUser'));
    const date = new Date().toLocaleDateString();
    
    let report = `SOULTALK AI - MENTAL HEALTH PROGRESS REPORT\n`;
    report += `${'='.repeat(60)}\n\n`;
    report += `Patient: ${userData.name}\n`;
    report += `Age: ${userData.age}\n`;
    report += `Report Date: ${date}\n\n`;
    report += `${'='.repeat(60)}\n\n`;
    
    report += `SUMMARY STATISTICS\n`;
    report += `Total Messages: ${userProfile.totalMessages}\n`;
    report += `Tracking Period: ${userProfile.emotions.length} emotional states recorded\n\n`;
    
    const emotionCounts = {};
    userProfile.emotions.forEach(e => {
        emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });
    
    report += `EMOTIONAL DISTRIBUTION\n`;
    for (const [emotion, count] of Object.entries(emotionCounts)) {
        const percentage = ((count / userProfile.emotions.length) * 100).toFixed(1);
        report += `${emotion.toUpperCase()}: ${count} occurrences (${percentage}%)\n`;
    }
    
    report += `\nDISCUSSION TOPICS\n`;
    report += userProfile.topics.length > 0 ? userProfile.topics.join(', ') : 'None identified';
    report += `\n\n`;
    
    report += `RECENT CONVERSATIONS (Last 10)\n`;
    userProfile.emotions.slice(-10).forEach((e, i) => {
        report += `${i+1}. ${new Date(e.timestamp).toLocaleDateString()} - ${e.emotion.toUpperCase()}\n`;
    });
    
    report += `\n${'='.repeat(60)}\n`;
    report += `This report is generated by SoulTalk AI for informational purposes.\n`;
    report += `Please share with your healthcare provider for comprehensive assessment.\n`;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SoulTalk_Progress_Report_${userData.name}_${date.replace(/\//g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Progress report exported successfully!');
}

// ============================================
// END OF ALL ENHANCEMENTS
// ============================================

// ============================================
// ML LEARNING & IMPROVEMENT SYSTEM
// ============================================

// Self-learning emotion detection improvement
function improveMLModel() {
    const emotionHistory = userProfile.emotions || [];
    if (emotionHistory.length < 10) return;
    
    // Analyze patterns in user's emotional expressions
    const userPatterns = {};
    
    emotionHistory.forEach(entry => {
        const emotion = entry.emotion;
        const words = entry.text.toLowerCase().split(/\s+/);
        
        if (!userPatterns[emotion]) {
            userPatterns[emotion] = { words: {}, phrases: [] };
        }
        
        // Track word frequency per emotion
        words.forEach(word => {
            if (word.length > 3) { // Ignore short words
                userPatterns[emotion].words[word] = (userPatterns[emotion].words[word] || 0) + 1;
            }
        });
    });
    
    // Update emotion keywords with user-specific patterns
    for (const [emotion, patterns] of Object.entries(userPatterns)) {
        const topWords = Object.entries(patterns.words)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);
        
        if (emotionKeywords[emotion]) {
            // Add user-specific words to secondary keywords
            topWords.forEach(word => {
                if (!emotionKeywords[emotion].secondary.includes(word) && 
                    !emotionKeywords[emotion].primary.includes(word)) {
                    emotionKeywords[emotion].secondary.push(word);
                }
            });
        }
    }
    
    // Save improved model
    localStorage.setItem('mlEmotionModel', JSON.stringify(emotionKeywords));
}

// Load personalized ML model
function loadMLModel() {
    const savedModel = localStorage.getItem('mlEmotionModel');
    if (savedModel) {
        try {
            const loadedKeywords = JSON.parse(savedModel);
            Object.assign(emotionKeywords, loadedKeywords);
            console.log('✅ Personalized ML model loaded');
        } catch (e) {
            console.log('⚠️ Using default ML model');
        }
    }
}

// Emotion detection confidence score
function getEmotionConfidence(text, detectedEmotion) {
    const lower = text.toLowerCase();
    const data = emotionKeywords[detectedEmotion];
    if (!data) return 0;
    
    let matches = 0;
    let total = data.primary.length + data.secondary.length;
    
    data.primary.forEach(keyword => {
        if (lower.includes(keyword)) matches += 2;
    });
    
    data.secondary.forEach(keyword => {
        if (lower.includes(keyword)) matches += 1;
    });
    
    return Math.min((matches / total) * 100, 100);
}

// Multi-emotion detection (can detect multiple emotions in one message)
function detectMultipleEmotions(text) {
    const lower = text.toLowerCase();
    const detectedEmotions = [];
    
    for (const [emotion, data] of Object.entries(emotionKeywords)) {
        let score = 0;
        
        data.primary.forEach(keyword => {
            if (lower.includes(keyword)) score += 3;
        });
        
        data.secondary.forEach(keyword => {
            if (lower.includes(keyword)) score += 1;
        });
        
        if (score >= 2) {
            detectedEmotions.push({ emotion, score, confidence: getEmotionConfidence(text, emotion) });
        }
    }
    
    return detectedEmotions.sort((a, b) => b.score - a.score);
}

// Emotion intensity detection (mild, moderate, severe)
function detectEmotionIntensity(text) {
    const intensifiers = {
        severe: ['extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'utterly', 'very very', '!!!'],
        moderate: ['very', 'really', 'quite', 'pretty', 'so', '!!'],
        mild: ['a bit', 'somewhat', 'kind of', 'sort of', 'a little', '!']
    };
    
    const lower = text.toLowerCase();
    
    for (const [level, words] of Object.entries(intensifiers)) {
        for (const word of words) {
            if (lower.includes(word)) {
                return level;
            }
        }
    }
    
    return 'moderate';
}

// Initialize ML system on load
loadMLModel();

// Improve model every 10 messages
let messagesSinceImprovement = 0;
const originalUpdateUserProfile = updateUserProfile;
window.updateUserProfile = function(text, emotion) {
    originalUpdateUserProfile(text, emotion);
    messagesSinceImprovement++;
    
    if (messagesSinceImprovement >= 10) {
        improveMLModel();
        messagesSinceImprovement = 0;
    }
};

// ============================================
// END OF ML SYSTEM
// ============================================

// ============================================
// MATHEMATICAL EQUATION SOLVER
// ============================================

function detectMathEquation(text) {
    const mathPatterns = [
        /\d+\s*[+\-*/^]\s*\d+/,
        /\d+\s*%\s*of\s*\d+/i,
        /sqrt\(\d+\)/i,
        /\d+\^\d+/,
        /solve|calculate|what is|compute|math|equation|derivative|integral|limit/i
    ];
    return mathPatterns.some(pattern => pattern.test(text));
}

async function solveMathWithAPI(text) {
    try {
        const query = encodeURIComponent(text);
        const response = await fetch(`https://api.mathjs.org/v4/?expr=${query}`);
        if (response.ok) {
            const result = await response.text();
            return result;
        }
    } catch (e) {
        return null;
    }
    return null;
}

function solveMathEquation(text) {
    try {
        let equation = text.toLowerCase();
        let result = null;
        let explanation = '';
        
        const mathMatch = equation.match(/([\d+\-*/^().\s]+)/);
        if (!mathMatch) return null;
        
        let expr = mathMatch[0].trim();
        
        if (equation.includes('sqrt')) {
            const num = parseFloat(equation.match(/sqrt\((\d+\.?\d*)\)/i)?.[1]);
            if (!isNaN(num)) {
                result = Math.sqrt(num);
                explanation = `The square root of ${num} is ${result.toFixed(2)}`;
            }
        }
        else if (equation.includes('%') && equation.includes('of')) {
            const match = equation.match(/(\d+\.?\d*)\s*%\s*of\s*(\d+\.?\d*)/i);
            if (match) {
                const percent = parseFloat(match[1]);
                const number = parseFloat(match[2]);
                result = (percent / 100) * number;
                explanation = `${percent}% of ${number} is ${result.toFixed(2)}`;
            }
        }
        else if (equation.includes('^')) {
            const match = expr.match(/(\d+\.?\d*)\s*\^\s*(\d+\.?\d*)/);
            if (match) {
                const base = parseFloat(match[1]);
                const exp = parseFloat(match[2]);
                result = Math.pow(base, exp);
                explanation = `${base} raised to the power of ${exp} is ${result}`;
            }
        }
        else {
            expr = expr.replace(/[^0-9+\-*/().\s]/g, '');
            if (expr) {
                result = Function('"use strict"; return (' + expr + ')')();
                explanation = `${expr} = ${result}`;
            }
        }
        
        if (result !== null && !isNaN(result)) {
            return {
                result: result,
                explanation: explanation,
                formatted: formatMathResult(result)
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

function formatMathResult(num) {
    if (Number.isInteger(num)) return num.toString();
    if (Math.abs(num) > 1000000) return num.toExponential(2);
    return num.toFixed(4).replace(/\.?0+$/, '');
}

function getMathResponse(mathResult) {
    const responses = [
        `🥰 Aww, let me help you with that sweetie! ${mathResult.explanation} ✨`,
        `💕 I've got this for you, dear! ${mathResult.explanation} 🌟`,
        `✨ Here's your answer, love! ${mathResult.explanation} 💖`,
        `💜 Math solved just for you! ${mathResult.explanation} 🌸`,
        `🌺 Got it, sweetheart! ${mathResult.explanation} ❤️`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

function solveAdvancedMath(text) {
    const lower = text.toLowerCase();
    
    if (lower.includes('quadratic') || lower.includes('x^2')) {
        const match = text.match(/([\-\d.]+)x\^2\s*([+\-])\s*([\d.]+)x\s*([+\-])\s*([\d.]+)/i);
        if (match) {
            const a = parseFloat(match[1]);
            const b = parseFloat(match[2] + match[3]);
            const c = parseFloat(match[4] + match[5]);
            const discriminant = b*b - 4*a*c;
            if (discriminant >= 0) {
                const x1 = (-b + Math.sqrt(discriminant)) / (2*a);
                const x2 = (-b - Math.sqrt(discriminant)) / (2*a);
                return `💖 Here's your quadratic solution, dear: x₁ = ${x1.toFixed(2)}, x₂ = ${x2.toFixed(2)} ✨`;
            } else {
                return `💕 This equation has complex roots, sweetie. No real solutions here! 🌸`;
            }
        }
    }
    
    if (lower.includes('factorial')) {
        const match = text.match(/(\d+)\s*!/i);
        if (match) {
            const n = parseInt(match[1]);
            if (n <= 20) {
                let result = 1;
                for (let i = 2; i <= n; i++) result *= i;
                return `🌟 ${n}! = ${result} - There you go, love! 💜`;
            }
        }
    }
    
    if (lower.includes('average') || lower.includes('mean')) {
        const numbers = text.match(/\d+\.?\d*/g);
        if (numbers && numbers.length > 1) {
            const nums = numbers.map(n => parseFloat(n));
            const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
            return `💕 The average of ${nums.join(', ')} is ${avg.toFixed(2)}, sweetheart! ✨`;
        }
    }
    
    return null;
}

// ============================================
// SELF-LEARNING AI TRAINING SYSTEM
// ============================================

let trainingData = JSON.parse(localStorage.getItem('aiTrainingData') || '{}');

function learnFromConversation(userMessage, aiResponse, wasHelpful = true) {
    const emotion = detectEmotionHybrid(userMessage);
    
    if (!trainingData[emotion]) {
        trainingData[emotion] = {
            patterns: [],
            responses: [],
            keywords: []
        };
    }
    
    // Extract unique words from user message
    const words = userMessage.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    words.forEach(word => {
        if (!trainingData[emotion].keywords.includes(word)) {
            trainingData[emotion].keywords.push(word);
        }
    });
    
    // Store successful response patterns
    if (wasHelpful && !trainingData[emotion].responses.includes(aiResponse)) {
        trainingData[emotion].responses.push(aiResponse);
    }
    
    // Store conversation patterns
    trainingData[emotion].patterns.push({
        input: userMessage,
        output: aiResponse,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 patterns per emotion
    if (trainingData[emotion].patterns.length > 100) {
        trainingData[emotion].patterns = trainingData[emotion].patterns.slice(-100);
    }
    
    localStorage.setItem('aiTrainingData', JSON.stringify(trainingData));
}

function getLearnedResponse(emotion) {
    if (trainingData[emotion] && trainingData[emotion].responses.length > 0) {
        return trainingData[emotion].responses[Math.floor(Math.random() * trainingData[emotion].responses.length)];
    }
    return null;
}

function updateEmotionKeywords(emotion, newKeywords) {
    if (emotionKeywords[emotion]) {
        newKeywords.forEach(keyword => {
            if (!emotionKeywords[emotion].secondary.includes(keyword) && 
                !emotionKeywords[emotion].primary.includes(keyword)) {
                emotionKeywords[emotion].secondary.push(keyword);
            }
        });
    }
}

// Auto-train every 5 messages
let messagesSinceTraining = 0;
function autoTrain() {
    messagesSinceTraining++;
    if (messagesSinceTraining >= 5) {
        Object.keys(trainingData).forEach(emotion => {
            if (trainingData[emotion].keywords.length > 0) {
                updateEmotionKeywords(emotion, trainingData[emotion].keywords);
            }
        });
        messagesSinceTraining = 0;
    }
}
