class Skill {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.coefficient = data.coefficient || 1.0;
        this.targetType = data.targetType || 'single';
        this.cooldown = data.cooldown || 0;
        this.currentCooldown = 0;
        this.description = data.description || '';
        this.effect = data.effect || null;
        this.buffValue = data.buffValue || 0;
        this.buffDuration = data.buffDuration || 0;
    }

    canUse() {
        return this.currentCooldown === 0;
    }

    use() {
        if (!this.canUse()) return false;
        this.currentCooldown = this.cooldown;
        return true;
    }

    reduceCooldown() {
        if (this.currentCooldown > 0) {
            this.currentCooldown--;
        }
    }

    resetCooldown() {
        this.currentCooldown = 0;
    }
}

const DEFAULT_SKILLS = [
    new Skill({
        id: 'skill_001',
        name: '普通攻击',
        type: 'normal',
        coefficient: 1.0,
        targetType: 'single',
        description: '普通攻击，造成100%攻击力伤害'
    }),
    new Skill({
        id: 'skill_002',
        name: '青龙偃月',
        type: 'active',
        coefficient: 1.8,
        targetType: 'single',
        cooldown: 3,
        description: '对敌人造成180%攻击力伤害'
    }),
    new Skill({
        id: 'skill_003',
        name: '燕人咆哮',
        type: 'active',
        coefficient: 1.5,
        targetType: 'all',
        cooldown: 4,
        description: '对所有敌人造成150%攻击力伤害'
    }),
    new Skill({
        id: 'skill_004',
        name: '仁德',
        type: 'passive',
        effect: 'heal',
        buffValue: 0.1,
        description: '每回合回复10%最大生命值'
    }),
    new Skill({
        id: 'skill_005',
        name: '以德服人',
        type: 'active',
        coefficient: 0,
        targetType: 'single',
        effect: 'buff_attack',
        buffValue: 0.3,
        buffDuration: 2,
        cooldown: 5,
        description: '提升单个友方30%攻击力，持续2回合'
    }),
    new Skill({
        id: 'skill_006',
        name: '领导力',
        type: 'passive',
        effect: 'buff_all_attack',
        buffValue: 0.15,
        description: '所有友方攻击力提升15%'
    }),
    new Skill({
        id: 'skill_007',
        name: '玄武之阵',
        type: 'active',
        coefficient: 0,
        targetType: 'all',
        effect: 'buff_defense',
        buffValue: 0.2,
        buffDuration: 2,
        cooldown: 4,
        description: '所有友方防御力提升20%，持续2回合'
    }),
    new Skill({
        id: 'skill_008',
        name: '七探蛇盘',
        type: 'active',
        coefficient: 2.0,
        targetType: 'single',
        cooldown: 5,
        description: '对敌人造成200%攻击力伤害'
    }),
    new Skill({
        id: 'skill_009',
        name: '护主',
        type: 'passive',
        effect: 'counter',
        buffValue: 0.2,
        description: '受到攻击时20%概率反击'
    }),
    new Skill({
        id: 'skill_010',
        name: '百步穿杨',
        type: 'active',
        coefficient: 1.6,
        targetType: 'single',
        cooldown: 3,
        description: '对敌人造成160%攻击力伤害'
    })
];

function getSkillById(skillId) {
    return DEFAULT_SKILLS.find(s => s.id === skillId);
}

function getHeroSkills(heroId) {
    const heroSkillsMap = {
        'hero_001': ['skill_001', 'skill_002'],
        'hero_002': ['skill_001', 'skill_003'],
        'hero_003': ['skill_004', 'skill_005'],
        'hero_004': ['skill_006', 'skill_007'],
        'hero_005': ['skill_008', 'skill_009']
    };
    const skillIds = heroSkillsMap[heroId] || ['skill_001'];
    return skillIds.map(id => getSkillById(id)).filter(s => s !== undefined);
}

class Buff {
    constructor(type, value, duration) {
        this.type = type;
        this.value = value;
        this.duration = duration;
        this.currentDuration = duration;
    }

    isExpired() {
        return this.currentDuration <= 0;
    }

    tick() {
        this.currentDuration--;
    }
}
