// 八字核心算法库 - 简化版
class BaziCalculator {
    constructor() {
        // 天干地支基础数据
        this.gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        this.zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    }
    
    // 计算年柱
    calculateYearGanZhi(year) {
        // 简化算法：1900年为庚子年
        const baseYear = 1900;
        const baseIndex = 36; // 庚子在六十甲子中的索引
        
        let diff = year - baseYear;
        if (diff < 0) diff += 60;
        
        const index = (baseIndex + diff) % 60;
        return this.getGanZhiByIndex(index);
    }
    
    // 计算月柱
    calculateMonthGanZhi(year, month) {
        // 简化算法
        const monthZhiMap = [2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];
        const yearGanZhi = this.calculateYearGanZhi(year);
        const yearGanIndex = this.gan.indexOf(yearGanZhi.gan);
        
        const startGanMap = [2, 2, 4, 4, 6, 6, 8, 8, 0, 0];
        const startGanIndex = startGanMap[yearGanIndex % 10];
        
        const monthZhiIndex = monthZhiMap[month - 1];
        const monthGanIndex = (startGanIndex + month - 1) % 10;
        
        return {
            gan: this.gan[monthGanIndex],
            zhi: this.zhi[monthZhiIndex]
        };
    }
    
    // 计算日柱
    calculateDayGanZhi(year, month, day) {
        // 简化算法
        const baseDate = new Date(1900, 0, 1);
        const targetDate = new Date(year, month - 1, day);
        const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
        const index = diffDays % 60;
        
        return this.getGanZhiByIndex(index);
    }
    
    // 计算时柱
    calculateHourGanZhi(dayGan, hour) {
        const hourZhiMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        const dayGanIndex = this.gan.indexOf(dayGan);
        const startGanMap = [0, 0, 2, 2, 4, 4, 6, 6, 8, 8];
        const startGanIndex = startGanMap[dayGanIndex % 10];
        
        const hourZhiIndex = hourZhiMap[Math.floor(hour / 2) % 12];
        const hourGanIndex = (startGanIndex + Math.floor(hour / 2)) % 10;
        
        return {
            gan: this.gan[hourGanIndex],
            zhi: this.zhi[hourZhiIndex]
        };
    }
    
    // 根据索引获取干支
    getGanZhiByIndex(index) {
        if (index < 0 || index >= 60) {
            index = (index % 60 + 60) % 60;
        }
        
        const ganIndex = index % 10;
        const zhiIndex = index % 12;
        
        return {
            gan: this.gan[ganIndex],
            zhi: this.zhi[zhiIndex],
            index: index
        };
    }
    
    // 计算完整的八字
    calculateBazi(birthInfo) {
        const { year, month, day, hour } = birthInfo;
        
        const yearGanZhi = this.calculateYearGanZhi(year);
        const monthGanZhi = this.calculateMonthGanZhi(year, month);
        const dayGanZhi = this.calculateDayGanZhi(year, month, day);
        const hourGanZhi = this.calculateHourGanZhi(dayGanZhi.gan, hour);
        
        return {
            year: yearGanZhi,
            month: monthGanZhi,
            day: dayGanZhi,
            hour: hourGanZhi
        };
    }
}