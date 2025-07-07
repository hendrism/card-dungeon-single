import React, { useState, useEffect } from ‘react’;

// ================== GAME DATA ==================
const GAME_DATA = {
races: [
{ name: ‘Human’, bonus: ‘Versatile: +1 to all stats’, color: ‘bg-blue-100’ },
{ name: ‘Elf’, bonus: ‘Agile: +2 Speed, +1 Magic’, color: ‘bg-green-100’ },
{ name: ‘Dwarf’, bonus: ‘Hardy: +2 Defense, +1 Health’, color: ‘bg-orange-100’ },
{ name: ‘Orc’, bonus: ‘Strong: +2 Attack, +1 Health’, color: ‘bg-red-100’ },
{ name: ‘Halfling’, bonus: ‘Lucky: Draw extra card each turn’, color: ‘bg-yellow-100’ },
{ name: ‘Tiefling’, bonus: ‘Infernal: +2 Magic, Fire resistance’, color: ‘bg-purple-100’ }
],

roles: [
{ name: ‘Fighter’, health: 25, attack: 8, defense: 6, magic: 2, speed: 4, ability: ‘Weapon Master: Face cards deal +3 damage’ },
{ name: ‘Paladin’, health: 30, attack: 6, defense: 8, magic: 4, speed: 3, ability: ‘Divine Shield: Hearts restore 2 HP to party’ },
{ name: ‘Rogue’, health: 20, attack: 7, defense: 4, magic: 3, speed: 8, ability: ‘Stealth Strike: Spades deal double damage’ },
{ name: ‘Wizard’, health: 15, attack: 3, defense: 3, magic: 9, speed: 5, ability: ‘Arcane Power: Clubs deal magic damage’ },
{ name: ‘Druid’, health: 22, attack: 5, defense: 5, magic: 6, speed: 6, ability: ‘Nature's Wrath: Diamonds boost next card’ },
{ name: ‘Barbarian’, health: 28, attack: 9, defense: 5, magic: 1, speed: 5, ability: ‘Rage: Aces deal massive damage’ }
],

enemies: [
{ name: ‘Goblin Scout’, health: 15, attack: 4, defense: 2, reward: ‘Draw 2 cards’ },
{ name: ‘Skeleton Warrior’, health: 20, attack: 6, defense: 4, reward: ‘Party heals 5 HP’ },
{ name: ‘Orc Berserker’, health: 25, attack: 8, defense: 3, reward: ‘Draw 3 cards’ },
{ name: ‘Dark Mage’, health: 18, attack: 7, defense: 5, reward: ‘Party heals 8 HP’ },
{ name: ‘Minotaur’, health: 35, attack: 10, defense: 6, reward: ‘Draw 4 cards’ }
],

constants: {
MAX_CARDS_PER_TURN: 2,
PARTY_SIZE: 4,
ROOMS_PER_FLOOR: 5
}
};

// ================== UTILITY FUNCTIONS ==================
const GameUtils = {
shuffleDeck: (deck) => {
const shuffled = […deck];
for (let i = shuffled.length - 1; i > 0; i–) {
const j = Math.floor(Math.random() * (i + 1));
[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
}
return shuffled;
},

createDeck: () => {
const suits = [‘♠’, ‘♥’, ‘♦’, ‘♣’];
const values = [‘A’, ‘2’, ‘3’, ‘4’, ‘5’, ‘6’, ‘7’, ‘8’, ‘9’, ‘10’, ‘J’, ‘Q’, ‘K’];
const newDeck = [];

```
suits.forEach(suit => {
  values.forEach(value => {
    newDeck.push({ suit, value, id: `${suit}${value}` });
  });
});

return GameUtils.shuffleDeck(newDeck);
```

},

getCardColor: (suit) => {
return suit === ‘♥’ || suit === ‘♦’ ? ‘text-red-600’ : ‘text-black’;
},

getCardValue: (card) => {
return card.value === ‘A’ ? 11 : [‘J’, ‘Q’, ‘K’].includes(card.value) ? 10 : parseInt(card.value);
},

applyRaceBonus: (baseStats, raceName) => {
const bonuses = {
health: [‘Dwarf’, ‘Orc’, ‘Human’].includes(raceName) ? 1 : 0,
attack: raceName === ‘Orc’ ? 2 : raceName === ‘Human’ ? 1 : 0,
defense: raceName === ‘Dwarf’ ? 2 : raceName === ‘Human’ ? 1 : 0,
magic: raceName === ‘Elf’ ? 1 : raceName === ‘Tiefling’ ? 2 : raceName === ‘Human’ ? 1 : 0,
speed: raceName === ‘Elf’ ? 2 : raceName === ‘Human’ ? 1 : 0
};

```
return {
  maxHealth: baseStats.health + bonuses.health,
  health: baseStats.health + bonuses.health,
  attack: baseStats.attack + bonuses.attack,
  defense: baseStats.defense + bonuses.defense,
  magic: baseStats.magic + bonuses.magic,
  speed: baseStats.speed + bonuses.speed
};
```

},

getPercentage: (current, max) => {
return Math.max(0, Math.min(100, (current / max) * 100));
}
};

// ================== CHARACTER CREATION ==================
const CharacterCreator = {
createCharacter: (raceName, roleName) => {
const raceData = GAME_DATA.races.find(r => r.name === raceName);
const roleData = GAME_DATA.roles.find(r => r.name === roleName);
const stats = GameUtils.applyRaceBonus(roleData, raceName);

```
return {
  id: Date.now() + Math.random(),
  race: raceName,
  role: roleName,
  ...stats,
  ability: roleData.ability,
  raceBonus: raceData.bonus,
  tempAttack: 0,
  tempDefense: 0,
  tempMagic: 0
};
```

},

generateRandomCharacter: () => {
const randomRace = GAME_DATA.races[Math.floor(Math.random() * GAME_DATA.races.length)];
const randomRole = GAME_DATA.roles[Math.floor(Math.random() * GAME_DATA.roles.length)];
return CharacterCreator.createCharacter(randomRace.name, randomRole.name);
},

generateRandomParty: () => {
const shuffledRaces = […GAME_DATA.races].sort(() => Math.random() - 0.5);
const shuffledRoles = […GAME_DATA.roles].sort(() => Math.random() - 0.5);

```
const party = [];
for (let i = 0; i < GAME_DATA.constants.PARTY_SIZE; i++) {
  const selectedRace = shuffledRaces[i % shuffledRaces.length];
  const selectedRole = shuffledRoles[i % shuffledRoles.length];
  party.push(CharacterCreator.createCharacter(selectedRace.name, selectedRole.name));
}
return party;
```

},

getEffectiveStats: (character) => {
return {
attack: character.attack + (character.tempAttack || 0),
defense: character.defense + (character.tempDefense || 0),
magic: character.magic + (character.tempMagic || 0),
speed: character.speed,
health: character.health,
maxHealth: character.maxHealth
};
},

isAlive: (character) => {
return character && character.health > 0;
},

healCharacter: (character, amount) => {
return {
…character,
health: Math.min(character.maxHealth, character.health + amount)
};
},

damageCharacter: (character, amount) => {
return {
…character,
health: Math.max(0, character.health - amount)
};
},

clearTempModifiers: (character) => {
return {
…character,
tempAttack: 0,
tempDefense: 0,
tempMagic: 0
};
}
};

// ================== COMBAT SYSTEM ==================
const CombatSystem = {
calculateCardEffect: (card, character) => {
if (!card || !character) return { damage: 0, healing: 0, special: ‘’ };

```
let damage = 0;
let healing = 0;
let special = '';
const cardValue = GameUtils.getCardValue(card);
const stats = CharacterCreator.getEffectiveStats(character);

switch (card.suit) {
  case '♠':
    damage = cardValue + stats.attack;
    if (character.role === 'Rogue') {
      damage *= 2;
      special = 'Stealth Strike!';
    }
    break;
  case '♥':
    healing = cardValue;
    if (character.role === 'Paladin') {
      healing += 2;
      special = 'Divine healing spreads to party!';
    }
    break;
  case '♦':
    special = 'Next card enhanced!';
    break;
  case '♣':
    damage = cardValue + stats.magic;
    if (character.role === 'Wizard') {
      damage += 3;
      special = 'Arcane Power!';
    }
    break;
}

if (['J', 'Q', 'K'].includes(card.value) && character.role === 'Fighter') {
  damage += 3;
  special = special ? `${special} Weapon Master!` : 'Weapon Master!';
}

if (card.value === 'A' && character.role === 'Barbarian') {
  damage += 10;
  special = special ? `${special} RAGE!` : 'RAGE!';
}

return { damage, healing, special };
```

},

getCardEffect: (card, character) => {
if (!card || !character) return { description: ‘’, damage: 0, healing: 0 };

```
const cardValue = GameUtils.getCardValue(card);
const stats = CharacterCreator.getEffectiveStats(character);
let description = '';
let damage = 0;
let healing = 0;

switch (card.suit) {
  case '♠':
    damage = cardValue + stats.attack;
    description = `Physical Attack: ${damage} damage`;
    if (character.role === 'Rogue') {
      damage *= 2;
      description = `Stealth Strike: ${damage} damage (doubled!)`;
    }
    break;
  case '♥':
    healing = cardValue;
    description = `Healing: Restore ${healing} HP`;
    if (character.role === 'Paladin') {
      healing += 2;
      description = `Divine Healing: Restore ${healing} HP to all`;
    }
    break;
  case '♦':
    description = 'Buff: Enhance next card played';
    break;
  case '♣':
    damage = cardValue + stats.magic;
    description = `Magic Attack: ${damage} magic damage`;
    if (character.role === 'Wizard') {
      damage += 3;
      description = `Arcane Blast: ${damage} magic damage`;
    }
    break;
}

if (['J', 'Q', 'K'].includes(card.value) && character.role === 'Fighter') {
  if (damage > 0) damage += 3;
  description += ' +3 (Weapon Master)';
}

if (card.value === 'A' && character.role === 'Barbarian') {
  if (damage > 0) damage += 10;
  description += ' +10 (RAGE!)';
}

return { description, damage, healing };
```

},

isCardOptimal: (card, character) => {
if (!card || !character || character.type === ‘enemy’) return false;

```
const actualChar = character.character || character;
const cardValue = GameUtils.getCardValue(card);
const stats = CharacterCreator.getEffectiveStats(actualChar);

if (cardValue >= 9) {
  if (card.suit === '♠' && (stats.attack >= 7 || actualChar.role === 'Rogue')) return true;
  if (card.suit === '♣' && (stats.magic >= 6 || actualChar.role === 'Wizard')) return true;
  if (card.suit === '♥' && actualChar.role === 'Paladin') return true;
}

if (actualChar.role === 'Rogue' && card.suit === '♠') return true;
if (actualChar.role === 'Wizard' && card.suit === '♣') return true;
if (actualChar.role === 'Paladin' && card.suit === '♥') return true;
if (actualChar.role === 'Fighter' && ['J', 'Q', 'K'].includes(card.value)) return true;
if (actualChar.role === 'Barbarian' && card.value === 'A') return true;

return false;
```

},

rollInitiative: (party, enemy) => {
const activeParty = party.filter(char => char !== null && CharacterCreator.isAlive(char));
const initiativeOrder = activeParty.map(character => ({
type: ‘player’,
character,
initiative: Math.floor(Math.random() * 20) + 1 + character.speed
}));

```
const enemyInitiative = {
  type: 'enemy',
  character: enemy,
  initiative: Math.floor(Math.random() * 20) + 1 + enemy.attack
};

initiativeOrder.push(enemyInitiative);
return initiativeOrder.sort((a, b) => b.initiative - a.initiative);
```

},

calculateActualDamage: (baseDamage, defense) => {
return Math.max(1, baseDamage - defense);
},

calculateEnemyDamage: (enemy) => {
return Math.floor(Math.random() * enemy.attack) + Math.floor(enemy.attack / 2);
},

calculateEscapeChance: (party) => {
const aliveMembers = party.filter(char => char && CharacterCreator.isAlive(char));
if (aliveMembers.length === 0) return 0;

```
const averageSpeed = aliveMembers.reduce((total, char) => total + char.speed, 0) / aliveMembers.length;
return 0.3 + (averageSpeed / 100);
```

},

calculateDrawBonuses: (cardsNotDrawn) => {
const bonuses = {
2: {
healing: 3,
tempAttack: 2,
tempMagic: 2,
message: “Focus Bonus: Party heals 3 HP and gains +2 Attack/Magic for next turn!”
},
1: {
healing: 1,
tempAttack: 1,
tempMagic: 0,
message: “Discipline Bonus: Party heals 1 HP and gains +1 Attack for next turn!”
},
0: {
healing: 0,
tempAttack: 0,
tempMagic: 0,
message: null
}
};

```
return bonuses[cardsNotDrawn] || bonuses[0];
```

},

processEnemyReward: (reward) => {
if (reward.includes(‘Draw’)) {
const cardCount = parseInt(reward.match(/\d+/)[0]);
return { type: ‘cards’, amount: cardCount };
} else if (reward.includes(‘heals’)) {
const healAmount = parseInt(reward.match(/\d+/)[0]);
return { type: ‘healing’, amount: healAmount };
}
return { type: ‘none’, amount: 0 };
}
};

// ================== MAIN COMPONENT ==================
const DungeonCrawler = () => {
// State Management
const [gameState, setGameState] = useState(‘setup’);
const [party, setParty] = useState([null, null, null, null]);
const [currentFloor, setCurrentFloor] = useState(1);
const [currentRoom, setCurrentRoom] = useState(1);
const [deck, setDeck] = useState([]);
const [hand, setHand] = useState([]);
const [enemy, setEnemy] = useState(null);
const [combatLog, setCombatLog] = useState([]);
const [selectedCard, setSelectedCard] = useState(null);
const [selectedCharacter, setSelectedCharacter] = useState(null);
const [showCharacterCreation, setShowCharacterCreation] = useState(false);
const [selectedSlot, setSelectedSlot] = useState(null);
const [selectedRace, setSelectedRace] = useState(’’);
const [selectedRole, setSelectedRole] = useState(’’);
const [cardsDrawnThisTurn, setCardsDrawnThisTurn] = useState(0);
const [showCardReference, setShowCardReference] = useState(false);
const [turnOrder, setTurnOrder] = useState([]);
const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
const [initiativeRolled, setInitiativeRolled] = useState(false);

// Initialize deck
useEffect(() => {
setDeck(GameUtils.createDeck());
}, []);

// ================== GAME ACTIONS ==================
const drawCards = (count) => {
const newHand = […hand];
const newDeck = […deck];

```
for (let i = 0; i < count && newDeck.length > 0; i++) {
  newHand.push(newDeck.pop());
}

setHand(newHand);
setDeck(newDeck);
setCardsDrawnThisTurn(prev => prev + count);
```

};

const applyDrawCardBonuses = () => {
const cardsNotDrawn = GAME_DATA.constants.MAX_CARDS_PER_TURN - cardsDrawnThisTurn;
const bonuses = CombatSystem.calculateDrawBonuses(cardsNotDrawn);

```
if (bonuses.message) {
  setParty(prev => prev.map(char => 
    char ? { 
      ...char, 
      health: Math.min(char.maxHealth, char.health + bonuses.healing),
      tempAttack: (char.tempAttack || 0) + bonuses.tempAttack,
      tempMagic: (char.tempMagic || 0) + bonuses.tempMagic
    } : char
  ));
  setCombatLog(prev => [...prev, bonuses.message]);
}
```

};

const startDungeon = () => {
if (party.filter(char => char !== null).length === 0) return;
setGameState(‘dungeon’);
drawCards(5);
setCardsDrawnThisTurn(0);
};

const enterCombat = () => {
const randomEnemy = GAME_DATA.enemies[Math.floor(Math.random() * GAME_DATA.enemies.length)];
setEnemy({ …randomEnemy, currentHealth: randomEnemy.health });
setGameState(‘combat’);
setCardsDrawnThisTurn(0);
setInitiativeRolled(false);
setTurnOrder([]);
setCurrentTurnIndex(0);
setSelectedCard(null);
setSelectedCharacter(null);
setCombatLog([`A ${randomEnemy.name} appears!`]);
};

// ================== CHARACTER MANAGEMENT ==================
const openCharacterCreation = (slotIndex) => {
setSelectedSlot(slotIndex);
setSelectedRace(’’);
setSelectedRole(’’);
setShowCharacterCreation(true);
};

const addCharacterToParty = () => {
if (!selectedRace || !selectedRole || selectedSlot === null) return;

```
const newParty = [...party];
newParty[selectedSlot] = CharacterCreator.createCharacter(selectedRace, selectedRole);
setParty(newParty);
setShowCharacterCreation(false);
```

};

const generateRandomCharacter = (slotIndex) => {
const newParty = […party];
newParty[slotIndex] = CharacterCreator.generateRandomCharacter();
setParty(newParty);
};

const generateRandomParty = () => {
setParty(CharacterCreator.generateRandomParty());
};

// ================== COMBAT ACTIONS ==================
const rollInitiative = () => {
const initiativeOrder = CombatSystem.rollInitiative(party, enemy);

```
setTurnOrder(initiativeOrder);
setCurrentTurnIndex(0);
setInitiativeRolled(true);
setCombatLog(prev => [
  ...prev,
  "Initiative rolled!",
  ...initiativeOrder.map((entry, index) => 
    entry.type === 'player' 
      ? `${index + 1}. ${entry.character.race} ${entry.character.role} (${entry.initiative})`
      : `${index + 1}. ${entry.character.name} (${entry.initiative})`
  )
]);

if (initiativeOrder[0].type === 'enemy') {
  setTimeout(() => executeEnemyTurn(), 1000);
}
```

};

const executeEnemyTurn = () => {
const damage = CombatSystem.calculateEnemyDamage(enemy);
const alivePlayers = party.filter(char => char !== null && CharacterCreator.isAlive(char));

```
if (alivePlayers.length > 0) {
  const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
  const actualDamage = CombatSystem.calculateActualDamage(damage, target.defense + (target.tempDefense || 0));
  
  setParty(prev => prev.map(char => 
    char && char.id === target.id 
      ? CharacterCreator.damageCharacter(char, actualDamage)
      : char
  ));
  
  setCombatLog(prev => [...prev, `${enemy.name} attacks ${target.race} ${target.role} for ${actualDamage} damage!`]);
}

setTimeout(() => {
  nextTurn();
}, 1500);
```

};

const nextTurn = () => {
setParty(prev => prev.map(char =>
char ? CharacterCreator.clearTempModifiers(char) : char
));

```
const nextIndex = (currentTurnIndex + 1) % turnOrder.length;
setCurrentTurnIndex(nextIndex);
setSelectedCard(null);
setSelectedCharacter(null);

if (nextIndex === 0) {
  applyDrawCardBonuses();
  setCardsDrawnThisTurn(0);
}

if (turnOrder[nextIndex]?.type === 'enemy') {
  setTimeout(() => executeEnemyTurn(), 1000);
}
```

};

const getCurrentCharacter = () => {
if (!initiativeRolled || turnOrder.length === 0) return null;
return turnOrder[currentTurnIndex];
};

const basicAttack = () => {
const currentChar = getCurrentCharacter();
if (!currentChar || currentChar.type === ‘enemy’) return;

```
const stats = CharacterCreator.getEffectiveStats(currentChar.character);
const damage = Math.floor(stats.attack / 2) + 1;
const actualDamage = CombatSystem.calculateActualDamage(damage, enemy.defense);

setEnemy(prev => ({ ...prev, currentHealth: prev.currentHealth - actualDamage }));
setCombatLog(prev => [...prev, `${currentChar.character.race} ${currentChar.character.role} makes a basic attack for ${actualDamage} damage!`]);

checkCombatEnd(actualDamage);
```

};

const guardAction = () => {
const currentChar = getCurrentCharacter();
if (!currentChar || currentChar.type === ‘enemy’) return;

```
setParty(prev => prev.map(char => 
  char && char.id === currentChar.character.id 
    ? { ...char, tempDefense: (char.tempDefense || 0) + 3 }
    : char
));

setCombatLog(prev => [...prev, `${currentChar.character.race} ${currentChar.character.role} takes a defensive stance! (+3 Defense until next turn)`]);

setTimeout(() => {
  nextTurn();
}, 1000);
```

};

const attemptEscape = () => {
const escapeChance = Math.random();
const successChance = CombatSystem.calculateEscapeChance(party);

```
if (escapeChance < successChance) {
  setCombatLog(prev => [...prev, "Successfully escaped from combat!"]);
  setTimeout(() => {
    setGameState('dungeon');
    setEnemy(null);
    setInitiativeRolled(false);
    setTurnOrder([]);
    setCardsDrawnThisTurn(0);
  }, 1500);
} else {
  setCombatLog(prev => [...prev, "Failed to escape! The enemy blocks your retreat."]);
  setTimeout(() => {
    nextTurn();
  }, 1000);
}
```

};

const checkCombatEnd = (damageDealt) => {
if (enemy.currentHealth - damageDealt <= 0) {
setTimeout(() => {
setCombatLog(prev => […prev, `${enemy.name} defeated! ${enemy.reward}`]);
setCurrentRoom(prev => prev + 1);

```
    if (currentRoom >= GAME_DATA.constants.ROOMS_PER_FLOOR) {
      setCurrentFloor(prev => prev + 1);
      setCurrentRoom(1);
    }
    
    setGameState('dungeon');
    setEnemy(null);
    setCardsDrawnThisTurn(0);
    setInitiativeRolled(false);
    setTurnOrder([]);
    
    const reward = CombatSystem.processEnemyReward(enemy.reward);
    if (reward.type === 'cards') {
      setTimeout(() => drawCards(reward.amount), 500);
    } else if (reward.type === 'healing') {
      setParty(prev => prev.map(char => 
        char ? CharacterCreator.healCharacter(char, reward.amount) : null
      ));
    }
  }, 1000);
} else {
  setTimeout(() => {
    nextTurn();
  }, 1000);
}
```

};

const playCard = (card, character) => {
if (!card || !character || character.type === ‘enemy’) return;

```
const actualChar = character.character || character;
const effect = CombatSystem.calculateCardEffect(card, actualChar);
let logEntry = `${actualChar.race} ${actualChar.role} plays ${card.value}${card.suit}`;

if (effect.damage > 0) {
  const actualDamage = CombatSystem.calculateActualDamage(effect.damage, enemy.defense);
  setEnemy(prev => ({ ...prev, currentHealth: prev.currentHealth - actualDamage }));
  logEntry += ` - Deals ${actualDamage} damage!`;
}

if (effect.healing > 0) {
  setParty(prev => prev.map(char => 
    char ? CharacterCreator.healCharacter(char, effect.healing) : char
  ));
  logEntry += ` - Heals ${effect.healing} HP!`;
}

if (effect.special) {
  logEntry += ` ${effect.special}`;
}

setCombatLog(prev => [...prev, logEntry]);
setHand(prev => prev.filter(c => c.id !== card.id));
setSelectedCard(null);
setSelectedCharacter(null);

checkCombatEnd(effect.damage > 0 ? CombatSystem.calculateActualDamage(effect.damage, enemy.defense) : 0);
```

};

// ================== RENDER COMPONENTS ==================
const renderSetup = () => (
<div className="p-6 max-w-4xl mx-auto">
<h1 className="text-3xl font-bold mb-6 text-center">Dungeon Crawler: Card Quest</h1>

```
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-4">Build Your Party ({GAME_DATA.constants.PARTY_SIZE} slots)</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {party.map((character, index) => (
        <div key={index} className="border-2 border-dashed border-gray-300 p-4 rounded-lg min-h-32">
          {character ? (
            <div className="text-center">
              <div className="font-bold">{character.race}</div>
              <div className="text-sm text-gray-600">{character.role}</div>
              <div className="text-xs mt-2">HP: {character.health}</div>
              <div className="flex gap-1 mt-2">
                <button 
                  onClick={() => generateRandomCharacter(index)}
                  className="text-blue-500 text-xs hover:underline"
                >
                  Randomize
                </button>
                <span className="text-gray-300">|</span>
                <button 
                  onClick={() => {
                    const newParty = [...party];
                    newParty[index] = null;
                    setParty(newParty);
                  }}
                  className="text-red-500 text-xs hover
```