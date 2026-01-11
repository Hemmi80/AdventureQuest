// ============================================
// REALMQUEST - Base Game Scene
// Base class for all playable scenes
// ============================================

class GameScene extends Phaser.Scene {
    constructor(key) {
        super({ key: key });
        this.sceneKey = key;
    }

    init(data) {
        this.initData = data || {};
        this.mapWidth = 1280;
        this.mapHeight = 720;
        this.groundLevel = 550;
    }

    create() {
        // Initialize systems
        this.combat = new window.CombatSystem(this);
        this.skills = new window.SkillSystem(this);
        
        // Arrays for entities
        this.enemies = [];
        this.npcs = [];
        this.portals = [];
        
        // Create world
        this.createBackground();
        this.createGround();
        this.createPlatforms();
        
        // Create player
        this.createPlayer();
        
        // Create entities specific to this scene
        this.createEntities();
        
        // Create portals
        this.createPortals();
        
        // Start UI scene
        this.scene.launch('UIScene');
        this.uiScene = this.scene.get('UIScene');
        
        // Setup camera
        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
        if (this.mapWidth > 1280) {
            this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        }
        
        // Keyboard shortcuts for modals
        this.input.keyboard.on('keydown-ESC', () => {
            window.closeAllModals();
        });

        // Setup multiplayer
        if (window.Multiplayer) {
            window.Multiplayer.setScene(this);
            window.Multiplayer.setLocalPlayer(this.player);
        }
    }

    createBackground() {
        // Override in child classes
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0a0a1e, 0x0a0a1e);
        bg.fillRect(0, 0, this.mapWidth, this.mapHeight);
    }

    createGround() {
        // Main ground
        this.ground = this.add.rectangle(
            this.mapWidth / 2, 
            this.groundLevel + 25, 
            this.mapWidth, 
            50, 
            0x2d2d2d
        );
        this.ground.setDepth(2);
        
        // Ground top (grass/stone line)
        this.groundTop = this.add.rectangle(
            this.mapWidth / 2,
            this.groundLevel,
            this.mapWidth,
            4,
            0x4a4a4a
        );
        this.groundTop.setDepth(3);
    }

    createPlatforms() {
        this.platforms = [];
        // Override in child classes to add platforms
    }

    createPlayer() {
        // Check for save data
        if (this.initData.saveData) {
            const saveData = this.initData.saveData;
            const spawnX = saveData.player.position.x || 200;
            const spawnY = saveData.player.position.y || this.groundLevel;
            
            this.player = new window.Player(this, spawnX, spawnY, saveData.player.classId);
            this.player.loadFromSave(saveData.player);
            this.player.quests.init(saveData.quests.active, saveData.quests.completed);
        } else if (this.initData.player) {
            // Transfer player from another scene
            const oldPlayer = this.initData.player;
            const spawnX = this.initData.spawnX || 200;
            const spawnY = this.initData.spawnY || this.groundLevel;
            
            this.player = new window.Player(this, spawnX, spawnY, oldPlayer.classId);
            this.player.level = oldPlayer.level;
            this.player.xp = oldPlayer.xp;
            this.player.inventory = oldPlayer.inventory;
            this.player.quests = oldPlayer.quests;
            this.player.recalculateStats();
            this.player.currentHealth = oldPlayer.currentHealth;
            this.player.currentMana = oldPlayer.currentMana;
        } else {
            // New game
            const spawnX = this.initData.spawnX || 200;
            this.player = new window.Player(this, spawnX, this.groundLevel, 'warrior');
            
            // Show class selection for new game
            if (this.initData.newGame) {
                this.time.delayedCall(500, () => {
                    window.showClassSelection();
                });
            }
        }
        
        // Store reference globally
        window.gameState.player = this.player;
    }

    createEntities() {
        // Override in child classes
    }

    createPortals() {
        // Override in child classes
    }

    addPortal(x, y, targetScene, label, spawnX = 200) {
        const portal = {
            x: x,
            y: y,
            targetScene: targetScene,
            spawnX: spawnX,
            range: 60
        };
        
        // Visual representation
        portal.sprite = this.add.rectangle(x, y - 40, 50, 80, 0x6633ff, 0.3);
        portal.sprite.setDepth(5);
        
        // Portal glow
        portal.glow = this.add.rectangle(x, y - 40, 60, 90, 0x6633ff, 0.15);
        portal.glow.setDepth(4);
        
        // Animate portal
        this.tweens.add({
            targets: [portal.sprite, portal.glow],
            alpha: { from: 0.3, to: 0.6 },
            scaleY: { from: 1, to: 1.05 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Label
        portal.label = this.add.text(x, y - 100, label, {
            fontSize: '14px',
            fontFamily: 'Cinzel, serif',
            color: '#aa88ff',
            stroke: '#000000',
            strokeThickness: 2
        });
        portal.label.setOrigin(0.5);
        portal.label.setDepth(25);
        
        // Interaction hint
        portal.hint = this.add.text(x, y - 120, '[E] Enter', {
            fontSize: '12px',
            fontFamily: 'Crimson Text, serif',
            color: '#888888'
        });
        portal.hint.setOrigin(0.5);
        portal.hint.setDepth(25);
        portal.hint.setVisible(false);
        
        this.portals.push(portal);
        return portal;
    }

    update(time, delta) {
        // Update player
        if (this.player && !this.player.isDead) {
            this.player.update(delta);
        }
        
        // Update enemies
        for (const enemy of this.enemies) {
            if (!enemy.isDead) {
                enemy.update(delta, this.player);
            }
        }
        
        // Update NPCs
        for (const npc of this.npcs) {
            npc.update(delta, this.player);
        }
        
        // Update combat system (status effects)
        this.combat.update(delta);
        
        // Update skill system (projectiles)
        this.skills.updateProjectiles(this.enemies);
        
        // Check portal proximity
        this.updatePortals();
        
        // Update UI
        if (this.uiScene && this.uiScene.updateHUD) {
            this.uiScene.updateHUD(this.player);
        }
        
        // Auto-save periodically
        this.autoSaveTimer = (this.autoSaveTimer || 0) + delta;
        if (this.autoSaveTimer > 30000) { // Every 30 seconds
            this.autoSaveTimer = 0;
            this.saveGame();
        }

        // Send multiplayer position updates
        if (window.Multiplayer && window.Multiplayer.isConnected) {
            window.Multiplayer.sendPositionUpdate();
        }
    }

    updatePortals() {
        for (const portal of this.portals) {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                portal.x, portal.y
            );
            
            const inRange = distance < portal.range;
            portal.hint.setVisible(inRange);
            
            if (inRange && portal.glow) {
                portal.glow.setFillStyle(0x8855ff, 0.3);
            } else if (portal.glow) {
                portal.glow.setFillStyle(0x6633ff, 0.15);
            }
        }
    }

    checkInteraction(player) {
        // Check NPCs
        for (const npc of this.npcs) {
            if (npc.canInteract(player)) {
                npc.interact(player);
                return;
            }
        }
        
        // Check portals
        for (const portal of this.portals) {
            const distance = Phaser.Math.Distance.Between(
                player.x, player.y,
                portal.x, portal.y
            );
            
            if (distance < portal.range) {
                this.enterPortal(portal);
                return;
            }
        }
    }

    enterPortal(portal) {
        // Save current state
        this.saveGame();
        
        // Notify multiplayer of scene change
        if (window.Multiplayer && window.Multiplayer.isConnected) {
            window.Multiplayer.sendSceneChange(portal.targetScene, portal.spawnX, this.groundLevel);
        }
        
        // Transition effect
        this.cameras.main.fadeOut(500, 0, 0, 0);
        
        this.time.delayedCall(500, () => {
            // Stop UI scene
            this.scene.stop('UIScene');
            
            // Clean up current scene
            this.cleanup();
            
            // Start target scene
            this.scene.start(portal.targetScene, {
                player: this.player,
                spawnX: portal.spawnX,
                spawnY: this.groundLevel
            });
        });
    }

    saveGame() {
        if (this.player && window.SaveSystem) {
            const saveData = this.player.getSaveData();
            saveData.currentScene = this.sceneKey;
            window.SaveSystem.saveGame(saveData);
        }
    }

    cleanup() {
        // Destroy all entities
        for (const enemy of this.enemies) {
            enemy.destroy();
        }
        for (const npc of this.npcs) {
            npc.destroy();
        }
        
        // Clear projectiles
        this.skills.clearProjectiles();
        
        // Clear arrays
        this.enemies = [];
        this.npcs = [];
        this.portals = [];
    }

    // Spawn an enemy
    spawnEnemy(enemyId, x, y) {
        const enemy = new window.Enemy(this, x, y, enemyId);
        this.enemies.push(enemy);
        return enemy;
    }

    // Spawn an NPC
    spawnNPC(npcId, x, y) {
        const npc = new window.NPC(this, x, y, npcId);
        this.npcs.push(npc);
        return npc;
    }
}

// Export for use
window.GameScene = GameScene;
