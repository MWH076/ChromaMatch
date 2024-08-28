let score = 0;
let highscore = parseInt(localStorage.getItem('highscore')) || 0;
let coins = parseInt(localStorage.getItem('coins')) || 0;
let earnedCoins = 0;
let difficulty;
let targetAttribute;
let brightnessTarget;
let unlockedPacks = JSON.parse(localStorage.getItem('unlockedPacks')) || ['default-pack'];
let currentPack = localStorage.getItem('currentPack') || 'default-pack';

document.body.className = currentPack;

document.getElementById('main-highscore').innerText = highscore;
document.getElementById('main-coins').innerText = coins;

function showScreen(screen) {
    document.querySelectorAll('.menu, .game, .shop, .inventory, .settings, .leaderboard, .game-over, .challenge-selection').forEach(div => div.classList.remove('active'));
    document.getElementById(screen).classList.add('active');

    if (screen === 'shop') {
        document.getElementById('shop-coins').innerText = coins;
    } else if (screen === 'menu') {
        document.getElementById('main-coins').innerText = coins;
    }
}

function selectDifficulty(selectedDifficulty) {
    difficulty = selectedDifficulty;
    showScreen('challenge-selection');
}

function selectChallenge(selectedChallenge) {
    targetAttribute = selectedChallenge;
    if (selectedChallenge === 'brightness') {
        brightnessTarget = Math.random() < 0.5 ? 'brighter' : 'darker';
    }
    document.getElementById('challenge-description').innerText = `You selected ${selectedChallenge}. You'll need to find the ${brightnessTarget || targetAttribute} square.`;
    showScreen('challenge-preview');
}

function startGame() {
    score = 0;
    earnedCoins = 0;
    document.getElementById('score').innerText = score;
    document.getElementById('highscore').innerText = highscore;
    document.getElementById('coins').innerText = coins;
    showScreen('game');
    generateColorOptions();
}

function generateColorOptions() {
    const colorOptionsContainer = document.getElementById('color-options');
    colorOptionsContainer.innerHTML = '';
    const baseColor = getRandomColor();
    const colorOptions = [];
    const numberOfOptions = difficulty === 'easy' ? 3 : difficulty === 'normal' ? 4 : 5;

    for (let i = 0; i < numberOfOptions; i++) {
        colorOptions.push(createSimilarColor(baseColor, i === 0));
    }

    shuffleArray(colorOptions);

    colorOptions.forEach(colorOption => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'color-option';
        colorDiv.style.backgroundColor = colorOption.color;
        colorDiv.onclick = () => checkColor(colorOption.isCorrect);
        colorOptionsContainer.appendChild(colorDiv);
    });
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createSimilarColor(baseColor, isCorrect) {
    const difference = isCorrect ? 0 : 20;
    let [r, g, b] = hexToRgb(baseColor);

    if (!isCorrect) {
        switch (targetAttribute) {
            case 'brightness':
                const adjustment = brightnessTarget === 'brighter' ? difference : -difference;
                r = clamp(r + adjustment);
                g = clamp(g + adjustment);
                b = clamp(b + adjustment);
                break;
            case 'hue':
                [r, g, b] = adjustHue(r, g, b, difference);
                break;
            case 'saturation':
                [r, g, b] = adjustSaturation(r, g, b, difference);
                break;
        }
    }

    return { color: rgbToHex(r, g, b), isCorrect };
}

function adjustHue(r, g, b, difference) {
    let hsl = rgbToHsl(r, g, b);
    hsl[0] = (hsl[0] + difference / 360) % 1;
    return hslToRgb(...hsl);
}

function adjustSaturation(r, g, b, difference) {
    let hsl = rgbToHsl(r, g, b);
    hsl[1] = clamp(hsl[1] + difference / 100);
    return hslToRgb(...hsl);
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function clamp(value) {
    return Math.max(0, Math.min(255, value));
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function checkColor(isCorrect) {
    if (isCorrect) {
        score += 10;
        earnedCoins += 5;
        document.getElementById('score').innerText = score;
        generateColorOptions();
    } else {
        endGame();
    }
}

function endGame() {
    if (score > highscore) {
        highscore = score;
        localStorage.setItem('highscore', highscore);
        document.getElementById('highscore').innerText = highscore;
        document.getElementById('highscore-message').classList.remove('hidden');
    } else {
        document.getElementById('highscore-message').classList.add('hidden');
    }
    coins += earnedCoins;
    localStorage.setItem('coins', coins);
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-coins').innerText = earnedCoins;
    showScreen('game-over');
}

function resetGame() {
    showScreen('menu');
}

function loadShopItems() {
    const shopItemsContainer = document.getElementById('shop-items');
    shopItemsContainer.innerHTML = '';

    const themes = [
        { name: 'Pink Pack', className: 'pink-pack', cost: 50, colors: ['#FFC0CB', '#FFB6C1', '#FF69B4', '#DB7093'] },
        { name: 'Blue Pack', className: 'blue-pack', cost: 100, colors: ['#ADD8E6', '#87CEEB', '#4682B4', '#1E90FF'] },
        { name: 'Green Pack', className: 'green-pack', cost: 150, colors: ['#98FB98', '#90EE90', '#00FA9A', '#3CB371'] },
    ];

    themes.forEach(theme => {
        const themeDiv = document.createElement('div');
        themeDiv.className = 'shop-item';

        const previewDiv = document.createElement('div');
        previewDiv.className = 'preview';
        theme.colors.forEach(color => {
            const colorBox = document.createElement('div');
            colorBox.style.backgroundColor = color;
            previewDiv.appendChild(colorBox);
        });

        const nameDiv = document.createElement('div');
        nameDiv.innerText = theme.name;

        const costDiv = document.createElement('div');
        costDiv.innerText = `${theme.cost} coins`;

        const button = document.createElement('button');
        if (unlockedPacks.includes(theme.className)) {
            button.className = 'disabled';
            button.innerText = 'Owned';
        } else if (coins >= theme.cost) {
            button.innerText = 'Buy';
            button.onclick = () => purchaseTheme(theme.className, theme.cost);
        } else {
            button.className = 'disabled';
            button.innerText = 'Buy';
        }

        themeDiv.appendChild(previewDiv);
        themeDiv.appendChild(nameDiv);
        themeDiv.appendChild(costDiv);
        themeDiv.appendChild(button);
        shopItemsContainer.appendChild(themeDiv);
    });
}

function purchaseTheme(themeClass, cost) {
    if (coins >= cost) {
        coins -= cost;
        unlockedPacks.push(themeClass);
        localStorage.setItem('coins', coins);
        localStorage.setItem('unlockedPacks', JSON.stringify(unlockedPacks));
        loadShopItems();
        loadInventoryItems();
        alert(`${themeClass.replace('-pack', ' Pack')} unlocked!`);
    } else {
        alert('Not enough coins!');
    }
}

function loadInventoryItems() {
    const inventoryItemsContainer = document.getElementById('inventory-items');
    inventoryItemsContainer.innerHTML = '';

    unlockedPacks.forEach(pack => {
        const packDiv = document.createElement('div');
        packDiv.className = 'inventory-item';
        packDiv.innerText = pack.replace('-pack', ' Pack');

        const button = document.createElement('button');
        if (pack === currentPack) {
            button.innerText = 'Selected';
            button.className = 'disabled';
        } else {
            button.innerText = 'Select';
            button.onclick = () => switchPack(pack);
        }

        packDiv.appendChild(button);
        inventoryItemsContainer.appendChild(packDiv);
    });
}

function switchPack(packClass) {
    document.body.className = packClass;
    currentPack = packClass;
    localStorage.setItem('currentPack', currentPack);
    loadInventoryItems();
    alert(`${packClass.replace('-pack', ' Pack')} selected!`);
}

document.addEventListener('DOMContentLoaded', () => {
    loadShopItems();
    loadInventoryItems();
});