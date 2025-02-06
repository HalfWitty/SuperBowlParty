let names = [];
let isSpinning = false;

function fetchData() {
    const errorMessageElement = document.getElementById('errorMessage');
    
    // Create a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) { // Request completed
            try {
                const data = JSON.parse(xhr.responseText);
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
            }
        }
    };
    
    // Open and send the request
    xhr.open('GET', 'https://script.google.com/macros/s/AKfycbwXsg-5vW2_89zyLUQhBSengSB-FUBJivMZdSgReQ83SuTaG2botkPshltorQiGJPKo2A/exec', true);
    xhr.send();
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

function spinWheel() {
    if (isSpinning || names.length === 0) return;
    
    const spinButton = document.getElementById('spinButton');
    const winnerDisplay = document.getElementById('winnerName');
    
    isSpinning = true;
    spinButton.disabled = true;
    winnerDisplay.classList.add('spinning');
    
    let duration = 3000;
    let interval = 50;
    let startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (elapsed < duration) {
            const randomName = names[Math.floor(Math.random() * names.length)];
            winnerDisplay.textContent = randomName;
            
            interval = 50 + (progress * 200);
            setTimeout(animate, interval);
        } else {
            const winner = names[Math.floor(Math.random() * names.length)];
            winnerDisplay.textContent = winner;
            winnerDisplay.classList.remove('spinning');
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
