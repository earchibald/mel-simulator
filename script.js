// Global State
let gameState = {
    deck: [],
    playerHand: [],
    dealerHand: [],
    gameOver: false,
    senseSwitch: false
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initBlackjack();
    initDrumVisualization();
    createHexRain();
    animateOnScroll();
});

// Navigation
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.story-section');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.dataset.section;
            
            // Update active button
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                    // Scroll to top of section
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    });
}

// Hex Rain Animation
function createHexRain() {
    const hexRain = document.querySelector('.hex-rain');
    if (!hexRain) return; // Exit if element doesn't exist
    
    const hexChars = '0123456789ABCDEF';
    const numColumns = 20;
    
    for (let i = 0; i < numColumns; i++) {
        const column = document.createElement('div');
        column.style.position = 'absolute';
        column.style.left = `${(i / numColumns) * 100}%`;
        column.style.top = '0';
        column.style.color = 'var(--primary)';
        column.style.opacity = '0.3';
        column.style.fontSize = '14px';
        column.style.animation = `fall ${5 + Math.random() * 10}s linear infinite`;
        column.style.animationDelay = `${Math.random() * 5}s`;
        
        let hexString = '';
        for (let j = 0; j < 20; j++) {
            hexString += hexChars[Math.floor(Math.random() * hexChars.length)] + '<br>';
        }
        column.innerHTML = hexString;
        
        hexRain.appendChild(column);
    }
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
        }
    `;
    document.head.appendChild(style);
}

// Drum Visualization
function initDrumVisualization() {
    const canvas = document.getElementById('drumCanvas');
    if (!canvas) return; // Exit if canvas doesn't exist
    
    const ctx = canvas.getContext('2d');
    const animateBtn = document.getElementById('animateDrum');
    if (!animateBtn) return;
    
    let animating = false;
    let rotation = 0;
    let instructions = [];
    
    // Generate random instructions
    for (let i = 0; i < 32; i++) {
        instructions.push({
            angle: (i / 32) * Math.PI * 2,
            address: i,
            opcode: Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0'),
            nextAddr: (i + 8) % 32, // Optimized spacing
            active: false
        });
    }
    
    function drawDrum() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 200;
        
        // Draw drum circle
        ctx.strokeStyle = '#00ff9f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw inner circle
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw read head
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath();
        ctx.arc(centerX, centerY - radius - 20, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw instructions
        instructions.forEach((instr, i) => {
            const angle = instr.angle + rotation;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Check if instruction is near read head
            const normalizedAngle = angle % (Math.PI * 2);
            const isNearHead = normalizedAngle < 0.2 || normalizedAngle > (Math.PI * 2 - 0.2);
            instr.active = isNearHead;
            
            // Draw instruction point
            ctx.fillStyle = instr.active ? '#00ff9f' : '#8892b0';
            ctx.beginPath();
            ctx.arc(x, y, instr.active ? 6 : 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw instruction text
            if (instr.active) {
                ctx.fillStyle = '#00ff9f';
                ctx.font = 'bold 14px Courier New';
                ctx.fillText(instr.opcode, x + 15, y + 5);
                
                // Draw connection to next instruction
                const nextInstr = instructions[instr.nextAddr];
                const nextAngle = nextInstr.angle + rotation;
                const nextX = centerX + Math.cos(nextAngle) * radius;
                const nextY = centerY + Math.sin(nextAngle) * radius;
                
                ctx.strokeStyle = 'rgba(0, 255, 159, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(nextX, nextY);
                ctx.stroke();
            }
        });
        
        // Draw center hub
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
        ctx.fill();
    }
    
    function animate() {
        if (animating) {
            rotation += 0.02;
            drawDrum();
            requestAnimationFrame(animate);
        }
    }
    
    animateBtn.addEventListener('click', () => {
        animating = !animating;
        animateBtn.textContent = animating ? 'Stop Animation' : 'Animate Drum Optimization';
        if (animating) {
            animate();
        }
    });
    
    // Initial draw
    drawDrum();
}

// Blackjack Game
function initBlackjack() {
    const senseSwitch = document.getElementById('senseSwitch');
    const switchStatus = document.getElementById('switchStatus');
    const hitBtn = document.getElementById('hitBtn');
    const standBtn = document.getElementById('standBtn');
    const newGameBtn = document.getElementById('newGameBtn');
    
    // Check if all required elements exist
    if (!senseSwitch || !switchStatus || !hitBtn || !standBtn || !newGameBtn) {
        return; // Exit if blackjack elements don't exist
    }
    
    senseSwitch.addEventListener('change', (e) => {
        gameState.senseSwitch = e.target.checked;
        switchStatus.textContent = gameState.senseSwitch ? 
            'ON - Dealer Cheats (Mel\'s "bug")' : 
            'OFF - Fair Play';
        switchStatus.style.color = gameState.senseSwitch ? 'var(--danger)' : 'var(--primary)';
    });
    
    hitBtn.addEventListener('click', playerHit);
    standBtn.addEventListener('click', playerStand);
    newGameBtn.addEventListener('click', startNewGame);
    
    startNewGame();
}

function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    
    for (let suit of suits) {
        for (let value of values) {
            deck.push({
                suit,
                value,
                numValue: value === 'A' ? 11 : (value === 'J' || value === 'Q' || value === 'K' ? 10 : parseInt(value))
            });
        }
    }
    
    return shuffleDeck(deck);
}

function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    
    for (let card of hand) {
        score += card.numValue;
        if (card.value === 'A') aces++;
    }
    
    // Adjust for aces
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

function createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card ' + (card.suit === '♥' || card.suit === '♦' ? 'red' : 'black');
    cardEl.innerHTML = `
        <div class="card-value">${card.value}</div>
        <div class="card-suit">${card.suit}</div>
        <div class="card-value">${card.value}</div>
    `;
    return cardEl;
}

function startNewGame() {
    gameState.deck = createDeck();
    gameState.playerHand = [];
    gameState.dealerHand = [];
    gameState.gameOver = false;
    
    // Clear displays
    document.getElementById('playerCards').innerHTML = '';
    document.getElementById('dealerCards').innerHTML = '';
    document.getElementById('gameMessage').textContent = '';
    
    // Deal initial cards
    dealCard(gameState.playerHand, 'playerCards');
    dealCard(gameState.dealerHand, 'dealerCards');
    dealCard(gameState.playerHand, 'playerCards');
    dealCard(gameState.dealerHand, 'dealerCards');
    
    updateScores();
    updateButtons();
    
    // Check for immediate blackjack
    if (calculateScore(gameState.playerHand) === 21) {
        endGame();
    }
}

function dealCard(hand, containerId) {
    const card = gameState.deck.pop();
    hand.push(card);
    
    const container = document.getElementById(containerId);
    const cardEl = createCardElement(card);
    container.appendChild(cardEl);
}

function playerHit() {
    if (gameState.gameOver) return;
    
    dealCard(gameState.playerHand, 'playerCards');
    updateScores();
    
    if (calculateScore(gameState.playerHand) > 21) {
        endGame();
    }
}

function playerStand() {
    if (gameState.gameOver) return;
    
    gameState.gameOver = true;
    
    // Dealer's turn - deal cards sequentially
    const dealDealerCard = () => {
        const dealerScore = calculateScore(gameState.dealerHand);
        const playerScore = calculateScore(gameState.playerHand);
        
        // If sense switch is ON (Mel's bug), dealer cheats
        if (gameState.senseSwitch) {
            // Dealer draws until they beat player or bust
            if (dealerScore < 21 && dealerScore <= playerScore) {
                dealCard(gameState.dealerHand, 'dealerCards');
                updateScores();
                setTimeout(dealDealerCard, 500);
            } else {
                setTimeout(endGame, 500);
            }
        } else {
            // Normal dealer logic - hit until 17
            if (dealerScore < 17) {
                dealCard(gameState.dealerHand, 'dealerCards');
                updateScores();
                setTimeout(dealDealerCard, 500);
            } else {
                setTimeout(endGame, 500);
            }
        }
    };
    
    dealDealerCard();
}

function endGame() {
    gameState.gameOver = true;
    
    const playerScore = calculateScore(gameState.playerHand);
    const dealerScore = calculateScore(gameState.dealerHand);
    
    let message = '';
    
    if (playerScore > 21) {
        message = '💥 BUST! You lose.';
    } else if (dealerScore > 21) {
        message = '🎉 Dealer busts! You win!';
    } else if (playerScore > dealerScore) {
        message = '🎉 You win!';
    } else if (dealerScore > playerScore) {
        message = '😞 Dealer wins.';
        if (gameState.senseSwitch) {
            message += ' (Sense switch ON - dealer cheated!)';
        }
    } else {
        message = '🤝 Push (tie).';
    }
    
    document.getElementById('gameMessage').textContent = message;
    updateButtons();
}

function updateScores() {
    const playerScore = calculateScore(gameState.playerHand);
    const dealerScore = calculateScore(gameState.dealerHand);
    
    document.getElementById('playerScore').textContent = `Score: ${playerScore}`;
    document.getElementById('dealerScore').textContent = `Score: ${dealerScore}`;
}

function updateButtons() {
    const hitBtn = document.getElementById('hitBtn');
    const standBtn = document.getElementById('standBtn');
    
    hitBtn.disabled = gameState.gameOver;
    standBtn.disabled = gameState.gameOver;
}

// Scroll animations
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.story-text, .code-example, .memory-diagram').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'all 0.8s ease-out';
        observer.observe(el);
    });
}

// Easter eggs and interactivity
let keySequence = []; // Persist key sequence across keypresses
let sequenceTimer = null;

document.addEventListener('keydown', (e) => {
    // Clear old sequence after 2 seconds of inactivity
    clearTimeout(sequenceTimer);
    sequenceTimer = setTimeout(() => {
        keySequence = [];
    }, 2000);
    
    // Add key to sequence
    keySequence.push(e.key.toLowerCase());
    
    // Keep only last 3 keys
    if (keySequence.length > 3) {
        keySequence.shift();
    }
    
    // Check for M-E-L sequence
    if (keySequence.join('') === 'mel') {
        // Trigger special effect
        document.body.style.animation = 'rainbow 2s linear';
        setTimeout(() => {
            document.body.style.animation = '';
            keySequence = [];
        }, 2000);
    }
});

// Add rainbow animation
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Add click ripple effect to buttons
document.addEventListener('click', (e) => {
    if (e.target.matches('button')) {
        const ripple = document.createElement('span');
        const rect = e.target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');
        
        e.target.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
});

// Add pulsing effect to hex bytes when they appear on screen
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.animation = `hex-glow 2s infinite`;
            }, index * 100);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.hex-byte').forEach(el => observer.observe(el));

// Performance optimization: pause animations when not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when tab is not visible
        document.querySelectorAll('.drum-memory, .light').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    } else {
        // Resume animations
        document.querySelectorAll('.drum-memory, .light').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
});
