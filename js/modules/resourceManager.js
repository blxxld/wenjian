// ==================== 资源数据管理模块 ====================
import { StorageUtil } from './utils.js';

export const ResourceManager = {
    resources: [],
    cacheExpiry: 3600000, // 缓存过期时间：1小时
    
    async loadResources() {
        try {
            // 尝试从缓存加载
            const cachedData = this.getCachedResources();
            if (cachedData) {
                console.log('从缓存加载资源数据，共', cachedData.length, '条资源');
                this.resources = cachedData;
                return this.resources;
            }
            
            // 缓存不存在或已过期，从网络加载
            console.log('开始从网络加载资源数据...');
            const startTime = performance.now();
            
            const response = await fetch('js/resources.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.resources = await response.json();
            const endTime = performance.now();
            console.log('从网络加载资源数据完成，共', this.resources.length, '条资源，耗时:', (endTime - startTime).toFixed(2), 'ms');
            
            // 缓存数据
            this.cacheResources(this.resources);
            
            return this.resources;
        } catch (error) {
            console.error('加载资源数据失败:', error);
            // 尝试使用备用数据
            this.resources = this.getFallbackResources();
            console.log('使用备用资源数据，共', this.resources.length, '条资源');
            return this.resources;
        }
    },
    
    // 备用资源数据，当网络加载失败时使用
    getFallbackResources() {
        return [
            {id:1, title:"清华大学公开课", category:"website", subCategory:"learning", description:"清华大学推出的在线教育平台，提供丰富的免费公开课程", url:"https://www.xuetangx.com", rating:5, free:true, grade:"all", tags:["公开课","免费","学习","清华"]},
            {id:2, title:"实习僧", category:"website", subCategory:"career", description:"专注大学生实习的招聘平台，提供大量实习机会", url:"https://www.shixiseng.com", rating:4, free:true, grade:"sophomore+", tags:["实习","招聘","求职"]},
            {id:3, title:"菜鸟教程", category:"website", subCategory:"learning", description:"编程入门学习网站，涵盖多种编程语言和技术", url:"https://www.runoob.com", rating:5, free:true, grade:"all", tags:["编程","教程","学习"]},
            {id:4, title:"全国大学生竞赛信息网", category:"website", subCategory:"competition", description:"官方竞赛信息发布平台，涵盖各类学科竞赛", url:"http://www.chinasaikr.com", rating:4, free:true, grade:"all", tags:["竞赛","比赛","学术"]},
            {id:5, title:"Canva可画", category:"website", subCategory:"design", description:"在线设计工具，适合制作海报、简历、PPT等", url:"https://www.canva.cn", rating:5, free:true, grade:"all", tags:["设计","工具","免费"]},
            {id:6, title:"中国大学MOOC", category:"website", subCategory:"learning", description:"国内优质的中文MOOC学习平台", url:"https://www.icourse163.org", rating:5, free:true, grade:"all", tags:["公开课","学习","MOOC"]}
        ];
    },
    
    getResources() {
        return this.resources;
    },
    
    getHotResources(limit = 6) {
        return [...this.resources]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    },
    
    getResourceById(id) {
        return this.resources.find(resource => resource.id == id);
    },
    
    // 缓存资源数据
    cacheResources(resources) {
        const cacheData = {
            data: resources,
            timestamp: Date.now()
        };
        StorageUtil.set('cachedResources', cacheData);
    },
    
    // 获取缓存的资源数据
    getCachedResources() {
        const cacheData = StorageUtil.get('cachedResources');
        if (!cacheData) return null;
        
        const { data, timestamp } = cacheData;
        const now = Date.now();
        
        // 检查缓存是否过期
        if (now - timestamp < this.cacheExpiry) {
            return data;
        }
        
        // 缓存过期，清除缓存
        StorageUtil.remove('cachedResources');
        return null;
    },
    
    // 清除缓存
    clearCache() {
        StorageUtil.remove('cachedResources');
        console.log('资源缓存已清除');
    },
    
    // 强制刷新资源数据
    async refreshResources() {
        this.clearCache();
        return await this.loadResources();
    }
};
