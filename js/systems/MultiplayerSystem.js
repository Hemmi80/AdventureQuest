// ============================================
// REALMQUEST - Multiplayer System
// Handles connection to server and player sync
// ============================================

class MultiplayerSystem {
    constructor() {
        this.socket = null;
        this.playerId = null;
        this.playerColor = null;
        this.otherPlayers = new Map(); // id -> player data
        this.isConnected = false;
        this.serverUrl = null;
        this.scene = null;
        this.localPlayer = null;
        
        // Update rate limiting
        this.lastUpdateTime = 0;
        this.updateInterval = 50; // Send updates every 50ms (20 times per second)
        this.lastPosition = { x: 0, y: 0 };
    }

    // Connect to multiplayer server
    connect(serverUrl) {
        if (this.socket) {
            this.socket.disconnect();
        }

        this.serverUrl = serverUrl;
        
        try {
            this.socket = io(serverUrl, {
                transports: ['websocket', 'polling'],
                timeout: 10000
            });

            this.setupSocketEvents();
            console.log('🌐 Connecting to multiplayer server...');
            
        } catch (error) {
            console.error('Failed to connect to server:', error);
            this.isConnected = false;
        }
    }

    // Setup socket event handlers
    setupSocketEvents() {
        this.socket.on('connect', () => {
            console.log('✅ Connected to multiplayer server!');
            this.isConnected = true;
            
            // Join with player info
            if (this.localPlayer) {
                this.joinGame();
            }
            
            // Show connection status
            showMultiplayerStatus('Connected!', 'success');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from server');
            this.isConnected = false;
            this.clearOtherPlayers();
            showMultiplayerStatus('Disconnected', 'error');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            showMultiplayerStatus('Connection failed', 'error');
        });

        // Receive our player ID and color
        this.socket.on('playerAssigned', (data) => {
            this.playerId = data.id;
            this.playerColor = data.color;
            console.log('Assigned player ID:', this.playerId);
        });

        // Receive existing players when joining
        this.socket.on('existingPlayers', (players) => {
            console.log(`Found ${players.length} players online`);
            for (const playerData of players) {
                if (playerData.id !== this.playerId) {
                    this.addOtherPlayer(playerData);
                }
            }
        });

        // New player joined
        this.socket.on('playerJoined', (playerData) => {
            if (playerData.id !== this.playerId) {
                console.log(`${playerData.name} joined the game`);
                this.addOtherPlayer(playerData);
                addChatMessage(`${playerData.name} joined the game`, 'system');
            }
        });

        // Player moved
        this.socket.on('playerMoved', (data) => {
            this.updateOtherPlayer(data);
        });

        // Player changed scene
        this.socket.on('playerSceneChanged', (data) => {
            const player = this.otherPlayers.get(data.id);
            if (player) {
                player.scene = data.scene;
                player.x = data.x;
                player.y = data.y;
                this.updatePlayerVisibility(player);
            }
        });

        // Player attacked
        this.socket.on('playerAttacked', (data) => {
            this.showOtherPlayerAttack(data);
        });

        // Player took damage
        this.socket.on('playerTookDamage', (data) => {
            const player = this.otherPlayers.get(data.id);
            if (player) {
                player.currentHealth = data.currentHealth;
                player.maxHealth = data.maxHealth;
                this.updatePlayerHealthBar(player);
            }
        });

        // Player info updated
        this.socket.on('playerInfoUpdated', (data) => {
            const player = this.otherPlayers.get(data.id);
            if (player) {
                player.name = data.name;
                player.level = data.level;
                player.classId = data.classId;
                if (player.nameTag) {
                    player.nameTag.setText(`${data.name} Lv.${data.level}`);
                }
            }
        });

        // Player left
        this.socket.on('playerLeft', (data) => {
            const player = this.otherPlayers.get(data.id);
            if (player) {
                console.log(`${player.name} left the game`);
                addChatMessage(`${player.name} left the game`, 'system');
                this.removeOtherPlayer(data.id);
            }
        });

        // Chat messages
        this.socket.on('chatHistory', (messages) => {
            for (const msg of messages) {
                addChatMessage(msg.message, 'player', msg.playerName, msg.color);
            }
        });

        this.socket.on('newChatMessage', (msg) => {
            addChatMessage(msg.message, 'player', msg.playerName, msg.color);
        });
    }

    // Join the game
    joinGame() {
        if (!this.socket || !this.localPlayer) return;

        const playerName = localStorage.getItem('playerName') || `Hero${Math.floor(Math.random() * 1000)}`;
        
        this.socket.emit('playerJoin', {
            name: playerName,
            x: this.localPlayer.x,
            y: this.localPlayer.y,
            scene: this.scene ? this.scene.scene.key : 'TownScene',
            classId: this.localPlayer.classId,
            level: this.localPlayer.level,
            currentHealth: this.localPlayer.currentHealth,
            maxHealth: this.localPlayer.stats.maxHealth
        });
    }

    // Set the current scene
    setScene(scene) {
        this.scene = scene;
        
        // Update visibility of other players based on scene
        for (const [id, player] of this.otherPlayers) {
            this.updatePlayerVisibility(player);
        }
    }

    // Set local player reference
    setLocalPlayer(player) {
        this.localPlayer = player;
        
        // If already connected, join the game
        if (this.isConnected) {
            this.joinGame();
        }
    }

    // Send position update
    sendPositionUpdate() {
        if (!this.socket || !this.isConnected || !this.localPlayer || !this.scene) return;

        const now = Date.now();
        if (now - this.lastUpdateTime < this.updateInterval) return;

        // Only send if position changed
        const pos = { x: Math.round(this.localPlayer.x), y: Math.round(this.localPlayer.y) };
        if (pos.x === this.lastPosition.x && pos.y === this.lastPosition.y) return;

        this.lastPosition = pos;
        this.lastUpdateTime = now;

        this.socket.emit('playerMove', {
            x: pos.x,
            y: pos.y,
            facingRight: this.localPlayer.facingRight,
            currentAnim: this.localPlayer.currentAnim,
            scene: this.scene.scene.key
        });
    }

    // Send scene change
    sendSceneChange(sceneName, x, y) {
        if (!this.socket || !this.isConnected) return;

        this.socket.emit('sceneChange', {
            scene: sceneName,
            x: x,
            y: y
        });
    }

    // Send attack
    sendAttack(skillId) {
        if (!this.socket || !this.isConnected || !this.localPlayer) return;

        this.socket.emit('playerAttack', {
            skillId: skillId,
            x: this.localPlayer.x,
            y: this.localPlayer.y,
            facingRight: this.localPlayer.facingRight
        });
    }

    // Send damage taken
    sendDamage() {
        if (!this.socket || !this.isConnected || !this.localPlayer) return;

        this.socket.emit('playerDamaged', {
            currentHealth: this.localPlayer.currentHealth,
            maxHealth: this.localPlayer.stats.maxHealth
        });
    }

    // Send player info update
    sendPlayerUpdate() {
        if (!this.socket || !this.isConnected || !this.localPlayer) return;

        this.socket.emit('playerUpdate', {
            name: localStorage.getItem('playerName'),
            level: this.localPlayer.level,
            classId: this.localPlayer.classId,
            currentHealth: this.localPlayer.currentHealth,
            maxHealth: this.localPlayer.stats.maxHealth
        });
    }

    // Send chat message
    sendChatMessage(message) {
        if (!this.socket || !this.isConnected) return;

        this.socket.emit('chatMessage', { message: message });
    }

    // Add another player to the scene
    addOtherPlayer(playerData) {
        if (this.otherPlayers.has(playerData.id)) return;

        const player = {
            id: playerData.id,
            name: playerData.name,
            x: playerData.x,
            y: playerData.y,
            scene: playerData.scene,
            classId: playerData.classId,
            level: playerData.level,
            color: playerData.color,
            facingRight: playerData.facingRight,
            currentAnim: playerData.currentAnim || 'idle',
            currentHealth: playerData.currentHealth || 100,
            maxHealth: playerData.maxHealth || 100,
            sprites: null
        };

        this.otherPlayers.set(playerData.id, player);
        
        // Create sprite if in same scene
        if (this.scene && player.scene === this.scene.scene.key) {
            this.createPlayerSprites(player);
        }
    }

    // Create sprites for another player
    createPlayerSprites(player) {
        if (!this.scene || player.sprites) return;

        // Body
        const sprite = this.scene.add.rectangle(player.x, player.y, 40, 60, player.color);
        sprite.setOrigin(0.5, 1);
        sprite.setDepth(10);
        sprite.setAlpha(0.9);

        // Head
        const head = this.scene.add.circle(player.x, player.y - 70, 15, 0xffcc99);
        head.setDepth(11);

        // Name tag
        const nameTag = this.scene.add.text(player.x, player.y - 95, `${player.name} Lv.${player.level}`, {
            fontSize: '12px',
            fontFamily: 'Cinzel, serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        nameTag.setOrigin(0.5, 1);
        nameTag.setDepth(20);

        // Health bar background
        const healthBg = this.scene.add.rectangle(player.x, player.y - 80, 40, 5, 0x333333);
        healthBg.setDepth(20);

        // Health bar
        const healthBar = this.scene.add.rectangle(player.x - 19, player.y - 80, 38, 3, 0x00ff00);
        healthBar.setOrigin(0, 0.5);
        healthBar.setDepth(21);

        player.sprites = { sprite, head, nameTag, healthBg, healthBar };
        player.nameTag = nameTag;
        player.healthBar = healthBar;

        this.updatePlayerHealthBar(player);
    }

    // Update other player position
    updateOtherPlayer(data) {
        const player = this.otherPlayers.get(data.id);
        if (!player) return;

        player.x = data.x;
        player.y = data.y;
        player.facingRight = data.facingRight;
        player.currentAnim = data.currentAnim;
        player.scene = data.scene;

        // Update sprites if they exist and in same scene
        if (player.sprites && this.scene && player.scene === this.scene.scene.key) {
            const { sprite, head, nameTag, healthBg, healthBar } = player.sprites;
            const direction = player.facingRight ? 1 : -1;

            // Smooth interpolation
            this.scene.tweens.add({
                targets: sprite,
                x: player.x,
                y: player.y,
                duration: 50,
                ease: 'Linear'
            });

            head.x = player.x;
            head.y = player.y - 70;
            sprite.scaleX = direction;

            nameTag.x = player.x;
            nameTag.y = player.y - 95;

            healthBg.x = player.x;
            healthBg.y = player.y - 80;

            healthBar.x = player.x - 19;
            healthBar.y = player.y - 80;
        }
    }

    // Update player visibility based on scene
    updatePlayerVisibility(player) {
        const inSameScene = this.scene && player.scene === this.scene.scene.key;

        if (inSameScene && !player.sprites) {
            this.createPlayerSprites(player);
        } else if (!inSameScene && player.sprites) {
            this.destroyPlayerSprites(player);
        }
    }

    // Update health bar display
    updatePlayerHealthBar(player) {
        if (player.healthBar) {
            const percent = player.currentHealth / player.maxHealth;
            player.healthBar.scaleX = Math.max(0, percent);
            
            if (percent < 0.3) {
                player.healthBar.setFillStyle(0xff0000);
            } else if (percent < 0.6) {
                player.healthBar.setFillStyle(0xffaa00);
            } else {
                player.healthBar.setFillStyle(0x00ff00);
            }
        }
    }

    // Show attack animation for other player
    showOtherPlayerAttack(data) {
        const player = this.otherPlayers.get(data.id);
        if (!player || !player.sprites || !this.scene) return;
        if (player.scene !== this.scene.scene.key) return;

        // Flash effect
        const { sprite } = player.sprites;
        const originalColor = player.color;
        sprite.setFillStyle(0xffffff);
        
        this.scene.time.delayedCall(100, () => {
            sprite.setFillStyle(originalColor);
        });

        // Attack visual
        const direction = data.facingRight ? 1 : -1;
        const attackX = data.x + (40 * direction);
        
        const slash = this.scene.add.circle(attackX, data.y - 30, 20, 0xffffff, 0.5);
        slash.setDepth(100);
        
        this.scene.tweens.add({
            targets: slash,
            alpha: 0,
            scale: 2,
            duration: 200,
            onComplete: () => slash.destroy()
        });
    }

    // Destroy player sprites
    destroyPlayerSprites(player) {
        if (player.sprites) {
            for (const sprite of Object.values(player.sprites)) {
                if (sprite && sprite.destroy) sprite.destroy();
            }
            player.sprites = null;
            player.nameTag = null;
            player.healthBar = null;
        }
    }

    // Remove other player
    removeOtherPlayer(playerId) {
        const player = this.otherPlayers.get(playerId);
        if (player) {
            this.destroyPlayerSprites(player);
            this.otherPlayers.delete(playerId);
        }
    }

    // Clear all other players
    clearOtherPlayers() {
        for (const [id, player] of this.otherPlayers) {
            this.destroyPlayerSprites(player);
        }
        this.otherPlayers.clear();
    }

    // Get player count
    getPlayerCount() {
        return this.otherPlayers.size + (this.isConnected ? 1 : 0);
    }

    // Disconnect
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnected = false;
        this.clearOtherPlayers();
    }
}

// Create global instance
window.Multiplayer = new MultiplayerSystem();

// Helper functions for UI
function showMultiplayerStatus(message, type) {
    const statusEl = document.getElementById('mp-status');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `mp-status ${type}`;
        statusEl.style.display = 'block';
        
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    }
}

function addChatMessage(message, type = 'player', playerName = '', color = 0xffffff) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${type}`;
    
    if (type === 'system') {
        msgDiv.innerHTML = `<span class="system-msg">⚡ ${message}</span>`;
    } else {
        const colorHex = typeof color === 'number' ? '#' + color.toString(16).padStart(6, '0') : color;
        msgDiv.innerHTML = `<span class="player-name" style="color:${colorHex}">${playerName}:</span> ${message}`;
    }
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Limit messages
    while (chatMessages.children.length > 50) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
}
