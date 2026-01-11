// ============================================
// REALMQUEST - Quest System
// Handles quest tracking, objectives, and rewards
// ============================================

class QuestSystem {
    constructor() {
        this.activeQuests = {}; // questId -> quest progress data
        this.completedQuests = new Set();
        this.turnedInQuests = new Set();
    }

    // Initialize with saved data
    init(savedActive, savedCompleted) {
        if (savedActive) {
            this.activeQuests = savedActive;
        }
        if (savedCompleted) {
            this.completedQuests = new Set(savedCompleted);
            this.turnedInQuests = new Set(savedCompleted);
        }
    }

    // Check if quest can be accepted
    canAcceptQuest(questId) {
        const quest = window.GameData.quests[questId];
        if (!quest) return false;

        // Already active
        if (this.activeQuests[questId]) return false;

        // Already completed (unless repeatable)
        if (this.turnedInQuests.has(questId) && !quest.repeatable) return false;

        // Check prerequisite
        if (quest.prerequisite && !this.turnedInQuests.has(quest.prerequisite)) {
            return false;
        }

        return true;
    }

    // Accept a quest
    acceptQuest(questId) {
        if (!this.canAcceptQuest(questId)) {
            return false;
        }

        const quest = window.GameData.quests[questId];
        
        // Create progress tracking
        this.activeQuests[questId] = {
            id: questId,
            objectives: quest.objectives.map(obj => ({
                ...obj,
                current: 0
            })),
            accepted: Date.now()
        };

        console.log(`Quest accepted: ${quest.name}`);
        return true;
    }

    // Abandon a quest
    abandonQuest(questId) {
        if (this.activeQuests[questId]) {
            delete this.activeQuests[questId];
            console.log(`Quest abandoned: ${questId}`);
            return true;
        }
        return false;
    }

    // Update quest progress for kills
    onEnemyKilled(enemyId) {
        for (const questId in this.activeQuests) {
            const questProgress = this.activeQuests[questId];
            
            for (const objective of questProgress.objectives) {
                if (objective.type === 'kill' && objective.target === enemyId) {
                    if (objective.current < objective.count) {
                        objective.current++;
                        console.log(`Quest progress: ${objective.current}/${objective.count} ${enemyId}`);
                        
                        // Check if quest is complete
                        this.checkQuestCompletion(questId);
                    }
                }
            }
        }
    }

    // Update quest progress for item collection
    onItemCollected(itemId, inventory) {
        for (const questId in this.activeQuests) {
            const questProgress = this.activeQuests[questId];
            
            for (const objective of questProgress.objectives) {
                if (objective.type === 'collect' && objective.item === itemId) {
                    // Update current count based on inventory
                    const count = inventory.getItemCount(itemId);
                    objective.current = Math.min(count, objective.count);
                    
                    // Check if quest is complete
                    this.checkQuestCompletion(questId);
                }
            }
        }
    }

    // Check if all objectives are complete
    checkQuestCompletion(questId) {
        const questProgress = this.activeQuests[questId];
        if (!questProgress) return false;

        const allComplete = questProgress.objectives.every(obj => obj.current >= obj.count);
        
        if (allComplete && !this.completedQuests.has(questId)) {
            this.completedQuests.add(questId);
            console.log(`Quest ready to turn in: ${window.GameData.quests[questId].name}`);
            return true;
        }
        
        return allComplete;
    }

    // Check if quest is ready to turn in
    isQuestComplete(questId) {
        return this.completedQuests.has(questId) && this.activeQuests[questId];
    }

    // Turn in a completed quest
    turnInQuest(questId, player) {
        if (!this.isQuestComplete(questId)) {
            return { success: false, message: 'Quest not complete' };
        }

        const quest = window.GameData.quests[questId];
        const rewards = quest.rewards;

        // Remove collected items for collection quests
        for (const objective of this.activeQuests[questId].objectives) {
            if (objective.type === 'collect') {
                player.inventory.removeItem(objective.item, objective.count);
            }
        }

        // Grant rewards
        if (rewards.xp) {
            player.addXP(rewards.xp);
        }
        if (rewards.gold) {
            player.inventory.addGold(rewards.gold);
        }
        if (rewards.items) {
            for (const itemId of rewards.items) {
                player.inventory.addItem(itemId);
            }
        }

        // Mark as turned in
        this.turnedInQuests.add(questId);
        this.completedQuests.delete(questId);
        delete this.activeQuests[questId];

        console.log(`Quest completed: ${quest.name}`);
        return { 
            success: true, 
            message: `Quest Complete!\n+${rewards.xp || 0} XP\n+${rewards.gold || 0} Gold`,
            rewards: rewards
        };
    }

    // Get available quests from an NPC
    getAvailableQuests(npcId) {
        const npc = window.GameData.npcs[npcId];
        if (!npc || !npc.dialogue.quests) return [];

        return npc.dialogue.quests.filter(questId => this.canAcceptQuest(questId));
    }

    // Get quests ready to turn in to an NPC
    getTurnInQuests(npcId) {
        const npc = window.GameData.npcs[npcId];
        if (!npc || !npc.dialogue.quests) return [];

        return npc.dialogue.quests.filter(questId => this.isQuestComplete(questId));
    }

    // Get quest display data for UI
    getQuestDisplay() {
        const display = [];
        
        for (const questId in this.activeQuests) {
            const questData = window.GameData.quests[questId];
            const progress = this.activeQuests[questId];
            
            display.push({
                id: questId,
                name: questData.name,
                description: questData.description,
                giver: questData.giver,
                objectives: progress.objectives.map(obj => {
                    let text = '';
                    if (obj.type === 'kill') {
                        const enemy = window.GameData.enemies[obj.target];
                        text = `Kill ${enemy ? enemy.name : obj.target}: ${obj.current}/${obj.count}`;
                    } else if (obj.type === 'collect') {
                        const item = window.GameData.items[obj.item];
                        text = `Collect ${item ? item.name : obj.item}: ${obj.current}/${obj.count}`;
                    }
                    return {
                        text: text,
                        complete: obj.current >= obj.count
                    };
                }),
                rewards: questData.rewards,
                isComplete: this.completedQuests.has(questId)
            });
        }
        
        return display;
    }

    // Get save data
    getSaveData() {
        return {
            active: { ...this.activeQuests },
            completed: Array.from(this.turnedInQuests)
        };
    }
}

// Create global class reference
window.QuestSystem = QuestSystem;
