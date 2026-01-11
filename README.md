# 🎮 RealmQuest - Browser Adventure RPG

A browser-based 2D action RPG inspired by AdventureQuest Worlds (AQW), built with Phaser 3.

![RealmQuest](https://img.shields.io/badge/Version-1.0.0-gold)
![Phaser](https://img.shields.io/badge/Phaser-3.60.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🎯 Core Gameplay
- **Smooth 2D Movement** - Run, jump, and double-jump through diverse environments
- **Real-Time Combat** - Attack enemies with melee strikes and special abilities
- **Skill System** - 4 unique skills per class with cooldowns and mana costs
- **Enemy AI** - Enemies patrol, chase, and attack with different behaviors

### ⚔️ Character Progression
- **4 Playable Classes**
  - ⚔️ **Warrior** - High health and defense, melee focused
  - 🔮 **Mage** - Powerful ranged attacks, high mana pool
  - 🗡️ **Rogue** - Fast attacks, high critical chance
  - ✨ **Healer** - Support abilities, balanced stats
- **Level System** - Gain XP from kills and quests to level up (max level 20)
- **Equipment** - Weapons, armor, helmets, and accessories with stat bonuses
- **Inventory System** - 30-slot inventory with stackable items

### 🗺️ World
- **3 Unique Zones**
  - 🏘️ **Starfall Village** - Safe hub with NPCs and shops
  - 🌲 **Dark Forest** - Combat zone with slimes, wolves, and goblins
  - 🏰 **Shadow Dungeon** - Dangerous area with skeletons, mages, and a boss
- **Portal Travel** - Seamless transitions between zones
- **Atmospheric Design** - Parallax backgrounds, ambient particles, and lighting effects

### 📜 Quests & NPCs
- **5 Unique NPCs** - Each with dialogue, quests, or shops
- **Quest System** - Kill quests, collection quests, and boss hunts
- **Shops** - Buy weapons, armor, and potions with gold

### 💾 Persistence
- **Auto-Save** - Game saves automatically every 30 seconds
- **Local Storage** - Progress saved in browser storage
- **Continue Game** - Resume from where you left off

## 🎮 Controls

| Key | Action |
|-----|--------|
| A/D or ←/→ | Move left/right |
| W/↑/Space | Jump (press again for double jump) |
| 1-5 | Use skills |
| E | Interact with NPCs/portals |
| I | Toggle inventory |
| Q | Toggle quest log |
| ESC | Close all menus |

## 🚀 Getting Started

### Option 1: Local Server (Recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```
Then open `http://localhost:8000` in your browser.

### Option 2: Direct File
Simply open `index.html` in a modern web browser. Some features may be limited due to CORS restrictions.

### Option 3: VS Code Live Server
If using VS Code, install the "Live Server" extension and click "Go Live".

## 📁 Project Structure

```
AdventureQuest/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # All game styling and UI
├── js/
│   ├── main.js            # Game initialization
│   ├── data/
│   │   └── GameData.js    # Items, enemies, quests, classes
│   ├── entities/
│   │   ├── Player.js      # Player character
│   │   ├── Enemy.js       # Enemy AI and behavior
│   │   └── NPC.js         # NPC interactions
│   ├── systems/
│   │   ├── CombatSystem.js    # Damage calculation
│   │   ├── SkillSystem.js     # Skills and cooldowns
│   │   ├── InventorySystem.js # Items and equipment
│   │   ├── QuestSystem.js     # Quest tracking
│   │   └── SaveSystem.js      # Save/load functionality
│   ├── scenes/
│   │   ├── BootScene.js       # Initial loading
│   │   ├── MenuScene.js       # Main menu
│   │   ├── GameScene.js       # Base game scene
│   │   ├── TownScene.js       # Village hub
│   │   ├── ForestScene.js     # Forest combat zone
│   │   ├── DungeonScene.js    # Dungeon with boss
│   │   └── UIScene.js         # HUD overlay
│   └── ui/
│       └── ModalManager.js    # Modal windows
└── README.md
```

## 🎨 Customization

### Adding New Items
Edit `js/data/GameData.js` and add to the `items` object:
```javascript
my_new_sword: {
    id: 'my_new_sword',
    name: 'Epic Blade',
    icon: '⚔️',
    type: 'weapon',
    rarity: 'epic',
    description: 'A legendary weapon.',
    stats: { attack: 30, critChance: 0.15 },
    price: 1000,
    sellPrice: 250
}
```

### Adding New Enemies
Add to the `enemies` object in GameData.js:
```javascript
my_monster: {
    id: 'my_monster',
    name: 'Scary Monster',
    color: 0xff0000,
    maxHealth: 100,
    attack: 20,
    defense: 10,
    speed: 80,
    xpReward: 50,
    goldReward: { min: 10, max: 30 },
    drops: [
        { itemId: 'health_potion', chance: 0.3 }
    ],
    behavior: 'aggressive',
    aggroRange: 200,
    attackRange: 50,
    attackCooldown: 1500
}
```

### Adding New Quests
Add to the `quests` object:
```javascript
my_quest: {
    id: 'my_quest',
    name: 'New Adventure',
    description: 'Complete this new quest!',
    giver: 'elder_marcus',
    objectives: [
        { type: 'kill', target: 'slime', count: 10, current: 0 }
    ],
    rewards: {
        xp: 200,
        gold: 100,
        items: ['steel_blade']
    },
    prerequisite: null,
    repeatable: false
}
```

## 🔧 Technical Details

- **Engine**: Phaser 3.60.0
- **Resolution**: 1280x720 (scales to fit screen)
- **Browser Support**: Chrome, Firefox, Safari, Edge (modern versions)
- **No Build Required**: Pure vanilla JavaScript, runs directly in browser

## 🐛 Known Issues

- Save data is stored in browser localStorage and will be lost if cleared
- Some older browsers may not support all CSS features
- Performance may vary on low-end devices with many enemies

## 📝 Future Improvements

- [ ] Add sound effects and music
- [ ] Implement multiplayer with WebSockets
- [ ] Add more classes and skills
- [ ] Create more zones and bosses
- [ ] Add achievements system
- [ ] Implement crafting
- [ ] Add pets/companions
- [ ] Daily login rewards

## 📄 License

MIT License - Feel free to use, modify, and distribute!

## 🙏 Credits

- **Phaser** - Game framework
- **Google Fonts** - Cinzel & Crimson Text fonts
- Built with ❤️ for fans of browser RPGs

---

*"The realm awaits, adventurer. Will you answer the call?"* ⚔️
