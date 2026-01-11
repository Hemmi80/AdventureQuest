// ============================================
// REALMQUEST - Skill System
// Handles skills, cooldowns, and ability usage
// ============================================

class SkillSystem {
    constructor(scene) {
        this.scene = scene;
        this.cooldowns = new Map(); // skillId -> timestamp when available
        this.activeProjectiles = [];
    }

    // Initialize skills for a class
    getClassSkills(classId) {
        const classData = window.GameData.classes[classId];
        if (!classData) return ['basic_attack'];
        
        return ['basic_attack', ...classData.skills];
    }

    // Check if skill is on cooldown
    isOnCooldown(skillId) {
        const availableAt = this.cooldowns.get(skillId);
        if (!availableAt) return false;
        return Date.now() < availableAt;
    }

    // Get remaining cooldown time
    getCooldownRemaining(skillId) {
        const availableAt = this.cooldowns.get(skillId);
        if (!availableAt) return 0;
        const remaining = availableAt - Date.now();
        return Math.max(0, remaining);
    }

    // Get cooldown percentage (0-1)
    getCooldownPercent(skillId) {
        const skillData = window.GameData.skills[skillId];
        if (!skillData) return 0;
        
        const remaining = this.getCooldownRemaining(skillId);
        return remaining / skillData.cooldown;
    }

    // Start cooldown for a skill
    startCooldown(skillId) {
        const skillData = window.GameData.skills[skillId];
        if (!skillData) return;
        
        this.cooldowns.set(skillId, Date.now() + skillData.cooldown);
    }

    // Check if player can use skill
    canUseSkill(skillId, player) {
        const skillData = window.GameData.skills[skillId];
        if (!skillData) return { canUse: false, reason: 'Invalid skill' };

        if (this.isOnCooldown(skillId)) {
            return { canUse: false, reason: 'On cooldown' };
        }

        if (player.currentMana < skillData.manaCost) {
            return { canUse: false, reason: 'Not enough mana' };
        }

        if (player.isStunned) {
            return { canUse: false, reason: 'Stunned' };
        }

        return { canUse: true };
    }

    // Use a skill
    useSkill(skillId, player, targets, facingRight = true) {
        const check = this.canUseSkill(skillId, player);
        if (!check.canUse) {
            console.log(`Cannot use ${skillId}: ${check.reason}`);
            return null;
        }

        const skillData = window.GameData.skills[skillId];
        
        // Consume mana
        player.currentMana -= skillData.manaCost;
        
        // Start cooldown
        this.startCooldown(skillId);

        // Execute skill based on type
        let result = null;
        
        switch (skillData.type) {
            case 'melee':
                result = this.executeMeleeSkill(skillId, player, targets);
                break;
            case 'projectile':
                result = this.executeProjectileSkill(skillId, player, facingRight);
                break;
            case 'aoe':
                result = this.executeAOESkill(skillId, player, targets);
                break;
            case 'buff':
                result = this.executeBuffSkill(skillId, player);
                break;
            case 'heal':
                result = this.executeHealSkill(skillId, player);
                break;
            case 'movement':
                result = this.executeMovementSkill(skillId, player, targets);
                break;
        }

        // Play attack animation
        if (player.playAnimation) {
            player.playAnimation('attack');
        }

        return result;
    }

    // Execute melee skill
    executeMeleeSkill(skillId, player, targets) {
        const skillData = window.GameData.skills[skillId];
        const combat = this.scene.combat;
        
        let totalDamage = 0;
        let hits = 0;

        // Handle multi-hit skills
        const hitCount = skillData.hits || 1;
        
        for (let h = 0; h < hitCount; h++) {
            for (const target of targets) {
                const distance = Phaser.Math.Distance.Between(
                    player.x, player.y,
                    target.x, target.y
                );

                if (distance <= skillData.range && target.currentHealth > 0) {
                    const isCrit = combat.rollCritical(player);
                    const damage = combat.calculateDamage(player, target, skillData.damage, isCrit);
                    const result = combat.applyDamage(target, damage, player);
                    
                    totalDamage += result.dealt;
                    hits++;

                    // Apply effects
                    if (skillData.effect) {
                        combat.applySkillEffect(target, skillData);
                    }

                    // Check for kill
                    if (result.killed && target.onDeath) {
                        target.onDeath();
                    }

                    // Only hit one target per swing (unless AOE)
                    if (!skillData.aoe) break;
                }
            }
        }

        return { hits, totalDamage };
    }

    // Execute projectile skill
    executeProjectileSkill(skillId, player, facingRight) {
        const skillData = window.GameData.skills[skillId];
        
        // Create projectile
        const projectile = this.createProjectile(
            player.x + (facingRight ? 30 : -30),
            player.y,
            skillId,
            facingRight,
            player
        );

        return { projectile };
    }

    // Create a projectile
    createProjectile(x, y, skillId, facingRight, owner) {
        const skillData = window.GameData.skills[skillId];
        
        // Visual representation
        const colors = {
            'fireball': 0xff4400,
            'ice_shard': 0x88ccff,
            'holy_light': 0xffff88,
            'smite': 0xffff00
        };
        
        const projectile = this.scene.add.circle(x, y, 12, colors[skillId] || 0xffffff);
        projectile.setDepth(100);
        
        // Add glow effect
        const glow = this.scene.add.circle(x, y, 20, colors[skillId] || 0xffffff, 0.3);
        glow.setDepth(99);

        // Physics body for collision
        this.scene.physics.add.existing(projectile);
        projectile.body.setCircle(12);
        
        const speed = skillData.projectileSpeed || 400;
        projectile.body.setVelocityX(facingRight ? speed : -speed);

        // Store projectile data
        const projectileData = {
            sprite: projectile,
            glow: glow,
            skillId: skillId,
            owner: owner,
            damage: skillData.damage,
            effect: skillData.effect,
            createdAt: Date.now(),
            maxDistance: skillData.range
        };

        this.activeProjectiles.push(projectileData);

        // Auto-destroy after range
        this.scene.time.delayedCall(skillData.range / speed * 1000, () => {
            this.destroyProjectile(projectileData);
        });

        return projectileData;
    }

    // Destroy projectile
    destroyProjectile(projectileData) {
        const index = this.activeProjectiles.indexOf(projectileData);
        if (index > -1) {
            this.activeProjectiles.splice(index, 1);
        }
        
        if (projectileData.sprite) {
            projectileData.sprite.destroy();
        }
        if (projectileData.glow) {
            projectileData.glow.destroy();
        }
    }

    // Update projectiles (collision check)
    updateProjectiles(enemies) {
        for (const projectileData of [...this.activeProjectiles]) {
            if (!projectileData.sprite || !projectileData.sprite.active) continue;

            // Update glow position
            if (projectileData.glow) {
                projectileData.glow.x = projectileData.sprite.x;
                projectileData.glow.y = projectileData.sprite.y;
            }

            // Check collision with enemies
            for (const enemy of enemies) {
                if (enemy.currentHealth <= 0) continue;

                const distance = Phaser.Math.Distance.Between(
                    projectileData.sprite.x, projectileData.sprite.y,
                    enemy.x, enemy.y
                );

                if (distance < 40) { // Hit radius
                    this.onProjectileHit(projectileData, enemy);
                    break;
                }
            }
        }
    }

    // Handle projectile hit
    onProjectileHit(projectileData, target) {
        const skillData = window.GameData.skills[projectileData.skillId];
        const combat = this.scene.combat;
        
        const isCrit = combat.rollCritical(projectileData.owner);
        const damage = combat.calculateDamage(projectileData.owner, target, projectileData.damage, isCrit);
        const result = combat.applyDamage(target, damage, projectileData.owner);

        // Apply effects
        if (skillData.effect) {
            combat.applySkillEffect(target, skillData);
        }

        // Check for kill
        if (result.killed && target.onDeath) {
            target.onDeath();
        }

        // Destroy projectile
        this.destroyProjectile(projectileData);
    }

    // Execute AOE skill
    executeAOESkill(skillId, player, targets) {
        const skillData = window.GameData.skills[skillId];
        const combat = this.scene.combat;
        
        let totalDamage = 0;
        let hits = 0;

        // Visual effect
        const circle = this.scene.add.circle(player.x, player.y, skillData.range, 0x9933ff, 0.3);
        circle.setDepth(50);
        
        this.scene.tweens.add({
            targets: circle,
            alpha: 0,
            scale: 1.5,
            duration: 500,
            onComplete: () => circle.destroy()
        });

        // Damage all enemies in range
        for (const target of targets) {
            const distance = Phaser.Math.Distance.Between(
                player.x, player.y,
                target.x, target.y
            );

            if (distance <= skillData.range && target.currentHealth > 0) {
                const isCrit = combat.rollCritical(player);
                const damage = combat.calculateDamage(player, target, skillData.damage, isCrit);
                const result = combat.applyDamage(target, damage, player);
                
                totalDamage += result.dealt;
                hits++;

                if (result.killed && target.onDeath) {
                    target.onDeath();
                }
            }
        }

        return { hits, totalDamage };
    }

    // Execute buff skill
    executeBuffSkill(skillId, player) {
        const skillData = window.GameData.skills[skillId];
        const combat = this.scene.combat;

        switch (skillData.effect) {
            case 'attackBoost':
                combat.applyStatusEffect(player, 'attackBoost', skillData.duration, 0.3);
                combat.showDamageNumber(player.x, player.y - 40, 'ATK UP!', 'heal');
                break;
            case 'invulnerable':
                combat.applyStatusEffect(player, 'invulnerable', skillData.duration);
                combat.showDamageNumber(player.x, player.y - 40, 'INVINCIBLE!', 'heal');
                break;
            case 'manaShield':
                combat.applyStatusEffect(player, 'manaShield', skillData.duration);
                combat.showDamageNumber(player.x, player.y - 40, 'SHIELD!', 'mana');
                break;
        }

        // Visual effect
        const ring = this.scene.add.circle(player.x, player.y, 40, 0x44ff44, 0.5);
        ring.setDepth(50);
        
        this.scene.tweens.add({
            targets: ring,
            alpha: 0,
            scale: 2,
            duration: 500,
            onComplete: () => ring.destroy()
        });

        return { buffApplied: skillData.effect };
    }

    // Execute heal skill
    executeHealSkill(skillId, player) {
        const skillData = window.GameData.skills[skillId];
        const combat = this.scene.combat;
        
        const healAmount = Math.floor(player.stats.maxHealth * skillData.healPercent);
        player.currentHealth = Math.min(player.stats.maxHealth, player.currentHealth + healAmount);
        
        combat.showDamageNumber(player.x, player.y - 40, `+${healAmount}`, 'heal');

        // Visual effect
        const particles = [];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particle = this.scene.add.circle(
                player.x + Math.cos(angle) * 40,
                player.y + Math.sin(angle) * 40,
                6, 0x44ff44
            );
            particle.setDepth(100);
            particles.push(particle);

            this.scene.tweens.add({
                targets: particle,
                x: player.x,
                y: player.y,
                alpha: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }

        return { healed: healAmount };
    }

    // Execute movement skill (like shadow step)
    executeMovementSkill(skillId, player, targets) {
        const skillData = window.GameData.skills[skillId];
        
        if (skillData.effect === 'teleport' && targets.length > 0) {
            // Find nearest enemy
            let nearest = null;
            let nearestDist = Infinity;

            for (const target of targets) {
                if (target.currentHealth <= 0) continue;
                
                const dist = Phaser.Math.Distance.Between(
                    player.x, player.y,
                    target.x, target.y
                );

                if (dist <= skillData.range && dist < nearestDist) {
                    nearest = target;
                    nearestDist = dist;
                }
            }

            if (nearest) {
                // Visual effect at start
                const startFlash = this.scene.add.circle(player.x, player.y, 30, 0x000000, 0.8);
                startFlash.setDepth(100);
                this.scene.tweens.add({
                    targets: startFlash,
                    alpha: 0,
                    scale: 0,
                    duration: 300,
                    onComplete: () => startFlash.destroy()
                });

                // Teleport behind enemy
                const behindX = nearest.x + (nearest.facingRight ? -50 : 50);
                player.setPosition(behindX, nearest.y);
                player.facingRight = !nearest.facingRight;

                // Visual effect at end
                const endFlash = this.scene.add.circle(player.x, player.y, 5, 0x000000, 0.8);
                endFlash.setDepth(100);
                this.scene.tweens.add({
                    targets: endFlash,
                    alpha: 0,
                    scale: 6,
                    duration: 300,
                    onComplete: () => endFlash.destroy()
                });

                return { teleported: true, target: nearest };
            }
        }

        return { teleported: false };
    }

    // Get skill display data for UI
    getSkillsDisplay(skills) {
        return skills.map(skillId => {
            const skillData = window.GameData.skills[skillId];
            return {
                id: skillId,
                name: skillData.name,
                icon: skillData.icon,
                description: skillData.description,
                manaCost: skillData.manaCost,
                cooldown: skillData.cooldown,
                cooldownRemaining: this.getCooldownRemaining(skillId),
                cooldownPercent: this.getCooldownPercent(skillId),
                isOnCooldown: this.isOnCooldown(skillId)
            };
        });
    }

    // Reset all cooldowns
    resetCooldowns() {
        this.cooldowns.clear();
    }

    // Clear all projectiles
    clearProjectiles() {
        for (const p of this.activeProjectiles) {
            if (p.sprite) p.sprite.destroy();
            if (p.glow) p.glow.destroy();
        }
        this.activeProjectiles = [];
    }
}

// Export for use
window.SkillSystem = SkillSystem;
