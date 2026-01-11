// ============================================
// REALMQUEST - NPC Entity
// Handles NPCs, dialogue, quests, and shops
// ============================================

class NPC {
    constructor(scene, x, y, npcId) {
        this.scene = scene;
        this.isNPC = true;
        
        // Get NPC data
        this.npcData = GameData.npcs[npcId];
        if (!this.npcData) {
            console.error(`NPC not found: ${npcId}`);
            return;
        }
        
        this.id = npcId;
        this.name = this.npcData.name;
        this.title = this.npcData.title;
        
        // Position
        this.x = x;
        this.y = y;
        
        // Interaction
        this.interactionRange = 80;
        this.isInteracting = false;
        
        // Create sprite
        this.createSprite();
        
        // Animation
        this.idleTimer = 0;
        this.idleBobDirection = 1;
    }

    // Create sprite representation
    createSprite() {
        // Body
        this.sprite = this.scene.add.rectangle(
            this.x, this.y,
            35, 55,
            this.npcData.color
        );
        this.sprite.setOrigin(0.5, 1);
        this.sprite.setDepth(9);
        
        // Head
        this.head = this.scene.add.circle(this.x, this.y - 65, 14, 0xffcc99);
        this.head.setDepth(10);
        
        // Eyes (friendly blue)
        this.leftEye = this.scene.add.circle(this.x - 5, this.y - 68, 3, 0x4488ff);
        this.leftEye.setDepth(11);
        
        this.rightEye = this.scene.add.circle(this.x + 5, this.y - 68, 3, 0x4488ff);
        this.rightEye.setDepth(11);
        
        // Name and title
        this.nameTag = this.scene.add.text(this.x, this.y - 90, this.name, {
            fontSize: '14px',
            fontFamily: 'Cinzel, serif',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.nameTag.setOrigin(0.5, 1);
        this.nameTag.setDepth(20);
        
        this.titleTag = this.scene.add.text(this.x, this.y - 75, this.title, {
            fontSize: '10px',
            fontFamily: 'Crimson Text, serif',
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.titleTag.setOrigin(0.5, 1);
        this.titleTag.setDepth(20);
        
        // Interaction indicator (shows when player is near)
        this.interactIcon = this.scene.add.text(this.x, this.y - 110, '💬', {
            fontSize: '24px'
        });
        this.interactIcon.setOrigin(0.5, 1);
        this.interactIcon.setDepth(25);
        this.interactIcon.setVisible(false);
        
        // Quest indicator
        this.questIcon = this.scene.add.text(this.x, this.y - 110, '', {
            fontSize: '24px'
        });
        this.questIcon.setOrigin(0.5, 1);
        this.questIcon.setDepth(26);
        
        // Shadow
        this.shadow = this.scene.add.ellipse(this.x, this.y, 35, 12, 0x000000, 0.3);
        this.shadow.setDepth(1);
        
        // Update quest icon
        this.updateQuestIcon();
    }

    // Update NPC each frame
    update(delta, player) {
        // Subtle idle animation
        this.idleTimer += delta;
        const bobAmount = Math.sin(this.idleTimer / 500) * 2;
        this.sprite.y = this.y + bobAmount;
        this.head.y = this.y - 65 + bobAmount;
        this.leftEye.y = this.y - 68 + bobAmount;
        this.rightEye.y = this.y - 68 + bobAmount;
        
        // Check if player is in range
        if (player && !player.isDead) {
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                player.x, player.y
            );
            
            const inRange = distance <= this.interactionRange;
            this.interactIcon.setVisible(inRange && !this.isInteracting);
            
            // Face the player when in range
            if (inRange) {
                // Could add facing logic here
            }
        }
        
        // Bob the interaction icon
        if (this.interactIcon.visible) {
            this.interactIcon.y = this.y - 110 + Math.sin(this.idleTimer / 200) * 5;
        }
        
        // Bob the quest icon
        if (this.questIcon.visible) {
            this.questIcon.y = this.y - 110 + Math.sin(this.idleTimer / 200) * 5;
        }
    }

    // Update quest icon based on available/completable quests
    updateQuestIcon() {
        if (!this.npcData.dialogue.quests) {
            this.questIcon.setText('');
            return;
        }
        
        const player = this.scene.player;
        if (!player) return;
        
        // Check for quests ready to turn in
        const turnInQuests = player.quests.getTurnInQuests(this.id);
        if (turnInQuests.length > 0) {
            this.questIcon.setText('❓'); // Question mark for turn-in
            this.questIcon.setVisible(true);
            return;
        }
        
        // Check for available quests
        const availableQuests = player.quests.getAvailableQuests(this.id);
        if (availableQuests.length > 0) {
            this.questIcon.setText('❗'); // Exclamation for new quest
            this.questIcon.setVisible(true);
            return;
        }
        
        this.questIcon.setText('');
        this.questIcon.setVisible(false);
    }

    // Check if player can interact
    canInteract(player) {
        if (!player || player.isDead) return false;
        
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            player.x, player.y
        );
        
        return distance <= this.interactionRange;
    }

    // Start interaction
    interact(player) {
        if (!this.canInteract(player)) return;
        
        this.isInteracting = true;
        this.interactIcon.setVisible(false);
        
        // Show dialogue
        showDialogue(this, player);
    }

    // End interaction
    endInteraction() {
        this.isInteracting = false;
        this.updateQuestIcon();
    }

    // Get dialogue options
    getDialogueOptions(player) {
        const options = [];
        const dialogue = this.npcData.dialogue;
        
        // Check for quests to turn in first
        if (dialogue.quests) {
            const turnInQuests = player.quests.getTurnInQuests(this.id);
            for (const questId of turnInQuests) {
                const quest = GameData.quests[questId];
                options.push({
                    text: `[Complete] ${quest.name}`,
                    action: 'turnInQuest',
                    questId: questId,
                    isQuest: true
                });
            }
        }
        
        // Add regular options
        for (const option of dialogue.options) {
            // Skip "show quests" if no quests available
            if (option.action === 'showQuests') {
                const availableQuests = player.quests.getAvailableQuests(this.id);
                if (availableQuests.length === 0) continue;
            }
            
            options.push({
                text: option.text,
                action: option.action,
                response: option.response
            });
        }
        
        return options;
    }

    // Get available quests
    getAvailableQuests(player) {
        if (!this.npcData.dialogue.quests) return [];
        
        return player.quests.getAvailableQuests(this.id).map(questId => {
            const quest = GameData.quests[questId];
            return {
                id: questId,
                name: quest.name,
                description: quest.description,
                objectives: quest.objectives,
                rewards: quest.rewards
            };
        });
    }

    // Get shop if NPC has one
    getShop() {
        const shopId = this.npcData.dialogue.shop;
        if (!shopId) return null;
        
        const shop = GameData.shops[shopId];
        if (!shop) return null;
        
        return {
            name: shop.name,
            items: shop.items.map(itemId => {
                const item = GameData.items[itemId];
                return {
                    id: itemId,
                    ...item
                };
            })
        };
    }

    // Destroy NPC sprites
    destroy() {
        if (this.sprite) this.sprite.destroy();
        if (this.head) this.head.destroy();
        if (this.leftEye) this.leftEye.destroy();
        if (this.rightEye) this.rightEye.destroy();
        if (this.nameTag) this.nameTag.destroy();
        if (this.titleTag) this.titleTag.destroy();
        if (this.interactIcon) this.interactIcon.destroy();
        if (this.questIcon) this.questIcon.destroy();
        if (this.shadow) this.shadow.destroy();
    }
}

// Export for use
window.NPC = NPC;
