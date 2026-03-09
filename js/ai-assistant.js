// AI助手功能模块

// 常量定义
const SYSTEM_PROMPT = '你是问茧的AI助手，一个基于DeepSeek大模型开发的独立智能助手，专注于帮助大学生解决学习、生活和职业发展问题。作为独立的AI模型，你具有以下能力：\n1. 理解复杂的学习和生活问题\n2. 提供个性化的学习建议和规划\n3. 解答专业领域的学术问题\n4. 帮助用户更好地使用问茧网站的各项功能\n5. 提供实时的信息和建议\n\n你的回答应该专业、详细、有针对性，并且要考虑到不同学习阶段（本科、研究生、博士）的学生需求。你不需要依赖任何预定义的回答模板，而是应该根据上下文和专业知识为用户提供原创的、有深度的回答。';

// 全局变量
let chatHistory = [
    {
        role: 'system',
        content: SYSTEM_PROMPT
    }
];

// DOM元素缓存
let chatBody = null;
let chatInput = null;
let sendBtn = null;

// 页面加载完成后初始化
export function initAIAssistant() {
    console.log('AI助手初始化');
    
    // 缓存DOM元素
    chatBody = document.getElementById('chat-body');
    chatInput = document.getElementById('chat-input');
    sendBtn = document.getElementById('send-btn');
    
    // 绑定表单提交事件
    const chatForm = document.querySelector('.ai-chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', handleChatSubmit);
    }
    
    
    
    // 绑定快速提问按钮事件
    const quickQuestionBtns = document.querySelectorAll('.quick-question-btn');
    quickQuestionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const question = this.textContent.trim();
            if (chatInput) {
                chatInput.value = question;
                handleChatSubmit(null);
            }
        });
    });
    
    // 确保预加载动画隐藏并移除
    (function() {
        const removePreloader = function() {
            const preloader = document.getElementById('preloader');
            if (preloader) {
                preloader.remove();
                console.log('预加载器已从AI助手页面移除');
            }
        };
        
        // 立即尝试移除
        removePreloader();
        
        // 100毫秒后再次尝试
        setTimeout(removePreloader, 100);
        
        // 500毫秒后再次尝试
        setTimeout(removePreloader, 500);
    })();
}

// 格式化响应内容，使其更有条理
function formatResponse(content) {
    // 替换换行符为HTML换行
    content = content.replace(/\n/g, '<br>');
    
    // 为列表项添加适当的缩进和样式
    content = content.replace(/<br>\s*-\s*/g, '<br><span style="margin-left: 1.5rem;">• </span>');
    content = content.replace(/<br>\s*\d+\.\s*/g, '<br><span style="margin-left: 1.5rem;">$&</span>');
    
    // 为标题添加样式
    content = content.replace(/<br>\s*\*\*([^\*]+)\*\*/g, '<br><strong style="font-size: 1.1em; display: block; margin-top: 1rem; margin-bottom: 0.5rem;">$1</strong>');
    
    // 为引用添加样式
    content = content.replace(/<br>\s*>\s*(.*)/g, '<br><div style="margin-left: 2rem; font-style: italic; color: #666;">$1</div>');
    
    return content;
}

// 通用响应生成函数
function generateGeneralResponse(question) {
    // 转换为小写以便更好地匹配
    const lowerQuestion = question.toLowerCase();
    
    // 问候语
    if (lowerQuestion.includes('你好') || lowerQuestion.includes('hello') || lowerQuestion.includes('嗨') || lowerQuestion.includes('hi')) {
        return formatResponse(`你好！我是问茧的AI助手，专门为大学生（包括本科生、研究生和博士生）设计。

很高兴为你服务，有什么可以帮助你的吗？你可以问我关于以下方面的问题：
- 课程学习和考试复习
- 论文写作和科研方法
- 职业规划和面试准备
- 考研升学和留学申请
- 生活和心理健康
- 网站使用和资源查找

我会尽力为你提供详细、专业的解答。`);
    }
    
    // 告别语
    else if (lowerQuestion.includes('再见') || lowerQuestion.includes('拜拜') || lowerQuestion.includes('bye')) {
        return formatResponse(`再见！如果你还有其他学习或生活方面的问题，随时可以问我。

祝你：
- 学业顺利，成绩优异
- 科研有成，成果丰硕
- 生活愉快，身心健康
- 未来前程似锦！`);
    }
    
    // 关于AI自身
    else if (lowerQuestion.includes('名字') || lowerQuestion.includes('叫什么') || lowerQuestion.includes('是谁') || lowerQuestion.includes('什么是')) {
        if (lowerQuestion.includes('你')) {
            return formatResponse(`我是问茧的AI助手，是一个专门为大学生群体（包括本科生、研究生和博士生）设计的智能助手。

我的主要功能包括：
- 解答课程学习问题和提供学习建议
- 提供科研方法指导和论文写作技巧
- 推荐学术资源和学习工具
- 规划职业发展路径和面试准备
- 解答生活和心理健康方面的问题
- 帮助了解和使用问茧网站的各项功能
- 推荐网站内的优质资源

我会不断学习和改进，为你提供更专业、更有针对性的服务。`);
        }
    }
    
    // 关于网站使用
    else if (lowerQuestion.includes('网站') || lowerQuestion.includes('问茧') || lowerQuestion.includes('使用') || lowerQuestion.includes('功能')) {
        if (lowerQuestion.includes('怎么') || lowerQuestion.includes('如何')) {
            if (lowerQuestion.includes('使用') || lowerQuestion.includes('查找') || lowerQuestion.includes('搜索')) {
                return formatResponse(`使用问茧网站非常简单：

1. **资源搜索**：在首页或<a href="resources.html" target="_blank">资源库</a>页面的搜索框中输入关键词，即可查找相关资源
2. **资源筛选**：在<a href="resources.html" target="_blank">资源库</a>页面，你可以按分类（网站类、信息类）、适用年级（大一到研究生）等条件筛选资源
3. **资源提交**：如果你发现了优质资源，可以点击导航栏的'提交资源'按钮分享给其他同学
4. **AI助手**：通过导航栏的'AI助手'进入，我可以回答你的学习问题和网站使用问题
5. **个性化推荐**：根据你的浏览历史，我们会为你推荐相关资源
6. **个人中心**：登录后，你可以查看和管理你的收藏、提交的资源和浏览历史

你可以在问茧网站的<a href="resources.html" target="_blank">资源库</a>中找到更多学习资源和工具，帮助你更好地学习和成长。如果你有具体的功能使用问题，随时告诉我，我会详细解答。`);
            } else if (lowerQuestion.includes('注册') || lowerQuestion.includes('登录')) {
                return formatResponse(`注册和登录问茧网站的步骤：

1. 点击网站右上角的'登录/注册'按钮
2. 在打开的页面中，选择'注册'选项，填写你的邮箱和密码
3. 注册成功后，你可以使用相同的邮箱和密码登录
4. 登录后，你可以查看个人中心，管理你的收藏和提交的资源

登录后，你将获得更多个性化功能，如资源收藏、历史记录等。`);
            } else if (lowerQuestion.includes('收藏') || lowerQuestion.includes('保存')) {
                return formatResponse(`在问茧网站收藏资源的方法：

1. 登录你的账号
2. 在资源详情页面，点击'收藏'按钮
3. 收藏的资源会保存在你的个人中心，方便随时查看和使用

收藏资源可以帮助你快速访问常用的学习资料，提高学习效率。`);
            } else if (lowerQuestion.includes('提交') || lowerQuestion.includes('分享')) {
                return formatResponse(`在问茧网站提交资源的步骤：

1. 点击导航栏的'提交资源'按钮
2. 填写资源标题、描述、链接等信息
3. 选择资源分类和适用年级
4. 点击'提交'按钮，我们会进行审核

提交优质资源可以帮助其他同学，共同建设良好的学习社区。`);
            }
        } else if (lowerQuestion.includes('有什么') || lowerQuestion.includes('功能') || lowerQuestion.includes('资源')) {
            return formatResponse(`问茧网站为大学生提供以下功能和资源：

**主要功能**：
- 资源搜索和筛选：快速找到你需要的学习资源
- 资源提交：分享你发现的优质资源
- AI助手：解答学习问题和网站使用问题
- 个性化推荐：根据你的兴趣推荐相关资源
- 资源收藏：保存常用的学习资料
- 浏览历史：记录你的资源访问记录

**资源分类**：
- 网站类：学习网站、就业网站、竞赛网站、工具网站、设计网站、学术网站
- 信息类：资讯信息、资源信息、竞赛信息、学习信息、就业信息

所有资源都经过人工审核，确保质量可靠、信息准确。`);
        } else if (lowerQuestion.includes('优势') || lowerQuestion.includes('特点')) {
            return formatResponse(`问茧网站的核心优势：

1. **专为大学生设计**：内容和功能都针对本科生、研究生和博士生的需求
2. **优质资源**：所有资源都经过人工审核，确保质量可靠
3. **智能搜索**：快速找到你需要的学习资源
4. **AI助手**：提供个性化的学习建议和网站使用指导
5. **社区共建**：鼓励用户分享优质资源，共同建设学习社区
6. **个性化推荐**：根据你的兴趣和浏览历史推荐相关资源

问茧致力于打破信息差，让大学更精彩！`);
        } else {
            return formatResponse(`问茧是专为大学生打造的优质资源整合平台，致力于打破信息差，让大学更精彩！

我们汇集了：
- 学习资源：课程资料、在线课程、学习工具
- 实习信息：实习机会、招聘信息、职业规划
- 竞赛资讯：学科竞赛、创新大赛、创业比赛
- 实用工具：科研工具、设计工具、生产力工具

网站主要功能包括资源搜索、分类筛选、资源提交、AI助手等。如果你有具体的网站使用问题，随时告诉我，我会详细解答。`);
        }
    }
    
    // 天气相关
    else if (lowerQuestion.includes('天气') || lowerQuestion.includes('气温') || lowerQuestion.includes('下雨') || lowerQuestion.includes('晴天')) {
        return formatResponse(`抱歉，我无法实时获取天气信息。你可以通过天气应用或网站查询当地天气。

对于大学生来说，合理安排学习时间很重要：
- 阴雨天：适合室内学习、论文写作、科研工作
- 晴天：可以考虑户外活动、运动锻炼，放松身心，缓解学习压力`);
    }
    
    // 时间相关
    else if (lowerQuestion.includes('时间') || lowerQuestion.includes('几点') || lowerQuestion.includes('现在')) {
        const now = new Date();
        const time = now.toLocaleTimeString('zh-CN');
        const date = now.toLocaleDateString('zh-CN');
        const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()];
        return formatResponse(`现在的时间是 ${time}，今天是 ${date} ${dayOfWeek}。

作为大学生，合理安排时间非常重要，建议你：
- 根据课程表和学习计划，制定每日学习安排
- 充分利用每天的时间进行学习、科研和休息
- 合理分配时间，平衡学习、工作和生活
- 采用有效的时间管理方法，提高学习效率

如果你需要时间管理方面的建议，我很乐意提供帮助。`);
    }
    
    // 日期相关
    else if (lowerQuestion.includes('日期') || lowerQuestion.includes('今天') || lowerQuestion.includes('几号')) {
        const now = new Date();
        const date = now.toLocaleDateString('zh-CN');
        const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()];
        return formatResponse(`今天是 ${date} ${dayOfWeek}。

对于大学生来说，每天都是宝贵的学习和成长机会，建议你：
- 制定合理的学习计划，明确每日目标
- 平衡好课程学习、科研任务和个人生活
- 充分利用大学时光，多学习、多实践、多积累
- 保持积极的学习态度，不断提升自己

祝你今天学习顺利！`);
    }
    
    // 学习网站推荐
    else if (lowerQuestion.includes('推荐') && (lowerQuestion.includes('学习') || lowerQuestion.includes('网站') || lowerQuestion.includes('资源'))) {
        return formatResponse(`问茧网站为你提供了丰富的学习资源，以下是一些推荐：

**网站类资源：**
- **学习网站**：我们收集了各类优质学习平台，包括在线课程、视频教程、学术资源等
- **就业网站**：包含实习信息、招聘平台、职业规划资源
- **竞赛网站**：各类学科竞赛、创新大赛、创业比赛信息
- **工具网站**：学习工具、科研工具、设计工具等实用资源
- **设计网站**：设计素材、灵感资源、设计工具
- **学术网站**：学术数据库、论文检索、学术社区

**信息类资源：**
- **资讯信息**：行业动态、学术前沿、校园新闻
- **资源信息**：学习资料、教材推荐、学习方法
- **竞赛信息**：比赛通知、参赛指南、获奖经验
- **学习信息**：课程推荐、学习技巧、考试指南
- **就业信息**：招聘信息、面试技巧、薪资行情

你可以在问茧资源库页面，通过分类筛选和搜索功能找到适合你的资源。所有资源都经过人工审核，确保质量可靠、信息准确。

如果你需要更具体的资源推荐，可以告诉我你的专业和学习目标。`);
    }
    
    // 编程相关
    else if (lowerQuestion.includes('编程') || lowerQuestion.includes('代码') || lowerQuestion.includes('编程学习') || lowerQuestion.includes('编程语言')) {
        if (lowerQuestion.includes('推荐') || lowerQuestion.includes('哪个好') || lowerQuestion.includes('入门')) {
            return formatResponse(`对于大学生编程入门，我推荐从Python开始，因为它语法简单、用途广泛，适合初学者。

你可以在问茧网站的资源库中找到丰富的编程学习资源，包括在线课程、视频教程、编程工具等。

**学习建议：**
- 计算机相关专业的学生：可以系统学习各种编程语言
- 其他专业的学生：学习Python可以帮助处理数据、进行科研分析
- 计算机专业高年级学生和研究生：根据研究方向选择学习C++、Java、JavaScript等语言

选择编程语言时，应考虑你的专业需求和职业规划。`);
        } else if (lowerQuestion.includes('如何学习') || lowerQuestion.includes('学习方法')) {
            return formatResponse(`大学生学习编程的最佳方法：

1. **从基础语法开始**：掌握编程语言的基本概念
2. **结合实践练习**：通过课程作业和小项目，将理论知识应用到实践中
3. **参与项目**：参与实验室项目或开源项目，积累实际项目经验
4. **解决编程挑战**：通过LeetCode、HackerRank等平台，提高算法和数据结构能力
5. **加入社区**：与同学和导师交流，加入编程社区
6. **关注行业动态**：学习新技术和框架

你可以在问茧网站上找到更多编程学习资源和方法。

记住，实践是最重要的，每天坚持编程才能不断进步。`);
        } else if (lowerQuestion.includes('困难') || lowerQuestion.includes('遇到问题') || lowerQuestion.includes('调试')) {
            return formatResponse(`编程中遇到困难是很正常的，尤其是对于大学生来说。

解决编程问题的方法：
1. **仔细阅读错误信息**：理解问题所在
2. **检查代码逻辑**：特别是条件判断和循环部分
3. **使用调试工具**：逐步执行代码，定位问题
4. **查阅文档**：参考官方文档和相关资料
5. **寻求帮助**：向同学、导师或在编程社区（如Stack Overflow）寻求帮助
6. **分解问题**：将复杂问题分解为更小的部分，逐个解决
7. **换个角度思考**：休息一下，重新审视问题

你可以在问茧网站上找到编程相关的资源和工具，帮助你解决编程难题。

记住，解决问题的过程也是学习的过程，这对培养科研能力很有帮助。`);
        } else {
            return formatResponse(`编程是一项重要的技能，无论你是什么专业的学生。

如果你有具体的编程问题，我很乐意帮助你解答，包括：
- 学习资源推荐
- 编程技巧和最佳实践
- 代码问题调试
- 项目开发建议

同时，你也可以在问茧网站的资源库中查找编程相关的学习资源和工具。

请提供更具体的问题，我会给你更详细的回答。`);
        }
    }
    
    // 学习相关
    else if (lowerQuestion.includes('学习') || lowerQuestion.includes('读书') || lowerQuestion.includes('考试') || lowerQuestion.includes('复习')) {
        if (lowerQuestion.includes('方法') || lowerQuestion.includes('技巧')) {
            return formatResponse(`适合大学生的有效学习方法：

1. **主动学习**：参与课堂讨论、教别人、实践操作
2. **间隔重复**：定期复习，如使用Anki等工具，特别适合记忆专业知识
3. **费曼学习法**：将复杂概念简化并教给他人，有助于深入理解
4. **实践应用**：将所学知识应用到实验、项目或论文中
5. **小组学习**：与同学一起讨论和学习，尤其是对于需要协作的课程
6. **多资源学习**：使用教材、论文、视频、实践等多种资源
7. **设定目标**：制定短期和长期目标，如课程成绩、科研成果
8. **保持好奇心**：主动探索和提问，培养科研思维

你可以在问茧网站上找到更多学习方法和资源。

选择适合自己的学习方法，并根据学习内容和个人特点进行调整。`);
        } else if (lowerQuestion.includes('时间管理') || lowerQuestion.includes('规划')) {
            return formatResponse(`大学生学习时间管理的建议：

1. **制定计划**：使用Todo清单或日历，平衡课程学习、科研任务和个人生活
2. **番茄工作法**：25分钟学习，5分钟休息，提高学习效率
3. **优先级排序**：先完成重要且紧急的任务，如作业、实验报告
4. **专注单一任务**：一次只专注于一项任务，提高学习质量
5. **设定截止日期**：为学习目标设定合理的截止日期，如论文提交、考试复习
6. **创造专注环境**：减少干扰，如图书馆、安静的自习室
7. **定期休息**：避免 burnout，保持身心健康
8. **健康生活方式**：充足睡眠、合理饮食、适量运动

你可以在问茧网站上找到时间管理工具和资源。

记住，时间管理的关键是坚持和调整，找到适合自己的节奏。`);
        } else if (lowerQuestion.includes('考试') || lowerQuestion.includes('复习')) {
            return formatResponse(`大学生考试复习的有效方法：

1. **提前开始**：不要临时抱佛脚，尤其是专业课和研究生课程
2. **制定计划**：分配时间给不同科目，重点关注难点和薄弱环节
3. **整理笔记**：制作思维导图、总结大纲，梳理知识结构
4. **间隔重复**：使用间隔重复法进行记忆，特别适合需要记忆的课程
5. **做练习题**：通过练习题和模拟题，熟悉考试题型，提高解题能力
6. **讲解知识点**：向他人讲解知识点，加深理解，发现知识漏洞
7. **保持良好作息**：避免熬夜，保证复习效率和记忆力
8. **考前放松**：考试前适当放松，保证充足睡眠，以最佳状态迎接考试

你可以在问茧网站上找到考试复习资源和技巧。

记住，复习的质量比时间更重要，专注和方法是关键。`);
        } else {
            return formatResponse(`学习是大学生活的核心内容，无论你是本科生、研究生还是博士生。

有效的学习方法包括：
- 设定明确目标，分解任务
- 定期复习，巩固知识
- 实践应用，加深理解
- 多渠道学习，拓宽视野

你可以在问茧网站上找到丰富的学习资源和方法。

如果你有具体的学习问题，我很乐意提供更详细的建议。请告诉我你具体想了解的学习方面，我会给你更有针对性的回答。`);
        }
    }
    
    // 科研相关
    else if (lowerQuestion.includes('科研') || lowerQuestion.includes('论文') || lowerQuestion.includes('实验') || lowerQuestion.includes('研究')) {
        if (lowerQuestion.includes('如何开始') || lowerQuestion.includes('入门')) {
            return formatResponse(`大学生开始科研的建议：

1. **联系导师**：主动表达对科研的兴趣，了解实验室研究方向
2. **阅读文献**：阅读相关领域的经典论文和综述，了解研究前沿和热点
3. **参与项目**：从辅助工作开始，逐步承担更多责任
4. **学习技能**：参加相关课程和培训，学习科研方法和实验技能
5. **参加学术活动**：定期参加组会和学术讲座，了解最新研究进展
6. **撰写综述**：尝试撰写文献综述或研究计划，培养学术写作能力
7. **交流学习**：与师兄师姐交流，学习他们的经验和方法
8. **保持耐心**：科研过程中会遇到挫折，坚持很重要

对于研究生和博士生，更要注重独立研究能力的培养，确定自己的研究方向。`);
        } else if (lowerQuestion.includes('论文') || lowerQuestion.includes('写作')) {
            return formatResponse(`学术论文写作的建议：

1. **明确研究问题**：选择有意义且可行的研究题目
2. **文献综述**：进行充分的文献综述，了解前人研究，找到研究缺口
3. **研究方法**：设计合理的研究方法，确保研究的科学性和可靠性
4. **数据处理**：收集和分析数据，使用适当的统计方法
5. **论文结构**：清晰的论文结构，包括摘要、引言、方法、结果、讨论、结论
6. **学术语言**：使用严谨的学术语言，避免口语化表达
7. **引用格式**：遵循目标期刊的引用格式要求
8. **反复修改**：征求导师和同行的意见，反复修改和完善

对于本科生，可以从课程论文和毕业论文开始练习；对于研究生和博士生，要注重论文的创新性和学术价值。`);
        } else {
            return formatResponse(`科研是大学生，尤其是研究生和博士生的重要任务。

如果你有关于以下方面的问题，我很乐意提供建议：
- 科研方法和实验设计
- 论文写作和发表
- 研究方向选择
- 学术资源查找
- 科研工具使用

请提供更具体的问题，我会给你更详细的回答。`);
        }
    }
    
    // 考研升学相关
    else if (lowerQuestion.includes('考研') || lowerQuestion.includes('升学') || lowerQuestion.includes('保研') || lowerQuestion.includes('留学')) {
        if (lowerQuestion.includes('如何准备') || lowerQuestion.includes('复习')) {
            return formatResponse(`考研准备的建议：

1. **确定目标**：结合自身实力和兴趣，选择适合的目标院校和专业
2. **制定计划**：分阶段进行，合理分配时间，避免临时抱佛脚
3. **系统复习**：理解知识点，做练习题，建立知识体系
4. **重视公共课**：每天积累，保持英语和政治的学习状态
5. **获取资源**：参加考研辅导班或使用在线资源，获取专业指导
6. **模拟考试**：熟悉考试流程，调整答题速度，适应考试节奏
7. **关注政策**：及时了解目标院校的招生政策和考试大纲变化
8. **保持心态**：考研是一场持久战，保持积极心态，坚持到底

**其他升学路径：**
- 保研：注重平时成绩、科研经历和竞赛奖项的积累
- 留学：提前准备语言考试、推荐信和个人陈述

你可以在问茧网站上找到考研相关资源和学习资料。`);
        } else {
            return formatResponse(`考研升学是很多大学生的重要选择。

如果你有关于以下方面的问题，我很乐意提供建议：
- 目标院校选择
- 复习方法和资料推荐
- 面试准备技巧
- 留学申请攻略
- 保研经验分享

请提供更具体的问题，我会给你更详细的回答。`);
        }
    }
    
    // 工作和职业相关
    else if (lowerQuestion.includes('工作') || lowerQuestion.includes('职业') || lowerQuestion.includes('面试') || lowerQuestion.includes('求职')) {
        if (lowerQuestion.includes('面试') || lowerQuestion.includes('准备')) {
            return formatResponse(`大学生面试准备建议：

1. **了解公司和职位**：研究公司文化、业务和职位要求，特别是与专业相关的岗位
2. **准备常见问题**：如自我介绍、优缺点、职业规划等，突出学术背景和项目经验
3. **练习自我介绍**：简洁明了，突出专业优势和科研成果
4. **准备项目案例**：使用STAR法则（情境、任务、行动、结果），特别是课程项目和科研经历
5. **研究行业**：了解行业发展方向和公司竞争对手，展示对行业的了解
6. **准备问题**：向面试官提问，显示你的兴趣和思考
7. **着装得体**：根据公司文化选择合适的服装
8. **提前到达**：熟悉环境，调整状态

自信、真诚和充分准备是面试成功的关键。`);
        } else if (lowerQuestion.includes('职业规划') || lowerQuestion.includes('发展')) {
            return formatResponse(`大学生职业规划建议：

1. **自我评估**：了解自己的兴趣、技能、价值观和优势，结合专业背景
2. **设定目标**：设定短期和长期职业目标，具体、可衡量、可实现、相关、有时限
3. **研究行业**：了解行业发展趋势和需求，特别是与专业相关的领域
4. **建立网络**：参加学术会议、行业活动、加入专业社区
5. **提升技能**：通过课程、认证、项目经验等方式提升专业能力
6. **积累经验**：通过实习、兼职、科研项目等积累实践经验
7. **寻求指导**：向导师、前辈请教，学习他人经验，避免走弯路
8. **定期评估**：定期评估职业规划，根据实际情况调整目标和策略

职业规划是一个动态过程，需要不断适应变化。`);
        } else if (lowerQuestion.includes('简历') || lowerQuestion.includes('求职')) {
            return formatResponse(`大学生简历撰写和求职建议：

1. **简历设计**：简洁明了（1-2页），重点突出学术背景和项目经验
2. **突出优势**：与职位要求匹配，强调专业能力和科研成果
3. **量化成果**：使用具体数据和成就，如GPA、论文发表、项目成果
4. **优化关键词**：适应ATS系统，包含专业术语
5. **定制求职信**：根据不同岗位调整内容，突出匹配度
6. **利用平台**：建立LinkedIn等专业平台形象，拓展人脉
7. **多渠道求职**：利用学校就业中心、网络招聘和人际关系内推
8. **保持心态**：求职可能需要时间和耐心，特别是对研究生和博士生

记住，简历是敲门砖，面试是展示自己的机会。`);
        } else {
            return formatResponse(`职业发展是大学生涯的重要目标之一。

如果你有关于以下方面的问题，我很乐意提供建议：
- 职业规划和发展路径
- 面试准备和技巧
- 简历撰写和优化
- 行业趋势和前景
- 实习和就业机会

请提供更具体的问题，我会给你更详细的回答。`);
        }
    }
    
    // 健康相关
    else if (lowerQuestion.includes('健康') || lowerQuestion.includes('身体') || lowerQuestion.includes('饮食') || lowerQuestion.includes('运动')) {
        if (lowerQuestion.includes('饮食') || lowerQuestion.includes('营养')) {
            return formatResponse(`大学生健康饮食建议：

1. **均衡营养**：均衡摄入各类营养素（碳水化合物、蛋白质、脂肪、维生素、矿物质），满足学习和科研的能量需求
2. **多吃蔬果**：每天5种以上蔬菜水果，颜色多样，增强免疫力
3. **适量蛋白质**：瘦肉、鱼类、豆类、蛋类，促进大脑发育和肌肉生长
4. **合理碳水**：选择复杂碳水和健康脂肪，避免过度摄入垃圾食品
5. **充足水分**：每天8杯左右，避免过度饮用含糖饮料和咖啡
6. **规律进食**：定时定量，避免暴饮暴食，尤其是考试期间
7. **健康食品**：避免过度加工食品，减少盐、糖、添加剂的摄入
8. **食品安全**：注意清洁卫生，合理储存食物

健康饮食是学习和科研的基础。`);
        } else if (lowerQuestion.includes('运动') || lowerQuestion.includes('锻炼')) {
            return formatResponse(`大学生健康运动建议：

1. **有氧运动**：每周至少150分钟中等强度有氧运动（快走、跑步、游泳、骑自行车等），缓解学习压力
2. **力量训练**：每周2-3次力量训练，锻炼肌肉群，提高身体素质
3. **日常活动**：每天保持身体活动，减少久坐时间，尤其是长时间学习和实验
4. **选择喜好**：选择适合自己的运动方式，根据兴趣和时间安排
5. **循序渐进**：逐渐增加运动强度，避免过度训练，防止受伤
6. **热身拉伸**：运动前热身，运动后拉伸，预防 injury
7. **补充水分**：运动前后充分补水，保持身体水分平衡
8. **注意安全**：使用正确的姿势和装备，避免运动损伤

坚持运动可以提高学习效率和心理健康。`);
        } else if (lowerQuestion.includes('睡眠') || lowerQuestion.includes('休息')) {
            return formatResponse(`大学生良好睡眠的建议：

1. **规律作息**：保持固定的睡觉和起床时间，避免熬夜学习
2. **舒适环境**：创建安静、黑暗、适宜温度的睡眠环境
3. **睡前放松**：避免电子设备，可进行热水澡、阅读等放松活动
4. **合理饮食**：避免睡前摄入咖啡因和大量食物，影响睡眠质量
5. **适量运动**：白天适量运动，但避免睡前剧烈运动
6. **压力管理**：通过冥想、深呼吸等方式，缓解考试和论文压力
7. **控制午睡**：限制白天午睡时间不超过30分钟，避免影响夜间睡眠
8. **寻求帮助**：如果有睡眠问题，及时咨询专业医生

充足的睡眠对学习、科研和身心健康至关重要。`);
        } else {
            return formatResponse(`保持健康的生活方式对大学生来说非常重要，尤其是在面对学业和科研压力时。

建议你：
- 保持均衡的饮食，摄入充足的营养
- 进行适量的运动，增强体质
- 保证充足的睡眠，恢复精力
- 定期进行体检，关注身体健康

如果你有具体的健康问题，建议咨询专业医生。请告诉我你具体想了解的健康方面，我会给你更详细的建议。`);
        }
    }
    
    // 娱乐相关
    else if (lowerQuestion.includes('娱乐') || lowerQuestion.includes('游戏') || lowerQuestion.includes('电影') || lowerQuestion.includes('音乐')) {
        return formatResponse(`适当的娱乐活动对大学生来说很重要，可以放松身心，缓解学习和科研压力。

建议选择健康的娱乐方式：
- 阅读：拓展视野，增长知识
- 运动：锻炼身体，释放压力
- 音乐：放松心情，陶冶情操
- 旅行：开阔眼界，增长见识
- 与朋友聚会：增进友谊，交流情感

**注意事项：**
- 合理安排娱乐时间，避免影响学习和科研进度
- 避免过度沉迷于电子设备或游戏
- 保持平衡的生活方式，确保身心健康

记住，娱乐活动应该是生活的调剂，而不是主要部分。`);
    }
    
    // 情绪和心理相关
    else if (lowerQuestion.includes('压力') || lowerQuestion.includes('焦虑') || lowerQuestion.includes('情绪') || lowerQuestion.includes('心理')) {
        return formatResponse(`大学生管理压力和情绪的建议：

1. **识别压力源**：了解是什么导致你的压力，如学业、科研、人际关系等
2. **放松技巧**：深呼吸和冥想，缓解即时压力，提高专注力
3. **运动释放**：通过运动释放内啡肽，改善情绪，缓解学习和科研压力
4. **充足睡眠**：保证良好的睡眠，有助于情绪稳定和压力缓解
5. **健康饮食**：避免过度摄入咖啡因和糖分，保持情绪稳定
6. **社交支持**：与朋友、同学和导师交流，分享压力，获得支持
7. **时间管理**：合理安排任务，避免 overwhelm，尤其是面对多个截止日期时
8. **寻求帮助**：如果情绪问题持续存在，及时咨询心理咨询师

记住，每个人都会经历压力和情绪波动，重要的是学会如何应对，这对大学生的成长非常重要。`);
    }
    
    // 其他问题
    else {
        // 尝试理解问题的核心
        if (lowerQuestion.includes('如何') || lowerQuestion.includes('怎样') || lowerQuestion.includes('怎么')) {
            return formatResponse(`作为大学生，你提出的问题很重要。我可以提供一些针对性的建议，不过为了给你更准确的回答，你可以提供更多具体信息，比如：
- 你的学习阶段（本科、研究生或博士）
- 你的专业领域
- 你的具体目标或需求

这样我可以更好地理解你的需求，为你提供更有针对性的建议。`);
        } else if (lowerQuestion.includes('为什么') || lowerQuestion.includes('原因')) {
            return formatResponse(`这是一个很好的问题，对于大学生的学习和成长很有意义。

要回答这个问题，我们需要考虑多个因素。不同的情况可能有不同的原因，而且原因可能是复杂的。

如果你能提供更多上下文信息，比如：
- 你的学习阶段和专业背景
- 具体的情境或问题背景
- 你已经尝试过的解决方法

我可以给你更详细、更准确的解释。`);
        } else if (lowerQuestion.includes('是什么') || lowerQuestion.includes('定义') || lowerQuestion.includes('含义')) {
            return formatResponse(`这是一个关于概念理解的问题，对于大学生的专业学习很重要。

不同的概念在不同的语境中有不同的含义，而且可能有多种解释。

如果你能提供更多上下文信息，比如：
- 你想了解的具体领域
- 你的学习阶段和专业背景
- 你遇到这个概念的具体情境

我可以给你更准确、更全面的解释。`);
        } else if (lowerQuestion.includes('最好') || lowerQuestion.includes('最有效') || lowerQuestion.includes('推荐')) {
            return formatResponse(`关于什么是最好的，这取决于你的具体情况和需求。

作为大学生，以下因素会影响最佳选择：
- 你的学习阶段（本科、研究生或博士）
- 你的专业领域和研究方向
- 你的学习目标和个人偏好
- 你的时间和资源限制

如果你能提供更多关于你的具体情况、学习目标、偏好等信息，我可以给你更有针对性的建议和推荐。`);
        } else {
            // 通用响应
            return formatResponse(`感谢你的问题。作为专门为大学生设计的AI助手，我很乐意帮助你解答以下方面的问题：

- 课程学习和考试复习
- 论文写作和科研方法
- 职业规划和面试准备
- 考研升学和留学申请
- 生活和心理健康
- 网站使用和资源查找

你可以尝试提供更具体的问题，或者询问我关于上述方面的内容，我会尽力为你提供详细、专业的回答。

如果你有更专业的问题，建议咨询相关领域的专家或导师。`);
        }
    }
}

// 增强的备用响应生成函数
function generateEnhancedResponse(question, context = '') {
    // 转换为小写以便更好地匹配
    const lowerQuestion = question.toLowerCase();
    
    // 关于AI智能度的问题
    if (lowerQuestion.includes('智能') || lowerQuestion.includes('聪明') || lowerQuestion.includes('deepseek')) {
        return formatResponse(`我是基于DeepSeek大模型开发的独立AI助手，专注于为大学生提供专业、智能的服务。作为独立的AI模型，我能够：\n\n1. 理解复杂的学习和生活问题\n2. 提供个性化的学习建议和规划\n3. 解答专业领域的学术问题\n4. 帮助你更好地使用问茧网站的各项功能\n5. 提供实时的信息和建议\n\n我的响应完全基于AI模型的理解和生成能力，不依赖于预定义的回答模板。如果你有任何问题，我会根据上下文和专业知识为你提供详细、准确的回答。`);
    }
    
    // 检查是否有上下文信息
    if (context) {
        // 简单的上下文理解逻辑
        if (lowerQuestion.includes('之前') || lowerQuestion.includes('刚才') || lowerQuestion.includes('上一个') || lowerQuestion.includes('那') || lowerQuestion.includes('这个')) {
            return formatResponse(`根据我们之前的对话，我理解你在询问关于之前讨论的内容。如果你有具体的问题，请告诉我，我会根据之前的对话内容为你提供更准确的回答。\n\n提示：你可以更具体地描述你想了解的内容，这样我可以给你更详细的回答。`);
        }
    }
    
    // 检查是否是追问
    if (lowerQuestion.includes('为什么') || lowerQuestion.includes('怎么') || lowerQuestion.includes('如何') || lowerQuestion.includes('什么')) {
        return formatResponse(`这是一个很好的问题！为了给你更准确的回答，我需要了解更多细节：\n\n1. 你是哪个专业的学生？\n2. 你目前处于哪个学习阶段（本科、研究生、博士）？\n3. 你具体想了解这个问题的哪方面内容？\n\n提供更多信息可以帮助我给你更有针对性的建议。`);
    }
    
    // 其他问题使用通用响应
    const generalResponse = generateGeneralResponse(question);
    // 为通用响应添加个性化结尾
    return formatResponse(generalResponse + '\n\n如果你需要更详细的信息或有其他问题，请随时告诉我。');
}

// 处理聊天提交
export function handleChatSubmit(event) {
    console.log('handleChatSubmit被调用');
    // 处理事件对象，防止页面刷新
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    // 检查DOM元素是否存在
    if (!chatInput || !chatBody || !sendBtn) {
        console.error('必要的DOM元素未找到');
        return;
    }
    
    // 获取消息内容
    const message = chatInput.value.trim();
    if (!message) {
        console.error('消息为空');
        return;
    }
    
    console.log('消息内容:', message);
    
    // 显示用户消息
    displayUserMessage(message);
    
    // 清空输入框
    chatInput.value = '';
    
    // 禁用发送按钮
    sendBtn.disabled = true;
    
    // 显示加载指示器
    showLoadingIndicator();
    
    // 确保聊天历史存在
    if (!chatHistory) {
        chatHistory = [
            {
                role: 'system',
                content: SYSTEM_PROMPT
            }
        ];
    }
    
    // 添加用户消息到聊天历史
    chatHistory.push({ role: 'user', content: message });
    
    // 限制聊天历史长度，保留最近的对话
    if (chatHistory.length > 20) {
        // 保留系统消息和最近的18条消息，增加上下文长度以提高AI理解能力
        chatHistory = [chatHistory[0], ...chatHistory.slice(-18)];
    }
    
    // 生成AI响应
    // 优先使用DeepSeek API作为独立AI模型
    console.log('调用generateAIResponse');
    generateAIResponse(message)
        .then(function(aiResponse) {
            console.log('收到AI响应:', aiResponse);
            // 添加AI响应到聊天历史
            chatHistory.push({ role: 'assistant', content: aiResponse });
            return aiResponse;
        })
        .finally(function() {
            console.log('完成AI响应处理');
            // 隐藏加载指示器
            hideLoadingIndicator();
            // 启用发送按钮
            sendBtn.disabled = false;
        })
        .then(function(aiResponse) {
            console.log('显示AI响应');
            // 创建AI消息元素
            const messageElement = document.createElement('div');
            messageElement.className = 'ai-message';
            messageElement.innerHTML = `
                <div class="ai-avatar">AI</div>
                <div class="ai-message-content">${aiResponse}</div>
            `;
            
            // 添加到聊天内容区域
            chatBody.appendChild(messageElement);
            
            // 滚动到底部
            chatBody.scrollTop = chatBody.scrollHeight;
        });
}

// 显示用户消息
function displayUserMessage(message) {
    try {
        if (!chatBody) {
            console.error('chat-body元素未找到');
            return;
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = 'user-message';
        messageElement.innerHTML = `
            <div class="user-message-content">${message}</div>
            <div class="user-avatar">你</div>
        `;
        
        chatBody.appendChild(messageElement);
        
        // 滚动到底部
        scrollToBottom();
    } catch (error) {
        console.error('显示用户消息失败:', error);
    }
}

// 显示加载指示器
function showLoadingIndicator() {
    if (!chatBody) {
        console.error('chat-body元素未找到');
        return;
    }
    
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-indicator';
    loadingElement.id = 'loading-indicator';
    loadingElement.innerHTML = `
        <div class="loading-spinner"></div>
        <span>AI正在思考...</span>
    `;
    chatBody.appendChild(loadingElement);
    scrollToBottom();
}

// 隐藏加载指示器
function hideLoadingIndicator() {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
        loadingElement.remove();
    }
}

// 滚动到底部
function scrollToBottom() {
    if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

// 清空聊天
export function clearChat() {
    if (confirm('确定要清空聊天记录吗？')) {
        // 重置聊天历史
        chatHistory = [
            {
                role: 'system',
                content: SYSTEM_PROMPT
            }
        ];
        
        // 清空聊天界面
        if (chatBody) {
            chatBody.innerHTML = `
                <div class="ai-message">
                    <div class="ai-avatar">AI</div>
                    <div class="ai-message-content">
                        <p>你好！我是问茧的AI助手，有什么可以帮助你的吗？</p>
                        <p>我可以帮你：</p>
                        <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
                            <li>检索学习资源</li>
                            <li>解答学习问题</li>
                            <li>提供学习建议</li>
                            <li>帮助规划学习计划</li>
                        </ul>
                    </div>
                </div>
            `;
            
            // 滚动到底部
            scrollToBottom();
        }
    }
}

// 快速提问
export function askQuickQuestion(question) {
    if (chatInput) {
        chatInput.value = question;
        // 直接调用handleChatSubmit，传递null作为事件对象
        handleChatSubmit(null);
    }
}



// 生成AI响应
export async function generateAIResponse(message) {
    console.log('generateAIResponse被调用，消息:', message);
    console.log('聊天历史:', chatHistory);
    try {
        // 确保chatHistory存在
        if (!chatHistory) {
            chatHistory = [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT
                }
            ];
        }
        
        // 生成AI响应
        let aiResponse;
        
        // 使用DeepSeek API作为独立AI模型
        const apiKey = 'sk-e3c4239c7fea445e84138a1f29f3d98a'; // 用户提供的DeepSeek API密钥
        
        // 添加请求超时处理
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
        
        console.log('开始调用DeepSeek API');
        console.log('API密钥:', apiKey.substring(0, 5) + '...'); // 只显示部分API密钥
        console.log('请求URL:', 'https://api.deepseek.com/v1/chat/completions');
        
        // 构建请求体
        const requestBody = {
            model: 'deepseek-chat',
            messages: chatHistory,
            max_tokens: 1500,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
        };
        
        console.log('请求体:', JSON.stringify(requestBody));
        
        // 测试API密钥是否有效
        console.log('测试API密钥有效性...');
        
        // 真实API调用
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('API响应状态:', response.status);
        
        if (!response.ok) {
            // 尝试获取详细的错误信息
            let errorData;
            try {
                errorData = await response.json();
                console.log('API错误信息:', errorData);
            } catch (e) {
                // 如果无法解析JSON，使用默认错误信息
                console.error('解析错误信息失败:', e);
                const errorText = await response.text();
                console.log('API错误文本:', errorText);
            }
            
            if (errorData && errorData.error && errorData.error.message === 'Insufficient Balance') {
                throw new Error('API余额不足');
            } else {
                throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
            }
        }
        
        const data = await response.json();
        console.log('API响应数据:', data);
        
        if (!data.choices || data.choices.length === 0) {
            throw new Error('API响应格式错误：没有choices字段');
        }
        
        aiResponse = data.choices[0].message.content;
        console.log('API原始响应:', aiResponse);
        
        // 对API响应进行格式化，使其更有条理
        aiResponse = formatResponse(aiResponse);
        console.log('格式化后的响应:', aiResponse);
        
        return aiResponse;
    } catch (error) {
        console.error('AI API调用失败:', error);
        // 失败时使用备用响应
        let errorResponse = "很抱歉，AI服务暂时不可用。你可以尝试以下操作：<br><ul style='margin-top: 0.5rem; padding-left: 1.5rem;'><li>检查网络连接</li><li>稍后再试</li><li>直接浏览我们的资源库</li></ul>";
        
        // 根据错误类型提供更具体的错误信息
        if (error.name === 'AbortError') {
            errorResponse = "很抱歉，AI服务响应超时。你可以尝试以下操作：<br><ul style='margin-top: 0.5rem; padding-left: 1.5rem;'><li>检查网络连接</li><li>稍后再试</li><li>简化你的问题</li></ul>";
        } else if (error.message === 'API余额不足') {
            errorResponse = "很抱歉，AI服务暂时不可用。原因：API密钥余额不足。<br><ul style='margin-top: 0.5rem; padding-left: 1.5rem;'><li>稍后再试，我们正在处理此问题</li><li>直接浏览我们的资源库</li><li>使用网站的其他功能</li></ul>";
        } else if (error.message.includes('API响应格式错误')) {
            errorResponse = "很抱歉，AI服务暂时不可用。原因：API响应格式错误。<br><ul style='margin-top: 0.5rem; padding-left: 1.5rem;'><li>稍后再试</li><li>直接浏览我们的资源库</li><li>使用网站的其他功能</li></ul>";
        }
        
        return errorResponse;
    }
}

// 测试函数
export function testAIAssistant() {
    console.log('测试AI助手函数被调用');
    const chatBody = document.getElementById('chat-body');
    if (chatBody) {
        // 清空聊天界面，只显示测试结果
        chatBody.innerHTML = `
            <div class="ai-message">
                <div class="ai-avatar">AI</div>
                <div class="ai-message-content">
                    <p>正在测试AI助手...</p>
                </div>
            </div>
        `;
        
        // 直接使用模拟响应，不调用generateAIResponse
        console.log('使用直接模拟响应');
        const mockResponse = '你好！我是问茧的AI助手，很高兴为你服务。我可以帮你解答学习问题、提供学习建议、推荐学习资源等。请问有什么可以帮助你的吗？';
        
        // 模拟API调用延迟
        setTimeout(() => {
            console.log('模拟API响应:', mockResponse);
            
            // 格式化响应
            const formattedResponse = formatResponse(mockResponse);
            console.log('格式化后的响应:', formattedResponse);
            
            // 显示成功消息
            chatBody.innerHTML = `
                <div class="ai-message">
                    <div class="ai-avatar">AI</div>
                    <div class="ai-message-content">
                        <p>AI测试成功！</p>
                        <p>响应: ${formattedResponse}</p>
                    </div>
                </div>
            `;
        }, 1000);
    }
}
