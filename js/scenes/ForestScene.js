// ============================================
// REALMQUEST - Forest Scene
// Combat area with enemies and resources
// ============================================

class ForestScene extends window.GameScene {
    constructor() {
        super('ForestScene');
    }

    init(data) {
        super.init(data);
        this.mapWidth = 2000;
    }

    createBackground() {
        // Dark forest gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a1a0a, 0x0a1a0a, 0x1a2a1a, 0x1a2a1a);
        bg.fillRect(0, 0, this.mapWidth, this.mapHeight);
        
        // Moon
        const moon = this.add.circle(1600, 80, 40, 0xeeeeff, 0.8);
        const moonGlow = this.add.circle(1600, 80, 70, 0xeeeeff, 0.15);
        
        // Stars
        for (let i = 0; i < 80; i++) {
            const star = this.add.circle(
                Math.random() * this.mapWidth,
                Math.random() * 300,
                Math.random() * 1.5 + 0.5,
                0xffffff,
                Math.random() * 0.4 + 0.2
            );
            
            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: 1000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1,
                delay: Math.random() * 2000
            });
        }
        
        // Background trees (multiple layers for depth)
        this.createBackgroundTrees();
        
        // Fog effect
        this.createFog();
    }

    createBackgroundTrees() {
        // Far layer (dark silhouettes)
        for (let x = 0; x < this.mapWidth; x += 80) {
            const height = 200 + Math.random() * 150;
            const tree = this.add.graphics();
            tree.fillStyle(0x0a150a);
            
            // Trunk
            tree.fillRect(x + 35, this.groundLevel - height + 150, 15, height - 50);
            
            // Foliage (multiple triangles)
            tree.beginPath();
            tree.moveTo(x, this.groundLevel - height + 200);
            tree.lineTo(x + 42, this.groundLevel - height);
            tree.lineTo(x + 85, this.groundLevel - height + 200);
            tree.closePath();
            tree.fill();
            
            tree.beginPath();
            tree.moveTo(x + 10, this.groundLevel - height + 150);
            tree.lineTo(x + 42, this.groundLevel - height + 50);
            tree.lineTo(x + 75, this.groundLevel - height + 150);
            tree.closePath();
            tree.fill();
        }
        
        // Mid layer
        for (let x = 30; x < this.mapWidth; x += 150) {
            const height = 180 + Math.random() * 100;
            const tree = this.add.graphics();
            tree.fillStyle(0x152515);
            
            tree.fillRect(x + 25, this.groundLevel - height + 120, 12, height - 40);
            
            tree.beginPath();
            tree.moveTo(x, this.groundLevel - height + 150);
            tree.lineTo(x + 30, this.groundLevel - height);
            tree.lineTo(x + 60, this.groundLevel - height + 150);
            tree.closePath();
            tree.fill();
        }
    }

    createFog() {
        // Ground fog
        for (let i = 0; i < 15; i++) {
            const fog = this.add.ellipse(
                Math.random() * this.mapWidth,
                this.groundLevel - 20 + Math.random() * 40,
                200 + Math.random() * 200,
                30 + Math.random() * 30,
                0x335533,
                0.15
            );
            fog.setDepth(15);
            
            this.tweens.add({
                targets: fog,
                x: fog.x + (Math.random() - 0.5) * 100,
                alpha: { from: 0.15, to: 0.05 },
                duration: 5000 + Math.random() * 3000,
                yoyo: true,
                repeat: -1
            });
        }
    }

    createGround() {
        // Forest floor
        this.ground = this.add.rectangle(
            this.mapWidth / 2,
            this.groundLevel + 40,
            this.mapWidth,
            80,
            0x1a2a1a
        );
        this.ground.setDepth(2);
        
        // Grass patches
        for (let x = 0; x < this.mapWidth; x += 30) {
            const grassHeight = 10 + Math.random() * 15;
            const grass = this.add.triangle(
                x + Math.random() * 20,
                this.groundLevel,
                0, 0,
                5, -grassHeight,
                10, 0,
                0x2a4a2a
            );
            grass.setDepth(3);
        }
        
        // Dirt path
        const path = this.add.rectangle(
            this.mapWidth / 2,
            this.groundLevel + 10,
            this.mapWidth,
            20,
            0x3d2817,
            0.5
        );
        path.setDepth(3);
    }

    createPlatforms() {
        // Floating log platforms
        this.createLogPlatform(400, this.groundLevel - 100);
        this.createLogPlatform(700, this.groundLevel - 180);
        this.createLogPlatform(1100, this.groundLevel - 120);
        this.createLogPlatform(1500, this.groundLevel - 200);
        
        // Rock formations
        this.createRock(250, this.groundLevel, 60, 40);
        this.createRock(900, this.groundLevel, 80, 50);
        this.createRock(1350, this.groundLevel, 50, 35);
    }

    createLogPlatform(x, y) {
        const log = this.add.rectangle(x, y, 120, 20, 0x5d3a1a);
        log.setDepth(5);
        
        // Bark texture lines
        const bark1 = this.add.rectangle(x - 30, y, 2, 18, 0x4a2a10);
        const bark2 = this.add.rectangle(x + 20, y, 2, 18, 0x4a2a10);
        bark1.setDepth(6);
        bark2.setDepth(6);
        
        // End caps
        const cap1 = this.add.ellipse(x - 60, y, 15, 20, 0x4a2a10);
        const cap2 = this.add.ellipse(x + 60, y, 15, 20, 0x4a2a10);
        cap1.setDepth(5);
        cap2.setDepth(5);
        
        // Moss
        const moss = this.add.ellipse(x, y - 12, 40, 8, 0x3a5a3a, 0.7);
        moss.setDepth(6);
        
        return { x, y, width: 120, height: 20 };
    }

    createRock(x, y, width, height) {
        const rock = this.add.ellipse(x, y - height/2, width, height, 0x4a4a4a);
        rock.setDepth(5);
        
        // Highlights
        const highlight = this.add.ellipse(x - width/4, y - height/2 - height/4, width/3, height/3, 0x5a5a5a);
        highlight.setDepth(6);
    }

    createEntities() {
        // Create foreground trees
        this.createForegroundTrees();
        
        // Spawn enemies
        // Slimes (easy)
        this.spawnEnemy('slime', 300, this.groundLevel);
        this.spawnEnemy('slime', 500, this.groundLevel);
        this.spawnEnemy('slime', 800, this.groundLevel);
        
        // Wolves (medium)
        this.spawnEnemy('forest_wolf', 1000, this.groundLevel);
        this.spawnEnemy('forest_wolf', 1300, this.groundLevel);
        
        // Goblins (medium-hard)
        this.spawnEnemy('goblin', 1500, this.groundLevel);
        this.spawnEnemy('goblin', 1700, this.groundLevel);
    }

    createForegroundTrees() {
        // Large detailed trees
        const treePositions = [150, 600, 1200, 1800];
        
        for (const x of treePositions) {
            // Trunk
            const trunk = this.add.rectangle(x, this.groundLevel - 100, 30, 200, 0x3d2817);
            trunk.setDepth(12);
            
            // Branches
            const branch1 = this.add.rectangle(x - 30, this.groundLevel - 150, 60, 8, 0x3d2817);
            branch1.setAngle(-20);
            branch1.setDepth(12);
            
            const branch2 = this.add.rectangle(x + 25, this.groundLevel - 180, 50, 8, 0x3d2817);
            branch2.setAngle(15);
            branch2.setDepth(12);
            
            // Foliage layers
            const foliage1 = this.add.circle(x, this.groundLevel - 230, 60, 0x1a4a1a);
            const foliage2 = this.add.circle(x - 40, this.groundLevel - 200, 45, 0x2a5a2a);
            const foliage3 = this.add.circle(x + 45, this.groundLevel - 210, 50, 0x1a4a1a);
            const foliage4 = this.add.circle(x, this.groundLevel - 280, 40, 0x2a5a2a);
            foliage1.setDepth(13);
            foliage2.setDepth(13);
            foliage3.setDepth(13);
            foliage4.setDepth(14);
            
            // Hanging vines
            for (let v = 0; v < 3; v++) {
                const vine = this.add.rectangle(
                    x - 30 + v * 30,
                    this.groundLevel - 180 + Math.random() * 20,
                    3,
                    40 + Math.random() * 30,
                    0x2a4a2a
                );
                vine.setDepth(14);
                
                // Sway animation
                this.tweens.add({
                    targets: vine,
                    angle: { from: -5, to: 5 },
                    duration: 2000 + Math.random() * 1000,
                    yoyo: true,
                    repeat: -1
                });
            }
        }
        
        // Mushrooms
        this.createMushroom(200, this.groundLevel, 0xff4444);
        this.createMushroom(550, this.groundLevel, 0x44ff44);
        this.createMushroom(950, this.groundLevel, 0x4444ff);
        this.createMushroom(1400, this.groundLevel, 0xffff44);
    }

    createMushroom(x, y, capColor) {
        // Stem
        const stem = this.add.rectangle(x, y - 10, 8, 20, 0xeeddcc);
        stem.setDepth(5);
        
        // Cap
        const cap = this.add.ellipse(x, y - 22, 20, 12, capColor);
        cap.setDepth(6);
        
        // Spots
        const spot1 = this.add.circle(x - 5, y - 24, 3, 0xffffff, 0.7);
        const spot2 = this.add.circle(x + 4, y - 22, 2, 0xffffff, 0.7);
        spot1.setDepth(7);
        spot2.setDepth(7);
        
        // Subtle glow
        const glow = this.add.circle(x, y - 15, 25, capColor, 0.1);
        glow.setDepth(4);
        
        this.tweens.add({
            targets: glow,
            alpha: { from: 0.1, to: 0.2 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
    }

    createPortals() {
        // Back to town (left)
        this.addPortal(80, this.groundLevel, 'TownScene', '← Town', 1500);
        
        // To dungeon (right)
        this.addPortal(this.mapWidth - 80, this.groundLevel, 'DungeonScene', '→ Dungeon', 100);
    }
}

// Register scene
window.ForestScene = ForestScene;
