const EquipmentType = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    HELMET: 'helmet',
    ACCESSORY: 'accessory'
};

const Quality = {
    GREEN: 'green',
    BLUE: 'blue',
    PURPLE: 'purple',
    ORANGE: 'orange',
    RED: 'red'
};

const EQUIPMENT_ICONS = {
    weapon: 'weapon_icon',
    armor: 'armor_icon',
    helmet: 'helmet_icon',
    accessory: 'accessory_icon'
};

class Equipment {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.quality = data.quality;
        this.attackBonus = data.attackBonus || 0;
        this.defenseBonus = data.defenseBonus || 0;
        this.hpBonus = data.hpBonus || 0;
        this.skillId = data.skillId || null;
        this.level = data.level || 1;
        this.ownerHeroId = data.ownerHeroId || null;
    }

    getTotalAttackBonus() {
        return this.attackBonus * this.level;
    }

    getTotalDefenseBonus() {
        return this.defenseBonus * this.level;
    }

    getTotalHpBonus() {
        return this.hpBonus * this.level;
    }

    strengthen() {
        this.level++;
    }

    getStrengthenCost() {
        return Math.floor(50 * Math.pow(1.5, this.level - 1));
    }

    getMaxLevel() {
        const maxLevels = {
            green: 10,
            blue: 15,
            purple: 20,
            orange: 25,
            red: 30
        };
        return maxLevels[this.quality] || 10;
    }

    canStrengthen() {
        return this.level < this.getMaxLevel();
    }

    getQualityColor() {
        const colors = {
            green: 0x00ff00,
            blue: 0x00bfff,
            purple: 0x9400d3,
            orange: 0xff8c00,
            red: 0xff0000
        };
        return colors[this.quality] || 0x00ff00;
    }

    static getTypeName(type) {
        const names = {
            weapon: '武器',
            armor: '防具',
            helmet: '头盔',
            accessory: '饰品'
        };
        return names[type] || type;
    }
}

const DEFAULT_EQUIPMENTS = [
    { id: 'equip_001', name: '新手长剑', type: EquipmentType.WEAPON, quality: Quality.GREEN, attackBonus: 10, hpBonus: 0, defenseBonus: 0 },
    { id: 'equip_002', name: '布衣', type: EquipmentType.ARMOR, quality: Quality.GREEN, attackBonus: 0, hpBonus: 50, defenseBonus: 5 },
    { id: 'equip_003', name: '皮帽', type: EquipmentType.HELMET, quality: Quality.GREEN, attackBonus: 0, hpBonus: 30, defenseBonus: 3 },
    { id: 'equip_004', name: '护腕', type: EquipmentType.ACCESSORY, quality: Quality.GREEN, attackBonus: 5, hpBonus: 20, defenseBonus: 2 },
    
    { id: 'equip_005', name: '精铁剑', type: EquipmentType.WEAPON, quality: Quality.BLUE, attackBonus: 25, hpBonus: 0, defenseBonus: 0 },
    { id: 'equip_006', name: '铁甲', type: EquipmentType.ARMOR, quality: Quality.BLUE, attackBonus: 0, hpBonus: 150, defenseBonus: 15 },
    { id: 'equip_007', name: '铁盔', type: EquipmentType.HELMET, quality: Quality.BLUE, attackBonus: 0, hpBonus: 80, defenseBonus: 8 },
    { id: 'equip_008', name: '精钢护符', type: EquipmentType.ACCESSORY, quality: Quality.BLUE, attackBonus: 12, hpBonus: 50, defenseBonus: 5 },
    
    { id: 'equip_009', name: '偃月刀', type: EquipmentType.WEAPON, quality: Quality.PURPLE, attackBonus: 50, hpBonus: 0, defenseBonus: 0 },
    { id: 'equip_010', name: '连环甲', type: EquipmentType.ARMOR, quality: Quality.PURPLE, attackBonus: 0, hpBonus: 300, defenseBonus: 30 },
    { id: 'equip_011', name: '亮银盔', type: EquipmentType.HELMET, quality: Quality.PURPLE, attackBonus: 0, hpBonus: 150, defenseBonus: 15 },
    { id: 'equip_012', name: '玄武玉佩', type: EquipmentType.ACCESSORY, quality: Quality.PURPLE, attackBonus: 25, hpBonus: 100, defenseBonus: 10 },
    
    { id: 'equip_013', name: '青龙偃月刀', type: EquipmentType.WEAPON, quality: Quality.ORANGE, attackBonus: 80, hpBonus: 50, defenseBonus: 0 },
    { id: 'equip_014', name: '白银狮子甲', type: EquipmentType.ARMOR, quality: Quality.ORANGE, attackBonus: 0, hpBonus: 500, defenseBonus: 50 },
    { id: 'equip_015', name: '赤金冠', type: EquipmentType.HELMET, quality: Quality.ORANGE, attackBonus: 0, hpBonus: 250, defenseBonus: 25 },
    { id: 'equip_016', name: '白虎圣符', type: EquipmentType.ACCESSORY, quality: Quality.ORANGE, attackBonus: 40, hpBonus: 150, defenseBonus: 15 }
];

function createEquipment(config) {
    return new Equipment(config);
}

function generateRandomEquipment(quality = Quality.GREEN) {
    const qualityOrder = [Quality.GREEN, Quality.BLUE, Quality.PURPLE, Quality.ORANGE, Quality.RED];
    const qualityIndex = qualityOrder.indexOf(quality);
    const minQualityIndex = Math.max(0, qualityIndex - 1);
    const maxQualityIndex = Math.min(qualityOrder.length - 1, qualityIndex + 1);
    const randomQualityIndex = minQualityIndex + Math.floor(Math.random() * (maxQualityIndex - minQualityIndex + 1));
    const randomQuality = qualityOrder[randomQualityIndex];
    
    const equipmentType = Object.values(EquipmentType)[Math.floor(Math.random() * Object.values(EquipmentType).length)];
    const equipmentPool = DEFAULT_EQUIPMENTS.filter(e => e.quality === randomQuality && e.type === equipmentType);
    
    if (equipmentPool.length === 0) {
        return null;
    }
    
    const config = equipmentPool[Math.floor(Math.random() * equipmentPool.length)];
    return createEquipment({ ...config, id: config.id + '_' + Date.now() });
}
