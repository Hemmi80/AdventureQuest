// ============================================
// REALMQUEST - Town Scene
// Safe hub area with NPCs, shops, and quests
// ============================================

class TownScene extends window.GameScene {
    constructor() {
        super('TownScene');
    }

    init(data) {
        super.init(data);
        this.mapWidth = 1600;
    }

    createBackground() {
        // Sky gradient (warm sunset)
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x2a1a3a, 0x2a1a3a, 0x4a2a2a, 0x4a2a2a);
        bg.fillRect(0, 0, this.mapWidth, this.mapHeight);
        
        // Sun
        const sun = this.add.circle(1400, 150, 60, 0xffaa44, 0.8);
        const sunGlow = this.add.circle(1400, 150, 100, 0xffaa44, 0.2);
        
        // Clouds
        this.createCloud(200, 100);
        this.createCloud(600, 80);
        this.createCloud(1000, 120);
        this.createCloud(1400, 60);
        
        // Distant buildings
        this.drawDistantBuildings();
        
        // Trees in background
        this.drawBackgroundTrees();
    }

    createCloud(x, y) {
        const cloud = this.add.graphics();
        cloud.fillStyle(0xffffff, 0.3);
        cloud.fillCircle(x, y, 30);
        cloud.fillCircle(x + 25, y - 10, 25);
        cloud.fillCircle(x + 50, y, 35);
        cloud.fillCircle(x + 75, y - 5, 20);
        
        // Slow drift
        this.tweens.add({
            targets: cloud,
            x: 50,
            duration: 60000,
            yoyo: true,
            repeat: -1
        });
    }

    drawDistantBuildings() {
        const buildings = this.add.graphics();
        buildings.fillStyle(0x1a1a2a);
        
        // Various building shapes
        buildings.fillRect(50, 350, 80, 200);
        buildings.fillRect(150, 380, 60, 170);
        buildings.fillRect(230, 320, 100, 230);
        buildings.fillRect(700, 360, 90, 190);
        buildings.fillRect(820, 390, 70, 160);
        buildings.fillRect(1200, 340, 110, 210);
        buildings.fillRect(1340, 380, 80, 170);
        buildings.fillRect(1450, 350, 100, 200);
        
        // Rooftops
        buildings.fillStyle(0x252535);
        buildings.beginPath();
        buildings.moveTo(50, 350);
        buildings.lineTo(90, 310);
        buildings.lineTo(130, 350);
        buildings.closePath();
        buildings.fill();
        
        buildings.beginPath();
        buildings.moveTo(230, 320);
        buildings.lineTo(280, 270);
        buildings.lineTo(330, 320);
        buildings.closePath();
        buildings.fill();
    }

    drawBackgroundTrees() {
        // Trees on the sides
        for (let i = 0; i < 8; i++) {
            const x = 100 + i * 200;
            const y = this.groundLevel + 10;
            
            // Tree trunk
            const trunk = this.add.rectangle(x, y - 40, 15, 80, 0x3d2817);
            trunk.setDepth(3);
            
            // Tree foliage
            const foliage = this.add.circle(x, y - 100, 40, 0x1a3a1a);
            foliage.setDepth(3);
        }
    }

    createGround() {
        // Cobblestone ground
        this.ground = this.add.rectangle(
            this.mapWidth / 2,
            this.groundLevel + 40,
            this.mapWidth,
            80,
            0x3a3a3a
        );
        this.ground.setDepth(2);
        
        // Stone pattern
        for (let x = 20; x < this.mapWidth; x += 40) {
            const stone = this.add.rectangle(
                x + Math.random() * 10,
                this.groundLevel + 30 + Math.random() * 20,
                30 + Math.random() * 15,
                20 + Math.random() * 10,
                0x4a4a4a
            );
            stone.setDepth(3);
            stone.setAlpha(0.5);
        }
        
        // Ground line
        this.groundTop = this.add.rectangle(
            this.mapWidth / 2,
            this.groundLevel,
            this.mapWidth,
            3,
            0x5a5a5a
        );
        this.groundTop.setDepth(4);
    }

    createEntities() {
        // Draw town decorations first
        this.createTownDecorations();
        
        // NPCs
        this.spawnNPC('elder_marcus', 300, this.groundLevel);
        this.spawnNPC('blacksmith_hilda', 600, this.groundLevel);
        this.spawnNPC('potion_master', 900, this.groundLevel);
        this.spawnNPC('guard_captain', 1200, this.groundLevel);
        this.spawnNPC('class_trainer', 1450, this.groundLevel);
    }

    createTownDecorations() {
        // Town sign
        const signPost = this.add.rectangle(100, this.groundLevel - 60, 8, 120, 0x5d3a1a);
        signPost.setDepth(5);
        
        const sign = this.add.rectangle(100, this.groundLevel - 110, 120, 40, 0x8b6914);
        sign.setDepth(6);
        
        const signText = this.add.text(100, this.groundLevel - 110, 'STARFALL VILLAGE', {
            fontSize: '12px',
            fontFamily: 'Cinzel, serif',
            color: '#3d2817'
        });
        signText.setOrigin(0.5);
        signText.setDepth(7);
        
        // Fountain in center
        this.createFountain(750, this.groundLevel);
        
        // Lamp posts
        this.createLampPost(400, this.groundLevel);
        this.createLampPost(1100, this.groundLevel);
        
        // Benches
        this.createBench(500, this.groundLevel);
        this.createBench(1000, this.groundLevel);
        
        // Flower pots
        for (let x = 200; x < this.mapWidth - 200; x += 300) {
            this.createFlowerPot(x + Math.random() * 50, this.groundLevel);
        }
        
        // Market stalls
        this.createMarketStall(550, this.groundLevel, 0xcc6633); // Blacksmith
        this.createMarketStall(850, this.groundLevel, 0x9944aa); // Potion
    }

    createFountain(x, y) {
        // Base
        const base = this.add.rectangle(x, y - 15, 100, 30, 0x555555);
        base.setDepth(5);
        
        // Bowl
        const bowl = this.add.ellipse(x, y - 30, 80, 20, 0x444444);
        bowl.setDepth(6);
        
        // Water
        const water = this.add.ellipse(x, y - 32, 70, 15, 0x4488cc, 0.7);
        water.setDepth(7);
        
        // Pillar
        const pillar = this.add.rectangle(x, y - 55, 15, 50, 0x666666);
        pillar.setDepth(6);
        
        // Water spray particles
        for (let i = 0; i < 5; i++) {
            const drop = this.add.circle(x, y - 80, 3, 0x66aaff, 0.6);
            drop.setDepth(8);
            
            this.tweens.add({
                targets: drop,
                y: y - 35,
                x: x + (Math.random() - 0.5) * 40,
                alpha: 0,
                duration: 1000,
                repeat: -1,
                delay: i * 200,
                onRepeat: () => {
                    drop.x = x + (Math.random() - 0.5) * 10;
                    drop.y = y - 80;
                    drop.alpha = 0.6;
                }
            });
        }
    }

    createLampPost(x, y) {
        // Post
        const post = this.add.rectangle(x, y - 70, 6, 140, 0x333333);
        post.setDepth(5);
        
        // Lamp housing
        const housing = this.add.rectangle(x, y - 145, 20, 25, 0x444444);
        housing.setDepth(6);
        
        // Light
        const light = this.add.circle(x, y - 145, 8, 0xffcc44);
        light.setDepth(7);
        
        // Glow
        const glow = this.add.circle(x, y - 145, 30, 0xffcc44, 0.2);
        glow.setDepth(4);
        
        this.tweens.add({
            targets: [light, glow],
            alpha: { from: 1, to: 0.7 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    createBench(x, y) {
        // Legs
        const leg1 = this.add.rectangle(x - 25, y - 10, 5, 20, 0x5d3a1a);
        const leg2 = this.add.rectangle(x + 25, y - 10, 5, 20, 0x5d3a1a);
        leg1.setDepth(5);
        leg2.setDepth(5);
        
        // Seat
        const seat = this.add.rectangle(x, y - 22, 70, 8, 0x8b6914);
        seat.setDepth(6);
        
        // Back
        const back = this.add.rectangle(x, y - 40, 70, 5, 0x8b6914);
        back.setDepth(6);
    }

    createFlowerPot(x, y) {
        // Pot
        const pot = this.add.rectangle(x, y - 10, 20, 20, 0x8b4513);
        pot.setDepth(5);
        
        // Flowers
        const colors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff];
        const color = Phaser.Utils.Array.GetRandom(colors);
        
        const flower1 = this.add.circle(x - 5, y - 25, 6, color);
        const flower2 = this.add.circle(x + 5, y - 28, 5, color);
        const flower3 = this.add.circle(x, y - 22, 4, color);
        flower1.setDepth(6);
        flower2.setDepth(6);
        flower3.setDepth(6);
    }

    createMarketStall(x, y, color) {
        // Posts
        const post1 = this.add.rectangle(x - 35, y - 50, 6, 100, 0x5d3a1a);
        const post2 = this.add.rectangle(x + 35, y - 50, 6, 100, 0x5d3a1a);
        post1.setDepth(4);
        post2.setDepth(4);
        
        // Counter
        const counter = this.add.rectangle(x, y - 30, 80, 15, 0x8b6914);
        counter.setDepth(5);
        
        // Awning
        const awning = this.add.triangle(x, y - 110, -50, 30, 0, -20, 50, 30, color);
        awning.setDepth(6);
    }

    createPortals() {
        // Portal to Forest (right side)
        this.addPortal(this.mapWidth - 80, this.groundLevel, 'ForestScene', '→ Forest', 100);
    }
}

// Register scene
window.TownScene = TownScene;
