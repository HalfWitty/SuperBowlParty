let names = [];
let isSpinning = false;

// Array of colors for the cycling names
const colors = [
    '#FF6B6B', // Coral Red
    '#4ECDC4', // Turquoise
    '#45B7D1', // Sky Blue
    '#96CEB4', // Sage Green
    '#FFEEAD', // Cream Yellow
    '#D4A5A5', // Dusty Rose
    '#9B59B6', // Purple
    '#3498DB', // Blue
    '#E67E22', // Orange
    '#2ECC71'  // Green
];

// Create audio object
const winSound = new Audio('WinSound.wav');

const style = document.createElement('style');
style.textContent = `
    @keyframes winnerPop {
        0% { transform: scale(1); }
        50% { transform: scale(2); }
        75% { transform: scale(1.75); }
        100% { transform: scale(2); }
    }
    .winner-animation {
        animation: winnerPop 0.5s ease-out forwards;
    }
`;
document.head.appendChild(style);

function fetchData() {
    const errorMessageElement = document.getElementById('errorMessage');
    
    const callbackName = 'jsonpCallback_' + Date.now();
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbwXsg-5vW2_89zyLUQhBSengSB-FUBJivMZdSgReQ83SuTaG2botkPshltorQiGJPKo2A/exec?callback=' + callbackName;
    
    const script = document.createElement('script');
    script.src = scriptUrl;
    
    window[callbackName] = function(data) {
        try {
            if (data && data.status === 'success' && Array.isArray(data.names)) {
                names = data.names.filter(name => name && typeof name === 'string');
                updateDisplay();
                errorMessageElement.textContent = '';
            } else {
                throw new Error('Invalid data format received from server');
            }
        } catch (error) {
            console.error('Error processing data:', error);
            errorMessageElement.textContent = 'Error loading names. Please refresh the page to try again.';
            document.getElementById('spinButton').disabled = true;
        } finally {
            document.body.removeChild(script);
            delete window[callbackName];
        }
    };
    
    script.onerror = function() {
        console.error('Script loading failed');
        errorMessageElement.textContent = 'Error loading names. Please refresh the page to try again.';
        document.getElementById('spinButton').disabled = true;
        document.body.removeChild(script);
        delete window[callbackName];
    };
    
    document.body.appendChild(script);
}

function updateDisplay() {
    const totalCount = document.getElementById('totalCount');
    const topFiveList = document.getElementById('topFiveList');
    const spinButton = document.getElementById('spinButton');
    
    if (names.length === 0) {
        totalCount.textContent = '0';
        topFiveList.innerHTML = '<div class="name-entry">No entries yet</div>';
        spinButton.disabled = true;
        return;
    }

    totalCount.textContent = names.length;
    spinButton.disabled = false;

    const nameCounts = {};
    names.forEach(name => {
        nameCounts[name] = (nameCounts[name] || 0) + 1;
    });

    const sortedNames = Object.entries(nameCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

    const topFiveHtml = sortedNames
        .map(([name, count]) => `
            <div class="name-entry">
                <span>${name}</span>
                <span>${count}</span>
            </div>
        `)
        .join('');
    topFiveList.innerHTML = topFiveHtml || '<div class="name-entry">No entries yet</div>';
}

function fireConfetti() {
    // Test if confetti is available
    if (typeof confetti === 'undefined') {
        console.error('Confetti library not loaded');
        return;
    }

    // Fire confetti with more particles and longer duration
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors
    });

    // Side cannons
    setTimeout(() => {
        confetti({
            particleCount: 75,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.5 },
            colors: colors
        });
        confetti({
            particleCount: 75,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.5 },
            colors: colors
        });
    }, 250);

    // Finale
    setTimeout(() => {
        confetti({
            particleCount: 200,
            spread: 160,
            origin: { y: 0.6 },
            colors: colors,
            startVelocity: 45,
        });
    }, 500);
}

function spinWheel() {
    if (isSpinning || names.length === 0) return;
    
    const spinButton = document.getElementById('spinButton');
    const winnerDisplay = document.getElementById('winnerName');
    
    // Reset any previous winner animation
    winnerDisplay.classList.remove('winner-animation');
    
   // Play sound on button press
    winSound.currentTime = 0; // Reset to start
    winSound.volume = 1;    // Set volume to 80%
    winSound.play().catch(error => console.log('Audio play failed:', error));
    
    isSpinning = true;
    spinButton.disabled = true;
    winnerDisplay.classList.add('spinning');
    
    let duration = 10000; // Changed to 13 seconds
    let startTime = Date.now();
    let colorIndex = 0;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (elapsed < duration) {
            const randomName = names[Math.floor(Math.random() * names.length)];
            winnerDisplay.textContent = randomName;
            winnerDisplay.style.color = colors[colorIndex];
            colorIndex = (colorIndex + 1) % colors.length;
            
            // Adjust interval based on progress to slow down gradually
            let interval;
            if (progress < 0.3) {
                // Start fast - 50ms between changes
                interval = 50;
            } else if (progress < 0.7) {
                // Gradually slow down - 50ms to 200ms
                interval = 50 + (progress * 300);
            } else {
                // Final slowdown - 200ms to 500ms
                interval = 200 + ((progress - 0.7) * 1000);
            }
            
            setTimeout(animate, interval);
        } else {
            const winner = names[Math.floor(Math.random() * names.length)];
            winnerDisplay.textContent = winner;
            winnerDisplay.style.color = '#0066cc';
            winnerDisplay.classList.remove('spinning');
            
            // Add winner animation
            winnerDisplay.classList.add('winner-animation');

            // Fire confetti
            setTimeout(fireConfetti, 100);       
            
            isSpinning = false;
            spinButton.disabled = false;
        }
    }
    
    animate();
}
// Add error handling for button clicks when no data is available
document.getElementById('spinButton').addEventListener('click', () => {
    if (names.length === 0) {
        document.getElementById('errorMessage').textContent = 'No names available to pick from';
        return;
    }
    spinWheel();
});

// Initial data fetch
fetchData();

// Refresh data every 30 seconds
setInterval(fetchData, 30000);

