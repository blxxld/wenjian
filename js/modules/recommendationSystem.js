// ==================== 推荐系统模块 ====================

import { StorageUtil } from './utils.js';
import { ResourceManager } from './resourceManager.js';

export const RecommendationSystem = {
    init() {
        this.loadUserPreferences();
        this.setupUserPreferencesForm();
    },
    
    userPreferences: {
        major: '',
        grade: '',
        interests: []
    },
    
    loadUserPreferences() {
        const savedPreferences = StorageUtil.get('userPreferences', {});
        this.userPreferences = {
            major: savedPreferences.major || '',
            grade: savedPreferences.grade || '',
            interests: savedPreferences.interests || []
        };
    },
    
    setupUserPreferencesForm() {
        // 绑定用户偏好设置表单提交
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'preferences-form') {
                e.preventDefault();
                this.saveUserPreferences(e.target);
            }
        });
    },
    
    saveUserPreferences(form) {
        const major = form.major.value;
        const grade = form.grade.value;
        const interests = Array.from(form.querySelectorAll('input[name="interests"]:checked')).map(input => input.value);
        
        this.userPreferences = {
            major,
            grade,
            interests
        };
        
        StorageUtil.set('userPreferences', this.userPreferences);
        
        // 显示保存成功提示
        this.showSaveSuccess();
        
        console.log('用户偏好保存成功:', this.userPreferences);
    },
    
    showSaveSuccess() {
        const successHTML = `
            <div class="preferences-success">
                <div class="preferences-success-content">
                    <i class="fas fa-check-circle"></i>
                    <h4>保存成功</h4>
                    <p>您的偏好设置已保存，我们将为您推荐更适合的资源！</p>
                    <button class="btn btn-primary" id="close-preferences-success">确定</button>
                </div>
            </div>
        `;
        
        // 移除已存在的成功提示
        const existingSuccess = document.querySelector('.preferences-success');
        if (existingSuccess) {
            existingSuccess.remove();
        }
        
        // 添加成功提示
        document.body.insertAdjacentHTML('beforeend', successHTML);
        
        // 绑定关闭按钮
        document.getElementById('close-preferences-success').addEventListener('click', () => {
            document.querySelector('.preferences-success').remove();
        });
        
        // 3秒后自动关闭
        setTimeout(() => {
            const success = document.querySelector('.preferences-success');
            if (success) {
                success.remove();
            }
        }, 3000);
    },
    
    // 获取个性化推荐资源
    getRecommendedResources(limit = 6) {
        const allResources = ResourceManager.getResources();
        const scoredResources = allResources.map(resource => {
            const score = this.calculateResourceScore(resource);
            return { ...resource, recommendationScore: score };
        });
        
        // 按推荐分数排序，取前N个
        return scoredResources
            .sort((a, b) => b.recommendationScore - a.recommendationScore)
            .slice(0, limit);
    },
    
    // 计算资源推荐分数
    calculateResourceScore(resource) {
        let score = 0;
        
        // 基础分数
        score += 50;
        
        // 年级匹配分数
        if (this.userPreferences.grade) {
            if (resource.grade === this.userPreferences.grade || resource.grade === 'all') {
                score += 30;
            } else if (this.isGradeCompatible(this.userPreferences.grade, resource.grade)) {
                score += 15;
            }
        }
        
        // 专业匹配分数
        if (this.userPreferences.major) {
            // 检查资源标签是否包含专业相关关键词
            const majorKeywords = this.getMajorKeywords(this.userPreferences.major);
            const resourceTags = Array.isArray(resource.tags) ? resource.tags : [resource.tags];
            
            majorKeywords.forEach(keyword => {
                if (resourceTags.some(tag => {
                    const tagText = Array.isArray(tag) ? tag.join('') : tag;
                    return tagText.toLowerCase().includes(keyword.toLowerCase());
                })) {
                    score += 20;
                }
            });
            
            // 检查资源标题和描述
            if (resource.title.toLowerCase().includes(this.userPreferences.major.toLowerCase()) ||
                resource.description.toLowerCase().includes(this.userPreferences.major.toLowerCase())) {
                score += 10;
            }
        }
        
        // 兴趣匹配分数
        if (this.userPreferences.interests.length > 0) {
            const resourceTags = Array.isArray(resource.tags) ? resource.tags : [resource.tags];
            
            this.userPreferences.interests.forEach(interest => {
                if (resourceTags.some(tag => {
                    const tagText = Array.isArray(tag) ? tag.join('') : tag;
                    return tagText.toLowerCase().includes(interest.toLowerCase());
                })) {
                    score += 15;
                }
            });
        }
        
        // 资源评分和热度加分
        score += (resource.rating || 0) * 5;
        score += (resource.views || 0) / 10;
        
        return score;
    },
    
    // 检查年级兼容性
    isGradeCompatible(userGrade, resourceGrade) {
        const gradeOrder = ['freshman', 'sophomore', 'junior', 'senior', 'graduate'];
        const userGradeIndex = gradeOrder.indexOf(userGrade);
        const resourceGradeIndex = gradeOrder.indexOf(resourceGrade);
        
        // 检查是否是复合年级（如 sophomore+）
        if (resourceGrade.endsWith('+')) {
            const baseGrade = resourceGrade.replace('+', '');
            const baseGradeIndex = gradeOrder.indexOf(baseGrade);
            return userGradeIndex >= baseGradeIndex;
        }
        
        return false;
    },
    
    // 获取专业相关关键词
    getMajorKeywords(major) {
        const majorKeywordsMap = {
            '计算机科学': ['编程', '代码', '算法', '软件', '计算机', '前端', '后端', '数据库', '人工智能', 'AI', '机器学习', '网络', '安全'],
            '电子工程': ['电子', '电路', '通信', '信号', '硬件', '嵌入式', '芯片', '自动化'],
            '机械工程': ['机械', '力学', '设计', '制造', 'CAD', 'CAM', '机器人'],
            '土木工程': ['建筑', '结构', '施工', '材料', '环境', '测绘'],
            '化学工程': ['化学', '化工', '材料', '反应', '工艺', '分析'],
            '生物工程': ['生物', '医学', '基因', '细胞', '实验', '制药'],
            '经济学': ['经济', '金融', '市场', '贸易', '投资', '财务', '会计'],
            '管理学': ['管理', '企业', '组织', '运营', '营销', '人力资源'],
            '法学': ['法律', '法规', '案例', '司法', '诉讼', '合同'],
            '教育学': ['教育', '教学', '课程', '学生', '教师', '心理'],
            '文学': ['文学', '语言', '写作', '阅读', '诗歌', '散文'],
            '历史': ['历史', '考古', '文物', '文化', '博物馆'],
            '哲学': ['哲学', '逻辑', '伦理', '思想', '宗教'],
            '艺术': ['艺术', '设计', '音乐', '美术', '表演', '创意'],
            '体育': ['体育', '运动', '健身', '竞技', '健康']
        };
        
        return majorKeywordsMap[major] || [];
    },
    
    // 获取热门资源（基于浏览量和评分）
    getHotResources(limit = 6) {
        const allResources = ResourceManager.getResources();
        const hotResources = allResources.map(resource => {
            const hotScore = (resource.views || 0) + (resource.rating || 0) * 10;
            return { ...resource, hotScore };
        });
        
        return hotResources
            .sort((a, b) => b.hotScore - a.hotScore)
            .slice(0, limit);
    },
    
    // 获取最新资源
    getLatestResources(limit = 6) {
        const allResources = ResourceManager.getResources();
        return allResources
            .sort((a, b) => b.id - a.id) // 假设id越大越新
            .slice(0, limit);
    },
    
    // 获取相似资源
    getSimilarResources(resourceId, limit = 4) {
        const allResources = ResourceManager.getResources();
        const targetResource = allResources.find(r => r.id == resourceId);
        
        if (!targetResource) return [];
        
        const similarResources = allResources
            .filter(r => r.id != resourceId)
            .map(resource => {
                const similarity = this.calculateSimilarity(targetResource, resource);
                return { ...resource, similarity };
            });
        
        return similarResources
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    },
    
    // 计算资源相似度
    calculateSimilarity(resource1, resource2) {
        let similarity = 0;
        
        // 分类相同
        if (resource1.category === resource2.category) {
            similarity += 30;
        }
        
        // 年级相同
        if (resource1.grade === resource2.grade) {
            similarity += 20;
        }
        
        // 标签相似度
        const tags1 = new Set(Array.isArray(resource1.tags) ? resource1.tags : [resource1.tags]);
        const tags2 = new Set(Array.isArray(resource2.tags) ? resource2.tags : [resource2.tags]);
        const commonTags = new Set([...tags1].filter(tag => tags2.has(tag)));
        similarity += commonTags.size * 10;
        
        // 标题和描述相似度（简单实现）
        const titleSimilarity = this.calculateStringSimilarity(resource1.title, resource2.title);
        const descSimilarity = this.calculateStringSimilarity(resource1.description, resource2.description);
        similarity += (titleSimilarity + descSimilarity) * 10;
        
        return similarity;
    },
    
    // 计算字符串相似度（简单实现）
    calculateStringSimilarity(str1, str2) {
        const words1 = str1.toLowerCase().split(/\s+/);
        const words2 = str2.toLowerCase().split(/\s+/);
        const commonWords = words1.filter(word => words2.includes(word));
        return commonWords.length / Math.max(words1.length, words2.length);
    },
    
    // 获取用户偏好设置
    getUserPreferences() {
        return this.userPreferences;
    }
};
