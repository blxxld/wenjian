// fix.js - 紧急修复脚本
document.addEventListener('DOMContentLoaded', function() {
    console.log('应用紧急修复...');
    
    // 1. 立即显示所有内容
    document.body.style.opacity = '1';
    document.body.style.visibility = 'visible';
    
    // 2. 移除所有动画类冲突
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
        el.style.animation = 'none';
        el.style.transition = 'none';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.transform = 'none';
    });
    
    // 3. 修复网格布局
    const grids = document.querySelectorAll('.resources-grid, .categories-grid, .features-grid');
    grids.forEach(grid => {
        grid.style.display = 'grid';
        grid.style.visibility = 'visible';
        grid.style.opacity = '1';
    });
    
    // 4. 修复导航栏
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.display = 'flex';
        navbar.style.visibility = 'visible';
        navbar.style.opacity = '1';
    }
    
    // 5. 修复页脚
    const footer = document.querySelector('.footer');
    if (footer) {
        footer.style.display = 'block';
        footer.style.visibility = 'visible';
        footer.style.opacity = '1';
    }
    
    // 6. 修复卡片
    const cards = document.querySelectorAll('.category-card, .resource-card, .feature');
    cards.forEach(card => {
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.style.transform = 'none';
    });
    
    // 7. 修复按钮
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.style.opacity = '1';
        button.style.visibility = 'visible';
        button.style.display = 'inline-flex';
    });
    
    // 8. 确保文本可见
    const texts = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, li');
    texts.forEach(text => {
        text.style.opacity = '1';
        text.style.visibility = 'visible';
        text.style.color = '';
    });
    
    // 9. 临时禁用复杂动画
    const style = document.createElement('style');
    style.textContent = `
        * {
            animation: none !important;
            transition: none !important;
        }
        
        body, body * {
            opacity: 1 !important;
            visibility: visible !important;
        }
        
        .animate-on-scroll,
        .delay-1,
        .delay-2,
        .delay-3,
        .delay-4 {
            opacity: 1 !important;
            transform: none !important;
        }
    `;
    document.head.appendChild(style);
    
    console.log('修复完成');
});

// 确保页面完全加载后再次检查
window.addEventListener('load', function() {
    setTimeout(() => {
        // 强制重绘以确保样式应用
        document.body.style.display = 'none';
        document.body.offsetHeight; // 触发重绘
        document.body.style.display = 'block';
        
        // 再次确保所有内容可见
        document.querySelectorAll('*').forEach(el => {
            el.style.opacity = '1';
            el.style.visibility = 'visible';
        });
    }, 100);
});