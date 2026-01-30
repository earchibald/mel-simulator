// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createHexRain();
    animateTextOnScroll();
});

// Hex Rain Animation
function createHexRain() {
    const hexRain = document.querySelector('.hex-rain');
    if (!hexRain) return;
    
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

// Text animation on scroll
function animateTextOnScroll() {
    const textBlocks = document.querySelectorAll('.story-text-block p');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.8s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    textBlocks.forEach((p, index) => {
        p.style.opacity = '0';
        p.style.animationDelay = `${index * 0.05}s`;
        observer.observe(p);
    });
}

// Add fadeIn animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
