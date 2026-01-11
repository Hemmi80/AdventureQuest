// ============================================
// REALMQUEST - Multiplayer Server
// Handles player connections, sync, and chat
// ============================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store connected players
const players = new Map();

// Store chat messages (last 50)
const chatHistory = [];
const MAX_CHAT_HISTORY = 50;

// Player colors for different players
const playerColors = [
    0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 
    0x6c5ce7, 0xa29bfe, 0xfd79a8, 0x00b894,
    0xe17055, 0x0984e3, 0x6d214f, 0x82ccdd
];

let colorIndex = 0;

// Health check endpoint for Render
app.get('/', (req, res) => {
    res.json({ 
        status: 'RealmQuest Server Running',
        players: players.size,
        uptime: process.uptime()
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Handle player joining
    socket.on('playerJoin', (data) => {
        const player = {
            id: socket.id,
            name: data.name || `Player${Math.floor(Math.random() * 1000)}`,
            x: data.x || 200,
            y: data.y || 550,
            scene: data.scene || 'TownScene',
            classId: data.classId || 'warrior',
            level: data.level || 1,
            color: playerColors[colorIndex % playerColors.length],
            facingRight: true,
            currentAnim: 'idle',
            currentHealth: data.currentHealth || 100,
            maxHealth: data.maxHealth || 100
        };
        
        colorIndex++;
        players.set(socket.id, player);

        // Send current player their ID and color
        socket.emit('playerAssigned', {
            id: socket.id,
            color: player.color
        });

        // Send existing players to new player
        socket.emit('existingPlayers', Array.from(players.values()));

        // Send chat history
        socket.emit('chatHistory', chatHistory);

        // Notify others of new player
        socket.broadcast.emit('playerJoined', player);

        console.log(`${player.name} joined in ${player.scene}`);
    });

    // Handle player movement updates
    socket.on('playerMove', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.x = data.x;
            player.y = data.y;
            player.facingRight = data.facingRight;
            player.currentAnim = data.currentAnim || 'idle';
            player.scene = data.scene;

            // Broadcast to other players in same scene
            socket.broadcast.emit('playerMoved', {
                id: socket.id,
                x: data.x,
                y: data.y,
                facingRight: data.facingRight,
                currentAnim: data.currentAnim,
                scene: data.scene
            });
        }
    });

    // Handle scene change
    socket.on('sceneChange', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.scene = data.scene;
            player.x = data.x;
            player.y = data.y;

            socket.broadcast.emit('playerSceneChanged', {
                id: socket.id,
                scene: data.scene,
                x: data.x,
                y: data.y
            });
        }
    });

    // Handle attack animation
    socket.on('playerAttack', (data) => {
        const player = players.get(socket.id);
        if (player) {
            socket.broadcast.emit('playerAttacked', {
                id: socket.id,
                skillId: data.skillId,
                x: data.x,
                y: data.y,
                facingRight: data.facingRight,
                scene: player.scene
            });
        }
    });

    // Handle player taking damage (for visual sync)
    socket.on('playerDamaged', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.currentHealth = data.currentHealth;
            
            socket.broadcast.emit('playerTookDamage', {
                id: socket.id,
                currentHealth: data.currentHealth,
                maxHealth: data.maxHealth,
                scene: player.scene
            });
        }
    });

    // Handle chat messages
    socket.on('chatMessage', (data) => {
        const player = players.get(socket.id);
        if (player && data.message && data.message.trim()) {
            const chatMsg = {
                id: socket.id,
                playerName: player.name,
                message: data.message.trim().substring(0, 200), // Limit message length
                timestamp: Date.now(),
                color: player.color
            };

            // Add to history
            chatHistory.push(chatMsg);
            if (chatHistory.length > MAX_CHAT_HISTORY) {
                chatHistory.shift();
            }

            // Broadcast to all players
            io.emit('newChatMessage', chatMsg);
        }
    });

    // Handle player info update (level up, class change, etc)
    socket.on('playerUpdate', (data) => {
        const player = players.get(socket.id);
        if (player) {
            if (data.name) player.name = data.name;
            if (data.level) player.level = data.level;
            if (data.classId) player.classId = data.classId;
            if (data.maxHealth) player.maxHealth = data.maxHealth;
            if (data.currentHealth !== undefined) player.currentHealth = data.currentHealth;

            socket.broadcast.emit('playerInfoUpdated', {
                id: socket.id,
                name: player.name,
                level: player.level,
                classId: player.classId,
                maxHealth: player.maxHealth,
                currentHealth: player.currentHealth
            });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        const player = players.get(socket.id);
        if (player) {
            console.log(`${player.name} disconnected`);
            players.delete(socket.id);
            io.emit('playerLeft', { id: socket.id });
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🎮 RealmQuest Server running on port ${PORT}`);
});
