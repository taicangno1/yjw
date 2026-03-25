export interface PlayerData {
    uid: string;
    nickname: string;
    level: number;
    gold: number;
    yuanbao: number;
    energy: number;
    maxEnergy: number;
    lastEnergyTime: number;
    lastOfflineTime: number;
    heroes: HeroData[];
    formation: string[];
    equipments: EquipmentData[];
    heroFragments: { [heroId: string]: number };
    items: { [itemId: string]: number };
    currentChapter: number;
    currentLevel: number;
    unlockedLevels: string[];
    friends: string[];
    friendRequests: string[];
    leagueId: string;
    leagueContribution: number;
}

export interface HeroData {
    id: string;
    level: number;
    exp: number;
    star: number;
    attack: number;
    defense: number;
    hp: number;
    speed: number;
    critRate: number;
    dodgeRate: number;
    comboRate: number;
    equipment: string[];
    isLocked: boolean;
}

export interface EquipmentData {
    id: string;
    heroId: string;
    type: EquipmentType;
    quality: Quality;
    attackBonus: number;
    hpBonus: number;
    defenseBonus: number;
}

export enum EquipmentType {
    WEAPON = 'weapon',
    ARMOR = 'armor',
    HELMET = 'helmet',
    ACCESSORY = 'accessory'
}

export enum Quality {
    GREEN = 'green',
    BLUE = 'blue',
    PURPLE = 'purple',
    ORANGE = 'orange',
    RED = 'red'
}

export enum TroopType {
    INFANTRY = 'infantry',
    CAVALRY = 'cavalry',
    ARCHER = 'archer'
}
