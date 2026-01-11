// ============================================
// REALMQUEST - Dungeon Scene
// Dangerous area with tough enemies and boss
// ============================================

class DungeonScene extends window.GameScene {
    constructor() {
        super('DungeonScene');
    }

    init(data) {
        super.init(data);
        this.mapWidth = 2400;
    }

    createBackground() {
        // Dark dungeon gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0a0f, 0x0a0a0f, 0x15101a, 0x15101a);
        bg.fillRect(0, 0, this.mapWidth, this.mapHeight);
        
        // Stone walls
        this.createWalls();
        
        // Torches along walls
        this.createTorches();
        
        // Ambient particles (dust)
        this.createDustParticles();
        
        // Eerie light beams
        this.createLightBeams();
    }

    createWalls() {
        const wallBg = this.add.graphics();
        
        // Back wall with stone texture
        wallBg.fillStyle(0x1a1a20);
        wallBg.fillRect(0, 0, this.mapWidth, this.groundLevel - 100);
        
        // Stone brick pattern
        for (let y = 50; y < this.groundLevel - 100; y += 50) {
            for (let x = 0; x < this.mapWidth; x += 80) {
                const offset = (Math.floor(y / 50) % 2) * 40;
                
                const brick = this.add.rectangle(
                    x + offset + 40,
                    y + 25,
                    75,
                    45,
                    0x222228
                );
                brick.setStrokeStyle(2, 0x1a1a1e);
                brick.setDepth(0);
            }
        }
        
        // Wall cracks
        this.addWallCracks();
    }

    addWallCracks() {
        const crackPositions = [
            { x: 200, y: 200 },
            { x: 600, y: 300 },
            { x: 1000, y: 150 },
            { x: 1400, y: 350 },
            { x: 1900, y: 250 },
            { x: 2200, y: 180 }
        ];
        
        for (const pos of crackPositions) {
            const crack = this.add.graphics();
            crack.lineStyle(2, 0x0a0a0f);
            crack.beginPath();
            crack.moveTo(pos.x, pos.y);
            crack.lineTo(pos.x + 10, pos.y + 30);
            crack.lineTo(pos.x - 5, pos.y + 50);
            crack.lineTo(pos.x + 15, pos.y + 80);
            crack.stroke();
            crack.setDepth(1);
        }
    }

    createTorches() {
        const torchPositions = [100, 400, 700, 1000, 1300, 1600, 1900, 2200];
        
        for (const x of torchPositions) {
            // Torch holder
            const holder = this.add.rectangle(x, 200, 15, 40, 0x4a3a2a);
            holder.setDepth(2);
            
            // Torch
            const torch = this.add.rectangle(x, 175, 8, 30, 0x5d3a1a);
            torch.setDepth(3);
            
            // Flame
            const flame = this.add.ellipse(x, 155, 12, 20, 0xff6622);
            flame.setDepth(4);
            
            const flameInner = this.add.ellipse(x, 158, 6, 12, 0xffaa44);
            flameInner.setDepth(5);
            
            // Flame animation
            this.tweens.add({
                targets: flame,
                scaleY: { from: 1, to: 1.3 },
                scaleX: { from: 1, to: 0.8 },
                duration: 200,
                yoyo: true,
                repeat: -1
            });
            
            this.tweens.add({
                targets: flameInner,
                scaleY: { from: 1, to: 1.2 },
                x: { from: x - 2, to: x + 2 },
                duration: 150,
                yoyo: true,
                repeat: -1
            });
            
            // Light glow
            const glow = this.add.circle(x, 170, 80, 0xff6622, 0.1);
            glow.setDepth(1);
            
            this.tweens.add({
                targets: glow,
                alpha: { from: 0.1, to: 0.15 },
                scale: { from: 1, to: 1.1 },
                duration: 300,
                yoyo: true,
                repeat: -1
            });
        }
    }

    createDustParticles() {
        for (let i = 0; i < 40; i++) {
            const dust = this.add.circle(
                Math.random() * this.mapWidth,
                Math.random() * this.groundLevel,
                Math.random() * 2 + 1,
                0x888888,
                Math.random() * 0.2 + 0.05
            );
            dust.setDepth(15);
            
            this.tweens.add({
                targets: dust,
                y: dust.y - 100 - Math.random() * 100,
                x: dust.x + (Math.random() - 0.5) * 100,
                alpha: 0,
                duration: 8000 + Math.random() * 4000,
                repeat: -1,
                onRepeat: () => {
                    dust.x = Math.random() * this.mapWidth;
                    dust.y = this.groundLevel;
                    dust.alpha = Math.random() * 0.2 + 0.05;
                }
            });
        }
    }

    createLightBeams() {
        const beamPositions = [300, 900, 1500, 2100];
        
        for (const x of beamPositions) {
            const beam = this.add.graphics();
            beam.fillStyle(0xffffee, 0.03);
            beam.beginPath();
            beam.moveTo(x - 20, 0);
            beam.lineTo(x + 20, 0);
            beam.lineTo(x + 60, this.groundLevel);
            beam.lineTo(x - 60, this.groundLevel);
            beam.closePath();
            beam.fill();
            beam.setDepth(16);
            
            // Animate
            this.tweens.add({
                targets: beam,
                alpha: { from: 0.03, to: 0.06 },
                duration: 3000,
                yoyo: true,
                repeat: -1
            });
        }
    }

    createGround() {
        // Stone floor
        this.ground = this.add.rectangle(
            this.mapWidth / 2,
            this.groundLevel + 40,
            this.mapWidth,
            80,
            0x2a2a30
        );
        this.ground.setDepth(2);
        
        // Floor tiles
        for (let x = 0; x < this.mapWidth; x += 60) {
            const tile = this.add.rectangle(
                x + 30,
                this.groundLevel + 20,
                55,
                35,
                0x333338
            );
            tile.setStrokeStyle(1, 0x1a1a1e);
            tile.setDepth(3);
        }
        
        // Scattered bones
        this.scatterBones();
    }

    scatterBones() {
        const bonePositions = [150, 450, 750, 1050, 1350, 1650, 1950, 2250];
        
        for (const x of bonePositions) {
            // Random bone type
            const type = Math.floor(Math.random() * 3);
            
            if (type === 0) {
                // Skull
                const skull = this.add.circle(x, this.groundLevel - 8, 10, 0xddddcc);
                skull.setDepth(4);
                const eye1 = this.add.circle(x - 4, this.groundLevel - 10, 2, 0x1a1a1a);
                const eye2 = this.add.circle(x + 4, this.groundLevel - 10, 2, 0x1a1a1a);
                eye1.setDepth(5);
                eye2.setDepth(5);
            } else if (type === 1) {
                // Long bone
                const bone = this.add.rectangle(x, this.groundLevel - 5, 30, 6, 0xddddcc);
                bone.setAngle(Math.random() * 30 - 15);
                bone.setDepth(4);
            } else {
                // Rib cage
                for (let i = 0; i < 4; i++) {
                    const rib = this.add.ellipse(x + i * 8, this.groundLevel - 10, 12, 20, 0xddddcc);
                    rib.setAngle(20 - i * 10);
                    rib.setDepth(4);
                }
            }
        }
    }

    createPlatforms() {
        // Stone platforms
        this.createStonePlatform(350, this.groundLevel - 100, 150);
        this.createStonePlatform(700, this.groundLevel - 180, 120);
        this.createStonePlatform(1000, this.groundLevel - 100, 180);
        this.createStonePlatform(1400, this.groundLevel - 150, 140);
        this.createStonePlatform(1800, this.groundLevel - 200, 160);
        
        // Chains hanging
        this.createHangingChains(500, 0);
        this.createHangingChains(1200, 0);
        this.createHangingChains(1900, 0);
    }

    createStonePlatform(x, y, width) {
        const platform = this.add.rectangle(x, y, width, 25, 0x3a3a40);
        platform.setStrokeStyle(2, 0x2a2a30);
        platform.setDepth(5);
        
        // Cracks on platform
        const crack = this.add.graphics();
        crack.lineStyle(1, 0x1a1a20);
        crack.lineBetween(x - width/4, y - 5, x - width/4 + 10, y + 8);
        crack.lineBetween(x + width/3, y - 8, x + width/3 - 5, y + 5);
        crack.setDepth(6);
    }

    createHangingChains(x, startY) {
        const chainLength = 150 + Math.random() * 100;
        
        for (let y = startY; y < chainLength; y += 15) {
            const link = this.add.ellipse(x, y, 8, 15, 0x555555);
            link.setStrokeStyle(2, 0x333333);
            link.setDepth(3);
            link.setAngle((Math.floor(y / 15) % 2) * 90);
        }
        
        // Swinging animation
        const chain = { x: x };
        this.tweens.add({
            targets: chain,
            x: x + 10,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createEntities() {
        // Decorations
        this.createDungeonDecorations();
        
        // Enemies - progressively harder
        // Skeletons
        this.spawnEnemy('skeleton', 300, this.groundLevel);
        this.spawnEnemy('skeleton', 600, this.groundLevel);
        this.spawnEnemy('skeleton', 1000, this.groundLevel);
        
        // Dark Mages
        this.spawnEnemy('dark_mage', 800, this.groundLevel);
        this.spawnEnemy('dark_mage', 1300, this.groundLevel);
        
        // Orc Warriors
        this.spawnEnemy('orc_warrior', 1500, this.groundLevel);
        this.spawnEnemy('orc_warrior', 1800, this.groundLevel);
        
        // BOSS at the end
        this.spawnEnemy('dungeon_boss', 2200, this.groundLevel);
        
        // Boss arena decoration
        this.createBossArena(2200);
    }

    createDungeonDecorations() {
        // Pillars
        this.createPillar(200);
        this.createPillar(600);
        this.createPillar(1100);
        this.createPillar(1600);
        this.createPillar(2000);
        
        // Barrels and crates
        this.createBarrel(350, this.groundLevel);
        this.createCrate(850, this.groundLevel);
        this.createBarrel(1250, this.groundLevel);
        this.createCrate(1700, this.groundLevel);
        
        // Cobwebs
        this.createCobweb(100, 50);
        this.createCobweb(550, 80);
        this.createCobweb(950, 40);
        this.createCobweb(1450, 70);
    }

    createPillar(x) {
        // Base
        const base = this.add.rectangle(x, this.groundLevel - 20, 50, 40, 0x3a3a40);
        base.setDepth(4);
        
        // Column
        const column = this.add.rectangle(x, this.groundLevel - 200, 35, 320, 0x333338);
        column.setDepth(4);
        
        // Capital
        const capital = this.add.rectangle(x, this.groundLevel - 365, 50, 30, 0x3a3a40);
        capital.setDepth(4);
        
        // Cracks
        const cracks = this.add.graphics();
        cracks.lineStyle(2, 0x1a1a20);
        cracks.lineBetween(x - 10, this.groundLevel - 150, x + 5, this.groundLevel - 180);
        cracks.lineBetween(x + 8, this.groundLevel - 250, x - 8, this.groundLevel - 220);
        cracks.setDepth(5);
    }

    createBarrel(x, y) {
        const barrel = this.add.ellipse(x, y - 20, 30, 40, 0x5d3a1a);
        barrel.setDepth(5);
        
        // Bands
        const band1 = this.add.rectangle(x, y - 30, 32, 4, 0x333333);
        const band2 = this.add.rectangle(x, y - 10, 32, 4, 0x333333);
        band1.setDepth(6);
        band2.setDepth(6);
    }

    createCrate(x, y) {
        const crate = this.add.rectangle(x, y - 20, 40, 40, 0x5d3a1a);
        crate.setDepth(5);
        
        // Cross pattern
        const h = this.add.rectangle(x, y - 20, 38, 4, 0x4a2a10);
        const v = this.add.rectangle(x, y - 20, 4, 38, 0x4a2a10);
        h.setDepth(6);
        v.setDepth(6);
    }

    createCobweb(x, y) {
        const web = this.add.graphics();
        web.lineStyle(1, 0xcccccc, 0.3);
        
        // Radial lines
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI;
            web.lineBetween(x, y, x + Math.cos(angle) * 60, y + Math.sin(angle) * 60);
        }
        
        // Spiral
        for (let r = 15; r < 60; r += 15) {
            web.beginPath();
            for (let i = 0; i <= 8; i++) {
                const angle = (i / 8) * Math.PI;
                const px = x + Math.cos(angle) * r;
                const py = y + Math.sin(angle) * r;
                if (i === 0) web.moveTo(px, py);
                else web.lineTo(px, py);
            }
            web.stroke();
        }
        
        web.setDepth(2);
    }

    createBossArena(x) {
        // Red carpet leading to boss
        const carpet = this.add.rectangle(x - 150, this.groundLevel - 3, 350, 15, 0x660022);
        carpet.setDepth(3);
        
        // Ornate pillars
        for (const offset of [-200, 200]) {
            const pillar = this.add.rectangle(x + offset, this.groundLevel - 180, 40, 360, 0x4a3030);
            pillar.setDepth(4);
            
            // Skull decoration
            const skull = this.add.circle(x + offset, this.groundLevel - 300, 15, 0xddddcc);
            skull.setDepth(5);
        }
        
        // Ominous glow
        const glow = this.add.circle(x, this.groundLevel - 50, 150, 0x440022, 0.2);
        glow.setDepth(1);
        
        this.tweens.add({
            targets: glow,
            alpha: { from: 0.2, to: 0.35 },
            scale: { from: 1, to: 1.1 },
            duration: 2000,
            yoyo: true,
            repeat: -1
        });
        
        // Warning text
        const warning = this.add.text(x, this.groundLevel - 400, '⚠️ BOSS AHEAD ⚠️', {
            fontSize: '20px',
            fontFamily: 'Cinzel, serif',
            color: '#ff4444',
            stroke: '#000000',
            strokeThickness: 3
        });
        warning.setOrigin(0.5);
        warning.setDepth(20);
        
        this.tweens.add({
            targets: warning,
            alpha: { from: 1, to: 0.5 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    createPortals() {
        // Back to forest
        this.addPortal(80, this.groundLevel, 'ForestScene', '← Forest', 1900);
    }
}

// Register scene
window.DungeonScene = DungeonScene;
