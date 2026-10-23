// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createHexRain();
    animateTextOnScroll();
    initDrumAnimation();
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

// Drum Memory Animation
function initDrumAnimation() {
    const canvas = document.getElementById('drum-animation-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const drumRadius = 55;
    
    let rotation = 0;
    const rotationSpeed = 0.01; // RPM simulation
    
    // Multiple tracks along the drum
    const tracksPerBand = 4;
    const bandHeight = 15;
    
    // Simulate data stored on drum
    const drumData = [];
    for (let track = 0; track < tracksPerBand; track++) {
        const trackData = [];
        for (let sector = 0; sector < 16; sector++) {
            trackData.push({
                data: Math.random().toString(16).substring(2, 5).toUpperCase(),
                address: sector,
                track: track
            });
        }
        drumData.push(trackData);
    }
    
    function drawDrumMemory() {
        // Clear canvas with semi-transparent background
        ctx.fillStyle = 'rgba(10, 14, 39, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw drum cylinder (side view showing multiple tracks)
        ctx.save();
        
        // Draw the drum as concentric circles for each track
        for (let track = 0; track < tracksPerBand; track++) {
            const trackRadius = drumRadius - (track * 12);
            
            // Track circle
            ctx.strokeStyle = track === 0 ? '#00ff9f' : '#ff6b35';
            ctx.lineWidth = track === 0 ? 3 : 2;
            ctx.globalAlpha = 1 - (track * 0.15);
            ctx.shadowColor = track === 0 ? '#00ff9f' : '#ff6b35';
            ctx.shadowBlur = track === 0 ? 15 : 8;
            ctx.beginPath();
            ctx.arc(centerX, centerY, trackRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            
            // Draw data sectors on this track
            const trackDataPoints = drumData[track];
            const sectorsPerTrack = trackDataPoints.length;
            
            trackDataPoints.forEach((sector, index) => {
                const sectorAngle = (index / sectorsPerTrack) * Math.PI * 2;
                const angle = sectorAngle + rotation;
                
                const x = centerX + Math.cos(angle) * trackRadius;
                const y = centerY + Math.sin(angle) * trackRadius;
                
                // Draw data block
                ctx.fillStyle = track === 0 ? '#00ff9f' : '#ff6b35';
                ctx.globalAlpha = 0.7;
                ctx.fillRect(x - 8, y - 4, 16, 8);
                ctx.globalAlpha = 1;
                
                // Draw data value
                ctx.fillStyle = '#0a0e27';
                ctx.font = 'bold 6px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(sector.data, x, y);
            });
        }
        
        // Draw read-write heads (fixed along the drum axis)
        const headPositions = [0, 60, 120, 180]; // Angles for multiple heads
        
        headPositions.forEach((headAngle, headIndex) => {
            const headX = centerX + Math.cos((headAngle * Math.PI) / 180) * (drumRadius + 20);
            const headY = centerY + Math.sin((headAngle * Math.PI) / 180) * (drumRadius + 20);
            
            // Head indicator
            ctx.fillStyle = '#ffd23f';
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(headX, headY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            
            // Connection line to drum
            ctx.strokeStyle = '#ffd23f';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.moveTo(headX, headY);
            const drumEdgeX = centerX + Math.cos((headAngle * Math.PI) / 180) * drumRadius;
            const drumEdgeY = centerY + Math.sin((headAngle * Math.PI) / 180) * drumRadius;
            ctx.lineTo(drumEdgeX, drumEdgeY);
            ctx.stroke();
            ctx.globalAlpha = 1;
        });
        
        // Draw rotation indicator
        const arrowAngle = rotation;
        const arrowLength = 40;
        const arrowX = centerX + Math.cos(arrowAngle) * arrowLength;
        const arrowY = centerY + Math.sin(arrowAngle) * arrowLength;
        
        ctx.strokeStyle = '#ffd23f';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(arrowX, arrowY);
        ctx.stroke();
        
        // Arrowhead
        const headlen = 6;
        const angle1 = arrowAngle + Math.PI / 6;
        const angle2 = arrowAngle - Math.PI / 6;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - headlen * Math.cos(angle1), arrowY - headlen * Math.sin(angle1));
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - headlen * Math.cos(angle2), arrowY - headlen * Math.sin(angle2));
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Draw annotations
        ctx.fillStyle = '#00ff9f';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.globalAlpha = 0.8;
        ctx.fillText('ROTATING DRUM', centerX + 70, centerY - 60);
        ctx.font = '8px monospace';
        ctx.fillText('Read-Write Heads', centerX + 70, centerY - 45);
        ctx.fillText('Multiple Tracks', centerX + 70, centerY - 30);
        ctx.globalAlpha = 1;
        
        ctx.restore();
        
        // Update rotation
        rotation += rotationSpeed;
    }
    
    function animate() {
        drawDrumMemory();
        requestAnimationFrame(animate);
    }
    
    animate();
}

