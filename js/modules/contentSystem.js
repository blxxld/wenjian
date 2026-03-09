// ==================== 内容管理模块 ====================

import { StorageUtil, DOMUtil } from './utils.js';

export const ContentSystem = {
    init() {
        this.loadArticles();
        this.setupArticleDisplay();
    },
    
    articles: [],
    
    loadArticles() {
        this.articles = StorageUtil.get('articles', this.getDefaultArticles());
    },
    
    getDefaultArticles() {
        return [
            {
                id: 1,
                title: '大学生竞赛报名全流程指南',
                author: '问茧团队',
                category: '竞赛指南',
                tags: ['竞赛', '报名', '流程'],
                content: `# 大学生竞赛报名全流程指南

## 一、竞赛类型及选择

### 1. 学科竞赛
- **数学类**：全国大学生数学竞赛、全国大学生数学建模竞赛
- **物理类**：全国大学生物理竞赛、全国大学生物理实验竞赛
- **化学类**：全国大学生化学竞赛、全国大学生化学实验竞赛
- **计算机类**：ACM-ICPC国际大学生程序设计竞赛、全国大学生信息安全竞赛

### 2. 创新创业竞赛
- **挑战杯**：全国大学生课外学术科技作品竞赛、全国大学生创业计划竞赛
- **互联网+**：中国“互联网+”大学生创新创业大赛
- **创青春**：全国大学生创业大赛

### 3. 学科专业竞赛
- **机械类**：全国大学生机械创新设计大赛
- **电子类**：全国大学生电子设计竞赛
- **建筑类**：全国大学生建筑设计竞赛

## 二、报名准备

### 1. 了解竞赛信息
- **官方网站**：访问竞赛官方网站，了解竞赛规则、报名条件、截止日期等信息
- **学校通知**：关注学校教务处、团委发布的竞赛通知
- **学长学姐**：向参加过竞赛的学长学姐咨询经验

### 2. 组队准备
- **寻找队友**：根据竞赛要求，寻找不同专业、不同技能的队友
- **明确分工**：根据队员的特长，明确各自的职责
- **团队磨合**：提前进行团队磨合，确保团队协作顺畅

### 3. 材料准备
- **个人材料**：身份证、学生证、获奖证书等
- **团队材料**：团队成员信息、项目计划书、研究报告等
- **其他材料**：根据竞赛要求准备的特殊材料

## 三、报名流程

### 1. 注册账号
- 访问竞赛官方网站，注册个人/团队账号
- 完善个人/团队信息，上传相关证件

### 2. 提交报名信息
- 填写报名表格，上传报名材料
- 确认报名信息，提交报名申请
- 缴纳报名费用（如有）

### 3. 等待审核
- 等待竞赛组委会审核报名信息
- 审核通过后，获取参赛资格
- 接收竞赛相关通知

## 四、备赛阶段

### 1. 制定备赛计划
- 根据竞赛时间，制定详细的备赛计划
- 合理安排时间，确保备赛进度
- 定期进行团队会议，讨论备赛进展

### 2. 知识储备
- 学习竞赛相关知识，掌握核心技能
- 参考历年竞赛题目，了解竞赛题型
- 参加相关培训，提升专业能力

### 3. 模拟训练
- 进行模拟竞赛，熟悉竞赛流程
- 分析模拟结果，找出不足之处
- 针对性地进行强化训练

## 五、竞赛阶段

### 1. 赛前准备
- 确认竞赛时间、地点、要求
- 准备竞赛所需的设备、材料
- 调整心态，保持良好状态

### 2. 竞赛过程
- 按照竞赛规则，完成竞赛任务
- 合理分配时间，确保任务完成
- 团队协作，发挥各自优势

### 3. 赛后总结
- 总结竞赛经验，分析优缺点
- 保存竞赛材料，为后续竞赛做准备
- 分享竞赛经验，帮助其他同学

## 六、常见问题及解决方法

### 1. 报名失败
- **原因**：报名信息填写错误、材料不完整、报名时间过期
- **解决方法**：仔细检查报名信息，及时补充材料，注意报名截止时间

### 2. 备赛困难
- **原因**：知识储备不足、团队协作不畅、时间紧张
- **解决方法**：加强知识学习，改善团队沟通，合理安排时间

### 3. 竞赛压力
- **原因**：竞争激烈、任务繁重、心理压力大
- **解决方法**：调整心态，合理规划，寻求支持

## 七、获奖后的后续工作

### 1. 证书领取
- 关注竞赛组委会发布的证书领取通知
- 按照要求领取竞赛证书
- 妥善保管证书，用于后续升学、就业

### 2. 经验分享
- 向学弟学妹分享竞赛经验
- 参与学校组织的经验交流会
- 在平台上发布竞赛心得

### 3. 继续提升
- 参加更高层次的竞赛
- 将竞赛经验应用到学习、科研中
- 培养创新思维和实践能力

## 八、结语

大学生竞赛是提升个人能力、丰富校园生活的重要途径。通过参与竞赛，不仅可以巩固专业知识，还可以培养团队协作、创新思维和解决问题的能力。希望本指南能够帮助大家顺利完成竞赛报名和备赛过程，取得优异的成绩！

祝大家竞赛顺利，收获满满！`,
                createdAt: '2024-01-15T10:00:00Z',
                updatedAt: '2024-01-15T10:00:00Z',
                views: 1250,
                likes: 89
            },
            {
                id: 2,
                title: '不同专业必备工具清单',
                author: '问茧团队',
                category: '工具推荐',
                tags: ['工具', '专业', '必备'],
                content: `# 不同专业必备工具清单

## 一、计算机类专业

### 1. 编程工具
- **IDE**：Visual Studio Code、IntelliJ IDEA、PyCharm
- **版本控制**：Git、GitHub、GitLab
- **调试工具**：Chrome DevTools、Postman
- **数据库工具**：MySQL Workbench、Navicat

### 2. 设计工具
- **UI设计**：Figma、Adobe XD、Sketch
- **原型设计**：Axure RP、Mockplus
- **图标设计**：Iconify、Flaticon

### 3. 开发工具
- **前端框架**：React、Vue、Angular
- **后端框架**：Spring Boot、Django、Express
- **移动开发**：Flutter、React Native

## 二、理工科专业

### 1. 数学工具
- **数学软件**：Mathematica、MATLAB、Maple
- **统计分析**：SPSS、R、Python (pandas, numpy)
- **数值计算**：Origin、SigmaPlot

### 2. 工程工具
- **CAD软件**：AutoCAD、SolidWorks、CATIA
- **仿真软件**：ANSYS、COMSOL Multiphysics
- **电路设计**：Altium Designer、Eagle

### 3. 实验工具
- **数据采集**：LabVIEW、Keithley
- **实验分析**：OriginPro、GraphPad Prism
- **科学计算**：GNU Octave、Scilab

## 三、文科类专业

### 1. 写作工具
- **文字处理**：Microsoft Word、Google Docs
- **排版工具**：LaTeX、Adobe InDesign
- **参考文献**：EndNote、Zotero、Mendeley

### 2. 研究工具
- **文献检索**：CNKI、Web of Science、Google Scholar
- **数据分析**：NVivo、Atlas.ti
- **问卷调查**：问卷星、SurveyMonkey

### 3. 媒体工具
- **视频编辑**：Adobe Premiere Pro、剪映
- **音频处理**：Adobe Audition、Audacity
- **图像处理**：Adobe Photoshop、GIMP

## 四、商科类专业

### 1. 办公工具
- **表格处理**：Microsoft Excel、WPS表格
- **演示文稿**：Microsoft PowerPoint、Prezi
- **项目管理**：Microsoft Project、Trello

### 2. 财务工具
- **财务软件**：金蝶、用友、SAP
- **数据分析**：Power BI、Tableau
- **投资分析**：Wind、Choice

### 3. 营销工具
- **社交媒体**：微信公众号、微博、抖音
- **营销分析**：百度统计、Google Analytics
- **广告投放**：百度推广、微信广告

## 五、艺术类专业

### 1. 设计工具
- **图像处理**：Adobe Photoshop、CorelDRAW
- **矢量设计**：Adobe Illustrator、Affinity Designer
- **3D建模**：Blender、3ds Max、Maya

### 2. 影视工具
- **视频剪辑**：Adobe Premiere Pro、Final Cut Pro
- **特效制作**：Adobe After Effects、DaVinci Resolve
- **动画制作**：Adobe Animate、Toon Boom Harmony

### 3. 音乐工具
- **音频制作**：Adobe Audition、Logic Pro
- **音乐制作**：FL Studio、Ableton Live
- **音效库**：Sound Effects Library

## 六、通用工具

### 1. 办公效率
- **笔记工具**：Notion、Evernote、OneNote
- **任务管理**：Todoist、TickTick、Microsoft To Do
- **云存储**：百度网盘、Google Drive、Dropbox

### 2. 学习工具
- **在线学习**：MOOC、Coursera、edX
- **语言学习**：百词斩、扇贝单词、Duolingo
- **思维导图**：XMind、MindManager、FreeMind

### 3. 沟通协作
- **即时通讯**：微信、QQ、钉钉
- **视频会议**：腾讯会议、Zoom、Teams
- **协同文档**：腾讯文档、飞书文档、Google Docs

## 七、工具获取途径

### 1. 官方网站
- 访问软件官方网站，下载试用版或免费版
- 关注官方优惠活动，获取学生折扣

### 2. 学校资源
- 利用学校提供的软件资源，如校园版Microsoft Office
- 访问学校图书馆电子资源，获取专业数据库

### 3. 开源软件
- 使用开源软件，如GIMP、LibreOffice、Blender
- 参与开源社区，贡献代码和反馈

### 4. 教育优惠
- 利用学生身份，获取教育版软件优惠
- 关注各大软件厂商的学生计划

## 八、工具使用建议

### 1. 选择适合自己的工具
- 根据专业需求和个人习惯，选择适合的工具
- 不要盲目追求最新、最复杂的工具

### 2. 掌握核心功能
- 重点学习工具的核心功能，提高使用效率
- 循序渐进，逐步掌握高级功能

### 3. 多平台协作
- 选择支持多平台的工具，实现无缝协作
- 利用云同步功能，确保数据安全

### 4. 持续学习
- 关注工具更新，学习新功能
- 参与在线社区，交流使用技巧

## 九、结语

合适的工具可以大大提高学习和工作效率，希望本清单能够帮助不同专业的同学找到适合自己的工具。记住，工具只是辅助手段，关键还是要提升自身的专业能力和实践能力。

祝大家学习进步，事业有成！`,
                createdAt: '2024-01-20T14:30:00Z',
                updatedAt: '2024-01-20T14:30:00Z',
                views: 980,
                likes: 67
            },
            {
                id: 3,
                title: '实习信息筛选技巧',
                author: '问茧团队',
                category: '就业指导',
                tags: ['实习', '信息筛选', '就业'],
                content: `# 实习信息筛选技巧

## 一、实习信息来源

### 1. 校内资源
- **就业指导中心**：学校就业指导中心发布的实习信息
- **辅导员通知**：辅导员通过班级群、邮件发送的实习信息
- **学长学姐推荐**：已实习的学长学姐分享的实习机会
- **校园宣讲会**：企业在校园举办的宣讲会

### 2. 线上平台
- **招聘网站**：智联招聘、前程无忧、实习僧
- **社交媒体**：微信公众号、微博、知乎
- **专业论坛**：行业相关论坛、社区
- **企业官网**：目标企业官方网站的招聘页面

### 3. 线下渠道
- **招聘会**：各类人才招聘会
- **行业活动**：行业展会、研讨会
- **人脉推荐**：通过亲友、老师推荐
- **直接联系**：主动联系目标企业HR

## 二、实习信息筛选标准

### 1. 行业匹配度
- **专业对口**：与所学专业相关的实习岗位
- **兴趣相符**：符合个人兴趣爱好的实习内容
- **职业规划**：有利于未来职业发展的实习机会

### 2. 企业资质
- **企业规模**：大型企业、中型企业、初创企业
- **企业声誉**：行业口碑、企业品牌
- **发展前景**：企业发展趋势、行业地位
- **企业文化**：企业氛围、价值观

### 3. 实习内容
- **工作内容**：具体的工作任务、职责范围
- **学习机会**：是否有培训、学习的机会
- **技能提升**：能否提升专业技能、软技能
- **项目经验**：是否参与重要项目

### 4. 实习条件
- **实习时长**：实习的时间长度
- **工作时间**：工作时间安排、是否加班
- **实习薪酬**：实习工资、福利补贴
- **工作地点**：工作地点的便利性

## 三、实习信息筛选步骤

### 1. 信息收集
- 广泛收集各类实习信息
- 建立实习信息数据库
- 定期更新信息来源

### 2. 初步筛选
- 根据行业匹配度进行筛选
- 排除明显不符合条件的信息
- 初步确定目标企业和岗位

### 3. 深入分析
- 研究目标企业的详细信息
- 了解岗位的具体要求
- 分析实习的潜在价值

### 4. 优先级排序
- 根据个人需求进行排序
- 考虑实习的综合价值
- 确定申请的优先级

## 四、实习信息真实性验证

### 1. 企业验证
- 核实企业的工商注册信息
- 查看企业的官方网站
- 搜索企业的相关新闻

### 2. 岗位验证
- 确认岗位的真实性
- 了解岗位的具体职责
- 验证岗位的招聘流程

### 3. 薪资验证
- 了解行业的平均实习薪资
- 确认薪资的支付方式
- 核实福利补贴的具体内容

### 4. 其他验证
- 咨询已在该企业实习的同学
- 查看企业的评价和口碑
- 警惕传销、诈骗等虚假信息

## 五、实习申请准备

### 1. 简历准备
- 针对不同岗位定制简历
- 突出与岗位相关的技能和经历
- 确保简历格式规范、内容真实

### 2. 求职信准备
- 根据岗位要求撰写求职信
- 表达对企业的了解和兴趣
- 强调个人优势和胜任能力

### 3. 面试准备
- 了解企业的基本情况
- 准备常见面试问题的回答
- 练习自我介绍和岗位相关问题

### 4. 其他材料
- 准备成绩单、获奖证书等材料
- 准备作品集（如有需要）
- 准备身份证、学生证等证件

## 六、实习信息管理

### 1. 建立信息库
- 使用Excel、Notion等工具管理实习信息
- 记录企业名称、岗位、要求、截止日期等信息
- 跟踪申请进度和面试结果

### 2. 时间管理
- 合理安排申请时间
- 注意申请截止日期
- 预留足够的准备时间

### 3. 进度跟踪
- 记录每个申请的状态
- 及时跟进申请进度
- 调整申请策略

### 4. 经验总结
- 总结申请过程中的经验教训
- 分析成功和失败的原因
- 不断优化申请策略

## 七、常见问题及解决方法

### 1. 信息过载
- **原因**：实习信息过多，难以筛选
- **解决方法**：制定筛选标准，优先处理符合条件的信息

### 2. 信息虚假
- **原因**：存在虚假实习信息
- **解决方法**：仔细验证信息真实性，警惕高回报低要求的岗位

### 3. 申请无回应
- **原因**：申请材料不够突出，竞争激烈
- **解决方法**：优化简历和求职信，提高自身竞争力

### 4. 选择困难
- **原因**：多个实习机会难以选择
- **解决方法**：根据个人职业规划和发展需求进行选择

## 八、实习后的评估

### 1. 实习收获
- 评估实习期间的学习和成长
- 总结实习经验和技能提升
- 建立实习期间的人脉关系

### 2. 未来规划
- 根据实习经验调整职业规划
- 确定未来的学习和发展方向
- 为正式就业做准备

### 3. 经验分享
- 向学弟学妹分享实习经验
- 提供实习信息和申请建议
- 建立实习资源共享网络

## 九、结语

实习是大学生从校园走向社会的重要过渡阶段，通过实习可以积累工作经验、提升专业技能、建立人脉关系。希望本指南能够帮助大家有效地筛选实习信息，找到适合自己的实习机会，为未来的职业发展打下坚实的基础。

祝大家实习顺利，收获满满！`,
                createdAt: '2024-01-25T09:15:00Z',
                updatedAt: '2024-01-25T09:15:00Z',
                views: 820,
                likes: 54
            }
        ];
    },
    
    setupArticleDisplay() {
        // 显示文章列表
        this.displayArticles();
        
        // 绑定文章阅读事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.article-read-more')) {
                const articleId = e.target.closest('.article-read-more').getAttribute('data-article-id');
                this.viewArticle(articleId);
            }
        });
        
        // 绑定文章点赞事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.article-like')) {
                const articleId = e.target.closest('.article-like').getAttribute('data-article-id');
                this.likeArticle(articleId);
            }
        });
    },
    
    displayArticles() {
        const container = DOMUtil.$('#articles-container');
        if (!container) return;
        
        container.innerHTML = this.articles.map(article => {
            return `
                <div class="article-card animate-on-scroll">
                    <div class="article-header">
                        <h3 class="article-title">${article.title}</h3>
                        <span class="article-category">${article.category}</span>
                    </div>
                    <div class="article-meta">
                        <span class="article-author">作者：${article.author}</span>
                        <span class="article-date">${new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="article-tags">
                        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="article-content-preview">
                        ${this.getContentPreview(article.content)}
                    </div>
                    <div class="article-footer">
                        <div class="article-stats">
                            <span class="article-views">
                                <i class="fas fa-eye"></i> ${article.views}
                            </span>
                            <span class="article-likes">
                                <i class="fas fa-thumbs-up"></i> ${article.likes}
                            </span>
                        </div>
                        <button class="article-read-more" data-article-id="${article.id}">
                            阅读更多 <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    getContentPreview(content) {
        // 移除Markdown格式，获取纯文本预览
        const plainText = content.replace(/#+/g, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    },
    
    viewArticle(articleId) {
        const article = this.articles.find(a => a.id == articleId);
        if (!article) return;
        
        // 增加浏览量
        article.views++;
        StorageUtil.set('articles', this.articles);
        
        // 显示文章详情
        this.showArticleDetail(article);
    },
    
    likeArticle(articleId) {
        const article = this.articles.find(a => a.id == articleId);
        if (!article) return;
        
        // 增加点赞数
        article.likes++;
        StorageUtil.set('articles', this.articles);
        
        // 更新UI
        this.displayArticles();
    },
    
    showArticleDetail(article) {
        const detailHTML = `
            <div class="article-detail-modal">
                <div class="article-detail-content">
                    <div class="article-detail-header">
                        <h2>${article.title}</h2>
                        <button class="close-article-detail">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="article-detail-meta">
                        <span class="article-detail-author">作者：${article.author}</span>
                        <span class="article-detail-date">${new Date(article.createdAt).toLocaleString()}</span>
                        <span class="article-detail-category">${article.category}</span>
                    </div>
                    <div class="article-detail-tags">
                        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="article-detail-body">
                        ${this.renderMarkdown(article.content)}
                    </div>
                    <div class="article-detail-footer">
                        <div class="article-detail-stats">
                            <span class="article-detail-views">
                                <i class="fas fa-eye"></i> ${article.views}
                            </span>
                            <span class="article-detail-likes">
                                <i class="fas fa-thumbs-up"></i> ${article.likes}
                            </span>
                        </div>
                        <button class="article-detail-like" data-article-id="${article.id}">
                            <i class="fas fa-thumbs-up"></i> 点赞
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // 移除已存在的模态框
        const existingModal = document.querySelector('.article-detail-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 添加新模态框
        document.body.insertAdjacentHTML('beforeend', detailHTML);
        document.body.style.overflow = 'hidden';
        
        // 绑定关闭按钮
        document.querySelector('.close-article-detail').addEventListener('click', () => {
            document.querySelector('.article-detail-modal').remove();
            document.body.style.overflow = '';
        });
        
        // 绑定点赞按钮
        document.querySelector('.article-detail-like').addEventListener('click', (e) => {
            const articleId = e.target.closest('.article-detail-like').getAttribute('data-article-id');
            this.likeArticle(articleId);
            // 更新模态框中的点赞数
            const likeElement = document.querySelector('.article-detail-likes');
            const updatedArticle = this.articles.find(a => a.id == articleId);
            if (likeElement && updatedArticle) {
                likeElement.innerHTML = `<i class="fas fa-thumbs-up"></i> ${updatedArticle.likes}`;
            }
        });
        
        // 点击模态框外部关闭
        document.querySelector('.article-detail-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('article-detail-modal')) {
                document.querySelector('.article-detail-modal').remove();
                document.body.style.overflow = '';
            }
        });
    },
    
    renderMarkdown(content) {
        // 简单的Markdown渲染
        return content
            .replace(/#{1} (.*?)(?=\n|$)/g, '<h1>$1</h1>')
            .replace(/#{2} (.*?)(?=\n|$)/g, '<h2>$1</h2>')
            .replace(/#{3} (.*?)(?=\n|$)/g, '<h3>$1</h3>')
            .replace(/\n\* (.*?)(?=\n|$)/g, '<li>$1</li>')
            .replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(?!<h[1-6]|</?ul|</?li|</?p).*$/gm, '<p>$&</p>')
            .replace(/<p><\/p>/g, '');
    },
    
    // 获取所有文章
    getArticles() {
        return this.articles;
    },
    
    // 根据分类获取文章
    getArticlesByCategory(category) {
        return this.articles.filter(article => article.category === category);
    },
    
    // 根据标签获取文章
    getArticlesByTag(tag) {
        return this.articles.filter(article => article.tags.includes(tag));
    },
    
    // 搜索文章
    searchArticles(keyword) {
        const keywordLower = keyword.toLowerCase();
        return this.articles.filter(article => 
            article.title.toLowerCase().includes(keywordLower) ||
            article.content.toLowerCase().includes(keywordLower) ||
            article.tags.some(tag => tag.toLowerCase().includes(keywordLower))
        );
    }
};
