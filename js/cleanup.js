// cleanup.js - 彻底清理页面
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== 开始彻底清理页面 ===');
    
    // 1. 移除所有黑色元素
    function removeBlackElements() {
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
            if (el === document.body || el === document.documentElement) return;
            
            const style = window.getComputedStyle(el);
            const bg = style.backgroundColor;
            const isBlack = 
                bg === 'rgb(0, 0, 0)' ||
                bg === 'black' ||
                el.style.backgroundColor === 'black' ||
                el.style.backgroundColor === '#000' ||
                el.style.background === 'black' ||
                el.style.background === '#000';
            
            const isMask = 
                el.classList.contains('mask') ||
                el.classList.contains('overlay') ||
                el.id.includes('mask') ||
                el.id.includes('overlay') ||
                (el.tagName === 'DIV' && 
                 (style.position === 'absolute' || style.position === 'fixed') &&
                 (style.width === '100%' || style.width === '100vw') &&
                 (style.height === '100%' || style.height === '100vh') &&
                 style.top === '0px');
            
            if (isBlack || isMask) {
                console.log('移除:', el);
                el.remove();
                return;
            }
        });
    }
    
    // 2. 修复文本颜色
    function fixTextColors() {
        document.querySelectorAll('*').forEach(el => {
            const style = window.getComputedStyle(el);
            const color = style.color;
            
            // 修复紫色和绿色文本
            if (color === 'rgb(128, 0, 128)' ||  // purple
                color === 'rgb(0, 128, 0)' ||    // green
                color === '#800080' ||
                color === '#008000') {
                el.style.color = '';
                el.classList.add('text-reset');
            }
        });
    }
    
    // 3. 修复布局
    function fixLayout() {
        // 确保body正确
        document.body.style.cssText = `
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
            position: relative !important;
            min-height: 100vh !important;
            background: white !important;
        `;
        
        // 修复主要区域
        const sections = [
            '.navbar',
            '.hero',
            '.section',
            '.container',
            '.footer'
        ];
        
        sections.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                el.style.cssText = `
                    position: relative !important;
                    z-index: ${sections.indexOf(selector) + 1} !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                `;
            }
        });
    }
    
    // 4. 修复粒子背景
    function fixParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (canvas) {
            canvas.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: -1 !important;
                pointer-events: none !important;
                opacity: 0.1 !important;
                background: transparent !important;
            `;
        }
    }
    
    // 执行所有修复
    removeBlackElements();
    fixTextColors();
    fixLayout();
    fixParticles();
    
    // 5. 观察DOM变化，防止异常元素再次出现
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) {
                    const style = window.getComputedStyle(node);
                    if (style.backgroundColor === 'rgb(0, 0, 0)') {
                        console.log('阻止黑色元素添加:', node);
                        node.remove();
                    }
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('=== 清理完成 ===');
});

// 加载完成后最终检查
window.addEventListener('load', function() {
    setTimeout(() => {
        // 强制重绘
        document.body.style.display = 'none';
        document.body.offsetHeight;
        document.body.style.display = 'block';
    }, 1000);
});