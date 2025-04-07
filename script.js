// 全局变量
let commandHistory = [];
let customTemplates = [];
let currentLanguage = 'zh-CN';
let isDarkMode = false;

// 语言配置
const languages = {
    'zh-CN': {
        title: 'SQLMap命令生成器',
        description: '快速生成SQLMap命令，支持多种注入方式和高级选项',
        // ... 其他翻译
    },
    'en-US': {
        title: 'SQLMap Command Generator',
        description: 'Quickly generate SQLMap commands with multiple injection methods and advanced options',
        // ... 其他翻译
    }
};

// 预设模板
const presetTemplates = {
    'basic': {
        name: '基本扫描',
        description: '基本的SQL注入扫描配置',
        options: {
            'level': '--level 2',
            'risk': '--risk 1',
            'threads': '--threads 1',
            'batch': true,
            'random-agent': true
        }
    },
    'waf-bypass': {
        name: 'WAF绕过',
        description: '针对WAF的绕过配置',
        options: {
            'tamper': '--tamper=space2comment,between,charencode',
            'waf': true,
            'identify-waf': true,
            'random-agent': true,
            'delay': '--delay 2',
            'timeout': '--timeout 30'
        }
    },
    'shell': {
        name: '获取Shell',
        description: '尝试获取操作系统Shell的配置',
        options: {
            'os-shell': true,
            'os-pwn': true,
            'level': '--level 5',
            'risk': '--risk 3',
            'threads': '--threads 1'
        }
    },
    'dump': {
        name: '数据导出',
        description: '导出数据库数据的配置',
        options: {
            'dump': true,
            'dump-all': true,
            'batch': true,
            'threads': '--threads 4'
        }
    },
    'enum': {
        name: '信息枚举',
        description: '枚举数据库信息的配置',
        options: {
            'dbs': true,
            'tables': true,
            'columns': true,
            'batch': true,
            'threads': '--threads 2'
        }
    },
    'fast-scan': {
        name: '高速扫描',
        description: '快速扫描多个可能的注入点',
        options: {
            'level': '--level 1',
            'risk': '--risk 1',
            'threads': '--threads 10',
            'batch': true,
            'smart': true,
            'random-agent': true
        }
    },
    'time-based': {
        name: '时间盲注',
        description: '针对时间延迟盲注的专用配置',
        options: {
            'technique': '--technique=T',
            'time-sec': '--time-sec=2',
            'timeout': '--timeout 30',
            'level': '--level 3',
            'risk': '--risk 2'
        }
    },
    'boolean-based': {
        name: '布尔盲注',
        description: '针对布尔型盲注的专用配置',
        options: {
            'technique': '--technique=B',
            'level': '--level 3',
            'risk': '--risk 2'
        }
    },
    'error-based': {
        name: '报错注入',
        description: '利用数据库错误信息的注入配置',
        options: {
            'technique': '--technique=E',
            'level': '--level 3',
            'risk': '--risk 3'
        }
    },
    'union-based': {
        name: '联合查询',
        description: '针对联合查询注入的专用配置',
        options: {
            'technique': '--technique=U',
            'union-cols': '--union-cols=8-12',
            'level': '--level 3',
            'risk': '--risk 2'
        }
    },
    'mysql': {
        name: 'MySQL专用',
        description: '针对MySQL数据库的优化配置',
        options: {
            'dbms': '--dbms=mysql',
            'no-cast': true,
            'technique': '--technique=BEUSTQ',
            'level': '--level 3',
            'risk': '--risk 2'
        }
    },
    'mssql': {
        name: 'MSSQL专用',
        description: '针对Microsoft SQL Server的优化配置',
        options: {
            'dbms': '--dbms=mssql',
            'technique': '--technique=BEUSTQ',
            'level': '--level 3',
            'risk': '--risk 2'
        }
    },
    'oracle': {
        name: 'Oracle专用',
        description: '针对Oracle数据库的优化配置',
        options: {
            'dbms': '--dbms=oracle',
            'technique': '--technique=BEUSTQ',
            'level': '--level 3',
            'risk': '--risk 2'
        }
    },
    'postgresql': {
        name: 'PostgreSQL专用',
        description: '针对PostgreSQL数据库的优化配置',
        options: {
            'dbms': '--dbms=postgresql',
            'technique': '--technique=BEUSTQ',
            'level': '--level 3',
            'risk': '--risk 2'
        }
    },
    'cloudflare': {
        name: 'Cloudflare绕过',
        description: '针对Cloudflare WAF的绕过配置',
        options: {
            'tamper': '--tamper=cloudflare,space2comment,randomcase',
            'random-agent': true,
            'delay': '--delay 3',
            'timeout': '--timeout 35',
            'identify-waf': true,
            'waf': true
        }
    },
    'modsecurity': {
        name: 'ModSecurity绕过',
        description: '针对ModSecurity WAF的绕过配置',
        options: {
            'tamper': '--tamper=modsecurityversioned,space2comment,space2dash',
            'random-agent': true,
            'delay': '--delay 2',
            'identify-waf': true,
            'waf': true
        }
    },
    'mobile-app': {
        name: '移动应用',
        description: '针对移动应用API的测试配置',
        options: {
            'mobile': true,
            'random-agent': true,
            'level': '--level 3',
            'risk': '--risk 2',
            'technique': '--technique=BEUSTQ'
        }
    },
    'fingerprint': {
        name: '数据库指纹',
        description: '仅用于识别后端数据库类型',
        options: {
            'fingerprint': true,
            'batch': true,
            'random-agent': true,
            'level': '--level 1',
            'risk': '--risk 1'
        }
    },
    'safe-scan': {
        name: '安全扫描',
        description: '低风险、低侵入性的扫描配置',
        options: {
            'level': '--level 1',
            'risk': '--risk 1',
            'batch': true,
            'technique': '--technique=B',
            'threads': '--threads 1',
            'time-sec': '--time-sec=1',
            'text-only': true
        }
    }
};

// 参数依赖关系
const parameterDependencies = {
    'os-shell': ['level', 'risk'],
    'os-pwn': ['os-shell'],
    'dump-all': ['dump'],
    'tables': ['dbs'],
    'columns': ['tables'],
    'check-tor': ['tor']
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('初始化应用...');
        initializeEventListeners();
        loadCustomTemplates();
        loadCommandHistory();
        initializeDarkMode();
        initializeLanguage();
        initializeValidation();
        
        // 初始化手风琴面板的内容高度
        const activeAccordions = document.querySelectorAll('.accordion.active');
        activeAccordions.forEach(accordion => {
            const content = accordion.querySelector('.accordion-content');
            if (content) {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
        
        // 初始化历史记录列表
        updateHistoryList();
        
        console.log('初始化完成');
    } catch (err) {
        console.error('初始化失败:', err);
    }
});

// 事件监听器初始化
function initializeEventListeners() {
    // 按钮事件
    document.getElementById('generate-button').addEventListener('click', generateCommand);
    document.getElementById('reset-button').addEventListener('click', resetOptions);
    document.getElementById('copy-button').addEventListener('click', copyCommand);
    document.getElementById('toggle-checkboxes').addEventListener('click', toggleCheckboxes);
    document.getElementById('toggle-all').addEventListener('click', toggleAllAccordions);
    document.getElementById('load-template').addEventListener('click', openTemplateModal);
    document.getElementById('save-template').addEventListener('click', saveCurrentTemplate);
    
    // 添加清除历史记录按钮事件监听
    const clearHistoryButton = document.getElementById('clear-history');
    if (clearHistoryButton) {
        clearHistoryButton.addEventListener('click', clearCommandHistory);
    }
    
    // 模板模态框事件
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeTemplateModal);
    }
    
    document.querySelectorAll('.template-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTemplateTab(tab));
    });
    
    document.querySelectorAll('.template-item').forEach(item => {
        item.addEventListener('click', () => loadTemplate(item.dataset.template));
    });
    
    // 保存自定义模板按钮
    const saveCustomTemplateBtn = document.getElementById('save-custom-template');
    if (saveCustomTemplateBtn) {
        saveCustomTemplateBtn.addEventListener('click', saveCurrentTemplate);
    }
    
    // 初始化手风琴菜单
    initializeAccordions();
    
    // 参数依赖关系事件
    Object.keys(parameterDependencies).forEach(param => {
        const element = document.getElementById(param);
        if (element) {
            element.addEventListener('change', () => handleParameterDependency(param));
        }
    });
    
    // 输入验证事件
    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('input', () => validateInput(element));
    });
    
    // 添加复选框状态变化事件监听，更新全选按钮状态
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateToggleCheckboxesButton);
    });
    
    // 初始化更新全选按钮状态
    updateToggleCheckboxesButton();
}

// 生成命令
function generateCommand() {
    // 获取当前激活的输出元素
    const outputElement = document.getElementById('output-command');
    
    // 添加加载指示
    outputElement.classList.add('loading');
    outputElement.value = '生成命令中...';
    
    // 延迟一点以显示加载动画
    setTimeout(() => {
        // 实际生成命令
        const command = buildCommand();
        
        // 动画效果展示命令
        if (command) {
            // 先淡入淡出
            outputElement.style.opacity = '0';
            setTimeout(() => {
                outputElement.value = command;
                outputElement.style.opacity = '1';
                outputElement.classList.remove('loading');
                validateCommand(command);
            }, 300);
        } else {
            outputElement.value = '';
            outputElement.classList.remove('loading');
            showWarning('请提供目标URL或其他必要参数');
        }
    }, 300);
}

// 构建命令
function buildCommand() {
    let command = 'python sqlmap.py';
    
    // 目标选项
    const targetUrl = document.getElementById('target-url').value;
    const targetFile = document.getElementById('target-file').value;
    const requestFile = document.getElementById('request-file').value;
    
    if (targetUrl) command += ` -u "${targetUrl}"`;
    if (targetFile) command += ` -m "${targetFile}"`;
    if (requestFile) command += ` -r "${requestFile}"`;
    
    // 请求选项
    const method = document.getElementById('method').value;
    const data = document.getElementById('data').value;
    const cookie = document.getElementById('cookie').value;
    const userAgent = document.getElementById('user-agent').value;
    const randomAgent = document.getElementById('random-agent').checked;
    
    if (method) command += ` ${method}`;
    if (data) command += ` --data="${data}"`;
    if (cookie) command += ` --cookie="${cookie}"`;
    if (userAgent) command += ` --user-agent="${userAgent}"`;
    if (randomAgent) command += ' --random-agent';
    
    // 注入选项
    const param = document.getElementById('param').value;
    const dbms = document.getElementById('dbms').value;
    const technique = document.getElementById('technique').value;
    const inlineQuery = document.getElementById('inline-query').value;
    const prefix = document.getElementById('prefix').value;
    const suffix = document.getElementById('suffix').value;
    const code = document.getElementById('code').checked;
    const osShell = document.getElementById('os-shell').checked;
    const osPwn = document.getElementById('os-pwn').checked;
    
    if (param) command += ` -p "${param}"`;
    if (dbms) command += ` ${dbms}`;
    if (technique) command += ` ${technique}`;
    if (inlineQuery) command += ` --sql-query="${inlineQuery}"`;
    if (prefix) command += ` --prefix="${prefix}"`;
    if (suffix) command += ` --suffix="${suffix}"`;
    if (code) command += ' --code-exec';
    if (osShell) command += ' --os-shell';
    if (osPwn) command += ' --os-pwn';
    
    // 探测选项
    const level = document.querySelector('input[name="level"]:checked').value;
    const risk = document.querySelector('input[name="risk"]:checked').value;
    
    if (level) command += ` ${level}`;
    if (risk) command += ` ${risk}`;
    
    // 枚举选项
    const dbs = document.getElementById('dbs').checked;
    const tables = document.getElementById('tables').checked;
    const columns = document.getElementById('columns').checked;
    const dump = document.getElementById('dump').checked;
    const dumpAll = document.getElementById('dump-all').checked;
    const dbName = document.getElementById('db-name').value;
    const tableName = document.getElementById('table-name').value;
    
    if (dbs) command += ' --dbs';
    if (tables) command += ' --tables';
    if (columns) command += ' --columns';
    if (dump) command += ' --dump';
    if (dumpAll) command += ' --dump-all';
    if (dbName) command += ` -D "${dbName}"`;
    if (tableName) command += ` -T "${tableName}"`;
    
    // 高级选项
    const threads = document.getElementById('threads').value;
    const verbose = document.querySelector('input[name="verbose"]:checked').value;
    const batch = document.getElementById('batch').checked;
    const tor = document.getElementById('tor').checked;
    const checkTor = document.getElementById('check-tor').checked;
    const proxy = document.getElementById('proxy').value;
    const delay = document.getElementById('delay').value;
    const timeout = document.getElementById('timeout').value;
    const retries = document.getElementById('retries').value;
    const timeSec = document.getElementById('time-sec').value;
    const unionCols = document.getElementById('union-cols').value;
    const fingerprint = document.getElementById('fingerprint').checked;
    
    if (threads) command += ` --threads ${threads}`;
    if (verbose) command += ` ${verbose}`;
    if (batch) command += ' --batch';
    if (tor) command += ' --tor';
    if (checkTor) command += ' --check-tor';
    if (proxy) command += ` --proxy="${proxy}"`;
    if (delay) command += ` --delay ${delay}`;
    if (timeout) command += ` --timeout ${timeout}`;
    if (retries) command += ` --retries ${retries}`;
    if (timeSec) command += ` --time-sec ${timeSec}`;
    if (unionCols) command += ` --union-cols ${unionCols}`;
    if (fingerprint) command += ' --fingerprint';
    
    // 绕过选项
    const tamper = document.getElementById('tamper').value;
    const tamperMultiple = document.getElementById('tamper-multiple').value;
    const waf = document.getElementById('waf').checked;
    const identifyWaf = document.getElementById('identify-waf').checked;
    const mobile = document.getElementById('mobile').checked;
    const smart = document.getElementById('smart').checked;
    const textOnly = document.getElementById('text-only').checked;
    const noCast = document.getElementById('no-cast').checked;
    const noEscape = document.getElementById('no-escape').checked;
    
    if (tamper) command += ` ${tamper}`;
    if (tamperMultiple) command += ` --tamper="${tamperMultiple}"`;
    if (waf) command += ' --waf';
    if (identifyWaf) command += ' --identify-waf';
    if (mobile) command += ' --mobile';
    if (smart) command += ' --smart';
    if (textOnly) command += ' --text-only';
    if (noCast) command += ' --no-cast';
    if (noEscape) command += ' --no-escape';
    
    // 其他选项
    const customOptions = document.getElementById('custom-options').value;
    if (customOptions) command += ` ${customOptions}`;
    
    return command;
}

// 重置选项
function resetOptions() {
    document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
    document.querySelectorAll('input[type="number"]').forEach(input => input.value = input.defaultValue);
    document.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        if (radio.value.includes('1')) radio.checked = true;
        else radio.checked = false;
    });
    
    document.getElementById('output-command').value = '';
    
    // 更新全选按钮状态
    updateToggleCheckboxesButton();
}

// 复制命令
function copyCommand() {
    const commandText = document.getElementById('output-command').value;
    if (!commandText.trim()) {
        showWarning('没有可复制的命令');
        return;
    }

    navigator.clipboard.writeText(commandText).then(() => {
        const copyButton = document.getElementById('copy-button');
        copyButton.classList.add('copied');
        copyButton.innerHTML = '<i class="fas fa-check"></i> 已复制';
        
        // 添加脉冲动画
        copyButton.style.animation = 'pulse 0.3s ease-in-out';
        
        setTimeout(() => {
            copyButton.classList.remove('copied');
            copyButton.innerHTML = '<i class="fas fa-copy"></i> 复制命令';
            copyButton.style.animation = '';
        }, 2000);
        
        addToHistory(commandText);
        showSuccess('命令已复制到剪贴板');
    }).catch(err => {
        console.error('复制失败:', err);
        showError('复制失败，请手动复制');
    });
}

// 切换复选框状态
function toggleCheckboxes() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked;
    });
    
    // 更新全选按钮状态
    updateToggleCheckboxesButton();
}

// 更新全选按钮状态
function updateToggleCheckboxesButton() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(checkbox => checkbox.checked);
    const toggleButton = document.getElementById('toggle-checkboxes');
    
    if (toggleButton) {
        if (allChecked) {
            toggleButton.innerHTML = '<i class="fas fa-check-square"></i> 取消全选';
            toggleButton.classList.add('all-checked');
        } else {
            toggleButton.innerHTML = '<i class="fas fa-square"></i> 全选';
            toggleButton.classList.remove('all-checked');
        }
    }
}

// 切换手风琴菜单
function toggleAccordion(accordion) {
    const content = accordion.querySelector('.accordion-content');
    
    if (accordion.classList.contains('active')) {
        // 折叠动画
        content.style.maxHeight = content.scrollHeight + 'px';
        setTimeout(() => {
            content.style.maxHeight = '0px';
            setTimeout(() => {
                accordion.classList.remove('active');
            }, 300);
        }, 10);
    } else {
        // 展开动画
        accordion.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
    }
}

// 切换所有手风琴菜单
function toggleAllAccordions() {
    const accordions = document.querySelectorAll('.accordion');
    const isAnyCollapsed = Array.from(accordions).some(accordion => !accordion.classList.contains('active'));
    
    accordions.forEach(accordion => {
        const content = accordion.querySelector('.accordion-content');
        
        if (isAnyCollapsed) {
            // 全部展开
            accordion.classList.add('active');
            content.style.maxHeight = content.scrollHeight + 'px';
        } else {
            // 全部折叠
            content.style.maxHeight = content.scrollHeight + 'px';
            setTimeout(() => {
                content.style.maxHeight = '0px';
                setTimeout(() => {
                    accordion.classList.remove('active');
                }, 300);
            }, 10);
        }
    });
    
    // 更新按钮图标
    const toggleIcon = document.querySelector('#toggle-all i');
    toggleIcon.className = isAnyCollapsed ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
}

// 打开模板模态框
function openTemplateModal() {
    const modal = document.getElementById('template-modal');
    if (!modal) {
        console.error('找不到模板模态框元素');
        return;
    }
    
    modal.style.display = 'flex';
    
    // 添加动画效果
    setTimeout(() => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 阻止背景滚动
        
        // 加载模板列表
        updateCustomTemplateList();
        
        // 默认激活预设模板选项卡
        const defaultTab = document.querySelector('.template-tab[data-tab="preset"]');
        if (defaultTab) {
            // 确保所有选项卡内容都正确初始化
            document.querySelectorAll('.template-content').forEach(content => {
                content.style.opacity = '0';
                content.style.transform = 'translateY(10px)';
                content.classList.remove('active');
            });
            
            // 重置所有选项卡状态
            document.querySelectorAll('.template-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // 激活默认选项卡
            defaultTab.classList.add('active');
            
            // 激活默认内容
            const defaultContent = document.getElementById('preset-templates');
            if (defaultContent) {
                defaultContent.classList.add('active');
                
                // 使用requestAnimationFrame确保DOM更新后再应用动画
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        defaultContent.style.opacity = '1';
                        defaultContent.style.transform = 'translateY(0)';
                        
                        // 初始化选项卡指示器
                        updateTabIndicator(defaultTab);
                    }, 50);
                });
            }
        }
    }, 50);
}

// 关闭模板模态框
function closeTemplateModal() {
    const modal = document.getElementById('template-modal');
    
    // 添加关闭动画
    modal.classList.remove('active');
    
    // 延迟隐藏模态框，等待动画完成
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // 恢复背景滚动
    }, 300);
}

// 切换模板选项卡
function switchTemplateTab(tab) {
    if (!tab) return;
    
    // 获取所有选项卡和内容
    const tabs = document.querySelectorAll('.template-tab');
    const contents = document.querySelectorAll('.template-content');
    
    // 获取目标内容
    const target = tab.getAttribute('data-tab');
    const targetContent = document.getElementById(`${target}-templates`);
    
    if (!targetContent) {
        console.error(`找不到模板内容元素: ${target}-templates`);
        return;
    }
    
    // 检查是否已经是激活状态
    if (tab.classList.contains('active')) return;
    
    // 获取当前激活的内容
    const activeContent = document.querySelector('.template-content.active');
    
    // 计算动画方向（左右）
    let direction = 1; // 默认向右切换
    if (activeContent) {
        const activeTabId = activeContent.id.replace('-templates', '');
        const activeTab = document.querySelector(`.template-tab[data-tab="${activeTabId}"]`);
        if (activeTab) {
            // 找出当前激活选项卡的索引和目标选项卡的索引
            const activeIndex = Array.from(tabs).indexOf(activeTab);
            const targetIndex = Array.from(tabs).indexOf(tab);
            direction = targetIndex > activeIndex ? 1 : -1;
        }
    }
    
    // 设置内容区域动画方向
    if (activeContent) {
        // 淡出当前内容
        activeContent.style.opacity = '0';
        activeContent.style.transform = `translateY(${10 * direction}px)`;
    }
    
    // 更新选项卡样式
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // 更新选项卡下的滑动指示器
    updateTabIndicator(tab);
    
    // 延迟一点后切换内容，让淡出动画有时间执行
    setTimeout(() => {
        // 移除所有内容的激活状态
        contents.forEach(c => c.classList.remove('active'));
        
        // 预设目标内容的起始状态
        targetContent.style.opacity = '0';
        targetContent.style.transform = `translateY(${-10 * direction}px)`;
        targetContent.classList.add('active');
        
        // 强制重绘
        void targetContent.offsetWidth;
        
        // 应用动画效果
        requestAnimationFrame(() => {
            targetContent.style.opacity = '1';
            targetContent.style.transform = 'translateY(0)';
        });
    }, 150);
}

// 更新选项卡指示器
function updateTabIndicator(activeTab) {
    const tabsContainer = document.querySelector('.template-tabs');
    if (!tabsContainer) return;
    
    const indicator = tabsContainer.querySelector('.tab-indicator') || 
                     createTabIndicator(tabsContainer);
    
    // 根据激活的选项卡更新指示器位置和宽度
    const tabRect = activeTab.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();
    
    indicator.style.left = `${tabRect.left - containerRect.left}px`;
    indicator.style.width = `${tabRect.width}px`;
}

// 创建选项卡指示器
function createTabIndicator(tabsContainer) {
    const indicator = document.createElement('div');
    indicator.className = 'tab-indicator';
    indicator.style.position = 'absolute';
    indicator.style.bottom = '0';
    indicator.style.height = '3px';
    indicator.style.backgroundColor = 'var(--primary-color)';
    indicator.style.transition = 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    indicator.style.pointerEvents = 'none';
    indicator.style.zIndex = '2';
    
    tabsContainer.appendChild(indicator);
    return indicator;
}

// 加载模板
function loadTemplate(templateId) {
    let template;
    
    // 检查是否是自定义模板（格式为 'custom-X'）
    if (templateId && templateId.startsWith('custom-')) {
        const index = parseInt(templateId.split('-')[1]);
        if (!isNaN(index) && index >= 0 && index < customTemplates.length) {
            template = customTemplates[index];
        }
    } else {
        // 否则是预设模板
        template = presetTemplates[templateId];
    }
    
    if (!template) {
        console.error(`找不到模板: ${templateId}`);
        return;
    }
    
    console.log(`加载模板: ${template.name}`);
    
    // 应用模板选项
    Object.entries(template.options).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = value;
            } else if (element.type === 'radio') {
                const radio = document.querySelector(`input[name="${key}"][value="${value}"]`);
                if (radio) {
                    radio.checked = true;
                }
            } else {
                element.value = value;
            }
        }
    });
    
    closeTemplateModal();
    generateCommand();
    
    // 更新全选按钮状态，确保与当前复选框状态同步
    updateToggleCheckboxesButton();
    
    showMessage(`已应用模板: ${template.name}`, 'success');
}

// 保存当前模板
function saveCurrentTemplate() {
    const templateNameInput = document.getElementById('template-name');
    const templateDescInput = document.getElementById('template-description');
    
    if (!templateNameInput || !templateDescInput) {
        showMessage('找不到模板名称或描述输入框', 'error');
        return;
    }
    
    const name = templateNameInput.value;
    const description = templateDescInput.value;
    
    if (!name || !description) {
        showMessage('请填写模板名称和描述', 'warning');
        return;
    }
    
    const template = {
        id: `custom-${Date.now()}`,
        name,
        description,
        options: getCurrentOptions()
    };
    
    customTemplates.push(template);
    saveCustomTemplates();
    updateCustomTemplateList();
    
    templateNameInput.value = '';
    templateDescInput.value = '';
    
    // 切换到自定义模板选项卡显示新添加的模板
    const customTab = document.querySelector('.template-tab[data-tab="custom"]');
    if (customTab) {
        switchTemplateTab(customTab);
    }
    
    showMessage('模板保存成功', 'success');
}

// 获取当前选项
function getCurrentOptions() {
    const options = {};
    
    document.querySelectorAll('input[type="checkbox"]').forEach(element => {
        if (element.id) {
            options[element.id] = element.checked;
        }
    });
    
    document.querySelectorAll('input[type="radio"]:checked').forEach(element => {
        if (element.name) {
            options[element.name] = element.value;
        }
    });
    
    document.querySelectorAll('input[type="text"], input[type="number"], select').forEach(element => {
        if (element.id && element.value.trim()) {
            options[element.id] = element.value;
        }
    });
    
    return options;
}

// 加载自定义模板
function loadCustomTemplates() {
    const saved = localStorage.getItem('customTemplates');
    if (saved) {
        customTemplates = JSON.parse(saved);
        updateCustomTemplateList();
    }
}

// 保存自定义模板
function saveCustomTemplates() {
    localStorage.setItem('customTemplates', JSON.stringify(customTemplates));
}

// 更新自定义模板列表
function updateCustomTemplateList() {
    const customTemplateList = document.querySelector('.custom-template-list');
    if (!customTemplateList) {
        console.error('找不到自定义模板列表元素');
        return;
    }
    
    customTemplateList.innerHTML = '';
    
    if (customTemplates.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-templates';
        emptyMsg.textContent = '没有保存的自定义模板';
        customTemplateList.appendChild(emptyMsg);
        return;
    }
    
    customTemplates.forEach((template, index) => {
        const templateItem = document.createElement('div');
        templateItem.className = 'template-item';
        templateItem.setAttribute('data-template', `custom-${index}`);
        templateItem.innerHTML = `
            <div class="template-info">
                <h4>${template.name}</h4>
                <p>${template.description || '无描述'}</p>
            </div>
            <div class="template-actions">
                <button class="use-template" onclick="loadTemplate('custom-${index}')">
                    <i class="fas fa-check"></i> 使用
                </button>
                <button class="delete-template" onclick="deleteTemplate(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // 添加点击事件，整个模板项也可以点击加载
        templateItem.addEventListener('click', (e) => {
            // 避免点击按钮时重复触发
            if (!e.target.closest('.use-template') && !e.target.closest('.delete-template')) {
                loadTemplate(`custom-${index}`);
            }
        });
        
        // 添加进入动画
        templateItem.style.opacity = '0';
        templateItem.style.transform = 'translateY(10px)';
        
        customTemplateList.appendChild(templateItem);
        
        // 错开显示时间，创建瀑布流效果
        setTimeout(() => {
            templateItem.style.opacity = '1';
            templateItem.style.transform = 'translateY(0)';
        }, 50 * index);
    });
}

// 删除模板
function deleteTemplate(index) {
    if (!confirm('确定要删除这个模板吗？')) {
        return;
    }
    
    customTemplates.splice(index, 1);
    saveCustomTemplates();
    updateCustomTemplateList();
    showMessage('模板已删除', 'success');
}

// 加载命令历史
function loadCommandHistory() {
    try {
        const savedHistory = localStorage.getItem('sqlmapCommandHistory');
        if (savedHistory) {
            commandHistory = JSON.parse(savedHistory);
            updateHistoryList();
        }
    } catch (err) {
        console.error('加载历史记录失败:', err);
        showMessage('加载历史记录失败', 'error');
        // 如果加载失败，重置为空数组
        commandHistory = [];
    }
}

// 保存命令历史
function saveCommandHistory() {
    try {
        localStorage.setItem('sqlmapCommandHistory', JSON.stringify(commandHistory));
    } catch (err) {
        console.error('保存历史记录失败:', err);
        showMessage('保存历史记录失败', 'error');
    }
}

// 添加命令到历史记录
function addToHistory(command) {
    if (!command) return;
    
    // 检查是否已存在相同命令
    const existingIndex = commandHistory.findIndex(item => item.command === command);
    if (existingIndex !== -1) {
        // 如果存在，更新时间戳并移到顶部
        const item = commandHistory.splice(existingIndex, 1)[0];
        item.timestamp = new Date().toISOString();
        commandHistory.unshift(item);
    } else {
        // 如果不存在，添加新记录
        commandHistory.unshift({
            command: command,
            timestamp: new Date().toISOString()
        });
    }
    
    // 限制历史记录数量为10条
    if (commandHistory.length > 10) {
        commandHistory = commandHistory.slice(0, 10);
    }
    
    saveCommandHistory();
    updateHistoryList();
}

// 更新历史记录列表
function updateHistoryList() {
    const historyList = document.getElementById('command-history');
    if (!historyList) {
        console.error('未找到历史记录列表元素');
        return;
    }
    
    historyList.innerHTML = '';
    
    if (!commandHistory || commandHistory.length === 0) {
        const emptyHistoryMsg = document.createElement('div');
        emptyHistoryMsg.className = 'empty-history';
        emptyHistoryMsg.innerHTML = '<i class="fas fa-history"></i> 没有命令历史记录';
        historyList.appendChild(emptyHistoryMsg);
        return;
    }
    
    // 倒序显示历史记录，最新的在前面
    const displayHistory = [...commandHistory].reverse();
    displayHistory.forEach((item, index) => {
        const historyItem = document.createElement('li');
        historyItem.className = 'history-item';
        
        // 命令文本，最大显示长度限制
        const commandText = item.command.length > 50 ? item.command.substring(0, 50) + '...' : item.command;
        
        historyItem.innerHTML = `
            <span class="command-text" title="${item.command}">${commandText}</span>
            <span class="timestamp">${formatTimestamp(item.timestamp)}</span>
            <button class="copy-history-btn" title="复制此命令">
                <i class="fas fa-copy"></i>
            </button>
        `;
        
        // 添加点击事件处理
        historyItem.addEventListener('click', (e) => {
            if (!e.target.closest('.copy-history-btn')) {
                document.getElementById('output-command').value = item.command;
            }
        });
        
        // 添加复制按钮事件
        const copyBtn = historyItem.querySelector('.copy-history-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                copyHistoryCommand(commandHistory.length - 1 - index);
            });
        }
        
        // 添加渐入动画
        historyItem.style.opacity = '0';
        historyItem.style.transform = 'translateY(10px)';
        
        historyList.appendChild(historyItem);
        
        // 错开显示时间，创建瀑布流效果
        setTimeout(() => {
            historyItem.style.opacity = '1';
            historyItem.style.transform = 'translateY(0)';
        }, 30 * index);
    });
}

// 复制历史记录中的命令
function copyHistoryCommand(index) {
    if (!commandHistory || index >= commandHistory.length || index < 0) {
        showMessage('无效的历史记录索引', 'error');
        return;
    }
    
    const command = commandHistory[index].command;
    
    navigator.clipboard.writeText(command).then(() => {
        // 复制后同时更新输出框
        document.getElementById('output-command').value = command;
        showMessage('命令已复制到剪贴板', 'success');
    }).catch(err => {
        console.error('复制失败:', err);
        showMessage('复制失败，请手动复制', 'error');
    });
}

// 格式化时间戳
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // 如果是一分钟内
    if (diff < 60000) {
        return '刚刚';
    }
    // 如果是一小时内
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}分钟前`;
    }
    // 如果是一天内
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}小时前`;
    }
    // 如果是一周内
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days}天前`;
    }
    // 其他情况显示具体日期和时间
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 显示消息提示
function showMessage(message, type = 'info') {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.innerHTML = `
        <div class="message-icon"><i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i></div>
        <div class="message-text">${message}</div>
    `;
    
    document.body.appendChild(messageElement);
    
    // 添加入场动画
    setTimeout(() => {
        messageElement.classList.add('visible');
    }, 10);
    
    // 添加出场动画
    setTimeout(() => {
        messageElement.classList.add('hiding');
        setTimeout(() => {
            messageElement.remove();
        }, 500);
    }, 3000);
}

// 显示成功消息
function showSuccess(message) {
    showMessage(message, 'success');
}

// 显示错误消息
function showError(message) {
    showMessage(message, 'error');
}

// 显示警告消息
function showWarning(message) {
    showMessage(message, 'warning');
}

// 初始化暗色模式
function initializeDarkMode() {
    const saved = localStorage.getItem('darkMode');
    if (saved) {
        isDarkMode = JSON.parse(saved);
        document.body.classList.toggle('dark-mode', isDarkMode);
    }
    
    // 确保模式切换后更新按钮状态
    updateToggleCheckboxesButton();
}

// 切换暗色模式
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    // 确保模式切换后更新按钮状态
    updateToggleCheckboxesButton();
}

// 初始化语言
function initializeLanguage() {
    const saved = localStorage.getItem('language');
    if (saved) {
        currentLanguage = saved;
        updateLanguage();
    }
}

// 切换语言
function switchLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updateLanguage();
}

// 更新语言
function updateLanguage() {
    const lang = languages[currentLanguage];
    document.title = lang.title;
    document.querySelector('header h1').textContent = lang.title;
    document.querySelector('header p').textContent = lang.description;
    // ... 更新其他文本
}

// 初始化验证
function initializeValidation() {
    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('input', () => validateInput(element));
    });
}

// 验证输入
function validateInput(element) {
    const value = element.value;
    const type = element.type;
    
    if (type === 'number') {
        const min = element.min;
        const max = element.max;
        
        if (min && value < min) {
            showError(`值不能小于 ${min}`);
            return false;
        }
        
        if (max && value > max) {
            showError(`值不能大于 ${max}`);
            return false;
        }
    }
    
    if (type === 'text' && element.required && !value) {
        showError('此字段为必填项');
        return false;
    }
    
    return true;
}

// 验证命令
function validateCommand(command) {
    const result = {
        valid: true,
        warnings: [],
        errors: []
    };
    
    // 检查必要参数
    if (!command.includes('-u') && !command.includes('-m') && !command.includes('-r')) {
        result.valid = false;
        result.errors.push('缺少目标URL、目标文件或请求文件');
    }
    
    // 检查风险参数
    if (command.includes('--os-shell') || command.includes('--os-pwn')) {
        if (!command.includes('--level 5')) {
            result.warnings.push('获取Shell操作建议使用最高测试级别 (--level 5)');
        }
    }
    
    // 检查性能参数
    if (command.includes('--threads')) {
        const threadsMatch = command.match(/--threads (\d+)/);
        if (threadsMatch && threadsMatch[1] && parseInt(threadsMatch[1]) > 5) {
            result.warnings.push('高线程数可能导致目标服务器负载过高');
        }
    }
    
    return result;
}

// 显示验证结果
function showValidationResult(result) {
    const container = document.querySelector('.command-validation');
    container.className = 'command-validation';
    
    if (!result.valid) {
        container.classList.add('invalid');
        container.textContent = result.errors.join('\n');
    } else if (result.warnings.length > 0) {
        container.classList.add('warning');
        container.textContent = result.warnings.join('\n');
    } else {
        container.classList.add('valid');
        container.textContent = '命令有效';
    }
}

// 模拟命令执行
function simulateCommandExecution(command) {
    const container = document.querySelector('.command-simulation');
    container.innerHTML = `
        <div class="simulation-step">
            <span class="step-number">1</span>
            <span class="step-description">正在连接目标...</span>
            <span class="step-time">0.5s</span>
        </div>
        <div class="simulation-step">
            <span class="step-number">2</span>
            <span class="step-description">测试注入点...</span>
            <span class="step-time">1.2s</span>
        </div>
        <div class="simulation-step">
            <span class="step-number">3</span>
            <span class="step-description">获取数据库信息...</span>
            <span class="step-time">2.1s</span>
        </div>
    `;
}

// 处理参数依赖关系
function handleParameterDependency(param) {
    const dependencies = parameterDependencies[param];
    if (!dependencies) return;
    
    const element = document.getElementById(param);
    const isChecked = element.checked;
    
    dependencies.forEach(dep => {
        const depElement = document.getElementById(dep);
        if (depElement) {
            if (isChecked) {
                depElement.checked = true;
                depElement.disabled = true;
            } else {
                depElement.disabled = false;
            }
        }
    });
}

// 清除历史记录
function clearCommandHistory() {
    if (confirm('确定要清除所有历史记录吗？')) {
        commandHistory = [];
        saveCommandHistory();
        updateHistoryList();
        showMessage('历史记录已清除', 'success');
    }
}

// 初始化手风琴菜单
function initializeAccordions() {
    // 首先处理所有活动手风琴的内容区域高度
    document.querySelectorAll('.accordion.active').forEach(accordion => {
        const content = accordion.querySelector('.accordion-content');
        if (content) {
            // 确保内容高度计算正确
            content.style.display = 'block';
            content.style.maxHeight = 'none';
            content.style.opacity = '1';
            content.style.overflow = 'visible';
            
            // 给内容添加padding以便正确计算高度 - 使用更紧凑的padding
            content.style.padding = '18px 20px';
            
            // 获取实际高度后设置
            setTimeout(() => {
                const height = content.scrollHeight + 50; // 减少额外空间
                content.style.maxHeight = height + 'px';
            }, 50);
        }
    });
    
    // 添加点击事件处理
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const accordion = header.parentElement;
            const content = accordion.querySelector('.accordion-content');
            
            // 使用动画效果展开/折叠
            if (accordion.classList.contains('active')) {
                // 折叠动画
                content.style.maxHeight = content.scrollHeight + 'px';
                content.style.overflow = 'hidden';
                
                setTimeout(() => {
                    content.style.maxHeight = '0px';
                    content.style.padding = '0px';
                    
                    setTimeout(() => {
                        accordion.classList.remove('active');
                    }, 300);
                }, 10);
            } else {
                // 展开动画
                accordion.classList.add('active');
                
                // 先重置内容区域样式
                content.style.display = 'block'; 
                content.style.overflow = 'hidden';
                content.style.maxHeight = '0px';
                content.style.padding = '0px';
                
                // 使用requestAnimationFrame确保DOM更新后再计算
                requestAnimationFrame(() => {
                    // 应用更紧凑的内容区域padding
                    content.style.padding = '18px 20px';
                    
                    // 短暂延迟以确保padding已应用并可正确计算高度
                    setTimeout(() => {
                        // 添加适量空间确保所有内容都显示
                        const height = content.scrollHeight + 30;
                        content.style.maxHeight = height + 'px';
                        
                        // 完成展开后设为可见溢出，确保所有内容可见
                        setTimeout(() => {
                            content.style.overflow = 'visible';
                        }, 300);
                    }, 10);
                });
            }
        });
    });
    
    // 窗口调整大小时重新计算内容高度
    window.addEventListener('resize', debounce(() => {
        document.querySelectorAll('.accordion.active').forEach(accordion => {
            const content = accordion.querySelector('.accordion-content');
            if (content) {
                // 临时移除过渡效果以立即更新高度
                content.style.transition = 'none';
                content.style.overflow = 'visible';
                
                // 重新计算高度 - 减少额外空间
                const height = content.scrollHeight + 30;
                content.style.maxHeight = height + 'px';
                
                // 恢复过渡效果
                setTimeout(() => {
                    content.style.transition = 'max-height 0.5s ease, padding 0.3s ease';
                }, 50);
            }
        });
    }, 250));
}

// 防抖函数，防止频繁调用
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
} 