// ==================== 筛选系统模块 ====================

import { Constants } from './constants.js';
import { ResourceManager } from './resourceManager.js';
import { ResourceDisplay } from './resourceDisplay.js';

export const FilterSystem = {
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
        
        // 检查资源是否已加载
        if (ResourceManager.getResources().length > 0) {
            // 资源已加载，直接应用筛选
            this.updateCategoryCounts();
            this.applyFilters();
        } else {
            // 资源未加载，等待资源加载完成后再应用筛选
            console.log('资源未加载，等待资源加载完成...');
            // 监听资源加载完成事件
            const checkResourcesLoaded = setInterval(() => {
                if (ResourceManager.getResources().length > 0) {
                    clearInterval(checkResourcesLoaded);
                    console.log('资源加载完成，开始应用筛选...');
                    this.updateCategoryCounts();
                    this.applyFilters();
                }
            }, 100);
            
            // 5秒后如果资源仍未加载，使用备用数据
            setTimeout(() => {
                clearInterval(checkResourcesLoaded);
                if (ResourceManager.getResources().length === 0) {
                    console.log('资源加载超时，使用备用数据...');
                    // 手动加载备用数据
                    ResourceManager.resources = ResourceManager.getFallbackResources();
                    this.updateCategoryCounts();
                    this.applyFilters();
                }
            }, 5000);
        }
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
        const resources = ResourceManager.getResources();
        console.log('更新分类计数，资源数量:', resources.length);
        
        const categories = {
            'website': 0,
            'information': 0
        };
        
        // 统计每个分类的资源数量
        resources.forEach(resource => {
            if (categories.hasOwnProperty(resource.category)) {
                categories[resource.category]++;
            }
        });
        
        console.log('分类计数:', categories);
        
        // 更新计数显示
        for (const [category, count] of Object.entries(categories)) {
            const countElement = document.getElementById(`count-${category}`);
            if (countElement) {
                countElement.textContent = count;
                console.log(`更新分类 ${category} 计数为 ${count}`);
            }
        }
        
        // 更新总体统计
        const totalCount = resources.length;
        const freeCount = resources.filter(r => r.free).length;
        const premiumCount = resources.filter(r => r.rating >= 4).length;
        
        console.log('总体统计:', { totalCount, freeCount, premiumCount });
        
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
