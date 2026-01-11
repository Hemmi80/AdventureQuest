// ============================================
// REALMQUEST - Boot Scene
// Initial loading and setup
// ============================================

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            fontSize: '24px',
            fontFamily: 'Cinzel, serif',
            color: '#ffd700'
        });
        loadingText.setOrigin(0.5);
        
        // Progress bar background
        const progressBarBg = this.add.rectangle(width / 2, height / 2, 400, 30, 0x1a1a2e);
        progressBarBg.setOrigin(0.5);
        
        // Progress bar
        const progressBar = this.add.rectangle(width / 2 - 195, height / 2, 0, 22, 0xffd700);
        progressBar.setOrigin(0, 0.5);
        
        // Update progress bar as assets load
        this.load.on('progress', (value) => {
            progressBar.width = 390 * value;
        });
        
        // When loading complete
        this.load.on('complete', () => {
            loadingText.setText('Ready!');
        });
        
        // Load any external assets here if needed
        // For now we're using procedural graphics
    }

    create() {
        // Initialize global game state
        window.gameState = {
            currentScene: 'MenuScene',
            player: null,
            settings: window.SaveSystem ? window.SaveSystem.loadSettings() : {
                musicVolume: 0.5,
                sfxVolume: 0.7,
                showDamageNumbers: true
            }
        };
        
        // Transition to menu
        this.time.delayedCall(500, () => {
            this.scene.start('MenuScene');
        });
    }
}

// Register scene
window.BootScene = BootScene;
