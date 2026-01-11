// ============================================
// REALMQUEST - Menu Scene
// Main menu with new game, continue, options
// ============================================

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Atmospheric background
        this.createBackground();
        
        // Title
        const title = this.add.text(width / 2, 120, 'REALMQUEST', {
            fontSize: '72px',
            fontFamily: 'Cinzel, serif',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);
        
        // Subtitle
        const subtitle = this.add.text(width / 2, 180, 'A Browser Adventure RPG', {
            fontSize: '20px',
            fontFamily: 'Crimson Text, serif',
            color: '#c9b896'
        });
        subtitle.setOrigin(0.5);
        
        // Title glow animation
        this.tweens.add({
            targets: title,
            alpha: 0.8,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Menu buttons
        const buttonY = 350;
        const buttonSpacing = 70;
        
        // Check for existing save
        const hasSave = window.SaveSystem && window.SaveSystem.hasSave();
        
        if (hasSave) {
            this.createButton(width / 2, buttonY, 'Continue', () => {
                this.continueGame();
            });
            
            this.createButton(width / 2, buttonY + buttonSpacing, 'New Game', () => {
                this.showNewGameConfirm();
            });
        } else {
            this.createButton(width / 2, buttonY, 'New Game', () => {
                this.startNewGame();
            });
        }
        
        this.createButton(width / 2, buttonY + buttonSpacing * (hasSave ? 2 : 1), 'Controls', () => {
            this.showControls();
        });

        this.createButton(width / 2, buttonY + buttonSpacing * (hasSave ? 3 : 2), 'Multiplayer', () => {
            window.openMPConnect();
        });
        
        // Version
        this.add.text(width - 10, height - 10, 'v1.0.0', {
            fontSize: '12px',
            fontFamily: 'Crimson Text, serif',
            color: '#666666'
        }).setOrigin(1, 1);
        
        // Floating particles
        this.createParticles();
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Dark gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a1a3a, 0x1a1a3a);
        bg.fillRect(0, 0, width, height);
        
        // Distant mountains
        const mountains = this.add.graphics();
        mountains.fillStyle(0x151525);
        mountains.beginPath();
        mountains.moveTo(0, height);
        mountains.lineTo(0, height - 200);
        mountains.lineTo(200, height - 350);
        mountains.lineTo(400, height - 250);
        mountains.lineTo(600, height - 400);
        mountains.lineTo(800, height - 280);
        mountains.lineTo(1000, height - 380);
        mountains.lineTo(1280, height - 200);
        mountains.lineTo(1280, height);
        mountains.closePath();
        mountains.fill();
        
        // Moon
        const moon = this.add.circle(1000, 100, 50, 0xffffee, 0.9);
        
        // Moon glow
        const moonGlow = this.add.circle(1000, 100, 80, 0xffffee, 0.1);
        
        // Stars
        for (let i = 0; i < 100; i++) {
            const star = this.add.circle(
                Math.random() * width,
                Math.random() * (height - 300),
                Math.random() * 2 + 0.5,
                0xffffff,
                Math.random() * 0.5 + 0.3
            );
            
            // Twinkle
            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: 1000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1,
                delay: Math.random() * 2000
            });
        }
        
        // Ground
        const ground = this.add.rectangle(width / 2, height - 50, width, 100, 0x0d0d15);
        
        // Castle silhouette
        this.drawCastle(150, height - 100);
    }

    drawCastle(x, y) {
        const castle = this.add.graphics();
        castle.fillStyle(0x0a0a12);
        
        // Main body
        castle.fillRect(x, y - 150, 200, 150);
        
        // Towers
        castle.fillRect(x - 30, y - 200, 60, 200);
        castle.fillRect(x + 170, y - 200, 60, 200);
        
        // Tower tops
        castle.beginPath();
        castle.moveTo(x - 30, y - 200);
        castle.lineTo(x, y - 250);
        castle.lineTo(x + 30, y - 200);
        castle.closePath();
        castle.fill();
        
        castle.beginPath();
        castle.moveTo(x + 170, y - 200);
        castle.lineTo(x + 200, y - 250);
        castle.lineTo(x + 230, y - 200);
        castle.closePath();
        castle.fill();
        
        // Windows (glowing)
        const windows = [
            { x: x + 50, y: y - 100 },
            { x: x + 100, y: y - 100 },
            { x: x + 150, y: y - 100 },
            { x: x, y: y - 150 },
            { x: x + 200, y: y - 150 }
        ];
        
        for (const win of windows) {
            const glow = this.add.rectangle(win.x, win.y, 20, 30, 0xffaa44, 0.3);
            const light = this.add.rectangle(win.x, win.y, 15, 25, 0xffcc66, 0.6);
            
            this.tweens.add({
                targets: [glow, light],
                alpha: { from: 0.3, to: 0.6 },
                duration: 2000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1
            });
        }
    }

    createParticles() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Floating dust/magic particles
        for (let i = 0; i < 30; i++) {
            const particle = this.add.circle(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 3 + 1,
                0xffd700,
                Math.random() * 0.3 + 0.1
            );
            
            this.tweens.add({
                targets: particle,
                y: particle.y - 100 - Math.random() * 200,
                x: particle.x + (Math.random() - 0.5) * 100,
                alpha: 0,
                duration: 5000 + Math.random() * 5000,
                repeat: -1,
                onRepeat: () => {
                    particle.x = Math.random() * width;
                    particle.y = height + 50;
                    particle.alpha = Math.random() * 0.3 + 0.1;
                }
            });
        }
    }

    createButton(x, y, text, callback) {
        // Button background
        const btnBg = this.add.rectangle(x, y, 250, 50, 0x1a1a2e);
        btnBg.setStrokeStyle(2, 0xffd700);
        btnBg.setInteractive({ useHandCursor: true });
        
        // Button text
        const btnText = this.add.text(x, y, text, {
            fontSize: '22px',
            fontFamily: 'Cinzel, serif',
            color: '#ffd700'
        });
        btnText.setOrigin(0.5);
        
        // Hover effects
        btnBg.on('pointerover', () => {
            btnBg.setFillStyle(0x2a2a4e);
            btnText.setScale(1.05);
        });
        
        btnBg.on('pointerout', () => {
            btnBg.setFillStyle(0x1a1a2e);
            btnText.setScale(1);
        });
        
        btnBg.on('pointerdown', () => {
            btnBg.setFillStyle(0x3a3a6e);
        });
        
        btnBg.on('pointerup', () => {
            btnBg.setFillStyle(0x2a2a4e);
            callback();
        });
        
        return { bg: btnBg, text: btnText };
    }

    startNewGame() {
        // Delete existing save
        if (window.SaveSystem) window.SaveSystem.deleteSave();
        
        // Show class selection
        this.scene.start('TownScene', { newGame: true });
    }

    continueGame() {
        const saveData = window.SaveSystem ? window.SaveSystem.loadGame() : null;
        if (saveData) {
            const targetScene = saveData.player.position.scene || 'TownScene';
            this.scene.start(targetScene, { saveData: saveData });
        } else {
            this.startNewGame();
        }
    }

    showNewGameConfirm() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        overlay.setInteractive();
        
        // Confirm box
        const box = this.add.rectangle(width / 2, height / 2, 400, 200, 0x1a1a2e);
        box.setStrokeStyle(2, 0xffd700);
        
        // Text
        const text = this.add.text(width / 2, height / 2 - 40, 'Start a new game?\nThis will delete your current save.', {
            fontSize: '18px',
            fontFamily: 'Crimson Text, serif',
            color: '#ffffff',
            align: 'center'
        });
        text.setOrigin(0.5);
        
        // Buttons
        const yesBtn = this.createButton(width / 2 - 80, height / 2 + 50, 'Yes', () => {
            overlay.destroy();
            box.destroy();
            text.destroy();
            yesBtn.bg.destroy();
            yesBtn.text.destroy();
            noBtn.bg.destroy();
            noBtn.text.destroy();
            this.startNewGame();
        });
        yesBtn.bg.setSize(100, 40);
        
        const noBtn = this.createButton(width / 2 + 80, height / 2 + 50, 'No', () => {
            overlay.destroy();
            box.destroy();
            text.destroy();
            yesBtn.bg.destroy();
            yesBtn.text.destroy();
            noBtn.bg.destroy();
            noBtn.text.destroy();
        });
        noBtn.bg.setSize(100, 40);
    }

    showControls() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        overlay.setInteractive();
        
        // Controls box
        const box = this.add.rectangle(width / 2, height / 2, 500, 400, 0x1a1a2e);
        box.setStrokeStyle(2, 0xffd700);
        
        // Title
        const title = this.add.text(width / 2, height / 2 - 160, 'Controls', {
            fontSize: '28px',
            fontFamily: 'Cinzel, serif',
            color: '#ffd700'
        });
        title.setOrigin(0.5);
        
        // Controls list
        const controls = [
            'A/D or ←/→ : Move Left/Right',
            'W or ↑ or Space : Jump (double jump!)',
            '1-5 : Use Skills',
            'E : Interact with NPCs',
            'I : Open Inventory',
            'Q : Open Quest Log',
            '',
            'Click NPCs to talk',
            'Click skills on hotbar to use'
        ];
        
        const controlsText = this.add.text(width / 2, height / 2 - 20, controls.join('\n'), {
            fontSize: '16px',
            fontFamily: 'Crimson Text, serif',
            color: '#c9b896',
            align: 'center',
            lineSpacing: 8
        });
        controlsText.setOrigin(0.5);
        
        // Close button
        const closeBtn = this.createButton(width / 2, height / 2 + 150, 'Close', () => {
            overlay.destroy();
            box.destroy();
            title.destroy();
            controlsText.destroy();
            closeBtn.bg.destroy();
            closeBtn.text.destroy();
        });
        closeBtn.bg.setSize(120, 40);
    }
}

// Register scene
window.MenuScene = MenuScene;
