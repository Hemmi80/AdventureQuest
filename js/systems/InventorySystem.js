// ============================================
// REALMQUEST - Inventory System
// Handles items, equipment, and inventory management
// ============================================

class InventorySystem {
    constructor() {
        this.maxSlots = 30;
        this.inventory = []; // Array of { itemId, quantity }
        this.equipment = {
            weapon: null,
            armor: null,
            helmet: null,
            accessory: null
        };
        this.gold = 0;
    }

    // Initialize with saved data
    init(savedInventory, savedEquipment, savedGold) {
        if (savedInventory) {
            this.inventory = savedInventory;
        }
        if (savedEquipment) {
            this.equipment = savedEquipment;
        }
        if (savedGold !== undefined) {
            this.gold = savedGold;
        }
    }

    // Add item to inventory
    addItem(itemId, quantity = 1) {
        const itemData = window.GameData.items[itemId];
        if (!itemData) {
            console.error(`Item not found: ${itemId}`);
            return false;
        }

        // Check if item is stackable and already exists
        if (itemData.stackable) {
            const existingSlot = this.inventory.find(slot => slot.itemId === itemId);
            if (existingSlot) {
                const maxStack = itemData.maxStack || 99;
                const canAdd = Math.min(quantity, maxStack - existingSlot.quantity);
                existingSlot.quantity += canAdd;
                
                // If we couldn't add all, try to add remainder to new slot
                if (canAdd < quantity) {
                    return this.addItem(itemId, quantity - canAdd);
                }
                return true;
            }
        }

        // Check if inventory has space
        if (this.inventory.length >= this.maxSlots) {
            console.log('Inventory full!');
            return false;
        }

        // Add new slot
        this.inventory.push({
            itemId: itemId,
            quantity: quantity
        });

        return true;
    }

    // Remove item from inventory
    removeItem(itemId, quantity = 1) {
        const slotIndex = this.inventory.findIndex(slot => slot.itemId === itemId);
        if (slotIndex === -1) {
            return false;
        }

        const slot = this.inventory[slotIndex];
        slot.quantity -= quantity;

        if (slot.quantity <= 0) {
            this.inventory.splice(slotIndex, 1);
        }

        return true;
    }

    // Get item count
    getItemCount(itemId) {
        const slot = this.inventory.find(slot => slot.itemId === itemId);
        return slot ? slot.quantity : 0;
    }

    // Has item
    hasItem(itemId, quantity = 1) {
        return this.getItemCount(itemId) >= quantity;
    }

    // Equip item
    equipItem(itemId) {
        const itemData = window.GameData.items[itemId];
        if (!itemData) return false;

        // Check if it's equippable
        const equipSlots = ['weapon', 'armor', 'helmet', 'accessory'];
        if (!equipSlots.includes(itemData.type)) {
            console.log('Item cannot be equipped');
            return false;
        }

        // Check if player has the item
        if (!this.hasItem(itemId)) {
            console.log('Item not in inventory');
            return false;
        }

        const slot = itemData.type;

        // Unequip current item if any
        if (this.equipment[slot]) {
            this.addItem(this.equipment[slot]);
        }

        // Remove from inventory and equip
        this.removeItem(itemId);
        this.equipment[slot] = itemId;

        return true;
    }

    // Unequip item
    unequipItem(slot) {
        if (!this.equipment[slot]) {
            return false;
        }

        // Check if inventory has space
        if (this.inventory.length >= this.maxSlots) {
            console.log('Inventory full, cannot unequip');
            return false;
        }

        const itemId = this.equipment[slot];
        this.addItem(itemId);
        this.equipment[slot] = null;

        return true;
    }

    // Use consumable item
    useItem(itemId, player) {
        const itemData = window.GameData.items[itemId];
        if (!itemData || itemData.type !== 'consumable') {
            return false;
        }

        if (!this.hasItem(itemId)) {
            return false;
        }

        // Apply effect
        if (itemData.effect) {
            switch (itemData.effect.type) {
                case 'heal':
                    player.heal(itemData.effect.value);
                    break;
                case 'mana':
                    player.restoreMana(itemData.effect.value);
                    break;
                case 'buff':
                    player.applyBuff(itemData.effect);
                    break;
            }
        }

        // Remove from inventory
        this.removeItem(itemId);
        return true;
    }

    // Get total stats from equipment
    getEquipmentStats() {
        const totalStats = {
            attack: 0,
            defense: 0,
            maxHealth: 0,
            maxMana: 0,
            speed: 0,
            critChance: 0
        };

        for (const slot in this.equipment) {
            const itemId = this.equipment[slot];
            if (itemId) {
                const itemData = window.GameData.items[itemId];
                if (itemData && itemData.stats) {
                    for (const stat in itemData.stats) {
                        if (totalStats.hasOwnProperty(stat)) {
                            totalStats[stat] += itemData.stats[stat];
                        }
                    }
                }
            }
        }

        return totalStats;
    }

    // Add gold
    addGold(amount) {
        this.gold += amount;
        return this.gold;
    }

    // Remove gold
    removeGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }

    // Buy item from shop
    buyItem(itemId) {
        const itemData = window.GameData.items[itemId];
        if (!itemData || !itemData.price) {
            return { success: false, message: 'Item not for sale' };
        }

        if (this.gold < itemData.price) {
            return { success: false, message: 'Not enough gold' };
        }

        if (this.inventory.length >= this.maxSlots && !itemData.stackable) {
            return { success: false, message: 'Inventory full' };
        }

        this.removeGold(itemData.price);
        this.addItem(itemId);

        return { success: true, message: `Purchased ${itemData.name}` };
    }

    // Sell item
    sellItem(itemId, quantity = 1) {
        const itemData = window.GameData.items[itemId];
        if (!itemData) {
            return { success: false, message: 'Invalid item' };
        }

        if (!this.hasItem(itemId, quantity)) {
            return { success: false, message: 'Not enough items' };
        }

        const sellPrice = (itemData.sellPrice || 1) * quantity;
        this.removeItem(itemId, quantity);
        this.addGold(sellPrice);

        return { success: true, message: `Sold for ${sellPrice} gold` };
    }

    // Get inventory data for UI
    getInventoryDisplay() {
        return this.inventory.map(slot => {
            const itemData = window.GameData.items[slot.itemId];
            return {
                ...slot,
                ...itemData
            };
        });
    }

    // Get equipment data for UI
    getEquipmentDisplay() {
        const display = {};
        for (const slot in this.equipment) {
            const itemId = this.equipment[slot];
            if (itemId) {
                display[slot] = {
                    itemId: itemId,
                    ...window.GameData.items[itemId]
                };
            } else {
                display[slot] = null;
            }
        }
        return display;
    }

    // Get save data
    getSaveData() {
        return {
            inventory: [...this.inventory],
            equipment: { ...this.equipment },
            gold: this.gold
        };
    }
}

// Create global instance
window.InventorySystem = InventorySystem;
