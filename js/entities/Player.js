// ============================================
// REALMQUEST - Player Entity
// Handles player movement, combat, stats, and rendering
// ============================================

class Player {
    constructor(scene, x, y, classId = 'warrior') {
        this.scene = scene;
        this.isPlayer = true;
        
        // Position and physics
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.facingRight = true;
        
        // Movement properties
        this.moveSpeed = 250;
        this.jumpForce = -450;
        this.gravity = 1200;
        this.isGrounded = false;
        this.canDoubleJump = true;
        this.jumpCount = 0;
        this.maxJumps = 2;
        
        // Class and stats
        this.classId = classId;
        this.level = 1;
        this.xp = 0;
        this.initializeClass(classId);
        
        // Current values
        this.currentHealth = this.stats.maxHealth;
        this.currentMana = this.stats.maxMana;
        
        // Combat state
        this.isAttacking = false;
        this.isStunned = false;
        this.isInvulnerable = false;
        this.attackMultiplier = 1;
        this.speedMultiplier = 1;
        
        // Systems
        this.inventory = new window.InventorySystem();
        this.quests = new window.QuestSystem();
        
        // Give starting equipment
        this.inventory.addItem('rusty_sword');
        this.inventory.addItem('health_potion', 3);
        this.inventory.equipItem('rusty_sword');
        this.inventory.addGold(50);
        
        // Animation state
        this.currentAnim = 'idle';
        this.animTimer = 0;
        
        // Create sprite
        this.createSprite();
        
        // Input
        this.setupInput();
        
        // Mana regeneration
        this.manaRegenTimer = 0;
        this.manaRegenRate = 2; // Mana per second
    }

    // Initialize class stats
    initializeClass(classId) {
        const classData = GameData.classes[classId];
        if (!classData) {
            console.error(`Invalid class: ${classId}`);
            classId = 'warrior';
        }
        
        this.classId = classId;
        const baseStats = GameData.classes[classId].baseStats;
        
        // Calculate stats with level bonuses
        this.stats = {
            maxHealth: baseStats.maxHealth + (this.level - 1) * GameData.statsPerLevel.maxHealth,
            maxMana: baseStats.maxMana + (this.level - 1) * GameData.statsPerLevel.maxMana,
            attack: baseStats.attack + (this.level - 1) * GameData.statsPerLevel.attack,
            defense: baseStats.defense + (this.level - 1) * GameData.statsPerLevel.defense,
            speed: baseStats.speed,
            critChance: baseStats.critChance
        };
        
        // Get skills for this class
        this.skills = ['basic_attack', ...GameData.classes[classId].skills];
    }

    // Change class
    changeClass(newClassId) {
        const wasMaxHealth = this.stats.maxHealth;
        const wasMaxMana = this.stats.maxMana;
        const healthPercent = this.currentHealth / wasMaxHealth;
        const manaPercent = this.currentMana / wasMaxMana;
        
        this.initializeClass(newClassId);
        this.recalculateStats();
        
        // Maintain health/mana percentage
        this.currentHealth = Math.floor(this.stats.maxHealth * healthPercent);
        this.currentMana = Math.floor(this.stats.maxMana * manaPercent);
        
        // Update sprite color
        if (this.sprite) {
            this.sprite.setFillStyle(GameData.classes[newClassId].color);
        }
        
        // Reset cooldowns
        if (this.scene.skills) {
            this.scene.skills.resetCooldowns();
        }
    }

    // Recalculate stats with equipment
    recalculateStats() {
        const classData = GameData.classes[this.classId];
        const baseStats = classData.baseStats;
        
        // Base stats + level bonuses
        this.stats = {
            maxHealth: baseStats.maxHealth + (this.level - 1) * GameData.statsPerLevel.maxHealth,
            maxMana: baseStats.maxMana + (this.level - 1) * GameData.statsPerLevel.maxMana,
            attack: baseStats.attack + (this.level - 1) * GameData.statsPerLevel.attack,
            defense: baseStats.defense + (this.level - 1) * GameData.statsPerLevel.defense,
            speed: baseStats.speed,
            critChance: baseStats.critChance
        };
        
        // Add equipment stats
        const equipStats = this.inventory.getEquipmentStats();
        for (const stat in equipStats) {
            if (this.stats.hasOwnProperty(stat)) {
                this.stats[stat] += equipStats[stat];
            }
        }
        
        // Update move speed based on speed stat
        this.moveSpeed = 200 + this.stats.speed;
    }

    // Create sprite representation
    createSprite() {
        // Main body (colored rectangle for now - can be replaced with sprite)
        const classColor = GameData.classes[this.classId].color;
        
        this.sprite = this.scene.add.rectangle(this.x, this.y, 40, 60, classColor);
        this.sprite.setOrigin(0.5, 1);
        this.sprite.setDepth(10);
        
        // Add head
        this.head = this.scene.add.circle(this.x, this.y - 70, 15, 0xffcc99);
        this.head.setDepth(11);
        
        // Add weapon indicator
        this.weaponSprite = this.scene.add.rectangle(this.x + 25, this.y - 30, 8, 35, 0x888888);
        this.weaponSprite.setOrigin(0.5, 1);
        this.weaponSprite.setDepth(12);
        
        // Shadow
        this.shadow = this.scene.add.ellipse(this.x, this.y, 40, 15, 0x000000, 0.3);
        this.shadow.setDepth(1);
        
        // Add physics body
        this.width = 40;
        this.height = 60;
    }

    // Setup input handling
    setupInput() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.keys = this.scene.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
            ONE: Phaser.Input.Keyboard.KeyCodes.ONE,
            TWO: Phaser.Input.Keyboard.KeyCodes.TWO,
            THREE: Phaser.Input.Keyboard.KeyCodes.THREE,
            FOUR: Phaser.Input.Keyboard.KeyCodes.FOUR,
            FIVE: Phaser.Input.Keyboard.KeyCodes.FIVE,
            E: Phaser.Input.Keyboard.KeyCodes.E,
            I: Phaser.Input.Keyboard.KeyCodes.I,
            Q: Phaser.Input.Keyboard.KeyCodes.Q
        });
        
        // Skill hotkeys
        this.skillKeys = [
            this.keys.ONE,
            this.keys.TWO,
            this.keys.THREE,
            this.keys.FOUR,
            this.keys.FIVE
        ];
    }

    // Update player each frame
    update(delta) {
        if (this.isDead) return;
        
        const deltaSeconds = delta / 1000;
        
        // Handle input
        this.handleMovement(deltaSeconds);
        this.handleSkillInput();
        this.handleInteractionInput();
        
        // Apply gravity
        if (!this.isGrounded) {
            this.velocityY += this.gravity * deltaSeconds;
        }
        
        // Update position
        this.x += this.velocityX * deltaSeconds;
        this.y += this.velocityY * deltaSeconds;
        
        // Ground collision (scene provides ground level)
        const groundLevel = this.scene.groundLevel || 550;
        if (this.y >= groundLevel) {
            this.y = groundLevel;
            this.velocityY = 0;
            this.isGrounded = true;
            this.jumpCount = 0;
        }
        
        // Screen bounds
        const minX = 30;
        const maxX = (this.scene.mapWidth || 1280) - 30;
        this.x = Phaser.Math.Clamp(this.x, minX, maxX);
        
        // Update sprite positions
        this.updateSpritePositions();
        
        // Mana regeneration
        this.manaRegenTimer += deltaSeconds;
        if (this.manaRegenTimer >= 1) {
            this.manaRegenTimer = 0;
            this.restoreMana(this.manaRegenRate);
        }
        
        // Update animation
        this.updateAnimation();
    }

    // Handle movement input
    handleMovement(deltaSeconds) {
        if (this.isStunned) {
            this.velocityX = 0;
            return;
        }
        
        // Horizontal movement
        const effectiveSpeed = this.moveSpeed * this.speedMultiplier;
        
        if (this.keys.A.isDown || this.cursors.left.isDown) {
            this.velocityX = -effectiveSpeed;
            this.facingRight = false;
        } else if (this.keys.D.isDown || this.cursors.right.isDown) {
            this.velocityX = effectiveSpeed;
            this.facingRight = true;
        } else {
            this.velocityX = 0;
        }
        
        // Jumping
        if (Phaser.Input.Keyboard.JustDown(this.keys.W) || 
            Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            
            if (this.jumpCount < this.maxJumps) {
                this.velocityY = this.jumpForce;
                this.isGrounded = false;
                this.jumpCount++;
            }
        }
    }

    // Handle skill input
    handleSkillInput() {
        if (this.isStunned) return;
        
        for (let i = 0; i < this.skillKeys.length && i < this.skills.length; i++) {
            if (Phaser.Input.Keyboard.JustDown(this.skillKeys[i])) {
                this.useSkill(i);
            }
        }
    }

    // Handle interaction input
    handleInteractionInput() {
        if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
            // Check for nearby NPCs or portals
            if (this.scene.checkInteraction) {
                this.scene.checkInteraction(this);
            }
        }
        
        // Toggle inventory
        if (Phaser.Input.Keyboard.JustDown(this.keys.I)) {
            toggleInventory();
        }
        
        // Toggle quest log
        if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) {
            toggleQuestLog();
        }
    }

    // Use skill by index
    useSkill(index) {
        if (index >= this.skills.length) return;
        
        const skillId = this.skills[index];
        const enemies = this.scene.enemies || [];
        
        if (this.scene.skills) {
            this.scene.skills.useSkill(skillId, this, enemies, this.facingRight);
        }
    }

    // Update sprite positions
    updateSpritePositions() {
        const direction = this.facingRight ? 1 : -1;
        
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.scaleX = direction;
        
        this.head.x = this.x;
        this.head.y = this.y - 70;
        
        this.weaponSprite.x = this.x + (25 * direction);
        this.weaponSprite.y = this.y - 30;
        this.weaponSprite.scaleX = direction;
        
        this.shadow.x = this.x;
        this.shadow.y = this.scene.groundLevel || 550;
    }

    // Update animation state
    updateAnimation() {
        let newAnim = 'idle';
        
        if (!this.isGrounded) {
            newAnim = this.velocityY < 0 ? 'jump' : 'fall';
        } else if (Math.abs(this.velocityX) > 10) {
            newAnim = 'run';
        }
        
        if (this.isAttacking) {
            newAnim = 'attack';
        }
        
        if (newAnim !== this.currentAnim) {
            this.currentAnim = newAnim;
            this.playAnimation(newAnim);
        }
    }

    // Play animation (visual feedback)
    playAnimation(animName) {
        switch (animName) {
            case 'attack':
                // Weapon swing animation
                this.scene.tweens.add({
                    targets: this.weaponSprite,
                    angle: this.facingRight ? 90 : -90,
                    duration: 100,
                    yoyo: true,
                    onComplete: () => {
                        this.weaponSprite.angle = 0;
                        this.isAttacking = false;
                    }
                });
                break;
            case 'run':
                // Subtle bob animation
                if (!this.runTween || !this.runTween.isPlaying()) {
                    this.runTween = this.scene.tweens.add({
                        targets: this.sprite,
                        scaleY: 0.95,
                        duration: 100,
                        yoyo: true,
                        repeat: -1
                    });
                }
                break;
            case 'idle':
            case 'jump':
            case 'fall':
                if (this.runTween) {
                    this.runTween.stop();
                    this.sprite.scaleY = 1;
                }
                break;
        }
    }

    // Take damage
    takeDamage(amount) {
        if (this.isInvulnerable || this.isDead) return;
        
        // Mana shield absorbs damage
        if (this.hasManaShield) {
            const manaCost = Math.min(amount, this.currentMana);
            this.currentMana -= manaCost;
            amount -= manaCost;
            
            if (this.currentMana <= 0) {
                this.hasManaShield = false;
            }
        }
        
        this.currentHealth -= amount;
        
        // Flash red
        this.sprite.setFillStyle(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (!this.isDead) {
                this.sprite.setFillStyle(GameData.classes[this.classId].color);
            }
        });
        
        if (this.currentHealth <= 0) {
            this.die();
        }
    }

    // Heal
    heal(amount) {
        this.currentHealth = Math.min(this.stats.maxHealth, this.currentHealth + amount);
    }

    // Restore mana
    restoreMana(amount) {
        this.currentMana = Math.min(this.stats.maxMana, this.currentMana + amount);
    }

    // Die
    die() {
        this.isDead = true;
        this.currentHealth = 0;
        
        // Death animation
        this.scene.tweens.add({
            targets: [this.sprite, this.head, this.weaponSprite],
            alpha: 0.5,
            angle: 90,
            duration: 500
        });
        
        // Show death screen
        showDeathScreen();
    }

    // Respawn
    respawn(x, y) {
        this.isDead = false;
        this.x = x;
        this.y = y;
        this.currentHealth = this.stats.maxHealth;
        this.currentMana = this.stats.maxMana;
        
        // Reset visuals
        this.sprite.alpha = 1;
        this.sprite.angle = 0;
        this.head.alpha = 1;
        this.head.angle = 0;
        this.weaponSprite.alpha = 1;
        this.weaponSprite.angle = 0;
        
        this.updateSpritePositions();
    }

    // Add XP and check for level up
    addXP(amount) {
        this.xp += amount;
        
        // Check for level up
        while (this.level < GameData.levelXpRequirements.length &&
               this.xp >= GameData.levelXpRequirements[this.level]) {
            this.levelUp();
        }
    }

    // Level up
    levelUp() {
        this.level++;
        this.recalculateStats();
        
        // Fully heal on level up
        this.currentHealth = this.stats.maxHealth;
        this.currentMana = this.stats.maxMana;
        
        // Show level up notification
        showLevelUp(this.level);
        
        console.log(`Level up! Now level ${this.level}`);
    }

    // Get XP progress to next level
    getXPProgress() {
        if (this.level >= GameData.levelXpRequirements.length) {
            return { current: this.xp, required: this.xp, percent: 1 };
        }
        
        const currentLevelXP = this.level > 1 ? GameData.levelXpRequirements[this.level - 1] : 0;
        const nextLevelXP = GameData.levelXpRequirements[this.level];
        const xpIntoLevel = this.xp - currentLevelXP;
        const xpNeeded = nextLevelXP - currentLevelXP;
        
        return {
            current: xpIntoLevel,
            required: xpNeeded,
            percent: xpIntoLevel / xpNeeded
        };
    }

    // Set position
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.updateSpritePositions();
    }

    // Get save data
    getSaveData() {
        const inventoryData = this.inventory.getSaveData();
        const questData = this.quests.getSaveData();
        
        return {
            classId: this.classId,
            level: this.level,
            xp: this.xp,
            currentHealth: this.currentHealth,
            currentMana: this.currentMana,
            stats: { ...this.stats },
            equipment: inventoryData.equipment,
            inventory: inventoryData.inventory,
            gold: inventoryData.gold,
            activeQuests: questData.active,
            completedQuests: questData.completed,
            currentScene: this.scene.scene.key,
            x: this.x,
            y: this.y
        };
    }

    // Load from save data
    loadFromSave(saveData) {
        this.classId = saveData.classId || 'warrior';
        this.level = saveData.level || 1;
        this.xp = saveData.xp || 0;
        
        this.initializeClass(this.classId);
        this.inventory.init(saveData.inventory, saveData.equipment, saveData.gold);
        this.quests.init(saveData.activeQuests, saveData.completedQuests);
        
        this.recalculateStats();
        
        this.currentHealth = saveData.currentHealth || this.stats.maxHealth;
        this.currentMana = saveData.currentMana || this.stats.maxMana;
        
        if (saveData.x && saveData.y) {
            this.setPosition(saveData.x, saveData.y);
        }
        
        // Update sprite color
        if (this.sprite) {
            this.sprite.setFillStyle(GameData.classes[this.classId].color);
        }
    }

    // Destroy player sprites
    destroy() {
        if (this.sprite) this.sprite.destroy();
        if (this.head) this.head.destroy();
        if (this.weaponSprite) this.weaponSprite.destroy();
        if (this.shadow) this.shadow.destroy();
    }
}

// Export for use
window.Player = Player;
