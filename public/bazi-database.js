// 八字数据库 - 简化版
const BAZI_DATABASE = {
    // 日柱特征
    RIZHU_FEATURES: {
        '甲子': '聪明秀气，学业有成',
        '乙丑': '勤俭持家，精打细算',
        '丙寅': '热情开朗，富有朝气',
        '丁卯': '文静秀气，心思细腻',
        '戊辰': '稳重踏实，诚信可靠',
        '己巳': '聪明机智，学习能力强',
        '庚午': '刚毅果断，事业心强',
        '辛未': '外柔内刚，心思缜密',
        '壬申': '足智多谋，适应力强',
        '癸酉': '聪明伶俐，敏感多思'
    },
    
    // 五行职业推荐
    WUXING_CAREERS: {
        '木': ['教育', '设计', '医疗', '文化'],
        '火': ['销售', '互联网', '广告', '能源'],
        '土': ['房地产', '建筑', '金融', '农业'],
        '金': ['机械', '法律', '金融', '军警'],
        '水': ['贸易', '旅游', '物流', '咨询']
    },
    
    // 五行颜色
    WUXING_COLORS: {
        '木': ['绿色', '青色'],
        '火': ['红色', '紫色'],
        '土': ['黄色', '棕色'],
        '金': ['白色', '金色'],
        '水': ['黑色', '蓝色']
    }
};

class BaziInterpreter {
    constructor() {}
    
    // 解析日柱特征
    interpretRizhu(rizhuGanZhi) {
        return BAZI_DATABASE.RIZHU_FEATURES[rizhuGanZhi] || '日柱信息待分析';
    }
    
    // 获取职业建议
    getCareerSuggestions(wuxing) {
        return BAZI_DATABASE.WUXING_CAREERS[wuxing] || ['多种职业均可尝试'];
    }
    
    // 获取颜色建议
    getColorSuggestions(wuxing) {
        return BAZI_DATABASE.WUXING_COLORS[wuxing] || ['多种颜色均可'];
    }
}