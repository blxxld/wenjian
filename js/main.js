// ==================== 工具函数 ====================

// 本地存储工具
const StorageUtil = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('读取本地存储失败:', error);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('写入本地存储失败:', error);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('删除本地存储失败:', error);
            return false;
        }
    }
};

// DOM工具
const DOMUtil = {
    on(element, event, callback) {
        if (element) {
            element.addEventListener(event, callback);
        }
    },
    
    off(element, event, callback) {
        if (element) {
            element.removeEventListener(event, callback);
        }
    },
    
    $(selector, context = document) {
        return context.querySelector(selector);
    },
    
    $$(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    },
    
    createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        if (options.className) {
            element.className = options.className;
        }
        
        if (options.innerHTML) {
            element.innerHTML = options.innerHTML;
        }
        
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        return element;
    }
};

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ==================== 模块化JavaScript代码 ====================

// 资源数据管理模块
const ResourceManager = {
    resources: [],
    
    async loadResources() {
        try {
            const response = await fetch('js/resources.json');
            this.resources = await response.json();
            console.log('资源数据加载成功，共', this.resources.length, '条资源');
            return this.resources;
        } catch (error) {
            console.error('加载资源数据失败:', error);
            this.resources = [];
            return this.resources;
        }
    },
    
    getResources() {
        return this.resources;
    },
    
    getHotResources(limit = 6) {
        return [...this.resources]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    }
};

// 分类和年级映射
const Constants = {
    // 主分类
    categoryMap: {
        'all': '全部',
        'website': '网站类',
        'information': '信息类'
    },
    
    // 子分类
    subCategoryMap: {
        'website': {
            'learning': '学习网站',
            'career': '就业网站',
            'competition': '竞赛网站',
            'tool': '工具网站',
            'design': '设计网站',
            'academic': '学术网站',
            'other': '其他网站'
        },
        'information': {
            'news': '资讯信息',
            'resource': '资源信息',
            'competition': '竞赛信息',
            'learning': '学习信息',
            'career': '就业信息',
            'other': '其他信息'
        }
    },
    
    gradeMap: {
        'all': '全部',
        'freshman': '大一',
        'sophomore': '大二',
        'junior': '大三',
        'senior': '大四',
        'graduate': '研究生',
        'sophomore+': '大二及以上',
        'junior+': '大三及以上'
    }
};

// 筛选系统模块
const FilterSystem = {
    currentFilters: {
        category: 'all',
        grade: 'all',
        freeOnly: false,
        highRating: false,
        searchTerm: '',
        sortBy: 'date'
    },
    
    init() {
        if (!document.querySelector('.resources-container')) return;
        
        console.log('初始化筛选系统...');
        
        // 更新分类计数
        this.updateCategoryCounts();
        
        // 绑定侧边栏分类筛选
        document.querySelectorAll('.filter-item[data-category]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const category = item.getAttribute('data-category');
                this.setCategoryFilter(category);
            });
        });
        
        // 绑定年级筛选
        document.querySelectorAll('.filter-item[data-grade]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const grade = item.getAttribute('data-grade');
                this.setGradeFilter(grade);
            });
        });
        
        // 绑定其他筛选
        const freeOnlyCheckbox = document.getElementById('free-only');
        const highRatingCheckbox = document.getElementById('high-rating');
        
        if (freeOnlyCheckbox) {
            freeOnlyCheckbox.addEventListener('change', function() {
                FilterSystem.currentFilters.freeOnly = this.checked;
                FilterSystem.applyFilters();
            });
        }
        
        if (highRatingCheckbox) {
            highRatingCheckbox.addEventListener('change', function() {
                FilterSystem.currentFilters.highRating = this.checked;
                FilterSystem.applyFilters();
            });
        }
        
        // 绑定搜索框
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchInput && searchBtn) {
            // 如果已经在全局绑定过，避免重复绑定
            const hasBound = searchBtn.hasAttribute('data-filter-bound');
            if (!hasBound) {
                searchBtn.addEventListener('click', function() {
                    FilterSystem.currentFilters.searchTerm = searchInput.value.trim();
                    FilterSystem.applyFilters();
                });
                
                searchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        FilterSystem.currentFilters.searchTerm = this.value.trim();
                        FilterSystem.applyFilters();
                    }
                });
                
                searchBtn.setAttribute('data-filter-bound', 'true');
            }
        }
        
        // 绑定排序选择
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                FilterSystem.currentFilters.sortBy = this.value;
                FilterSystem.applyFilters();
            });
        }
        
        // 绑定重置按钮
        const resetBtn = document.getElementById('reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => FilterSystem.resetFilters());
        }
        
        // 从URL参数读取筛选条件
        this.readFiltersFromURL();
        
        // 初始筛选
        this.applyFilters();
    },
    
    applyFilters() {
        console.log('应用筛选条件:', this.currentFilters);
        
        // 获取所有资源
        let filteredResources = [...ResourceManager.getResources()];
        
        // 1. 分类筛选
        if (this.currentFilters.category !== 'all') {
            filteredResources = filteredResources.filter(resource => 
                resource.category === this.currentFilters.category
            );
        }
        
        // 2. 年级筛选（改进的逻辑）
        if (this.currentFilters.grade !== 'all') {
            filteredResources = filteredResources.filter(resource => {
                // 处理特殊的年级筛选逻辑
                const userGrade = this.currentFilters.grade;
                const resourceGrade = resource.grade;
                
                // 如果资源面向所有年级，则通过
                if (resourceGrade === 'all') return true;
                
                // 如果用户选择特定年级，资源也是特定年级
                if (resourceGrade === userGrade) return true;
                
                // 处理复合条件
                if (userGrade === 'freshman') {
                    // 大一只能看到面向大一和全部的
                    return resourceGrade === 'all';
                }
                else if (userGrade === 'sophomore') {
                    // 大二可以看到面向大二、大二及以上、全部的
                    return resourceGrade === 'sophomore' || resourceGrade === 'sophomore+' || resourceGrade === 'all';
                }
                else if (userGrade === 'junior') {
                    // 大三可以看到面向大三、大三及以上、全部的
                    return resourceGrade === 'junior' || resourceGrade === 'junior+' || resourceGrade === 'all';
                }
                else if (userGrade === 'senior' || userGrade === 'graduate') {
                    // 大四和研究生可以看到所有资源
                    return true;
                }
                
                return false;
            });
        }
        
        // 3. 免费筛选
        if (this.currentFilters.freeOnly) {
            filteredResources = filteredResources.filter(resource => 
                resource.free === true
            );
        }
        
        // 4. 高评分筛选
        if (this.currentFilters.highRating) {
            filteredResources = filteredResources.filter(resource => 
                resource.rating >= 4
            );
        }
        
        // 5. 搜索筛选
        if (this.currentFilters.searchTerm) {
            const searchTerm = this.currentFilters.searchTerm.toLowerCase();
            filteredResources = filteredResources.filter(resource => 
                resource.title.toLowerCase().includes(searchTerm) ||
                resource.description.toLowerCase().includes(searchTerm) ||
                resource.tags.some(tag => {
                    const tagText = Array.isArray(tag) ? tag.join('') : tag;
                    return tagText.toLowerCase().includes(searchTerm);
                })
            );
        }
        
        // 6. 排序
        filteredResources = this.sortFilteredResources(filteredResources, this.currentFilters.sortBy);
        
        // 显示筛选结果
        this.displayFilteredResources(filteredResources);
        
        // 更新结果计数
        this.updateFilteredCount(filteredResources.length);
        this.updateCurrentFilterText();
        
        // 更新URL参数
        this.updateURLWithFilters();
    },
    
    displayFilteredResources(filteredResources) {
        const container = document.getElementById('all-resources');
        if (!container) return;
        
        ResourceDisplay.displayResources(filteredResources, container);
    },
    
    sortFilteredResources(resources, sortBy) {
        const sorted = [...resources];
        
        switch(sortBy) {
            case 'rating':
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            case 'name':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'date':
            default:
                sorted.sort((a, b) => b.id - a.id); // 假设id越大越新
                break;
        }
        
        return sorted;
    },
    
    setCategoryFilter(category) {
        this.currentFilters.category = category;
        
        // 更新UI状态
        document.querySelectorAll('.filter-item[data-category]').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-category') === category) {
                item.classList.add('active');
            }
        });
        
        this.applyFilters();
    },
    
    setGradeFilter(grade) {
        this.currentFilters.grade = grade;
        
        // 更新UI状态
        document.querySelectorAll('.filter-item[data-grade]').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-grade') === grade) {
                item.classList.add('active');
            }
        });
        
        this.applyFilters();
    },
    
    updateCategoryCounts() {
        const categories = {
            'website': 0,
            'information': 0
        };
        
        // 统计每个分类的资源数量
        ResourceManager.getResources().forEach(resource => {
            if (categories.hasOwnProperty(resource.category)) {
                categories[resource.category]++;
            }
        });
        
        // 更新计数显示
        for (const [category, count] of Object.entries(categories)) {
            const countElement = document.getElementById(`count-${category}`);
            if (countElement) {
                countElement.textContent = count;
            }
        }
        
        // 更新总体统计
        const totalCount = ResourceManager.getResources().length;
        const freeCount = ResourceManager.getResources().filter(r => r.free).length;
        const premiumCount = ResourceManager.getResources().filter(r => r.rating >= 4).length;
        
        const totalCountElement = document.getElementById('total-count');
        const freeCountElement = document.getElementById('free-count');
        const premiumCountElement = document.getElementById('premium-count');
        
        if (totalCountElement) totalCountElement.textContent = totalCount;
        if (freeCountElement) freeCountElement.textContent = freeCount;
        if (premiumCountElement) premiumCountElement.textContent = premiumCount;
    },
    
    updateFilteredCount(count) {
        const countElement = document.getElementById('filtered-count');
        if (countElement) {
            countElement.textContent = count;
        }
    },
    
    updateCurrentFilterText() {
        const filterTexts = [];
        
        // 添加分类筛选文本
        if (this.currentFilters.category !== 'all') {
            filterTexts.push(Constants.categoryMap[this.currentFilters.category] || this.currentFilters.category);
        }
        
        // 添加年级筛选文本
        if (this.currentFilters.grade !== 'all') {
            filterTexts.push(Constants.gradeMap[this.currentFilters.grade] || this.currentFilters.grade);
        }
        
        // 添加其他筛选文本
        if (this.currentFilters.freeOnly) filterTexts.push('仅免费');
        if (this.currentFilters.highRating) filterTexts.push('高评分');
        if (this.currentFilters.searchTerm) filterTexts.push(`搜索: ${this.currentFilters.searchTerm}`);
        
        const filterTextElement = document.getElementById('current-filter-text');
        if (filterTextElement) {
            filterTextElement.textContent = filterTexts.length > 0 ? 
                filterTexts.join(' · ') : '全部资源';
        }
    },
    
    resetFilters() {
        console.log('重置筛选条件');
        
        // 重置筛选状态
        this.currentFilters = {
            category: 'all',
            grade: 'all',
            freeOnly: false,
            highRating: false,
            searchTerm: '',
            sortBy: 'date'
        };
        
        // 重置UI
        document.querySelectorAll('.filter-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-category') === 'all' || 
                item.getAttribute('data-grade') === 'all') {
                item.classList.add('active');
            }
        });
        
        // 重置复选框
        const freeOnlyCheckbox = document.getElementById('free-only');
        const highRatingCheckbox = document.getElementById('high-rating');
        
        if (freeOnlyCheckbox) freeOnlyCheckbox.checked = false;
        if (highRatingCheckbox) highRatingCheckbox.checked = false;
        
        // 重置搜索框
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // 重置排序
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.value = 'date';
        }
        
        // 应用重置后的筛选
        this.applyFilters();
    },
    
    readFiltersFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // 读取分类
        const category = urlParams.get('category');
        if (category && ['website', 'information'].includes(category)) {
            this.setCategoryFilter(category);
        }
        
        // 读取年级
        const grade = urlParams.get('grade');
        if (grade && Object.keys(Constants.gradeMap).includes(grade)) {
            this.setGradeFilter(grade);
        }
        
        // 读取搜索词
        const search = urlParams.get('search');
        if (search) {
            this.currentFilters.searchTerm = search;
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = search;
            }
        }
        
        // 读取其他筛选条件
        const freeOnly = urlParams.get('freeOnly');
        if (freeOnly === 'true') {
            this.currentFilters.freeOnly = true;
            const freeOnlyCheckbox = document.getElementById('free-only');
            if (freeOnlyCheckbox) {
                freeOnlyCheckbox.checked = true;
            }
        }
        
        const highRating = urlParams.get('highRating');
        if (highRating === 'true') {
            this.currentFilters.highRating = true;
            const highRatingCheckbox = document.getElementById('high-rating');
            if (highRatingCheckbox) {
                highRatingCheckbox.checked = true;
            }
        }
        
        const sortBy = urlParams.get('sortBy');
        if (sortBy && ['date', 'rating', 'name'].includes(sortBy)) {
            this.currentFilters.sortBy = sortBy;
            const sortSelect = document.getElementById('sort-select');
            if (sortSelect) {
                sortSelect.value = sortBy;
            }
        }
    },
    
    updateURLWithFilters() {
        const urlParams = new URLSearchParams();
        
        if (this.currentFilters.category !== 'all') {
            urlParams.set('category', this.currentFilters.category);
        }
        
        if (this.currentFilters.grade !== 'all') {
            urlParams.set('grade', this.currentFilters.grade);
        }
        
        if (this.currentFilters.searchTerm) {
            urlParams.set('search', this.currentFilters.searchTerm);
        }
        
        if (this.currentFilters.freeOnly) {
            urlParams.set('freeOnly', 'true');
        }
        
        if (this.currentFilters.highRating) {
            urlParams.set('highRating', 'true');
        }
        
        if (this.currentFilters.sortBy !== 'date') {
            urlParams.set('sortBy', this.currentFilters.sortBy);
        }
        
        const newUrl = urlParams.toString() ? 
            `${window.location.pathname}?${urlParams.toString()}` : 
            window.location.pathname;
        
        // 更新URL但不刷新页面
        window.history.replaceState({}, '', newUrl);
    }
};

// 资源显示模块
const ResourceDisplay = {
    displayResources(resourceList, container) {
        container.innerHTML = '';
        
        if (resourceList.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>没有找到匹配的资源</h3>
                    <p>尝试调整筛选条件或搜索关键词</p>
                    <button id="clear-filters-btn" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-redo"></i> 清除所有筛选
                    </button>
                </div>
            `;
            
            // 绑定清除筛选按钮
            document.getElementById('clear-filters-btn')?.addEventListener('click', () => FilterSystem.resetFilters());
            return;
        }
        
        resourceList.forEach(resource => {
            const resourceElement = this.createResourceElement(resource);
            container.appendChild(resourceElement);
        });
    },
    
    createResourceElement(resource) {
        const div = document.createElement('div');
        div.className = 'resource-card animate-on-scroll';
        
        // 生成星级评分
        const stars = '★'.repeat(resource.rating) + '☆'.repeat(5 - resource.rating);
        
        // 生成标签HTML
        const tagsHtml = resource.tags.map(tag => {
            // 确保标签是字符串，处理数组格式的标签
            const tagText = Array.isArray(tag) ? tag.join('') : tag;
            return `<span class="tag">${tagText}</span>`;
        }).join('');
        
        // 免费/付费标签
        const freeBadge = resource.free ? 
            '<span class="free-badge">免费</span>' : 
            '<span class="paid-badge">付费</span>';
        
        // 使用映射转换分类和年级
        const displayCategory = Constants.categoryMap[resource.category] || resource.category;
        const displayGrade = Constants.gradeMap[resource.grade] || resource.grade;
        
        // 为分类添加图标
        const getCategoryIcon = (category) => {
            const icons = {
                'website': 'fas fa-globe',
                'information': 'fas fa-newspaper'
            };
            return icons[category] || 'fas fa-book';
        };
        
        const categoryIcon = getCategoryIcon(resource.category);
        
        // 检查是否已收藏
        const isFavorited = FavoriteManager.isResourceFavorited(resource.id);
        const favoriteIcon = isFavorited ? 'fas fa-heart' : 'far fa-heart';
        const favoriteClass = isFavorited ? 'favorited' : '';
        
        div.innerHTML = `
            <div class="resource-header">
                <div class="resource-meta">
                    <span class="resource-category">
                        <i class="${categoryIcon}"></i> ${displayCategory}
                    </span>
                    ${freeBadge}
                    <button class="favorite-btn ${favoriteClass}" data-resource-id="${resource.id}">
                        <i class="${favoriteIcon}"></i>
                    </button>
                </div>
                <h3 class="resource-title">${resource.title}</h3>
                <p class="resource-description">${resource.description}</p>
                <div class="resource-tags">
                    ${tagsHtml}
                </div>
            </div>
            <div class="resource-footer">
                <div class="resource-info">
                    <span class="resource-grade">
                        <i class="fas fa-user-graduate"></i> ${displayGrade}
                    </span>
                    <span class="resource-rating" title="评分：${resource.rating}/5">
                        ${stars}
                    </span>
                </div>
                <a href="${resource.url}" target="_blank" class="resource-link">
                    <i class="fas fa-external-link-alt"></i> 访问网站
                </a>
            </div>
        `;
        
        // 绑定收藏按钮事件
        const favoriteBtn = div.querySelector('.favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', function() {
                const resourceId = this.getAttribute('data-resource-id');
                FavoriteManager.toggleFavorite(resourceId);
                const icon = this.querySelector('i');
                if (this.classList.contains('favorited')) {
                    this.classList.remove('favorited');
                    icon.className = 'far fa-heart';
                } else {
                    this.classList.add('favorited');
                    icon.className = 'fas fa-heart';
                }
            });
        }
        
        return div;
    }
};

// 收藏管理模块
const FavoriteManager = {
    getFavorites() {
        return StorageUtil.get('favorites', []);
    },
    
    isResourceFavorited(resourceId) {
        const favorites = this.getFavorites();
        return favorites.includes(resourceId.toString());
    },
    
    toggleFavorite(resourceId) {
        const favorites = this.getFavorites();
        const resourceIdStr = resourceId.toString();
        
        if (favorites.includes(resourceIdStr)) {
            // 移除收藏
            const index = favorites.indexOf(resourceIdStr);
            favorites.splice(index, 1);
        } else {
            // 添加收藏
            favorites.push(resourceIdStr);
        }
        
        StorageUtil.set('favorites', favorites);
    }
};

// 动画管理模块
const AnimationManager = {
    initAllAnimations() {
        this.initScrollAnimations();
        this.initNavbarScroll();
        this.initPageLoadAnimations();
        this.initButtonEffects();
        this.initCardHoverEffects();
        this.initScrollToTop();
        this.initProgressIndicator();
        this.initStaggeredAnimations();
        this.initFormAnimations();
        this.initFilterAnimations();
        this.initModalAnimations();
    },
    
    initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);

        // 观察所有需要滚动动画的元素
        DOMUtil.$$('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    },
    
    initNavbarScroll() {
        let lastScrollTop = 0;
        const navbar = DOMUtil.$('.navbar');
        
        if (!navbar) return;
        
        DOMUtil.on(window, 'scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // 添加滚动类
            if (scrollTop > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            // 隐藏/显示导航栏
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // 向下滚动
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // 向上滚动
                navbar.style.transform = 'translateY(0)';
            }
            
            navbar.style.transition = 'transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease';
            lastScrollTop = scrollTop;
        });
    },
    
    initPageLoadAnimations() {
        // 添加页面加载类
        document.body.classList.add('page-load-animation');
        
        // 为特定元素添加延迟动画
        const heroElements = DOMUtil.$$('.hero-content > *');
        heroElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.2}s`;
        });
        
        // 为分类卡片添加延迟动画
        const categoryCards = DOMUtil.$$('.category-card');
        categoryCards.forEach((card, index) => {
            card.style.animationDelay = `${0.2 + index * 0.1}s`;
        });
        
        // 为资源卡片添加延迟动画
        const resourceCards = DOMUtil.$$('.resource-card');
        resourceCards.forEach((card, index) => {
            card.style.animationDelay = `${0.4 + index * 0.1}s`;
        });
    },
    
    initButtonEffects() {
        DOMUtil.$$('.btn').forEach(button => {
            // 避免重复绑定
            if (button.hasAttribute('data-ripple-bound')) return;
            
            button.setAttribute('data-ripple-bound', 'true');
            
            // 鼠标悬停效果
            DOMUtil.on(button, 'mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 8px 25px rgba(67, 97, 238, 0.3)';
            });
            
            DOMUtil.on(button, 'mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'var(--shadow-md)';
            });
            
            // 点击涟漪效果
            DOMUtil.on(button, 'click', function(e) {
                // 添加点击涟漪效果
                const ripple = DOMUtil.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    transform: scale(0);
                    animation: ripple-animation 0.6s linear;
                    width: ${size}px;
                    height: ${size}px;
                    top: ${y}px;
                    left: ${x}px;
                    pointer-events: none;
                `;
                
                this.appendChild(ripple);
                
                // 移除涟漪元素
                setTimeout(() => {
                    if (ripple.parentNode === this) {
                        ripple.remove();
                    }
                }, 600);
            });
        });
        
        // 添加涟漪动画样式（如果尚未添加）
        if (!DOMUtil.$('#ripple-animation-style')) {
            const rippleStyle = DOMUtil.createElement('style', {
                id: 'ripple-animation-style',
                innerHTML: `
                    @keyframes ripple-animation {
                        to {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }
                `
            });
            document.head.appendChild(rippleStyle);
        }
    },
    
    initCardHoverEffects() {
        // 为资源卡片添加悬停效果
        DOMUtil.$$('.resource-card, .category-card, .feature, .team-member').forEach(card => {
            DOMUtil.on(card, 'mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
            });
            
            DOMUtil.on(card, 'mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = 'var(--shadow-lg)';
            });
        });
    },
    
    initScrollToTop() {
        const scrollToTopBtn = DOMUtil.createElement('button', {
            className: 'scroll-to-top',
            innerHTML: '<i class="fas fa-arrow-up"></i>'
        });
        document.body.appendChild(scrollToTopBtn);
        
        DOMUtil.on(window, 'scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
        
        // 添加悬停效果
        DOMUtil.on(scrollToTopBtn, 'mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.1)';
        });
        
        DOMUtil.on(scrollToTopBtn, 'mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        DOMUtil.on(scrollToTopBtn, 'click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },
    
    initProgressIndicator() {
        const progressBar = DOMUtil.createElement('div', {
            className: 'progress-bar'
        });
        document.body.appendChild(progressBar);
        
        DOMUtil.on(window, 'scroll', function() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        });
    },
    
    initStaggeredAnimations() {
        const cards = DOMUtil.$$('.resource-card, .category-card, .feature, .team-member');
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animated');
                    }, index * 100);
                }
            });
        }, observerOptions);

        cards.forEach(card => {
            observer.observe(card);
        });
    },
    
    initFormAnimations() {
        // 为表单输入框添加焦点效果
        DOMUtil.$$('input, textarea, select').forEach(input => {
            DOMUtil.on(input, 'focus', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 15px rgba(67, 97, 238, 0.2)';
            });
            
            DOMUtil.on(input, 'blur', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
        });
    },
    
    initFilterAnimations() {
        // 为筛选选项添加点击效果
        DOMUtil.$$('.filter-item').forEach(item => {
            DOMUtil.on(item, 'click', function() {
                // 添加点击动画
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
        });
    },
    
    initModalAnimations() {
        // 为模态框添加动画效果
        const modals = DOMUtil.$$('.modal');
        modals.forEach(modal => {
            DOMUtil.on(modal, 'show.bs.modal', function() {
                this.style.opacity = '0';
                this.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    this.style.opacity = '1';
                    this.style.transform = 'scale(1)';
                }, 10);
            });
            
            DOMUtil.on(modal, 'hide.bs.modal', function() {
                this.style.opacity = '0';
                this.style.transform = 'scale(0.9)';
            });
        });
    }
};

// 搜索功能模块
const SearchSystem = {
    searchHistory: [],
    searchSuggestions: [],
    
    init() {
        this.loadSearchHistory();
        this.setupSearchInput();
    },
    
    setupSearchInput() {
        const searchInput = DOMUtil.$('#search-input');
        if (!searchInput) return;
        
        // 搜索防抖
        const debouncedSearch = debounce((searchTerm) => {
            if (searchTerm.length > 1) {
                this.showSearchSuggestions(searchTerm);
            } else {
                this.hideSearchSuggestions();
            }
        }, 300);
        
        // 搜索输入事件
        DOMUtil.on(searchInput, 'input', (e) => {
            const searchTerm = e.target.value.trim();
            debouncedSearch(searchTerm);
        });
        
        // 搜索提交事件
        const searchBtn = DOMUtil.$('#search-btn');
        if (searchBtn) {
            DOMUtil.on(searchBtn, 'click', () => this.performSearch());
        }
        
        // 回车键搜索
        DOMUtil.on(searchInput, 'keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // 点击其他区域隐藏搜索建议
        DOMUtil.on(document, 'click', (e) => {
            if (!searchInput.contains(e.target) && !e.target.closest('.search-suggestions')) {
                this.hideSearchSuggestions();
            }
        });
    },
    
    performSearch() {
        const searchInput = DOMUtil.$('#search-input');
        const searchTerm = searchInput ? searchInput.value.trim() : '';
        
        if (searchTerm) {
            // 添加到搜索历史
            this.addToSearchHistory(searchTerm);
        }
        
        FilterSystem.currentFilters.searchTerm = searchTerm;
        
        // 如果在资源页面，直接应用筛选
        if (DOMUtil.$('#all-resources')) {
            FilterSystem.applyFilters();
        } else {
            // 如果不在资源页面，跳转到资源页面并传递搜索参数
            window.location.href = `resources.html?search=${encodeURIComponent(searchTerm)}`;
        }
        
        // 隐藏搜索建议
        this.hideSearchSuggestions();
    },
    
    showSearchSuggestions(searchTerm) {
        const searchInput = DOMUtil.$('#search-input');
        if (!searchInput) return;
        
        // 生成搜索建议
        this.searchSuggestions = this.generateSearchSuggestions(searchTerm);
        
        // 创建搜索建议容器
        let suggestionsContainer = DOMUtil.$('.search-suggestions');
        if (!suggestionsContainer) {
            suggestionsContainer = DOMUtil.createElement('div', {
                className: 'search-suggestions'
            });
            searchInput.parentNode.appendChild(suggestionsContainer);
        }
        
        // 渲染搜索建议
        if (this.searchSuggestions.length > 0) {
            suggestionsContainer.innerHTML = this.searchSuggestions.map(suggestion => {
                // 根据建议类型选择图标
                let icon = 'fas fa-search';
                let typeClass = 'search-suggestion-type-' + suggestion.type;
                
                switch (suggestion.type) {
                    case 'history':
                        icon = 'fas fa-history';
                        break;
                    case 'tag':
                        icon = 'fas fa-tag';
                        break;
                    case 'title':
                        icon = 'fas fa-file-alt';
                        break;
                    case 'description':
                        icon = 'fas fa-align-left';
                        break;
                }
                
                // 高亮搜索词
                const highlightedText = suggestion.text.replace(
                    new RegExp(`(${searchTerm})`, 'gi'),
                    '<span class="search-highlight">$1</span>'
                );
                
                return `
                    <div class="search-suggestion-item ${typeClass}" data-term="${suggestion.text}">
                        <i class="${icon}"></i>
                        <span>${highlightedText}</span>
                    </div>
                `;
            }).join('');
            
            // 绑定点击事件
            DOMUtil.$$('.search-suggestion-item', suggestionsContainer).forEach(item => {
                DOMUtil.on(item, 'click', () => {
                    const term = item.getAttribute('data-term');
                    searchInput.value = term;
                    this.performSearch();
                });
            });
            
            suggestionsContainer.classList.add('active');
        } else {
            this.hideSearchSuggestions();
        }
    },
    
    hideSearchSuggestions() {
        const suggestionsContainer = DOMUtil.$('.search-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.classList.remove('active');
        }
    },
    
    generateSearchSuggestions(searchTerm) {
        const resources = ResourceManager.getResources();
        const suggestions = [];
        const seenSuggestions = new Set();
        
        // 从资源标题、描述和标签中提取建议
        resources.forEach(resource => {
            // 标题建议
            if (resource.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                const titleSuggestion = {
                    text: resource.title,
                    type: 'title',
                    resourceId: resource.id,
                    score: 10 // 标题匹配得分最高
                };
                if (!seenSuggestions.has(titleSuggestion.text)) {
                    suggestions.push(titleSuggestion);
                    seenSuggestions.add(titleSuggestion.text);
                }
            }
            
            // 标签建议
            resource.tags.forEach(tag => {
                const tagText = Array.isArray(tag) ? tag.join('') : tag;
                if (tagText.toLowerCase().includes(searchTerm.toLowerCase())) {
                    const tagSuggestion = {
                        text: tagText,
                        type: 'tag',
                        score: 8 // 标签匹配得分较高
                    };
                    if (!seenSuggestions.has(tagSuggestion.text)) {
                        suggestions.push(tagSuggestion);
                        seenSuggestions.add(tagSuggestion.text);
                    }
                }
            });
            
            // 描述建议
            if (resource.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                // 提取描述中的相关短语
                const descLower = resource.description.toLowerCase();
                const startIndex = descLower.indexOf(searchTerm.toLowerCase());
                if (startIndex !== -1) {
                    const endIndex = descLower.indexOf(' ', startIndex + searchTerm.length + 20);
                    const suggestionText = resource.description.substring(
                        Math.max(0, startIndex - 10),
                        endIndex !== -1 ? endIndex : resource.description.length
                    ).trim();
                    if (suggestionText.length > 10) {
                        const descSuggestion = {
                            text: suggestionText,
                            type: 'description',
                            resourceId: resource.id,
                            score: 6 // 描述匹配得分较低
                        };
                        if (!seenSuggestions.has(descSuggestion.text)) {
                            suggestions.push(descSuggestion);
                            seenSuggestions.add(descSuggestion.text);
                        }
                    }
                }
            }
        });
        
        // 添加搜索历史中的相关项
        this.searchHistory.forEach(historyItem => {
            if (historyItem.toLowerCase().includes(searchTerm.toLowerCase())) {
                const historySuggestion = {
                    text: historyItem,
                    type: 'history',
                    score: 9 // 历史记录得分较高
                };
                if (!seenSuggestions.has(historySuggestion.text)) {
                    suggestions.push(historySuggestion);
                    seenSuggestions.add(historySuggestion.text);
                }
            }
        });
        
        // 按得分排序，然后按字母顺序排序
        suggestions.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.text.localeCompare(b.text);
        });
        
        // 最多返回8个建议
        return suggestions.slice(0, 8);
    },
    
    addToSearchHistory(searchTerm) {
        // 移除重复项
        this.searchHistory = this.searchHistory.filter(item => item !== searchTerm);
        
        // 添加到开头
        this.searchHistory.unshift(searchTerm);
        
        // 限制历史记录数量
        this.searchHistory = this.searchHistory.slice(0, 10);
        
        // 保存到本地存储
        StorageUtil.set('searchHistory', this.searchHistory);
    },
    
    loadSearchHistory() {
        this.searchHistory = StorageUtil.get('searchHistory', []);
    }
};

// 统计功能模块
const StatsManager = {
    updateAboutStats() {
        const resourceCountElement = document.getElementById('resource-count');
        if (resourceCountElement && !resourceCountElement.textContent) {
            resourceCountElement.textContent = ResourceManager.getResources().length;
        }
        
        // 计算分类数量
        const categories = new Set(ResourceManager.getResources().map(r => r.category));
        const categoryCountElement = document.getElementById('category-count');
        if (categoryCountElement) {
            categoryCountElement.textContent = categories.size;
        }
    }
};

// 积分管理模块
const PointsManager = {
    // 积分配置
    pointConfig: {
        submitResource: 10, // 提交资源获得10积分
        resourceApproved: 20, // 资源审核通过获得20积分
        dailyLogin: 1, // 每日登录获得1积分
        shareResource: 2 // 分享资源获得2积分
    },
    
    // 初始化用户积分
    initUserPoints(username) {
        const users = this.getUsersPoints();
        if (!users[username]) {
            users[username] = {
                points: 0,
                username: username,
                lastLogin: null,
                submissions: 0
            };
            this.saveUsersPoints(users);
            console.log('初始化用户积分成功:', users[username]);
        }
        return users[username];
    },
    
    // 获取所有用户积分
    getUsersPoints() {
        return StorageUtil.get('usersPoints', {});
    },
    
    // 保存用户积分
    saveUsersPoints(users) {
        StorageUtil.set('usersPoints', users);
        // 触发storage事件，通知其他标签页更新
        localStorage.setItem('usersPointsUpdated', Date.now().toString());
        
        // 如果Firebase可用，同步到Firebase
        if (typeof firebase !== 'undefined' && firebase.database) {
            try {
                firebase.database().ref('usersPoints').set(users);
                console.log('积分数据已同步到Firebase');
            } catch (error) {
                console.error('同步到Firebase失败:', error);
            }
        }
    },
    
    // 增加用户积分
    addPoints(username, points, reason) {
        let users = this.getUsersPoints();
        if (!users[username]) {
            this.initUserPoints(username);
            // 重新获取更新后的用户数据
            users = this.getUsersPoints();
        }
        
        // 确保users[username]存在
        if (!users[username]) {
            users[username] = {
                points: 0,
                username: username,
                lastLogin: null,
                submissions: 0
            };
        }
        
        users[username].points += points;
        users[username].lastLogin = new Date().toISOString();
        
        if (reason === 'submitResource') {
            users[username].submissions = (users[username].submissions || 0) + 1;
        }
        
        this.saveUsersPoints(users);
        console.log('添加积分成功:', username, points, '积分', '原因:', reason, '当前积分:', users[username].points);
        return users[username];
    },
    
    // 获取用户积分
    getUserPoints(username) {
        const users = this.getUsersPoints();
        return users[username] || { points: 0, username: username, lastLogin: null, submissions: 0 };
    },
    
    // 获取积分排行榜
    getRanking(limit = 10, type = 'total') {
        const users = this.getUsersPoints();
        let filteredUsers = Object.values(users);
        
        // 根据类型筛选时间范围
        if (type !== 'total') {
            const now = new Date();
            let cutoffDate;
            
            if (type === 'daily') {
                // 24小时内
                cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            } else if (type === 'weekly') {
                // 7天内
                cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            }
            
            // 筛选在时间范围内有活动的用户
            filteredUsers = filteredUsers.filter(user => {
                if (!user.lastLogin) return false;
                const lastLoginDate = new Date(user.lastLogin);
                return lastLoginDate >= cutoffDate;
            });
        }
        
        // 排序并返回前N名
        return filteredUsers
            .sort((a, b) => b.points - a.points)
            .slice(0, limit);
    },
    
    // 记录每日登录积分
    claimDailyLoginPoints(username) {
        const user = this.getUserPoints(username);
        const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
        const today = new Date();
        
        // 检查是否已经领取过今日积分
        if (!lastLogin || lastLogin.toDateString() !== today.toDateString()) {
            const updatedUser = this.addPoints(username, this.pointConfig.dailyLogin, 'dailyLogin');
            console.log('领取每日登录积分成功:', updatedUser);
            return updatedUser;
        }
        console.log('今日已领取过积分:', user);
        return user;
    },
    
    // 从Firebase同步数据
    syncFromFirebase() {
        if (typeof firebase !== 'undefined' && firebase.database) {
            try {
                firebase.database().ref('usersPoints').once('value')
                    .then(snapshot => {
                        const usersPoints = snapshot.val();
                        if (usersPoints) {
                            StorageUtil.set('usersPoints', usersPoints);
                            localStorage.setItem('usersPointsUpdated', Date.now().toString());
                            console.log('从Firebase同步积分数据成功');
                        }
                    })
                    .catch(error => {
                        console.error('从Firebase同步数据失败:', error);
                    });
            } catch (error) {
                console.error('从Firebase同步数据失败:', error);
            }
        }
    }
};

// 用户管理模块
const UserManager = {
    // 获取当前用户
    getCurrentUser() {
        return StorageUtil.get('currentUser', null);
    },
    
    // 检查用户是否已登录
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },
    
    // 检查用户是否为管理员
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },
    
    // 登出用户
    logout() {
        StorageUtil.remove('currentUser');
        this.updateUserMenu();
        window.location.href = 'index.html';
    },
    
    // 更新用户菜单
    updateUserMenu() {
        const userMenu = DOMUtil.$('#user-menu');
        if (!userMenu) return;
        
        if (this.isLoggedIn()) {
            const user = this.getCurrentUser();
            const userPoints = PointsManager.getUserPoints(user.username);
            
            // 构建菜单内容
            let menuContent = `
                <div class="user-dropdown">
                    <a href="#" class="user-profile">
                        <i class="fas fa-user-circle"></i> ${user.username}
                        <span class="user-points">${userPoints.points} 积分</span>
                        <i class="fas fa-chevron-down"></i>
                    </a>
                    <div class="dropdown-menu">
                        <a href="#" class="dropdown-item"><i class="fas fa-user"></i> 个人中心</a>
                        <a href="ranking.html" class="dropdown-item"><i class="fas fa-trophy"></i> 积分排行榜</a>
                        <a href="#" class="dropdown-item"><i class="fas fa-heart"></i> 我的收藏</a>
                        <a href="#" class="dropdown-item"><i class="fas fa-cog"></i> 设置</a>
            `;
            
            // 如果是管理员，添加管理员菜单
            if (this.isAdmin()) {
                menuContent += `
                        <div class="dropdown-divider"></div>
                        <a href="admin.html" class="dropdown-item"><i class="fas fa-shield-alt"></i> 管理后台</a>
                `;
            }
            
            menuContent += `
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item logout-btn"><i class="fas fa-sign-out-alt"></i> 登出</a>
                    </div>
                </div>
            `;
            
            userMenu.innerHTML = menuContent;
            
            // 绑定登出按钮事件
            const logoutBtn = userMenu.querySelector('.logout-btn');
            if (logoutBtn) {
                DOMUtil.on(logoutBtn, 'click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
            
            // 绑定个人中心按钮事件
            const profileLink = userMenu.querySelector('.dropdown-item:nth-child(1)');
            if (profileLink) {
                DOMUtil.on(profileLink, 'click', (e) => {
                    e.preventDefault();
                    window.location.href = 'profile.html';
                });
            }
            
            // 绑定我的收藏按钮事件
            const favoritesLink = userMenu.querySelector('.dropdown-item:nth-child(3)');
            if (favoritesLink) {
                DOMUtil.on(favoritesLink, 'click', (e) => {
                    e.preventDefault();
                    window.location.href = 'profile.html#favorites';
                });
            }
            
            // 绑定下拉菜单事件
            const userProfile = userMenu.querySelector('.user-profile');
            const dropdownMenu = userMenu.querySelector('.dropdown-menu');
            
            if (userProfile && dropdownMenu) {
                DOMUtil.on(userProfile, 'click', (e) => {
                    e.preventDefault();
                    dropdownMenu.classList.toggle('active');
                });
                
                // 点击其他区域关闭下拉菜单
                DOMUtil.on(document, 'click', (e) => {
                    if (!userMenu.contains(e.target)) {
                        dropdownMenu.classList.remove('active');
                    }
                });
            }
        } else {
            userMenu.innerHTML = '<a href="auth.html"><i class="fas fa-user"></i> 登录/注册</a>';
        }
    },
    
    // 确保管理员账户存在
    ensureAdminAccount() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // 检查是否已有管理员账户
        const existingAdmin = users.find(user => user.role === 'admin');
        if (existingAdmin) {
            return;
        }
        
        // 创建管理员账户
        const adminUser = {
            id: Date.now(),
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        
        // 添加到用户列表
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('管理员账户已创建：', adminUser.username);
    }
};

// 页面初始化
async function initPage() {
    // 确保管理员账户存在
    UserManager.ensureAdminAccount();
    
    // 移动端菜单切换
    const navToggle = DOMUtil.$('.nav-toggle');
    const navMenu = DOMUtil.$('.nav-menu');
    
    if (navToggle && navMenu) {
        DOMUtil.on(navToggle, 'click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // 更新用户菜单
    UserManager.updateUserMenu();
    
    // 搜索功能初始化
    SearchSystem.init();
    
    // 键盘快捷键支持
    DOMUtil.on(document, 'keydown', function(e) {
        // 按 Ctrl/Cmd + K 打开搜索
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchBox = DOMUtil.$('#search-input');
            if (searchBox) {
                searchBox.focus();
            }
        }
        
        // 按 Escape 关闭搜索
        if (e.key === 'Escape') {
            const searchBox = DOMUtil.$('#search-input');
            if (searchBox) {
                searchBox.blur();
                SearchSystem.hideSearchSuggestions();
            }
        }
        
        // 按 Ctrl/Cmd + Home 回到顶部
        if ((e.ctrlKey || e.metaKey) && e.key === 'Home') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    
    // 加载资源数据
    await ResourceManager.loadResources();
    
    // 显示热门资源（在首页）
    const hotResourcesContainer = DOMUtil.$('#hot-resources');
    if (hotResourcesContainer) {
        const hotResources = ResourceManager.getHotResources(6);
        ResourceDisplay.displayResources(hotResources, hotResourcesContainer);
        
        // 初始化动画（仅在首页）
        AnimationManager.initAllAnimations();
    }
    
    // 更新关于页面的统计数据
    StatsManager.updateAboutStats();
    
    // 初始化筛选系统（在资源页面）
    FilterSystem.init();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);