// ============================================
// REALMQUEST - UI Scene
// Handles HUD, hotbar, and in-game UI
// ============================================

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // Create HUD elements
        this.createHealthBar();
        this.createManaBar();
        this.createXPBar();
        this.createHotbar();
        this.createPlayerInfo();
        this.createGoldDisplay();
        this.createMiniInfo();
        
        // Update interval
        this.updateTimer = 0;
    }

    createHealthBar() {
        const x = 20;
        const y = 20;
        const width = 250;
        const height = 25;
        
        // Background
        this.healthBg = this.add.rectangle(x + width/2, y + height/2, width, height, 0x1a1a2e);
        this.healthBg.setStrokeStyle(2, 0x333333);
        
        // Health bar
        this.healthBar = this.add.rectangle(x + 3, y + 3, width - 6, height - 6, 0xc41e3a);
        this.healthBar.setOrigin(0, 0);
        
        // Health text
        this.healthText = this.add.text(x + width/2, y + height/2, '100/100', {
            fontSize: '14px',
            fontFamily: 'Cinzel, serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.healthText.setOrigin(0.5);
        
        // Heart icon
        this.add.text(x - 5, y + height/2, '❤️', { fontSize: '16px' }).setOrigin(1, 0.5);
    }

    createManaBar() {
        const x = 20;
        const y = 50;
        const width = 200;
        const height = 20;
        
        // Background
        this.manaBg = this.add.rectangle(x + width/2, y + height/2, width, height, 0x1a1a2e);
        this.manaBg.setStrokeStyle(2, 0x333333);
        
        // Mana bar
        this.manaBar = this.add.rectangle(x + 3, y + 3, width - 6, height - 6, 0x1e90ff);
        this.manaBar.setOrigin(0, 0);
        
        // Mana text
        this.manaText = this.add.text(x + width/2, y + height/2, '100/100', {
            fontSize: '12px',
            fontFamily: 'Cinzel, serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.manaText.setOrigin(0.5);
        
        // Mana icon
        this.add.text(x - 5, y + height/2, '🔵', { fontSize: '14px' }).setOrigin(1, 0.5);
    }

    createXPBar() {
        const x = 20;
        const y = 75;
        const width = 200;
        const height = 12;
        
        // Background
        this.xpBg = this.add.rectangle(x + width/2, y + height/2, width, height, 0x1a1a2e);
        this.xpBg.setStrokeStyle(1, 0x333333);
        
        // XP bar
        this.xpBar = this.add.rectangle(x + 2, y + 2, 0, height - 4, 0x32cd32);
        this.xpBar.setOrigin(0, 0);
        
        // XP text
        this.xpText = this.add.text(x + width/2, y + height/2, 'XP: 0/100', {
            fontSize: '10px',
            fontFamily: 'Crimson Text, serif',
            color: '#aaffaa',
            stroke: '#000000',
            strokeThickness: 1
        });
        this.xpText.setOrigin(0.5);
    }

    createPlayerInfo() {
        const x = 20;
        const y = 95;
        
        // Level and class
        this.levelText = this.add.text(x, y, 'Lv.1 Warrior', {
            fontSize: '16px',
            fontFamily: 'Cinzel, serif',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 2
        });
    }

    createGoldDisplay() {
        const x = 1260;
        const y = 20;
        
        // Gold icon and amount
        this.goldText = this.add.text(x, y, '💰 0', {
            fontSize: '18px',
            fontFamily: 'Cinzel, serif',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.goldText.setOrigin(1, 0);
    }

    createHotbar() {
        const startX = 400;
        const y = 680;
        const slotSize = 50;
        const spacing = 5;
        
        this.hotbarSlots = [];
        this.hotbarIcons = [];
        this.hotbarCooldowns = [];
        this.hotbarKeys = [];
        
        for (let i = 0; i < 5; i++) {
            const x = startX + i * (slotSize + spacing);
            
            // Slot background
            const slot = this.add.rectangle(x + slotSize/2, y + slotSize/2, slotSize, slotSize, 0x1a1a2e);
            slot.setStrokeStyle(2, 0x4a4a4a);
            slot.setInteractive({ useHandCursor: true });
            this.hotbarSlots.push(slot);
            
            // Skill icon
            const icon = this.add.text(x + slotSize/2, y + slotSize/2 - 5, '?', {
                fontSize: '24px'
            });
            icon.setOrigin(0.5);
            this.hotbarIcons.push(icon);
            
            // Cooldown overlay
            const cooldown = this.add.rectangle(x + slotSize/2, y + slotSize/2, slotSize - 4, 0, 0x000000, 0.7);
            cooldown.setOrigin(0.5, 1);
            cooldown.y = y + slotSize - 2;
            this.hotbarCooldowns.push(cooldown);
            
            // Key hint
            const key = this.add.text(x + 5, y + 5, (i + 1).toString(), {
                fontSize: '12px',
                fontFamily: 'Cinzel, serif',
                color: '#888888'
            });
            this.hotbarKeys.push(key);
            
            // Click handler
            const slotIndex = i;
            slot.on('pointerdown', () => {
                this.useSkill(slotIndex);
            });
            
            // Hover effect
            slot.on('pointerover', () => {
                slot.setStrokeStyle(2, 0xffd700);
                this.showSkillTooltip(slotIndex, x + slotSize/2, y - 10);
            });
            
            slot.on('pointerout', () => {
                slot.setStrokeStyle(2, 0x4a4a4a);
                this.hideTooltip();
            });
        }
    }

    createMiniInfo() {
        // Scene name
        this.sceneText = this.add.text(1260, 50, 'Town', {
            fontSize: '14px',
            fontFamily: 'Cinzel, serif',
            color: '#888888'
        });
        this.sceneText.setOrigin(1, 0);
        
        // Controls hint
        this.controlsHint = this.add.text(640, 650, 'I: Inventory | Q: Quests | E: Interact', {
            fontSize: '12px',
            fontFamily: 'Crimson Text, serif',
            color: '#666666'
        });
        this.controlsHint.setOrigin(0.5);
    }

    updateHUD(player) {
        if (!player) return;
        
        // Update health bar
        const healthPercent = player.currentHealth / player.stats.maxHealth;
        this.healthBar.scaleX = healthPercent;
        this.healthText.setText(`${Math.floor(player.currentHealth)}/${player.stats.maxHealth}`);
        
        // Health bar color based on percentage
        if (healthPercent < 0.25) {
            this.healthBar.setFillStyle(0xff0000);
        } else if (healthPercent < 0.5) {
            this.healthBar.setFillStyle(0xff6600);
        } else {
            this.healthBar.setFillStyle(0xc41e3a);
        }
        
        // Update mana bar
        const manaPercent = player.currentMana / player.stats.maxMana;
        this.manaBar.scaleX = manaPercent;
        this.manaText.setText(`${Math.floor(player.currentMana)}/${player.stats.maxMana}`);
        
        // Update XP bar
        const xpProgress = player.getXPProgress();
        const xpPercent = xpProgress.percent;
        this.xpBar.scaleX = xpPercent;
        this.xpText.setText(`XP: ${xpProgress.current}/${xpProgress.required}`);
        
        // Update level/class
        const className = GameData.classes[player.classId].name;
        this.levelText.setText(`Lv.${player.level} ${className}`);
        
        // Update gold
        this.goldText.setText(`💰 ${player.inventory.gold}`);
        
        // Update hotbar
        this.updateHotbar(player);
        
        // Update scene name
        const sceneKey = player.scene.scene.key;
        const sceneNames = {
            'TownScene': '🏘️ Starfall Village',
            'ForestScene': '🌲 Dark Forest',
            'DungeonScene': '🏰 Shadow Dungeon'
        };
        this.sceneText.setText(sceneNames[sceneKey] || sceneKey);
    }

    updateHotbar(player) {
        if (!player || !player.skills) return;
        
        const skills = player.scene.skills;
        
        for (let i = 0; i < this.hotbarSlots.length; i++) {
            if (i < player.skills.length) {
                const skillId = player.skills[i];
                const skillData = GameData.skills[skillId];
                
                // Update icon
                this.hotbarIcons[i].setText(skillData.icon);
                
                // Update cooldown overlay
                if (skills) {
                    const cdPercent = skills.getCooldownPercent(skillId);
                    this.hotbarCooldowns[i].scaleY = cdPercent;
                    
                    // Dim if on cooldown or not enough mana
                    if (cdPercent > 0 || player.currentMana < skillData.manaCost) {
                        this.hotbarSlots[i].setAlpha(0.5);
                    } else {
                        this.hotbarSlots[i].setAlpha(1);
                    }
                }
            } else {
                this.hotbarIcons[i].setText('');
            }
        }
    }

    useSkill(index) {
        const player = window.gameState.player;
        if (player && !player.isDead) {
            player.useSkill(index);
        }
    }

    showSkillTooltip(index, x, y) {
        const player = window.gameState.player;
        if (!player || index >= player.skills.length) return;
        
        const skillId = player.skills[index];
        const skillData = GameData.skills[skillId];
        
        // Create tooltip
        this.tooltip = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 200, 100, 0x1a1a2e);
        bg.setStrokeStyle(1, 0xffd700);
        bg.setOrigin(0.5, 1);
        
        const title = this.add.text(0, -85, `${skillData.icon} ${skillData.name}`, {
            fontSize: '14px',
            fontFamily: 'Cinzel, serif',
            color: '#ffd700'
        });
        title.setOrigin(0.5);
        
        const desc = this.add.text(0, -60, skillData.description, {
            fontSize: '11px',
            fontFamily: 'Crimson Text, serif',
            color: '#c9b896',
            wordWrap: { width: 180 },
            align: 'center'
        });
        desc.setOrigin(0.5, 0);
        
        const stats = this.add.text(0, -20, `Mana: ${skillData.manaCost} | CD: ${skillData.cooldown/1000}s`, {
            fontSize: '10px',
            fontFamily: 'Crimson Text, serif',
            color: '#888888'
        });
        stats.setOrigin(0.5);
        
        this.tooltip.add([bg, title, desc, stats]);
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.destroy();
            this.tooltip = null;
        }
    }

    update(time, delta) {
        // Update HUD periodically
        this.updateTimer += delta;
        if (this.updateTimer > 50) { // 20 updates per second
            this.updateTimer = 0;
            const player = window.gameState.player;
            if (player) {
                this.updateHUD(player);
            }
        }
    }
}

// Register scene
window.UIScene = UIScene;
