// ============================================
// REALMQUEST - Combat System
// Handles damage calculation, effects, and combat logic
// ============================================

class CombatSystem {
    constructor(scene) {
        this.scene = scene;
        this.damageNumbers = [];
        this.statusEffects = new Map(); // entity -> [effects]
    }

    // Calculate damage
    calculateDamage(attacker, defender, skillMultiplier = 1.0, isCritical = false) {
        // Base damage calculation
        let baseDamage = attacker.stats.attack * skillMultiplier;
        
        // Apply critical hit
        if (isCritical) {
            baseDamage *= 2;
        }

        // Apply defense reduction
        const defenseReduction = defender.stats.defense / (defender.stats.defense + 50);
        let finalDamage = baseDamage * (1 - defenseReduction);

        // Add some variance (±15%)
        const variance = 0.85 + Math.random() * 0.3;
        finalDamage *= variance;

        // Minimum 1 damage
        finalDamage = Math.max(1, Math.floor(finalDamage));

        return {
            damage: finalDamage,
            isCritical: isCritical
        };
    }

    // Check for critical hit
    rollCritical(attacker) {
        const critChance = attacker.stats.critChance || 0.05;
        return Math.random() < critChance;
    }

    // Apply damage to target
    applyDamage(target, damage, attacker = null) {
        if (target.isInvulnerable) {
            this.showDamageNumber(target.x, target.y - 30, 'IMMUNE', 'immune');
            return { dealt: 0, killed: false };
        }

        target.currentHealth -= damage.damage;
        
        // Show damage number
        const type = target.isPlayer ? 'player-damage' : 'enemy-damage';
        this.showDamageNumber(
            target.x, 
            target.y - 30, 
            damage.damage.toString(),
            damage.isCritical ? 'critical' : type
        );

        // Check for death
        if (target.currentHealth <= 0) {
            target.currentHealth = 0;
            return { dealt: damage.damage, killed: true };
        }

        return { dealt: damage.damage, killed: false };
    }

    // Show floating damage number
    showDamageNumber(x, y, text, type = 'enemy-damage') {
        const colors = {
            'player-damage': '#c41e3a',
            'enemy-damage': '#ffd700',
            'critical': '#ff8000',
            'heal': '#32cd32',
            'immune': '#ffffff',
            'mana': '#1e90ff'
        };

        const fontSize = type === 'critical' ? 28 : 20;
        const color = colors[type] || '#ffffff';

        const damageText = this.scene.add.text(x, y, text, {
            fontSize: `${fontSize}px`,
            fontFamily: 'Cinzel, serif',
            color: color,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(1000);

        // Animate floating up and fading
        this.scene.tweens.add({
            targets: damageText,
            y: y - 60,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => damageText.destroy()
        });
    }

    // Apply status effect
    applyStatusEffect(target, effectType, duration, value = 0) {
        if (!this.statusEffects.has(target)) {
            this.statusEffects.set(target, []);
        }

        const effects = this.statusEffects.get(target);
        
        // Check if effect already exists
        const existingEffect = effects.find(e => e.type === effectType);
        if (existingEffect) {
            // Refresh duration
            existingEffect.duration = duration;
            existingEffect.value = value;
            return;
        }

        const effect = {
            type: effectType,
            duration: duration,
            value: value,
            startTime: Date.now(),
            tickTime: Date.now()
        };

        effects.push(effect);
        this.onEffectApplied(target, effect);
    }

    // Handle effect application
    onEffectApplied(target, effect) {
        switch (effect.type) {
            case 'stun':
                target.isStunned = true;
                // Visual indicator
                if (target.sprite) {
                    target.sprite.setTint(0xffff00);
                }
                break;
            case 'slow':
                target.speedMultiplier = (target.speedMultiplier || 1) * (1 - effect.value);
                if (target.sprite) {
                    target.sprite.setTint(0x88ccff);
                }
                break;
            case 'poison':
                if (target.sprite) {
                    target.sprite.setTint(0x00ff00);
                }
                break;
            case 'burn':
                if (target.sprite) {
                    target.sprite.setTint(0xff4400);
                }
                break;
            case 'attackBoost':
                target.attackMultiplier = (target.attackMultiplier || 1) + effect.value;
                break;
            case 'invulnerable':
                target.isInvulnerable = true;
                if (target.sprite) {
                    target.sprite.setAlpha(0.7);
                }
                break;
            case 'manaShield':
                target.hasManaShield = true;
                break;
        }
    }

    // Handle effect removal
    onEffectRemoved(target, effect) {
        switch (effect.type) {
            case 'stun':
                target.isStunned = false;
                break;
            case 'slow':
                target.speedMultiplier = 1;
                break;
            case 'poison':
            case 'burn':
                break;
            case 'attackBoost':
                target.attackMultiplier = 1;
                break;
            case 'invulnerable':
                target.isInvulnerable = false;
                if (target.sprite) {
                    target.sprite.setAlpha(1);
                }
                break;
            case 'manaShield':
                target.hasManaShield = false;
                break;
        }

        // Clear tint if no more effects
        if (target.sprite) {
            const remainingEffects = this.statusEffects.get(target) || [];
            if (remainingEffects.length === 0) {
                target.sprite.clearTint();
            }
        }
    }

    // Update status effects (call every frame)
    update(delta) {
        const now = Date.now();

        for (const [target, effects] of this.statusEffects) {
            for (let i = effects.length - 1; i >= 0; i--) {
                const effect = effects[i];
                
                // Check if effect has expired
                if (now - effect.startTime >= effect.duration) {
                    this.onEffectRemoved(target, effect);
                    effects.splice(i, 1);
                    continue;
                }

                // Handle tick effects (poison, burn)
                if (effect.type === 'poison' || effect.type === 'burn') {
                    if (now - effect.tickTime >= 1000) { // Tick every second
                        effect.tickTime = now;
                        const tickDamage = Math.floor(target.stats.maxHealth * 0.05);
                        this.applyDamage(target, { damage: tickDamage, isCritical: false });
                        
                        if (target.currentHealth <= 0 && target.onDeath) {
                            target.onDeath();
                        }
                    }
                }
            }
        }
    }

    // Clear effects on death
    clearEffects(target) {
        const effects = this.statusEffects.get(target);
        if (effects) {
            for (const effect of effects) {
                this.onEffectRemoved(target, effect);
            }
            this.statusEffects.delete(target);
        }
    }

    // Check if target has effect
    hasEffect(target, effectType) {
        const effects = this.statusEffects.get(target) || [];
        return effects.some(e => e.type === effectType);
    }

    // Perform melee attack
    performMeleeAttack(attacker, targets, skill = null) {
        const skillData = skill ? GameData.skills[skill] : GameData.skills.basic_attack;
        const range = skillData.range || 70;
        
        let hitCount = 0;
        
        for (const target of targets) {
            const distance = Phaser.Math.Distance.Between(
                attacker.x, attacker.y,
                target.x, target.y
            );
            
            if (distance <= range && target.currentHealth > 0) {
                const isCrit = this.rollCritical(attacker);
                const damage = this.calculateDamage(attacker, target, skillData.damage, isCrit);
                const result = this.applyDamage(target, damage, attacker);
                
                // Apply skill effects
                if (skillData.effect && result.dealt > 0) {
                    this.applySkillEffect(target, skillData);
                }
                
                if (result.killed && target.onDeath) {
                    target.onDeath();
                }
                
                hitCount++;
                
                // Most melee skills only hit one target
                if (!skillData.aoe) break;
            }
        }
        
        return hitCount;
    }

    // Apply skill-specific effects
    applySkillEffect(target, skillData) {
        switch (skillData.effect) {
            case 'stun':
                this.applyStatusEffect(target, 'stun', 2000);
                break;
            case 'slow':
                this.applyStatusEffect(target, 'slow', 3000, 0.3);
                break;
            case 'poison':
                this.applyStatusEffect(target, 'poison', skillData.duration || 5000);
                break;
            case 'burn':
                this.applyStatusEffect(target, 'burn', 3000);
                break;
        }
    }

    // Check if attack would hit (for AI)
    isInRange(attacker, target, range) {
        const distance = Phaser.Math.Distance.Between(
            attacker.x, attacker.y,
            target.x, target.y
        );
        return distance <= range;
    }
}

// Export for use
window.CombatSystem = CombatSystem;
