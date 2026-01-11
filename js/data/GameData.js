// ============================================
// REALMQUEST - Game Data
// All items, enemies, quests, classes, and NPCs
// ============================================

const GameData = {
    // ============================================
    // CLASSES
    // ============================================
    classes: {
        warrior: {
            id: 'warrior',
            name: 'Warrior',
            icon: '⚔️',
            description: 'A master of melee combat, excelling in strength and defense.',
            baseStats: {
                maxHealth: 150,
                maxMana: 50,
                attack: 15,
                defense: 12,
                speed: 100,
                critChance: 0.1
            },
            skills: ['slash', 'shield_bash', 'war_cry', 'berserker_rage'],
            color: 0xcc4444
        },
        mage: {
            id: 'mage',
            name: 'Mage',
            icon: '🔮',
            description: 'Wields powerful arcane magic, devastating foes from afar.',
            baseStats: {
                maxHealth: 80,
                maxMana: 150,
                attack: 20,
                defense: 5,
                speed: 90,
                critChance: 0.15
            },
            skills: ['fireball', 'ice_shard', 'arcane_blast', 'mana_shield'],
            color: 0x4444cc
        },
        rogue: {
            id: 'rogue',
            name: 'Rogue',
            icon: '🗡️',
            description: 'Swift and deadly, striking from the shadows with precision.',
            baseStats: {
                maxHealth: 100,
                maxMana: 80,
                attack: 18,
                defense: 8,
                speed: 130,
                critChance: 0.25
            },
            skills: ['backstab', 'poison_blade', 'shadow_step', 'deadly_combo'],
            color: 0x44cc44
        },
        healer: {
            id: 'healer',
            name: 'Healer',
            icon: '✨',
            description: 'Channels divine energy to heal wounds and smite evil.',
            baseStats: {
                maxHealth: 110,
                maxMana: 120,
                attack: 12,
                defense: 10,
                speed: 95,
                critChance: 0.08
            },
            skills: ['holy_light', 'heal', 'divine_shield', 'smite'],
            color: 0xcccc44
        }
    },

    // ============================================
    // SKILLS
    // ============================================
    skills: {
        // Warrior Skills
        slash: {
            id: 'slash',
            name: 'Slash',
            icon: '⚔️',
            description: 'A powerful sword slash dealing 120% weapon damage.',
            manaCost: 10,
            cooldown: 2000,
            damage: 1.2,
            range: 80,
            type: 'melee',
            effect: null
        },
        shield_bash: {
            id: 'shield_bash',
            name: 'Shield Bash',
            icon: '🛡️',
            description: 'Bash enemy with shield, dealing damage and stunning briefly.',
            manaCost: 20,
            cooldown: 5000,
            damage: 0.8,
            range: 60,
            type: 'melee',
            effect: 'stun'
        },
        war_cry: {
            id: 'war_cry',
            name: 'War Cry',
            icon: '📢',
            description: 'Boost attack by 30% for 10 seconds.',
            manaCost: 30,
            cooldown: 15000,
            damage: 0,
            range: 0,
            type: 'buff',
            effect: 'attackBoost',
            duration: 10000
        },
        berserker_rage: {
            id: 'berserker_rage',
            name: 'Berserker Rage',
            icon: '😤',
            description: 'Enter a rage, dealing 200% damage but taking 50% more.',
            manaCost: 40,
            cooldown: 20000,
            damage: 2.0,
            range: 100,
            type: 'melee',
            effect: 'berserker'
        },

        // Mage Skills
        fireball: {
            id: 'fireball',
            name: 'Fireball',
            icon: '🔥',
            description: 'Launch a fireball dealing 150% magic damage.',
            manaCost: 25,
            cooldown: 3000,
            damage: 1.5,
            range: 400,
            type: 'projectile',
            effect: 'burn',
            projectileSpeed: 500
        },
        ice_shard: {
            id: 'ice_shard',
            name: 'Ice Shard',
            icon: '❄️',
            description: 'Fire ice shards that slow enemies by 30%.',
            manaCost: 20,
            cooldown: 2500,
            damage: 1.2,
            range: 350,
            type: 'projectile',
            effect: 'slow',
            projectileSpeed: 600
        },
        arcane_blast: {
            id: 'arcane_blast',
            name: 'Arcane Blast',
            icon: '💫',
            description: 'Unleash arcane energy in an area for 180% damage.',
            manaCost: 40,
            cooldown: 6000,
            damage: 1.8,
            range: 200,
            type: 'aoe',
            effect: null
        },
        mana_shield: {
            id: 'mana_shield',
            name: 'Mana Shield',
            icon: '🔵',
            description: 'Create a shield that absorbs damage using mana.',
            manaCost: 50,
            cooldown: 20000,
            damage: 0,
            range: 0,
            type: 'buff',
            effect: 'manaShield',
            duration: 8000
        },

        // Rogue Skills
        backstab: {
            id: 'backstab',
            name: 'Backstab',
            icon: '🗡️',
            description: 'Strike from behind for 200% damage, guaranteed crit if behind.',
            manaCost: 25,
            cooldown: 4000,
            damage: 2.0,
            range: 60,
            type: 'melee',
            effect: 'backstab'
        },
        poison_blade: {
            id: 'poison_blade',
            name: 'Poison Blade',
            icon: '☠️',
            description: 'Apply poison dealing damage over 5 seconds.',
            manaCost: 20,
            cooldown: 8000,
            damage: 0.5,
            range: 70,
            type: 'melee',
            effect: 'poison',
            duration: 5000
        },
        shadow_step: {
            id: 'shadow_step',
            name: 'Shadow Step',
            icon: '👤',
            description: 'Teleport behind the nearest enemy.',
            manaCost: 30,
            cooldown: 10000,
            damage: 0,
            range: 300,
            type: 'movement',
            effect: 'teleport'
        },
        deadly_combo: {
            id: 'deadly_combo',
            name: 'Deadly Combo',
            icon: '💀',
            description: 'Rapid 5-hit combo dealing 50% damage each hit.',
            manaCost: 45,
            cooldown: 12000,
            damage: 0.5,
            hits: 5,
            range: 70,
            type: 'melee',
            effect: null
        },

        // Healer Skills
        holy_light: {
            id: 'holy_light',
            name: 'Holy Light',
            icon: '☀️',
            description: 'Blast enemy with holy light for 130% damage.',
            manaCost: 20,
            cooldown: 2500,
            damage: 1.3,
            range: 300,
            type: 'projectile',
            effect: null,
            projectileSpeed: 450
        },
        heal: {
            id: 'heal',
            name: 'Heal',
            icon: '💚',
            description: 'Restore 40% of max health.',
            manaCost: 35,
            cooldown: 8000,
            damage: 0,
            healPercent: 0.4,
            range: 0,
            type: 'heal',
            effect: 'heal'
        },
        divine_shield: {
            id: 'divine_shield',
            name: 'Divine Shield',
            icon: '🛡️',
            description: 'Become invulnerable for 3 seconds.',
            manaCost: 50,
            cooldown: 30000,
            damage: 0,
            range: 0,
            type: 'buff',
            effect: 'invulnerable',
            duration: 3000
        },
        smite: {
            id: 'smite',
            name: 'Smite',
            icon: '⚡',
            description: 'Call down holy wrath for 250% damage to undead.',
            manaCost: 40,
            cooldown: 10000,
            damage: 2.5,
            range: 250,
            type: 'projectile',
            effect: 'smite',
            projectileSpeed: 800
        },

        // Basic Attack (all classes)
        basic_attack: {
            id: 'basic_attack',
            name: 'Attack',
            icon: '👊',
            description: 'Basic attack dealing 100% weapon damage.',
            manaCost: 0,
            cooldown: 800,
            damage: 1.0,
            range: 70,
            type: 'melee',
            effect: null
        }
    },

    // ============================================
    // ITEMS
    // ============================================
    items: {
        // --- WEAPONS ---
        rusty_sword: {
            id: 'rusty_sword',
            name: 'Rusty Sword',
            icon: '🗡️',
            type: 'weapon',
            rarity: 'common',
            description: 'An old, rusty sword. Better than nothing.',
            stats: { attack: 3 },
            price: 10,
            sellPrice: 2
        },
        iron_sword: {
            id: 'iron_sword',
            name: 'Iron Sword',
            icon: '⚔️',
            type: 'weapon',
            rarity: 'common',
            description: 'A sturdy iron sword.',
            stats: { attack: 8 },
            price: 50,
            sellPrice: 12
        },
        steel_blade: {
            id: 'steel_blade',
            name: 'Steel Blade',
            icon: '⚔️',
            type: 'weapon',
            rarity: 'uncommon',
            description: 'A well-crafted steel blade.',
            stats: { attack: 15, critChance: 0.05 },
            price: 150,
            sellPrice: 40
        },
        flame_sword: {
            id: 'flame_sword',
            name: 'Flame Sword',
            icon: '🔥',
            type: 'weapon',
            rarity: 'rare',
            description: 'A sword imbued with eternal flame.',
            stats: { attack: 25, critChance: 0.1 },
            price: 500,
            sellPrice: 125
        },
        shadow_dagger: {
            id: 'shadow_dagger',
            name: 'Shadow Dagger',
            icon: '🗡️',
            type: 'weapon',
            rarity: 'rare',
            description: 'A dagger forged in darkness.',
            stats: { attack: 20, critChance: 0.2, speed: 20 },
            price: 450,
            sellPrice: 110
        },
        arcane_staff: {
            id: 'arcane_staff',
            name: 'Arcane Staff',
            icon: '🪄',
            type: 'weapon',
            rarity: 'rare',
            description: 'Channels arcane energy with ease.',
            stats: { attack: 22, maxMana: 30 },
            price: 480,
            sellPrice: 120
        },
        legendary_excalibur: {
            id: 'legendary_excalibur',
            name: 'Excalibur',
            icon: '⚔️',
            type: 'weapon',
            rarity: 'legendary',
            description: 'The legendary sword of kings.',
            stats: { attack: 50, defense: 10, critChance: 0.15, maxHealth: 50 },
            price: 5000,
            sellPrice: 1250
        },

        // --- ARMOR ---
        cloth_robe: {
            id: 'cloth_robe',
            name: 'Cloth Robe',
            icon: '👘',
            type: 'armor',
            rarity: 'common',
            description: 'Simple cloth robes.',
            stats: { defense: 2, maxMana: 10 },
            price: 20,
            sellPrice: 5
        },
        leather_armor: {
            id: 'leather_armor',
            name: 'Leather Armor',
            icon: '🦺',
            type: 'armor',
            rarity: 'common',
            description: 'Light leather armor.',
            stats: { defense: 5 },
            price: 40,
            sellPrice: 10
        },
        chainmail: {
            id: 'chainmail',
            name: 'Chainmail',
            icon: '🛡️',
            type: 'armor',
            rarity: 'uncommon',
            description: 'Linked metal rings for protection.',
            stats: { defense: 12, maxHealth: 20 },
            price: 120,
            sellPrice: 30
        },
        plate_armor: {
            id: 'plate_armor',
            name: 'Plate Armor',
            icon: '🛡️',
            type: 'armor',
            rarity: 'rare',
            description: 'Heavy plate armor.',
            stats: { defense: 25, maxHealth: 50, speed: -10 },
            price: 400,
            sellPrice: 100
        },
        dragon_scale_armor: {
            id: 'dragon_scale_armor',
            name: 'Dragon Scale Armor',
            icon: '🐉',
            type: 'armor',
            rarity: 'epic',
            description: 'Armor crafted from dragon scales.',
            stats: { defense: 35, maxHealth: 80, attack: 10 },
            price: 2000,
            sellPrice: 500
        },

        // --- HELMETS ---
        leather_cap: {
            id: 'leather_cap',
            name: 'Leather Cap',
            icon: '🎓',
            type: 'helmet',
            rarity: 'common',
            description: 'A simple leather cap.',
            stats: { defense: 2 },
            price: 15,
            sellPrice: 4
        },
        iron_helm: {
            id: 'iron_helm',
            name: 'Iron Helm',
            icon: '⛑️',
            type: 'helmet',
            rarity: 'uncommon',
            description: 'A sturdy iron helmet.',
            stats: { defense: 6, maxHealth: 15 },
            price: 80,
            sellPrice: 20
        },
        crown_of_kings: {
            id: 'crown_of_kings',
            name: 'Crown of Kings',
            icon: '👑',
            type: 'helmet',
            rarity: 'legendary',
            description: 'A crown worn by ancient kings.',
            stats: { defense: 15, maxHealth: 100, maxMana: 50, attack: 10 },
            price: 3000,
            sellPrice: 750
        },

        // --- ACCESSORIES ---
        wooden_ring: {
            id: 'wooden_ring',
            name: 'Wooden Ring',
            icon: '💍',
            type: 'accessory',
            rarity: 'common',
            description: 'A simple wooden ring.',
            stats: { maxHealth: 10 },
            price: 25,
            sellPrice: 6
        },
        ring_of_power: {
            id: 'ring_of_power',
            name: 'Ring of Power',
            icon: '💍',
            type: 'accessory',
            rarity: 'rare',
            description: 'Increases attack power.',
            stats: { attack: 12, critChance: 0.08 },
            price: 350,
            sellPrice: 90
        },
        amulet_of_vitality: {
            id: 'amulet_of_vitality',
            name: 'Amulet of Vitality',
            icon: '📿',
            type: 'accessory',
            rarity: 'epic',
            description: 'Greatly increases health.',
            stats: { maxHealth: 100, defense: 5 },
            price: 800,
            sellPrice: 200
        },

        // --- CONSUMABLES ---
        health_potion: {
            id: 'health_potion',
            name: 'Health Potion',
            icon: '🧪',
            type: 'consumable',
            rarity: 'common',
            description: 'Restores 50 health.',
            effect: { type: 'heal', value: 50 },
            stackable: true,
            maxStack: 99,
            price: 25,
            sellPrice: 6
        },
        mana_potion: {
            id: 'mana_potion',
            name: 'Mana Potion',
            icon: '🧪',
            type: 'consumable',
            rarity: 'common',
            description: 'Restores 40 mana.',
            effect: { type: 'mana', value: 40 },
            stackable: true,
            maxStack: 99,
            price: 30,
            sellPrice: 8
        },
        super_health_potion: {
            id: 'super_health_potion',
            name: 'Super Health Potion',
            icon: '🧪',
            type: 'consumable',
            rarity: 'uncommon',
            description: 'Restores 150 health.',
            effect: { type: 'heal', value: 150 },
            stackable: true,
            maxStack: 99,
            price: 100,
            sellPrice: 25
        },

        // --- QUEST ITEMS ---
        slime_goo: {
            id: 'slime_goo',
            name: 'Slime Goo',
            icon: '💧',
            type: 'quest',
            rarity: 'common',
            description: 'Gooey substance from slimes.',
            stackable: true,
            maxStack: 99,
            sellPrice: 2
        },
        wolf_fang: {
            id: 'wolf_fang',
            name: 'Wolf Fang',
            icon: '🦷',
            type: 'quest',
            rarity: 'common',
            description: 'A sharp fang from a forest wolf.',
            stackable: true,
            maxStack: 99,
            sellPrice: 5
        },
        goblin_ear: {
            id: 'goblin_ear',
            name: 'Goblin Ear',
            icon: '👂',
            type: 'quest',
            rarity: 'common',
            description: 'Proof of a slain goblin.',
            stackable: true,
            maxStack: 99,
            sellPrice: 3
        },
        ancient_key: {
            id: 'ancient_key',
            name: 'Ancient Key',
            icon: '🗝️',
            type: 'quest',
            rarity: 'rare',
            description: 'A mysterious key to the dungeon.',
            stackable: false,
            sellPrice: 0
        },
        dragon_heart: {
            id: 'dragon_heart',
            name: 'Dragon Heart',
            icon: '❤️',
            type: 'quest',
            rarity: 'legendary',
            description: 'The still-beating heart of a dragon.',
            stackable: false,
            sellPrice: 500
        }
    },

    // ============================================
    // ENEMIES
    // ============================================
    enemies: {
        slime: {
            id: 'slime',
            name: 'Slime',
            color: 0x44dd44,
            maxHealth: 30,
            attack: 5,
            defense: 2,
            speed: 40,
            xpReward: 15,
            goldReward: { min: 2, max: 8 },
            drops: [
                { itemId: 'slime_goo', chance: 0.5 },
                { itemId: 'health_potion', chance: 0.1 }
            ],
            behavior: 'passive',
            aggroRange: 150,
            attackRange: 40,
            attackCooldown: 1500
        },
        forest_wolf: {
            id: 'forest_wolf',
            name: 'Forest Wolf',
            color: 0x888888,
            maxHealth: 60,
            attack: 12,
            defense: 5,
            speed: 100,
            xpReward: 30,
            goldReward: { min: 5, max: 15 },
            drops: [
                { itemId: 'wolf_fang', chance: 0.4 },
                { itemId: 'leather_armor', chance: 0.05 }
            ],
            behavior: 'aggressive',
            aggroRange: 200,
            attackRange: 50,
            attackCooldown: 1200
        },
        goblin: {
            id: 'goblin',
            name: 'Goblin',
            color: 0x44aa44,
            maxHealth: 45,
            attack: 10,
            defense: 4,
            speed: 70,
            xpReward: 25,
            goldReward: { min: 8, max: 20 },
            drops: [
                { itemId: 'goblin_ear', chance: 0.6 },
                { itemId: 'rusty_sword', chance: 0.1 },
                { itemId: 'wooden_ring', chance: 0.05 }
            ],
            behavior: 'aggressive',
            aggroRange: 180,
            attackRange: 45,
            attackCooldown: 1000
        },
        skeleton: {
            id: 'skeleton',
            name: 'Skeleton',
            color: 0xdddddd,
            maxHealth: 55,
            attack: 14,
            defense: 3,
            speed: 60,
            xpReward: 35,
            goldReward: { min: 10, max: 25 },
            drops: [
                { itemId: 'iron_sword', chance: 0.08 },
                { itemId: 'leather_cap', chance: 0.1 },
                { itemId: 'mana_potion', chance: 0.15 }
            ],
            behavior: 'aggressive',
            aggroRange: 200,
            attackRange: 55,
            attackCooldown: 1300,
            undead: true
        },
        dark_mage: {
            id: 'dark_mage',
            name: 'Dark Mage',
            color: 0x6633aa,
            maxHealth: 70,
            attack: 20,
            defense: 6,
            speed: 50,
            xpReward: 50,
            goldReward: { min: 20, max: 40 },
            drops: [
                { itemId: 'arcane_staff', chance: 0.03 },
                { itemId: 'cloth_robe', chance: 0.15 },
                { itemId: 'mana_potion', chance: 0.3 }
            ],
            behavior: 'ranged',
            aggroRange: 300,
            attackRange: 250,
            attackCooldown: 2000,
            projectile: true
        },
        orc_warrior: {
            id: 'orc_warrior',
            name: 'Orc Warrior',
            color: 0x556b2f,
            maxHealth: 120,
            attack: 22,
            defense: 15,
            speed: 55,
            xpReward: 65,
            goldReward: { min: 25, max: 50 },
            drops: [
                { itemId: 'steel_blade', chance: 0.05 },
                { itemId: 'chainmail', chance: 0.08 },
                { itemId: 'super_health_potion', chance: 0.2 }
            ],
            behavior: 'aggressive',
            aggroRange: 180,
            attackRange: 60,
            attackCooldown: 1500
        },
        dungeon_boss: {
            id: 'dungeon_boss',
            name: 'Shadow Lord',
            color: 0x330033,
            maxHealth: 500,
            attack: 35,
            defense: 20,
            speed: 45,
            xpReward: 500,
            goldReward: { min: 200, max: 500 },
            drops: [
                { itemId: 'legendary_excalibur', chance: 0.1 },
                { itemId: 'dragon_scale_armor', chance: 0.15 },
                { itemId: 'crown_of_kings', chance: 0.08 },
                { itemId: 'dragon_heart', chance: 1.0 }
            ],
            behavior: 'boss',
            aggroRange: 400,
            attackRange: 80,
            attackCooldown: 2000,
            isBoss: true
        }
    },

    // ============================================
    // NPCS
    // ============================================
    npcs: {
        elder_marcus: {
            id: 'elder_marcus',
            name: 'Elder Marcus',
            title: 'Village Elder',
            color: 0xaa8855,
            dialogue: {
                greeting: "Welcome, young adventurer! Our village has been plagued by monsters. Will you help us?",
                quests: ['slime_trouble', 'wolf_hunt'],
                options: [
                    { text: "I'll help! What do you need?", action: 'showQuests' },
                    { text: "Tell me about this place.", response: "This is Starfall Village, a peaceful hamlet... until the monsters came. The forest to the east has become dangerous, and there are rumors of a dungeon to the north filled with dark magic." },
                    { text: "Goodbye.", action: 'close' }
                ]
            }
        },
        blacksmith_hilda: {
            id: 'blacksmith_hilda',
            name: 'Hilda',
            title: 'Master Blacksmith',
            color: 0xcc6633,
            dialogue: {
                greeting: "Ho there! Looking for some quality steel? I've got the finest weapons and armor in the realm!",
                shop: 'blacksmith',
                options: [
                    { text: "Show me your wares.", action: 'openShop' },
                    { text: "Can you tell me about your craft?", response: "I've been smithing for 30 years! Every piece I make is forged with passion. My grandfather taught me, and his grandfather before him." },
                    { text: "Goodbye.", action: 'close' }
                ]
            }
        },
        potion_master: {
            id: 'potion_master',
            name: 'Mystara',
            title: 'Potion Master',
            color: 0x9944aa,
            dialogue: {
                greeting: "Ah, another adventurer in need of magical remedies? My potions are the best you'll find anywhere!",
                shop: 'potions',
                options: [
                    { text: "I need some potions.", action: 'openShop' },
                    { text: "What's in these potions?", response: "Trade secrets, my dear! But I assure you, everything is ethically sourced... mostly. The slime extract helps with the texture." },
                    { text: "Goodbye.", action: 'close' }
                ]
            }
        },
        guard_captain: {
            id: 'guard_captain',
            name: 'Captain Rex',
            title: 'Town Guard Captain',
            color: 0x4477aa,
            dialogue: {
                greeting: "Halt! Oh, an adventurer. Good, we need capable fighters. The dungeon to the north has been spewing undead lately.",
                quests: ['goblin_menace', 'dungeon_key'],
                options: [
                    { text: "I can help clear the dungeon.", action: 'showQuests' },
                    { text: "What's in the dungeon?", response: "Dark things. Skeletons, dark mages, and worse. At its heart lurks the Shadow Lord - an ancient evil that must be destroyed." },
                    { text: "Goodbye.", action: 'close' }
                ]
            }
        },
        class_trainer: {
            id: 'class_trainer',
            name: 'Master Zephyr',
            title: 'Class Trainer',
            color: 0xddaa33,
            dialogue: {
                greeting: "Greetings, warrior! I can sense great potential in you. Would you like to change your fighting style?",
                options: [
                    { text: "I want to change my class.", action: 'openClassSelect' },
                    { text: "What classes can you teach?", response: "I can train you as a Warrior, Mage, Rogue, or Healer. Each path has unique abilities. Choose wisely!" },
                    { text: "Goodbye.", action: 'close' }
                ]
            }
        }
    },

    // ============================================
    // QUESTS
    // ============================================
    quests: {
        slime_trouble: {
            id: 'slime_trouble',
            name: 'Slime Trouble',
            description: 'The slimes in the forest have been multiplying. Clear out 5 of them to make the paths safer.',
            giver: 'elder_marcus',
            objectives: [
                { type: 'kill', target: 'slime', count: 5, current: 0 }
            ],
            rewards: {
                xp: 100,
                gold: 50,
                items: ['health_potion', 'health_potion']
            },
            prerequisite: null,
            repeatable: false
        },
        wolf_hunt: {
            id: 'wolf_hunt',
            name: 'Wolf Hunt',
            description: 'Forest wolves have been attacking travelers. Bring back 3 wolf fangs as proof.',
            giver: 'elder_marcus',
            objectives: [
                { type: 'collect', item: 'wolf_fang', count: 3, current: 0 }
            ],
            rewards: {
                xp: 150,
                gold: 80,
                items: ['leather_armor']
            },
            prerequisite: 'slime_trouble',
            repeatable: false
        },
        goblin_menace: {
            id: 'goblin_menace',
            name: 'Goblin Menace',
            description: 'Goblins from the dungeon have been raiding our supplies. Collect 5 goblin ears.',
            giver: 'guard_captain',
            objectives: [
                { type: 'collect', item: 'goblin_ear', count: 5, current: 0 }
            ],
            rewards: {
                xp: 200,
                gold: 120,
                items: ['iron_sword']
            },
            prerequisite: null,
            repeatable: false
        },
        dungeon_key: {
            id: 'dungeon_key',
            name: 'The Dungeon Key',
            description: 'Find the Ancient Key to unlock the deepest part of the dungeon where the Shadow Lord dwells.',
            giver: 'guard_captain',
            objectives: [
                { type: 'collect', item: 'ancient_key', count: 1, current: 0 }
            ],
            rewards: {
                xp: 300,
                gold: 200,
                items: ['steel_blade']
            },
            prerequisite: 'goblin_menace',
            repeatable: false
        },
        defeat_shadow_lord: {
            id: 'defeat_shadow_lord',
            name: 'Defeat the Shadow Lord',
            description: 'The ultimate challenge awaits. Defeat the Shadow Lord and bring peace to the realm.',
            giver: 'guard_captain',
            objectives: [
                { type: 'kill', target: 'dungeon_boss', count: 1, current: 0 }
            ],
            rewards: {
                xp: 1000,
                gold: 1000,
                items: ['amulet_of_vitality']
            },
            prerequisite: 'dungeon_key',
            repeatable: true
        }
    },

    // ============================================
    // SHOPS
    // ============================================
    shops: {
        blacksmith: {
            name: "Hilda's Smithy",
            items: ['rusty_sword', 'iron_sword', 'steel_blade', 'leather_armor', 'chainmail', 'plate_armor', 'leather_cap', 'iron_helm']
        },
        potions: {
            name: "Mystara's Potions",
            items: ['health_potion', 'mana_potion', 'super_health_potion']
        }
    },

    // ============================================
    // LEVEL PROGRESSION
    // ============================================
    levelXpRequirements: [
        0,      // Level 1
        100,    // Level 2
        250,    // Level 3
        500,    // Level 4
        850,    // Level 5
        1300,   // Level 6
        1900,   // Level 7
        2650,   // Level 8
        3550,   // Level 9
        4600,   // Level 10
        5850,   // Level 11
        7300,   // Level 12
        9000,   // Level 13
        11000,  // Level 14
        13500,  // Level 15
        16500,  // Level 16
        20000,  // Level 17
        24500,  // Level 18
        30000,  // Level 19
        37000   // Level 20 (max)
    ],

    // Stats gained per level
    statsPerLevel: {
        maxHealth: 10,
        maxMana: 5,
        attack: 2,
        defense: 1
    }
};

// Make it globally available
window.GameData = GameData;
