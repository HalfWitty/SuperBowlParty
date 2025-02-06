let names = [];
let isSpinning = false;

async function fetchData() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbwXsg-5vW2_89zyLUQhBSengSB-FUBJivMZdSgReQ83SuTaG2botkPshltorQiGJPKo2A/exec', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const responseData = await response.text();
        const data = JSON.parse(responseData);
        
        if (data && data.status === 'success' && Array.isArray(data.names)) {
            names = data.names;
            updateDisplay();
        } else {
            console.error('Invalid data format:', data);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function updateDisplay() {
    document.getElementById('totalCount').textContent = names.length;

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
    document.getElementById('topFiveList').innerHTML = topFiveHtml;
}

function spinWheel() {
    if (isSpinning) return;
    
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

document.getElementById('spinButton').addEventListener('click', spinWheel);
fetchData();