document.addEventListener('DOMContentLoaded', () => {
    // --- 基础权限逻辑 ---
    const loginBtn = document.getElementById('login-btn');
    const guestBtn = document.getElementById('guest-btn');
    const analyzeBtn = document.getElementById('analyze-btn');

    loginBtn.addEventListener('click', () => {
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;
        const tempPass = sessionStorage.getItem('temp_pass');

        if ((u === '老王' && p === '123456') || (tempPass && p === tempPass)) {
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('main-container').classList.remove('hidden');
            document.getElementById('welcome-msg').textContent = `你好，${u}。天机已为你开启。`;
        } else {
            alert('验证失败！');
        }
    });

    guestBtn.addEventListener('click', () => {
        const code = 'GUEST_' + Math.floor(Math.random() * 9000 + 1000);
        sessionStorage.setItem('temp_pass', code);
        document.getElementById('guest-msg').textContent = '临时密码：' + code + '（请填入密码框，刷新失效）';
    });

    // --- 核心计算逻辑 ---
    analyzeBtn.addEventListener('click', () => {
        const timeInput = document.getElementById('birth-time').value;
        if (!timeInput) return alert('请先输入出生时辰');

        document.getElementById('loading').classList.remove('hidden');
        
        setTimeout(() => {
            renderAnalysis();
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('results-area').classList.remove('hidden');
        }, 1000);
    });

    function renderAnalysis() {
        const date = new Date(document.getElementById('birth-time').value);
        const gender = parseInt(document.querySelector('input[name="gender"]:checked').value);
        
        // 1. 调用开源库排盘
        const solar = Solar.fromDate(date);
        const lunar = solar.getLunar();
        const eightChar = lunar.getEightChar();
        const dayun = eightChar.getYun(gender);
        
        // 2. 基础八字显示
        let html = `
            <div class="bazi-card">
                <h3 style="color:#d4af37; margin-bottom:15px;">【${gender === 1 ? '乾造' : '坤造'}命盘】</h3>
                <div class="bazi-table" style="display:flex; justify-content:space-around; font-size:1.2rem;">
                    <div><p>年</p><b>${eightChar.getYear()}</b></div>
                    <div><p>月</p><b>${eightChar.getMonth()}</b></div>
                    <div><p>日</p><b>${eightChar.getDay()}</b></div>
                    <div><p>时</p><b>${eightChar.getHour()}</b></div>
                </div>
                <p style="margin-top:15px; color:#9a8c98;">五行喜用：${calculateXiyong(eightChar)}</p>
            </div>
            
            <div class="info-block" style="margin-top:20px; text-align:left; background:rgba(0,0,0,0.2); padding:15px; border-radius:8px;">
                <h4 style="color:#d4af37;">● 终身细断</h4>
                <p style="font-size:0.9rem; line-height:1.6;">${getDuanYu(eightChar)}</p>
                <h4 style="color:#d4af37; margin-top:10px;">● 神煞影响</h4>
                <p style="font-size:0.9rem;">${getShenSha(lunar)}</p>
            </div>
        `;

        // 3. 合婚逻辑 (如果开启)
        if (document.getElementById('enable-hehun').checked) {
            const partnerTime = document.getElementById('partner-birth-time').value;
            if (partnerTime) {
                const pDate = new Date(partnerTime);
                const pEightChar = Solar.fromDate(pDate).getLunar().getEightChar();
                html += `
                    <div class="info-block" style="margin-top:20px; border: 1px solid #c44536;">
                        <h4 style="color:#c44536;">❤ 合婚鉴评</h4>
                        <p>${compareBazi(eightChar, pEightChar)}</p>
                    </div>
                `;
            }
        }

        document.getElementById('tab-content').innerHTML = html;
    }

    // --- 辅助算法函数 ---
    function calculateXiyong(eb) {
        const gan = eb.getDayGan();
        const wuxingMap = {'甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水'};
        return `主格属${wuxingMap[gan]}，建议职业：${BAZI_DATABASE.WUXING_CAREERS[wuxingMap[gan]][0]}`;
    }

    function getDuanYu(eb) {
        return "此命生于深秋，日坐财官，中年后必有大发之机。为人仗义疏财，利在南方发展。流年若遇甲辰，需防口舌之争。";
    }

    function getShenSha(lunar) {
        const shas = ["天乙贵人：逢凶化吉，有贵人暗助", "文昌：才思敏捷，学业事业双馨"];
        return shas.join("<br>");
    }

    function compareBazi(b1, b2) {
        if (b1.getDayGan() === b2.getDayGan()) return "天干相同，性格相近，初期甜蜜但需防中后期争执。建议多向火属性方位寻找和谐。";
        return "五行互补，年柱相合，乃上等婚配之象。";
    }
});