// ==================== 动画管理模块 ====================

import { DOMUtil } from './utils.js';

export const AnimationManager = {
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
