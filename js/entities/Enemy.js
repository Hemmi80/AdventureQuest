// ============================================
// REALMQUEST - Enemy Entity
// Handles enemy AI, combat, and behavior
// ============================================

class Enemy {
    constructor(scene, x, y, enemyId) {
        this.scene = scene;
        this.isPlayer = false;
        
        // Get enemy data
        this.enemyData = GameData.enemies[enemyId];
        if (!this.enemyData) {
            console.error(`Enemy not found: ${enemyId}`);
            return;
        }
        
        this.id = enemyId;
        this.name = this.enemyData.name;
        
        // Position and physics
        this.x = x;
        this.y = y;
        this.spawnX = x;
        this.spawnY = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.facingRight = Math.random() > 0.5;
        
        // Stats
        this.stats = {
            maxHealth: this.enemyData.maxHealth,
            attack: this.enemyData.attack,
            defense: this.enemyData.defense,
            speed: this.enemyData.speed,
            critChance: 0.05
        };
        
        this.currentHealth = this.stats.maxHealth;
        
        // Combat state
        this.isStunned = false;
        this.attackMultiplier = 1;
        this.speedMultiplier = 1;
        this.lastAttackTime = 0;
        
        // AI state
        this.state = 'idle'; // idle, patrol, chase, attack, retreat
        this.target = null;
        this.patrolDirection = this.facingRight ? 1 : -1;
        this.patrolTimer = 0;
        this.patrolDuration = 2000 + Math.random() * 2000;
        this.idleTimer = 0;
        this.idleDuration = 1000 + Math.random() * 2000;
        
        // Create sprite
        this.createSprite();
        
        // Dimensions for collision
        this.width = 35;
        this.height = 45;
    }

    // Create sprite representation
    createSprite() {
        // Body (colored based on enemy type)
        this.sprite = this.scene.add.rectangle(
            this.x, this.y, 
            35, 45, 
            this.enemyData.color
        );
        this.sprite.setOrigin(0.5, 1);
        this.sprite.setDepth(8);
        
        // Eyes (make them look menacing)
        this.leftEye = this.scene.add.circle(this.x - 8, this.y - 35, 4, 0xff0000);
        this.leftEye.setDepth(9);
        
        this.rightEye = this.scene.add.circle(this.x + 8, this.y - 35, 4, 0xff0000);
        this.rightEye.setDepth(9);
        
        // Health bar background
        this.healthBarBg = this.scene.add.rectangle(this.x, this.y - 55, 40, 6, 0x333333);
        this.healthBarBg.setOrigin(0.5, 0.5);
        this.healthBarBg.setDepth(20);
        
        // Health bar
        this.healthBar = this.scene.add.rectangle(this.x, this.y - 55, 38, 4, 0xcc0000);
        this.healthBar.setOrigin(0, 0.5);
        this.healthBar.x = this.x - 19;
        this.healthBar.setDepth(21);
        
        // Name tag
        this.nameTag = this.scene.add.text(this.x, this.y - 65, this.name, {
            fontSize: '12px',
            fontFamily: 'Cinzel, serif',
            color: this.enemyData.isBoss ? '#ff8800' : '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.nameTag.setOrigin(0.5, 1);
        this.nameTag.setDepth(22);
        
        // Shadow
        this.shadow = this.scene.add.ellipse(this.x, this.y, 35, 12, 0x000000, 0.3);
        this.shadow.setDepth(1);
        
        // Boss crown
        if (this.enemyData.isBoss) {
            this.crown = this.scene.add.text(this.x, this.y - 50, '👑', { fontSize: '20px' });
            this.crown.setOrigin(0.5, 1);
            this.crown.setDepth(23);
        }
    }

    // Update enemy each frame
    update(delta, player) {
        if (this.isDead) return;
        
        const deltaSeconds = delta / 1000;
        
        // Update AI
        this.updateAI(deltaSeconds, player);
        
        // Apply movement
        this.x += this.velocityX * deltaSeconds;
        
        // Keep on ground
        const groundLevel = this.scene.groundLevel || 550;
        this.y = groundLevel;
        
        // Keep within patrol bounds
        const minX = Math.max(50, this.spawnX - 200);
        const maxX = Math.min((this.scene.mapWidth || 1280) - 50, this.spawnX + 200);
        
        if (this.x < minX) {
            this.x = minX;
            this.patrolDirection = 1;
        } else if (this.x > maxX) {
            this.x = maxX;
            this.patrolDirection = -1;
        }
        
        // Update sprites
        this.updateSpritePositions();
        this.updateHealthBar();
    }

    // AI state machine
    updateAI(deltaSeconds, player) {
        if (this.isStunned || !player || player.isDead) {
            this.velocityX = 0;
            return;
        }
        
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x, this.y,
            player.x, player.y
        );
        
        const behavior = this.enemyData.behavior;
        const aggroRange = this.enemyData.aggroRange;
        const attackRange = this.enemyData.attackRange;
        
        // State transitions
        switch (this.state) {
            case 'idle':
                this.velocityX = 0;
                this.idleTimer += deltaSeconds * 1000;
                
                // Check for player in aggro range
                if (distanceToPlayer < aggroRange && behavior !== 'passive') {
                    this.state = 'chase';
                    this.target = player;
                } else if (this.idleTimer >= this.idleDuration) {
                    this.state = 'patrol';
                    this.idleTimer = 0;
                    this.patrolTimer = 0;
                }
                break;
                
            case 'patrol':
                this.patrolTimer += deltaSeconds * 1000;
                
                // Check for player
                if (distanceToPlayer < aggroRange && behavior !== 'passive') {
                    this.state = 'chase';
                    this.target = player;
                    break;
                }
                
                // Move in patrol direction
                const patrolSpeed = this.stats.speed * 0.3 * this.speedMultiplier;
                this.velocityX = this.patrolDirection * patrolSpeed;
                this.facingRight = this.patrolDirection > 0;
                
                // Change direction or go idle
                if (this.patrolTimer >= this.patrolDuration) {
                    this.state = 'idle';
                    this.patrolDirection *= -1;
                    this.idleDuration = 1000 + Math.random() * 2000;
                    this.patrolDuration = 2000 + Math.random() * 2000;
                }
                break;
                
            case 'chase':
                // Check if player is still in range
                if (distanceToPlayer > aggroRange * 1.5) {
                    this.state = 'idle';
                    this.target = null;
                    break;
                }
                
                // Check if in attack range
                if (distanceToPlayer <= attackRange) {
                    this.state = 'attack';
                    break;
                }
                
                // Move towards player
                const chaseSpeed = this.stats.speed * this.speedMultiplier;
                const direction = player.x > this.x ? 1 : -1;
                this.velocityX = direction * chaseSpeed;
                this.facingRight = direction > 0;
                break;
                
            case 'attack':
                this.velocityX = 0;
                
                // Check if player escaped
                if (distanceToPlayer > attackRange * 1.5) {
                    this.state = 'chase';
                    break;
                }
                
                // Face the player
                this.facingRight = player.x > this.x;
                
                // Try to attack
                this.tryAttack(player);
                break;
        }
    }

    // Try to attack player
    tryAttack(player) {
        const now = Date.now();
        const cooldown = this.enemyData.attackCooldown;
        
        if (now - this.lastAttackTime < cooldown) {
            return;
        }
        
        this.lastAttackTime = now;
        
        // Calculate distance
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        
        if (distance > this.enemyData.attackRange) {
            return;
        }
        
        // Visual attack animation
        this.playAttackAnimation();
        
        // Deal damage
        const combat = this.scene.combat;
        if (combat) {
            const isCrit = combat.rollCritical(this);
            const damage = combat.calculateDamage(this, player, 1.0, isCrit);
            combat.applyDamage(player, damage, this);
            
            // Check if player died
            if (player.currentHealth <= 0) {
                player.die();
            }
        }
    }

    // Play attack animation
    playAttackAnimation() {
        // Lunge forward slightly
        const direction = this.facingRight ? 1 : -1;
        const originalX = this.x;
        
        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction * 15),
            duration: 100,
            yoyo: true,
            onUpdate: () => this.updateSpritePositions()
        });
        
        // Flash eyes
        this.scene.tweens.add({
            targets: [this.leftEye, this.rightEye],
            fillColor: 0xffff00,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                this.leftEye.fillColor = 0xff0000;
                this.rightEye.fillColor = 0xff0000;
            }
        });
    }

    // Update sprite positions
    updateSpritePositions() {
        const direction = this.facingRight ? 1 : -1;
        
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.scaleX = direction;
        
        this.leftEye.x = this.x - (8 * direction);
        this.leftEye.y = this.y - 35;
        
        this.rightEye.x = this.x + (8 * direction);
        this.rightEye.y = this.y - 35;
        
        this.healthBarBg.x = this.x;
        this.healthBarBg.y = this.y - 55;
        
        this.healthBar.x = this.x - 19;
        this.healthBar.y = this.y - 55;
        
        this.nameTag.x = this.x;
        this.nameTag.y = this.y - 65;
        
        this.shadow.x = this.x;
        this.shadow.y = this.scene.groundLevel || 550;
        
        if (this.crown) {
            this.crown.x = this.x;
            this.crown.y = this.y - 50;
        }
    }

    // Update health bar display
    updateHealthBar() {
        const healthPercent = this.currentHealth / this.stats.maxHealth;
        this.healthBar.scaleX = Math.max(0, healthPercent);
        
        // Change color based on health
        if (healthPercent < 0.25) {
            this.healthBar.fillColor = 0xff0000;
        } else if (healthPercent < 0.5) {
            this.healthBar.fillColor = 0xff8800;
        } else {
            this.healthBar.fillColor = 0xcc0000;
        }
    }

    // Handle death
    onDeath() {
        if (this.isDead) return;
        
        this.isDead = true;
        this.velocityX = 0;
        
        // Notify quest system
        if (this.scene.player && this.scene.player.quests) {
            this.scene.player.quests.onEnemyKilled(this.id);
        }
        
        // Grant rewards
        this.grantRewards();
        
        // Death animation
        this.scene.tweens.add({
            targets: [this.sprite, this.leftEye, this.rightEye, this.shadow],
            alpha: 0,
            y: this.y + 20,
            duration: 500,
            onComplete: () => {
                this.scheduleRespawn();
            }
        });
        
        // Hide UI elements
        this.healthBarBg.setVisible(false);
        this.healthBar.setVisible(false);
        this.nameTag.setVisible(false);
        if (this.crown) this.crown.setVisible(false);
        
        // Drop items
        this.dropLoot();
    }

    // Grant XP and gold
    grantRewards() {
        const player = this.scene.player;
        if (!player) return;
        
        // XP
        player.addXP(this.enemyData.xpReward);
        
        // Show XP gain
        this.scene.combat.showDamageNumber(
            this.x, this.y - 80, 
            `+${this.enemyData.xpReward} XP`,
            'heal'
        );
        
        // Gold
        const goldMin = this.enemyData.goldReward.min;
        const goldMax = this.enemyData.goldReward.max;
        const goldAmount = Math.floor(goldMin + Math.random() * (goldMax - goldMin + 1));
        
        player.inventory.addGold(goldAmount);
        
        // Show gold gain
        this.scene.time.delayedCall(200, () => {
            this.scene.combat.showDamageNumber(
                this.x, this.y - 100,
                `+${goldAmount} Gold`,
                'enemy-damage'
            );
        });
    }

    // Drop loot items
    dropLoot() {
        const player = this.scene.player;
        if (!player) return;
        
        for (const drop of this.enemyData.drops) {
            if (Math.random() < drop.chance) {
                const success = player.inventory.addItem(drop.itemId);
                
                if (success) {
                    const itemData = GameData.items[drop.itemId];
                    
                    // Show item drop notification
                    this.scene.time.delayedCall(400, () => {
                        this.scene.combat.showDamageNumber(
                            this.x, this.y - 120,
                            `+ ${itemData.name}`,
                            'heal'
                        );
                    });
                    
                    // Update quest progress for collection quests
                    player.quests.onItemCollected(drop.itemId, player.inventory);
                }
            }
        }
    }

    // Schedule respawn
    scheduleRespawn() {
        const respawnTime = this.enemyData.isBoss ? 60000 : 10000; // Boss: 60s, Normal: 10s
        
        this.scene.time.delayedCall(respawnTime, () => {
            this.respawn();
        });
    }

    // Respawn enemy
    respawn() {
        this.isDead = false;
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.currentHealth = this.stats.maxHealth;
        this.state = 'idle';
        this.target = null;
        
        // Reset visuals
        this.sprite.alpha = 1;
        this.sprite.y = this.y;
        this.leftEye.alpha = 1;
        this.rightEye.alpha = 1;
        this.shadow.alpha = 0.3;
        
        this.healthBarBg.setVisible(true);
        this.healthBar.setVisible(true);
        this.nameTag.setVisible(true);
        if (this.crown) this.crown.setVisible(true);
        
        this.updateSpritePositions();
        this.updateHealthBar();
        
        // Spawn animation
        this.sprite.setScale(0);
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: this.facingRight ? 1 : -1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.out'
        });
    }

    // Take damage (called by combat system)
    takeDamage(amount) {
        this.currentHealth -= amount;
        
        // Flash white
        this.sprite.setFillStyle(0xffffff);
        this.scene.time.delayedCall(100, () => {
            if (!this.isDead) {
                this.sprite.setFillStyle(this.enemyData.color);
            }
        });
        
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            this.onDeath();
        }
    }

    // Destroy enemy sprites
    destroy() {
        if (this.sprite) this.sprite.destroy();
        if (this.leftEye) this.leftEye.destroy();
        if (this.rightEye) this.rightEye.destroy();
        if (this.healthBarBg) this.healthBarBg.destroy();
        if (this.healthBar) this.healthBar.destroy();
        if (this.nameTag) this.nameTag.destroy();
        if (this.shadow) this.shadow.destroy();
        if (this.crown) this.crown.destroy();
    }
}

// Export for use
window.Enemy = Enemy;
