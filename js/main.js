// ============================================
// REALMQUEST - Main Entry Point
// Initializes the Phaser game
// ============================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Starting RealmQuest...');
    
    // Check if Phaser loaded
    if (typeof Phaser === 'undefined') {
        console.error('Phaser not loaded!');
        document.getElementById('game-container').innerHTML = '<p style="color:red;padding:20px;">Error: Phaser failed to load. Check your internet connection.</p>';
        return;
    }
    
    // Check if scenes are defined
    const requiredClasses = ['BootScene', 'MenuScene', 'TownScene', 'ForestScene', 'DungeonScene', 'UIScene'];
    for (const className of requiredClasses) {
        if (typeof window[className] === 'undefined') {
            console.error(`${className} not loaded!`);
            document.getElementById('game-container').innerHTML = `<p style="color:red;padding:20px;">Error: ${className} failed to load.</p>`;
            return;
        }
    }
    
    console.log('All scenes loaded successfully');
    
    // Game configuration
    const config = {
        type: Phaser.AUTO,
        width: 1280,
        height: 720,
        parent: 'game-container',
        backgroundColor: '#0a0a0f',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: [
            window.BootScene,
            window.MenuScene,
            window.TownScene,
            window.ForestScene,
            window.DungeonScene,
            window.UIScene
        ],
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        render: {
            pixelArt: false,
            antialias: true
        }
    };

    try {
        // Create the game instance
        const game = new Phaser.Game(config);

        // Store game reference globally
        window.game = game;

        // Initialize game state
        window.gameState = {
            currentScene: 'BootScene',
            player: null,
            settings: {
                musicVolume: 0.5,
                sfxVolume: 0.7,
                showDamageNumbers: true
            }
        };

        console.log('🎮 RealmQuest initialized!');
        console.log('Controls:');
        console.log('  A/D or ←/→ : Move');
        console.log('  W/↑/Space : Jump');
        console.log('  1-5 : Skills');
        console.log('  E : Interact');
        console.log('  I : Inventory');
        console.log('  Q : Quest Log');
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        document.getElementById('game-container').innerHTML = `<p style="color:red;padding:20px;">Error initializing game: ${error.message}</p>`;
    }

    // Handle visibility change (pause when tab not focused)
    document.addEventListener('visibilitychange', () => {
        if (window.game) {
            if (document.hidden) {
                window.game.scene.pause();
            } else {
                window.game.scene.resume();
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.game) {
            window.game.scale.refresh();
        }
    });

    // Prevent right-click context menu on game
    document.getElementById('game-container').addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
});

// Utility function to get player save data
function getPlayerSaveData() {
    if (window.gameState && window.gameState.player) {
        return window.gameState.player.getSaveData();
    }
    return null;
}

// Export utility
window.getPlayerSaveData = getPlayerSaveData;
