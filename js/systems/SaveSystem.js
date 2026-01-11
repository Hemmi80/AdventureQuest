// ============================================
// REALMQUEST - Save System
// Handles saving and loading game progress
// ============================================

class SaveSystem {
    constructor() {
        this.saveKey = 'realmquest_save';
        this.settingsKey = 'realmquest_settings';
    }

    // Save the entire game state
    saveGame(playerData) {
        const saveData = {
            version: '1.0.0',
            timestamp: Date.now(),
            player: {
                name: playerData.name || 'Hero',
                classId: playerData.classId,
                level: playerData.level,
                xp: playerData.xp,
                gold: playerData.gold,
                currentHealth: playerData.currentHealth,
                currentMana: playerData.currentMana,
                stats: playerData.stats,
                equipment: playerData.equipment,
                inventory: playerData.inventory,
                position: {
                    scene: playerData.currentScene,
                    x: playerData.x,
                    y: playerData.y
                }
            },
            quests: {
                active: playerData.activeQuests,
                completed: playerData.completedQuests
            },
            world: {
                defeatedBosses: playerData.defeatedBosses || [],
                unlockedAreas: playerData.unlockedAreas || ['town', 'forest']
            }
        };

        try {
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            console.log('Game saved successfully!');
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            return false;
        }
    }

    // Load game state
    loadGame() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (saveData) {
                const parsed = JSON.parse(saveData);
                console.log('Game loaded successfully!');
                return parsed;
            }
            return null;
        } catch (e) {
            console.error('Failed to load game:', e);
            return null;
        }
    }

    // Check if a save exists
    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    // Delete save data
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            console.log('Save data deleted.');
            return true;
        } catch (e) {
            console.error('Failed to delete save:', e);
            return false;
        }
    }

    // Save settings (volume, controls, etc.)
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Failed to save settings:', e);
            return false;
        }
    }

    // Load settings
    loadSettings() {
        try {
            const settings = localStorage.getItem(this.settingsKey);
            if (settings) {
                return JSON.parse(settings);
            }
            // Default settings
            return {
                musicVolume: 0.5,
                sfxVolume: 0.7,
                showDamageNumbers: true,
                autoSave: true
            };
        } catch (e) {
            console.error('Failed to load settings:', e);
            return null;
        }
    }

    // Auto-save functionality
    startAutoSave(gameInstance, intervalMs = 60000) {
        this.autoSaveInterval = setInterval(() => {
            if (gameInstance && gameInstance.player) {
                this.saveGame(gameInstance.getPlayerSaveData());
            }
        }, intervalMs);
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    // Export save to string (for sharing/backup)
    exportSave() {
        const saveData = localStorage.getItem(this.saveKey);
        if (saveData) {
            return btoa(saveData); // Base64 encode
        }
        return null;
    }

    // Import save from string
    importSave(encodedData) {
        try {
            const saveData = atob(encodedData); // Base64 decode
            const parsed = JSON.parse(saveData);
            // Validate it's a proper save
            if (parsed.version && parsed.player) {
                localStorage.setItem(this.saveKey, saveData);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to import save:', e);
            return false;
        }
    }
}

// Create global instance
window.SaveSystem = new SaveSystem();
