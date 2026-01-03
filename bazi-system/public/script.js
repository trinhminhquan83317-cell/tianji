document.addEventListener('DOMContentLoaded', () => {
    // 初始化全局变量
    const loginContainer = document.getElementById('login-container');
    const mainContainer = document.getElementById('main-container');
    const resultsSection = document.getElementById('results-section');
    const loadingOverlay = document.getElementById('loading-overlay');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const guestBtn = document.getElementById('guest-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    const enableHehun = document.getElementById('enable-hehun');
    const partnerSection = document.getElementById('partner-section');
    const hehunTab = document.getElementById('hehun-tab');
    const tabs = document.querySelectorAll('.tab');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // 初始化解析器
    const baziInterpreter = new BaziInterpreter();
    const baziCalculator = new BaziCalculator();

    // --- 登录功能 ---
    loginBtn.addEventListener('click', handleLogin);
    guestBtn.addEventListener('click', handleGuestLogin);
    logoutBtn.addEventListener('click', handleLogout);

    // 登录处理
    function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const tempPass = sessionStorage.getItem('temp_pass');

        // 验证逻辑
        if ((username === '老王' && password === '123456') || 
            (tempPass && password === tempPass)) {
            
            // 显示主界面
            loginContainer.classList.add('hidden');
            mainContainer.classList.remove('hidden');
            
            // 显示欢迎信息
            const welcomeMsg = document.getElementById('welcome-msg');
            welcomeMsg.innerHTML = `欢迎，${username} <br><small>天机已为您开启</small>`;
            
            // 自动填充当前日期作为默认
            const now = new Date();
            const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
            document.getElementById('birth-time').value = localDateTime;
            
            // 自动模拟一次计算以显示示例
            setTimeout(() => simulateExample(), 500);
            
        } else {
            alert('验证失败！请检查用户名和密码');
        }
    }

    // 游客登录
    function handleGuestLogin() {
        const guestCode = 'GUEST_' + Math.floor(Math.random() * 9000 + 1000);
        sessionStorage.setItem('temp_pass', guestCode);
        document.getElementById('guest-msg').innerHTML = 
            `临时密码：<strong>${guestCode}</strong><br><small>请在密码框输入此密码</small>`;
    }

    // 退出登录
    function handleLogout() {
        // 清除临时密码
        sessionStorage.removeItem('temp_pass');
        
        // 重置表单
        usernameInput.value = '老王';
        passwordInput.value = '123456';
        document.getElementById('guest-msg').textContent = '';
        
        // 切换界面
        mainContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
        resultsSection.classList.add('hidden');
    }

    // --- 八字计算功能 ---
    analyzeBtn.addEventListener('click', analyzeBazi);
    enableHehun.addEventListener('change', toggleHehunMode);

    // 切换合婚模式
    function toggleHehunMode() {
        if (enableHehun.checked) {
            partnerSection.classList.remove('hidden');
            hehunTab.classList.remove('hidden');
        } else {
            partnerSection.classList.add('hidden');
            hehunTab.classList.add('hidden');
            // 如果当前显示合婚标签，切换到命盘解析
            if (hehunTab.classList.contains('active')) {
                switchTab('mingpan');
            }
        }
    }

    // 标签切换
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    function switchTab(tabName) {
        // 更新标签状态
        tabs.forEach(t => t.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        
        // 激活当前标签
        const activeTab = document.querySelector(`.tab[data-tab="${tabName}"]`);
        const activePane = document.getElementById(`${tabName}-content`);
        
        if (activeTab) activeTab.classList.add('active');
        if (activePane) activePane.classList.add('active');
    }

    // 主要分析函数
    async function analyzeBazi() {
        const birthTime = document.getElementById('birth-time').value;
        if (!birthTime) {
            alert('请先输入出生时辰');
            return;
        }

        // 验证合婚输入
        if (enableHehun.checked) {
            const partnerTime = document.getElementById('partner-birth-time').value;
            if (!partnerTime) {
                alert('请先输入对方的出生时辰');
                return;
            }
        }

        // 显示加载动画
        loadingOverlay.classList.remove('hidden');

        try {
            // 延迟以显示加载效果
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 获取主命盘信息
            const birthDate = new Date(birthTime);
            const gender = parseInt(document.querySelector('input[name="gender"]:checked').value);
            
            // 使用lunar库计算八字
            const solar = Solar.fromDate(birthDate);
            const lunar = solar.getLunar();
            const eightChar = lunar.getEightChar();
            
            // 计算大运
            const dayun = eightChar.getYun(gender);
            
            // 渲染结果
            renderMingpan(eightChar, lunar, gender);
            renderDayun(dayun, eightChar, gender);
            renderLiuyue(eightChar);
            
            // 如果开启合婚，渲染合婚结果
            if (enableHehun.checked) {
                const partnerTime = document.getElementById('partner-birth-time').value;
                const partnerGender = parseInt(document.querySelector('input[name="partner-gender"]:checked').value);
                const partnerDate = new Date(partnerTime);
                const partnerSolar = Solar.fromDate(partnerDate);
                const partnerEightChar = partnerSolar.getLunar().getEightChar();
                
                renderHehun(eightChar, partnerEightChar, gender, partnerGender);
            }
            
            // 显示结果区域
            resultsSection.classList.remove('hidden');
            
        } catch (error) {
            console.error('八字计算错误:', error);
            alert('计算失败，请检查输入数据');
        } finally {
            // 隐藏加载动画
            loadingOverlay.classList.add('hidden');
        }
    }

    // 渲染命盘解析
    function renderMingpan(eightChar, lunar, gender) {
        const mingpanContent = document.getElementById('mingpan-content');
        const dayGan = eightChar.getDayGan();
        const dayZhi = eightChar.getDayZhi();
        const rizhu = dayGan + dayZhi;
        
        // 获取五行属性
        const wuxingMap = {
            '甲':'木', '乙':'木', '丙':'火', '丁':'火', '戊':'土',
            '己':'土', '庚':'金', '辛':'金', '壬':'水', '癸':'水'
        };
        
        const mainWuxing = wuxingMap[dayGan];
        
        // 构建HTML
        let html = `
            <div class="bazi-card">
                <div class="block-title">
                    <span>${gender === 1 ? '乾造' : '坤造'}命盘</span>
                    <small>${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}日</small>
                </div>
                
                <div class="bazi-grid">
                    <div class="bazi-column">
                        <div class="bazi-title">年柱</div>
                        <div class="bazi-content">${eightChar.getYear()}</div>
                    </div>
                    <div class="bazi-column">
                        <div class="bazi-title">月柱</div>
                        <div class="bazi-content">${eightChar.getMonth()}</div>
                    </div>
                    <div class="bazi-column">
                        <div class="bazi-title">日柱</div>
                        <div class="bazi-content">${eightChar.getDay()}</div>
                    </div>
                    <div class="bazi-column">
                        <div class="bazi-title">时柱</div>
                        <div class="bazi-content">${eightChar.getHour()}</div>
                    </div>
                </div>
                
                <div class="info-block">
                    <div class="block-title">日柱解析</div>
                    <div class="block-content">${baziInterpreter.interpretRizhu(rizhu)}</div>
                </div>
            </div>
            
            <div class="info-block">
                <div class="block-title">五行分析</div>
                <div class="block-content">
                    <p>命主属<strong>${mainWuxing}</strong>性，以<strong>${getXiyong(mainWuxing)}</strong>为喜用神。</p>
                    <p><strong>适合职业：</strong><br>
                        ${baziInterpreter.getCareerSuggestions(mainWuxing).map(job => 
                            `<span class="wuxing-tag wuxing-${getWuxingClass(mainWuxing)}">${job}</span>`
                        ).join('')}
                    </p>
                    <p><strong>吉利颜色：</strong><br>
                        ${baziInterpreter.getColorSuggestions(mainWuxing).map(color => 
                            `<span class="wuxing-tag wuxing-${getWuxingClass(mainWuxing)}">${color}</span>`
                        ).join('')}
                    </p>
                    <p><strong>健康注意：</strong>${getHealthAdvice(mainWuxing)}</p>
                </div>
            </div>
            
            <div class="info-block">
                <div class="block-title">终身细断</div>
                <div class="block-content">${getDetailedFortune(rizhu, gender)}</div>
            </div>
            
            <div class="info-block">
                <div class="block-title">神煞影响</div>
                <div class="block-content">${getShenshaDetails(lunar)}</div>
            </div>
        `;
        
        mingpanContent.innerHTML = html;
    }

    // 渲染大运流年
    function renderDayun(dayun, eightChar, gender) {
        const dayunContent = document.getElementById('dayun-content');
        
        // 计算十年大运
        const startAge = dayun.getStartYear();
        const startYear = new Date().getFullYear() - startAge;
        const ganZhiList = [];
        
        for (let i = 0; i < 8; i++) {
            const yun = dayun.getYun(i);
            ganZhiList.push({
                age: startAge + i * 10,
                year: startYear + i * 10,
                ganzhi: yun
            });
        }
        
        let html = `
            <div class="info-block">
                <div class="block-title">十年大运</div>
                <div class="block-content">
                    <p>起运时间：${dayun.getStartYear()}岁</p>
                    <p>起运方位：${getDirection(eightChar)}</p>
                </div>
            </div>
        `;
        
        // 显示大运详情
        ganZhiList.forEach((yun, index) => {
            html += `
                <div class="info-block">
                    <div class="block-title">${yun.age}-${yun.age + 9}岁 (${yun.year}年)</div>
                    <div class="block-content">
                        <p><strong>大运：</strong>${yun.ganzhi}</p>
                        <p><strong>断语：</strong>${getDayunFortune(yun.ganzhi, index, gender)}</p>
                        <p><strong>建议：</strong>${getDayunAdvice(yun.ganzhi)}</p>
                    </div>
                </div>
            `;
        });
        
        dayunContent.innerHTML = html;
    }

    // 渲染流月详情
    function renderLiuyue(eightChar) {
        const liuyueContent = document.getElementById('liuyue-content');
        const currentYear = new Date().getFullYear();
        
        let html = `
            <div class="info-block">
                <div class="block-title">${currentYear}年流月分析</div>
                <div class="block-content">
                    <p>本年太岁：${getCurrentYearGanzhi(currentYear)}</p>
        `;
        
        // 显示12个月份
        for (let month = 1; month <= 12; month++) {
            html += `
                <div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 4px;">
                    <strong>${month}月：</strong>${getMonthlyFortune(eightChar, currentYear, month)}
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
            
            <div class="info-block">
                <div class="block-title">注意事项</div>
                <div class="block-content">
                    ${getYearlyWarnings(eightChar, currentYear)}
                </div>
            </div>
        `;
        
        liuyueContent.innerHTML = html;
    }

    // 渲染合婚鉴评
    function renderHehun(bazi1, bazi2, gender1, gender2) {
        const hehunContent = document.getElementById('hehun-content');
        
        let html = `
            <div class="info-block">
                <div class="block-title">双人命盘对比</div>
                <div class="block-content">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <h4>${gender1 === 1 ? '男' : '女'}命</h4>
                            <p>年柱：${bazi1.getYear()}</p>
                            <p>月柱：${bazi1.getMonth()}</p>
                            <p>日柱：${bazi1.getDay()}</p>
                            <p>时柱：${bazi1.getHour()}</p>
                        </div>
                        <div>
                            <h4>${gender2 === 1 ? '男' : '女'}命</h4>
                            <p>年柱：${bazi2.getYear()}</p>
                            <p>月柱：${bazi2.getMonth()}</p>
                            <p>日柱：${bazi2.getDay()}</p>
                            <p>时柱：${bazi2.getHour()}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="info-block">
                <div class="block-title">合婚鉴评</div>
                <div class="block-content">
                    ${getHehunAnalysis(bazi1, bazi2, gender1, gender2)}
                </div>
            </div>
            
            <div class="info-block">
                <div class="block-title">建议</div>
                <div class="block-content">
                    ${getHehunAdvice(bazi1, bazi2)}
                </div>
            </div>
        `;
        
        hehunContent.innerHTML = html;
    }

    // --- 辅助函数 ---
    
    function getWuxingClass(wuxing) {
        const map = { '木': 'mu', '火': 'huo', '土': 'tu', '金': 'jin', '水': 'shui' };
        return map[wuxing] || 'tu';
    }
    
    function getXiyong(wuxing) {
        const map = { '木': '金土', '火': '水金', '土': '木金', '金': '火木', '水': '土火' };
        return map[wuxing] || '金水';
    }
    
    function getHealthAdvice(wuxing) {
        const map = {
            '木': '注意肝胆系统，避免熬夜伤肝',
            '火': '注意心脏和血液循环，避免过度劳累',
            '土': '注意脾胃消化系统，饮食要规律',
            '金': '注意呼吸系统和皮肤健康',
            '水': '注意肾脏和泌尿系统，避免受凉'
        };
        return map[wuxing] || '保持作息规律，定期体检';
    }
    
    function getDetailedFortune(rizhu, gender) {
        // 这里应该调用详细的断语库
        return `此命${gender === 1 ? '男' : '女'}，生于${rizhu}日，主一生贵人相助，中年得运，晚年享福。事业上宜往${gender === 1 ? '东南' : '西南'}方向发展，婚配宜找${gender === 1 ? '属鼠、龙、猴' : '属蛇、鸡、牛'}之人。`;
    }
    
    function getShenshaDetails(lunar) {
        try {
            const shensha = lunar.getOtherShenSha().split(' ');
            return shensha.map(ss => {
                const meanings = {
                    '天乙贵人': '逢凶化吉，有贵人相助',
                    '文昌贵人': '才思敏捷，学业有成',
                    '太极贵人': '悟性高，有宗教信仰缘',
                    '桃花': '人缘好，异性缘佳',
                    '将星': '领导能力强，适合管理职位'
                };
                return `${ss}：${meanings[ss] || '吉凶参半'}`;
            }).join('<br>');
        } catch {
            return '天乙贵人、文昌贵人：主贵人相助，学业事业顺利';
        }
    }
    
    function getDirection(eightChar) {
        const yearGan = eightChar.getYear().charAt(0);
        const directions = {
            '甲': '东方', '乙': '东方', '丙': '南方', '丁': '南方',
            '戊': '中央', '己': '中央', '庚': '西方', '辛': '西方',
            '壬': '北方', '癸': '北方'
        };
        return directions[yearGan] || '南方';
    }
    
    function getDayunFortune(ganzhi, index, gender) {
        const fortunes = [
            '少年得志，学业顺利，奠定基础',
            '青年奋发，事业起步，贵人相助',
            '中年发达，财运亨通，名利双收',
            '中年稳健，家庭和睦，事业有成',
            '中年辉煌，权力增长，地位提升',
            '中年转机，把握机遇，更上一层',
            '晚年安逸，享受成果，福禄双全',
            '晚年安康，子孙孝顺，寿终正寝'
        ];
        return fortunes[index] || '运势平稳，吉凶参半';
    }
    
    function getDayunAdvice(ganzhi) {
        return `在此大运期间，建议投资保守，多行善事，广结善缘。`;
    }
    
    function getCurrentYearGanzhi(year) {
        const gan = ['庚','辛','壬','癸','甲','乙','丙','丁','戊','己'];
        const zhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
        const startYear = 1900; // 庚子年
        const diff = year - startYear;
        const ganIndex = (diff + 6) % 10;
        const zhiIndex = (diff + 4) % 12;
        return gan[ganIndex] + zhi[zhiIndex];
    }
    
    function getMonthlyFortune(eightChar, year, month) {
        const monthNames = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
        const fortunes = [
            '万事开头难，需稳扎稳打',
            '贵人出现，宜多社交',
            '财运初现，投资需谨慎',
            '情绪波动，注意人际关系',
            '事业进展，把握机会',
            '桃花运旺，感情升温',
            '财运亨通，适宜投资',
            '工作繁忙，注意健康',
            '贵人相助，事业发展',
            '财运稳定，储蓄为佳',
            '感情稳定，考虑长远',
            '年终总结，规划来年'
        ];
        return `${monthNames[month-1]}月：${fortunes[month-1] || '平稳过渡'}`;
    }
    
    function getYearlyWarnings(eightChar, year) {
        return `
            <ul style="padding-left: 20px;">
                <li>春季注意交通安全</li>
                <li>夏季避免与人口舌</li>
                <li>秋季谨慎投资理财</li>
                <li>冬季注意身体健康</li>
                <li>全年贵人方：东方、南方</li>
            </ul>
        `;
    }
    
    function getHehunAnalysis(bazi1, bazi2, gender1, gender2) {
        const dayGan1 = bazi1.getDayGan();
        const dayGan2 = bazi2.getDayGan();
        
        if (dayGan1 === dayGan2) {
            return '天干相同，性格相似，初识投缘，但需注意长期相处中的包容与理解。';
        }
        
        // 简单五行相生判断
        const wuxing1 = getWuxingFromGan(dayGan1);
        const wuxing2 = getWuxingFromGan(dayGan2);
        const shengke = getShengKe(wuxing1, wuxing2);
        
        if (shengke === '相生') {
            return '五行相生，命理互补，属于上等婚配，主婚姻和谐，家运昌隆。';
        } else if (shengke === '相克') {
            return '五行相克，性格差异较大，需要更多磨合与理解，属于中等婚配。';
        } else {
            return '五行平和，性格互补，属于良好婚配，主家宅平安，儿女双全。';
        }
    }
    
    function getHehunAdvice(bazi1, bazi2) {
        return `
            <ul style="padding-left: 20px;">
                <li>建议选择春季或秋季举办婚礼</li>
                <li>新房宜坐北朝南或坐西朝东</li>
                <li>家居装饰以黄色、金色为主</li>
                <li>婚后第一年宜多出行增进感情</li>
                <li>三年内不宜进行大规模投资</li>
            </ul>
        `;
    }
    
    function getWuxingFromGan(gan) {
        const map = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };
        return map[gan] || '土';
    }
    
    function getShengKe(wuxing1, wuxing2) {
        const sheng = { '木':'火','火':'土','土':'金','金':'水','水':'木' };
        const ke = { '木':'土','火':'金','土':'水','金':'木','水':'火' };
        
        if (sheng[wuxing1] === wuxing2) return '相生';
        if (ke[wuxing1] === wuxing2) return '相克';
        return '平和';
    }

    // 模拟示例显示
    function simulateExample() {
        // 自动填充示例数据
        const exampleDate = new Date(1990, 5, 15, 14, 30);
        const localDateTime = new Date(exampleDate.getTime() - exampleDate.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        document.getElementById('birth-time').value = localDateTime;
        
        // 更新合婚时间
        const partnerDate = new Date(1992, 8, 20, 10, 0);
        const partnerDateTime = new Date(partnerDate.getTime() - partnerDate.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        document.getElementById('partner-birth-time').value = partnerDateTime;
        document.querySelector('input[name="partner-gender"][value="0"]').checked = true;
    }

    // 初始化事件监听
    function initEventListeners() {
        // 按Enter键登录
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }

    // 初始化
    initEventListeners();
});