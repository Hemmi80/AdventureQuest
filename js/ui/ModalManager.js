// ============================================
// REALMQUEST - Modal Manager
// Handles all UI modals (inventory, quests, shop, dialogue)
// ============================================

// Global modal functions that can be called from anywhere

// Close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
    
    // Resume game if player exists
    if (window.gameState && window.gameState.player) {
        // End any NPC interactions
        const gameScene = window.gameState.player.scene;
        if (gameScene && gameScene.npcs) {
            gameScene.npcs.forEach(npc => npc.endInteraction());
        }
    }
}

// ============================================
// INVENTORY MODAL
// ============================================

function toggleInventory() {
    const modal = document.getElementById('inventory-modal');
    if (modal.classList.contains('hidden')) {
        openInventory();
    } else {
        closeInventory();
    }
}

function openInventory() {
    closeAllModals();
    const modal = document.getElementById('inventory-modal');
    modal.classList.remove('hidden');
    updateInventoryDisplay();
}

function closeInventory() {
    document.getElementById('inventory-modal').classList.add('hidden');
}

function updateInventoryDisplay() {
    const player = window.gameState.player;
    if (!player) return;
    
    // Update equipment slots
    const equipment = player.inventory.getEquipmentDisplay();
    
    for (const slot in equipment) {
        const slotElement = document.getElementById(`equipped-${slot}`);
        if (slotElement) {
            if (equipment[slot]) {
                slotElement.innerHTML = `
                    <span class="item-icon">${equipment[slot].icon}</span>
                    <span class="item-name">${equipment[slot].name}</span>
                `;
                slotElement.classList.remove('empty');
                slotElement.onclick = () => unequipItem(slot);
            } else {
                slotElement.innerHTML = '';
                slotElement.classList.add('empty');
                slotElement.onclick = null;
            }
        }
    }
    
    // Update stats panel
    const statsPanel = document.getElementById('player-stats-panel');
    const stats = player.stats;
    statsPanel.innerHTML = `
        <div class="stat-row"><span class="stat-label">Attack:</span><span class="stat-value">${stats.attack}</span></div>
        <div class="stat-row"><span class="stat-label">Defense:</span><span class="stat-value">${stats.defense}</span></div>
        <div class="stat-row"><span class="stat-label">Speed:</span><span class="stat-value">${stats.speed}</span></div>
        <div class="stat-row"><span class="stat-label">Crit Chance:</span><span class="stat-value">${Math.round(stats.critChance * 100)}%</span></div>
    `;
    
    // Update inventory grid
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '';
    
    const inventoryItems = player.inventory.getInventoryDisplay();
    
    for (const item of inventoryItems) {
        const slot = document.createElement('div');
        slot.className = `inventory-slot rarity-${item.rarity}`;
        slot.innerHTML = `
            <span class="item-icon">${item.icon}</span>
            <span class="item-name">${item.name}</span>
            ${item.quantity > 1 ? `<span class="item-qty">${item.quantity}</span>` : ''}
        `;
        
        slot.onclick = () => handleItemClick(item);
        slot.oncontextmenu = (e) => {
            e.preventDefault();
            handleItemRightClick(item);
        };
        
        grid.appendChild(slot);
    }
    
    // Fill empty slots
    const emptySlots = player.inventory.maxSlots - inventoryItems.length;
    for (let i = 0; i < emptySlots; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        grid.appendChild(slot);
    }
}

function handleItemClick(item) {
    const player = window.gameState.player;
    if (!player) return;
    
    if (item.type === 'consumable') {
        // Use consumable
        player.inventory.useItem(item.itemId, player);
        updateInventoryDisplay();
    } else if (['weapon', 'armor', 'helmet', 'accessory'].includes(item.type)) {
        // Equip item
        player.inventory.equipItem(item.itemId);
        player.recalculateStats();
        updateInventoryDisplay();
    }
}

function handleItemRightClick(item) {
    // Could show item details or sell option
    console.log('Right clicked:', item.name);
}

function unequipItem(slot) {
    const player = window.gameState.player;
    if (!player) return;
    
    player.inventory.unequipItem(slot);
    player.recalculateStats();
    updateInventoryDisplay();
}

// ============================================
// QUEST LOG MODAL
// ============================================

function toggleQuestLog() {
    const modal = document.getElementById('quest-modal');
    if (modal.classList.contains('hidden')) {
        openQuestLog();
    } else {
        closeQuestLog();
    }
}

function openQuestLog() {
    closeAllModals();
    const modal = document.getElementById('quest-modal');
    modal.classList.remove('hidden');
    updateQuestDisplay();
}

function closeQuestLog() {
    document.getElementById('quest-modal').classList.add('hidden');
}

function updateQuestDisplay() {
    const player = window.gameState.player;
    if (!player) return;
    
    const questList = document.getElementById('quest-list');
    questList.innerHTML = '';
    
    const quests = player.quests.getQuestDisplay();
    
    if (quests.length === 0) {
        questList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p>No active quests</p>
                <p style="font-size: 0.9em;">Talk to NPCs to find quests!</p>
            </div>
        `;
        return;
    }
    
    for (const quest of quests) {
        const questItem = document.createElement('div');
        questItem.className = `quest-item ${quest.isComplete ? 'completed' : ''}`;
        
        const objectivesHtml = quest.objectives.map(obj => `
            <li class="${obj.complete ? 'complete' : ''}">${obj.text}</li>
        `).join('');
        
        questItem.innerHTML = `
            <div class="quest-title">${quest.isComplete ? '✅ ' : ''}${quest.name}</div>
            <div class="quest-description">${quest.description}</div>
            <ul class="quest-objectives">${objectivesHtml}</ul>
            <div class="quest-rewards">
                <span class="xp">⭐ ${quest.rewards.xp} XP</span>
                <span class="gold">💰 ${quest.rewards.gold} Gold</span>
            </div>
        `;
        
        questList.appendChild(questItem);
    }
}

// ============================================
// SHOP MODAL
// ============================================

function openShop(shopData) {
    closeAllModals();
    const modal = document.getElementById('shop-modal');
    modal.classList.remove('hidden');
    
    document.getElementById('shop-title').textContent = `🏪 ${shopData.name}`;
    updateShopDisplay(shopData);
}

function closeShop() {
    document.getElementById('shop-modal').classList.add('hidden');
}

function updateShopDisplay(shopData) {
    const player = window.gameState.player;
    if (!player) return;
    
    const shopItems = document.getElementById('shop-items');
    shopItems.innerHTML = '';
    
    for (const item of shopData.items) {
        const itemDiv = document.createElement('div');
        itemDiv.className = `shop-item rarity-${item.rarity}`;
        itemDiv.innerHTML = `
            <span class="item-icon">${item.icon}</span>
            <span class="item-name">${item.name}</span>
            <span class="item-price">💰 ${item.price}</span>
        `;
        
        itemDiv.onclick = () => selectShopItem(item, shopData);
        
        shopItems.appendChild(itemDiv);
    }
    
    // Update player gold
    document.getElementById('shop-player-gold').textContent = player.inventory.gold;
    
    // Clear selection
    document.getElementById('selected-item-info').innerHTML = `
        <p style="color: #666; text-align: center;">Click an item to see details</p>
    `;
}

let selectedShopItem = null;

function selectShopItem(item, shopData) {
    selectedShopItem = item;
    
    const infoDiv = document.getElementById('selected-item-info');
    
    let statsHtml = '';
    if (item.stats) {
        statsHtml = '<div class="item-stats">';
        for (const stat in item.stats) {
            const value = item.stats[stat];
            const sign = value >= 0 ? '+' : '';
            statsHtml += `<div>${stat}: ${sign}${value}</div>`;
        }
        statsHtml += '</div>';
    }
    
    infoDiv.innerHTML = `
        <h4 style="color: var(--rarity-${item.rarity})">${item.icon} ${item.name}</h4>
        <p>${item.description}</p>
        ${statsHtml}
        <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="buySelectedItem()">
            Buy for 💰 ${item.price}
        </button>
    `;
}

function buySelectedItem() {
    if (!selectedShopItem) return;
    
    const player = window.gameState.player;
    if (!player) return;
    
    const result = player.inventory.buyItem(selectedShopItem.id);
    
    if (result.success) {
        // Update displays
        document.getElementById('shop-player-gold').textContent = player.inventory.gold;
        
        // Show feedback
        const infoDiv = document.getElementById('selected-item-info');
        infoDiv.innerHTML += `<p style="color: #32cd32; margin-top: 10px;">✓ ${result.message}</p>`;
    } else {
        alert(result.message);
    }
}

// ============================================
// DIALOGUE MODAL
// ============================================

let currentNPC = null;
let currentPlayer = null;

function showDialogue(npc, player) {
    closeAllModals();
    currentNPC = npc;
    currentPlayer = player;
    
    const modal = document.getElementById('dialogue-modal');
    modal.classList.remove('hidden');
    
    // Set NPC info
    document.getElementById('npc-name').textContent = `${npc.name} - ${npc.title}`;
    
    // Show greeting
    showDialogueText(npc.npcData.dialogue.greeting);
    showDialogueOptions(npc.getDialogueOptions(player));
}

function closeDialogue() {
    document.getElementById('dialogue-modal').classList.add('hidden');
    if (currentNPC) {
        currentNPC.endInteraction();
    }
    currentNPC = null;
    currentPlayer = null;
}

function showDialogueText(text) {
    document.getElementById('dialogue-text').textContent = text;
}

function showDialogueOptions(options) {
    const optionsDiv = document.getElementById('dialogue-options');
    optionsDiv.innerHTML = '';
    
    for (const option of options) {
        const btn = document.createElement('button');
        btn.className = 'dialogue-option';
        if (option.isQuest) btn.className += ' quest-option';
        if (option.action === 'openShop') btn.className += ' shop-option';
        
        btn.textContent = option.text;
        btn.onclick = () => handleDialogueOption(option);
        
        optionsDiv.appendChild(btn);
    }
}

function handleDialogueOption(option) {
    if (!currentNPC || !currentPlayer) return;
    
    switch (option.action) {
        case 'close':
            closeDialogue();
            break;
            
        case 'showQuests':
            showAvailableQuests();
            break;
            
        case 'openShop':
            const shop = currentNPC.getShop();
            if (shop) {
                closeDialogue();
                openShop(shop);
            }
            break;
            
        case 'openClassSelect':
            closeDialogue();
            showClassSelection();
            break;
            
        case 'turnInQuest':
            turnInQuest(option.questId);
            break;
            
        default:
            // Just a response
            if (option.response) {
                showDialogueText(option.response);
                showDialogueOptions([
                    { text: "Thanks!", action: 'close' }
                ]);
            }
    }
}

function showAvailableQuests() {
    const quests = currentNPC.getAvailableQuests(currentPlayer);
    
    if (quests.length === 0) {
        showDialogueText("I have no quests for you at the moment. Come back later!");
        showDialogueOptions([{ text: "Alright.", action: 'close' }]);
        return;
    }
    
    // Show quest selection
    const options = quests.map(quest => ({
        text: `📜 ${quest.name}`,
        action: 'viewQuest',
        quest: quest
    }));
    options.push({ text: "Never mind.", action: 'close' });
    
    showDialogueText("I have some tasks that need doing. Which interests you?");
    
    const optionsDiv = document.getElementById('dialogue-options');
    optionsDiv.innerHTML = '';
    
    for (const option of options) {
        const btn = document.createElement('button');
        btn.className = 'dialogue-option quest-option';
        btn.textContent = option.text;
        btn.onclick = () => {
            if (option.quest) {
                showQuestDetails(option.quest);
            } else {
                handleDialogueOption(option);
            }
        };
        optionsDiv.appendChild(btn);
    }
}

function showQuestDetails(quest) {
    const objectivesText = quest.objectives.map(obj => {
        if (obj.type === 'kill') {
            const enemy = GameData.enemies[obj.target];
            return `• Kill ${obj.count} ${enemy ? enemy.name : obj.target}`;
        } else if (obj.type === 'collect') {
            const item = GameData.items[obj.item];
            return `• Collect ${obj.count} ${item ? item.name : obj.item}`;
        }
        return '';
    }).join('\n');
    
    const rewardsText = `Rewards: ⭐ ${quest.rewards.xp} XP, 💰 ${quest.rewards.gold} Gold`;
    
    showDialogueText(`${quest.description}\n\n${objectivesText}\n\n${rewardsText}`);
    
    showDialogueOptions([
        { text: "I'll do it!", action: 'acceptQuest', questId: quest.id },
        { text: "Show me other quests.", action: 'showQuests' },
        { text: "Maybe later.", action: 'close' }
    ]);
    
    // Override option handlers
    const optionsDiv = document.getElementById('dialogue-options');
    optionsDiv.children[0].onclick = () => {
        currentPlayer.quests.acceptQuest(quest.id);
        showDialogueText("Excellent! Good luck, adventurer!");
        showDialogueOptions([{ text: "Thanks!", action: 'close' }]);
        
        // Update NPC quest icon
        currentNPC.updateQuestIcon();
    };
}

function turnInQuest(questId) {
    const result = currentPlayer.quests.turnInQuest(questId, currentPlayer);
    
    if (result.success) {
        showDialogueText(`Quest Complete!\n\n${result.message}\n\nWell done, adventurer!`);
        showDialogueOptions([{ text: "Thanks!", action: 'close' }]);
        
        // Update NPC quest icon
        currentNPC.updateQuestIcon();
        
        // Update quest log if open
        updateQuestDisplay();
    }
}

// ============================================
// CLASS SELECTION MODAL
// ============================================

function showClassSelection() {
    closeAllModals();
    const modal = document.getElementById('class-modal');
    modal.classList.remove('hidden');
    
    const grid = document.getElementById('class-grid');
    grid.innerHTML = '';
    
    for (const classId in GameData.classes) {
        const classData = GameData.classes[classId];
        
        const card = document.createElement('div');
        card.className = 'class-card';
        
        const statsText = `HP: ${classData.baseStats.maxHealth} | MP: ${classData.baseStats.maxMana}\nATK: ${classData.baseStats.attack} | DEF: ${classData.baseStats.defense}`;
        
        card.innerHTML = `
            <div class="class-icon">${classData.icon}</div>
            <div class="class-name">${classData.name}</div>
            <div class="class-description">${classData.description}</div>
            <div class="class-stats">${statsText}</div>
        `;
        
        card.onclick = () => selectClass(classId, card);
        
        grid.appendChild(card);
    }
}

function closeClassModal() {
    document.getElementById('class-modal').classList.add('hidden');
}

function selectClass(classId, card) {
    const player = window.gameState.player;
    if (!player) return;
    
    // Update selection visual
    document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    
    // Change class
    player.changeClass(classId);
    
    // Close modal after short delay
    setTimeout(() => {
        closeClassModal();
    }, 500);
}

// ============================================
// DEATH SCREEN
// ============================================

function showDeathScreen() {
    document.getElementById('death-screen').classList.remove('hidden');
}

function hideDeathScreen() {
    document.getElementById('death-screen').classList.add('hidden');
}

function respawnPlayer() {
    const player = window.gameState.player;
    if (!player) return;
    
    hideDeathScreen();
    
    // Respawn in town
    const gameScene = player.scene;
    if (gameScene.scene.key !== 'TownScene') {
        // Transition to town
        gameScene.scene.stop('UIScene');
        gameScene.cleanup();
        gameScene.scene.start('TownScene', {
            player: player,
            spawnX: 200,
            spawnY: 550
        });
    }
    
    player.respawn(200, 550);
}

// ============================================
// LEVEL UP NOTIFICATION
// ============================================

function showLevelUp(level) {
    const notification = document.getElementById('levelup-notification');
    const text = document.getElementById('levelup-text');
    
    text.textContent = `You are now level ${level}!`;
    notification.classList.remove('hidden');
    
    // Hide after animation
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 2500);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Don't handle if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch (e.key.toLowerCase()) {
        case 'escape':
            closeAllModals();
            break;
        case 'i':
            // Only toggle if no other modal is open
            if (document.querySelectorAll('.modal:not(.hidden)').length === 0 || 
                !document.getElementById('inventory-modal').classList.contains('hidden')) {
                toggleInventory();
            }
            break;
        case 'q':
            if (document.querySelectorAll('.modal:not(.hidden)').length === 0 ||
                !document.getElementById('quest-modal').classList.contains('hidden')) {
                toggleQuestLog();
            }
            break;
    }
});

// ============================================
// MULTIPLAYER FUNCTIONS
// ============================================

function openMPConnect() {
    closeAllModals();
    const modal = document.getElementById('mp-connect-modal');
    modal.classList.remove('hidden');
    
    // Load saved name
    const savedName = localStorage.getItem('playerName') || '';
    document.getElementById('player-name-input').value = savedName;
    
    // Load saved server URL
    const savedServer = localStorage.getItem('serverUrl') || '';
    document.getElementById('server-url-input').value = savedServer;
}

function closeMPConnect() {
    document.getElementById('mp-connect-modal').classList.add('hidden');
}

function connectMultiplayer() {
    const nameInput = document.getElementById('player-name-input');
    const serverInput = document.getElementById('server-url-input');
    
    const playerName = nameInput.value.trim() || `Hero${Math.floor(Math.random() * 1000)}`;
    const serverUrl = serverInput.value.trim();
    
    if (!serverUrl) {
        alert('Please enter a server URL');
        return;
    }
    
    // Save preferences
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('serverUrl', serverUrl);
    
    // Connect
    if (window.Multiplayer) {
        window.Multiplayer.connect(serverUrl);
    }
    
    closeMPConnect();
}

function disconnectMultiplayer() {
    if (window.Multiplayer) {
        window.Multiplayer.disconnect();
    }
}

// Setup chat input
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && chatInput.value.trim()) {
                const message = chatInput.value.trim();
                if (window.Multiplayer && window.Multiplayer.isConnected) {
                    window.Multiplayer.sendChatMessage(message);
                }
                chatInput.value = '';
            }
            // Prevent game from receiving input while typing
            e.stopPropagation();
        });
        
        // Focus handling
        chatInput.addEventListener('focus', () => {
            chatInput.placeholder = 'Type message...';
        });
        
        chatInput.addEventListener('blur', () => {
            chatInput.placeholder = 'Press Enter to chat...';
        });
    }
    
    // Update player count periodically
    setInterval(() => {
        const countEl = document.getElementById('player-count');
        if (countEl && window.Multiplayer) {
            const count = window.Multiplayer.getPlayerCount();
            countEl.textContent = `${count} online`;
        }
    }, 1000);
});

// Export functions globally
window.closeAllModals = closeAllModals;
window.toggleInventory = toggleInventory;
window.openInventory = openInventory;
window.closeInventory = closeInventory;
window.toggleQuestLog = toggleQuestLog;
window.openQuestLog = openQuestLog;
window.closeQuestLog = closeQuestLog;
window.openShop = openShop;
window.closeShop = closeShop;
window.showDialogue = showDialogue;
window.closeDialogue = closeDialogue;
window.showClassSelection = showClassSelection;
window.closeClassModal = closeClassModal;
window.showDeathScreen = showDeathScreen;
window.respawnPlayer = respawnPlayer;
window.showLevelUp = showLevelUp;
window.openMPConnect = openMPConnect;
window.closeMPConnect = closeMPConnect;
window.connectMultiplayer = connectMultiplayer;
window.disconnectMultiplayer = disconnectMultiplayer;