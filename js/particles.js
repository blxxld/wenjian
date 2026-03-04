// 优化后的粒子背景效果
function initParticles() {
    // 1. 安全检查：避免重复创建 Canvas
    if (document.getElementById('particles-canvas')) return;
    
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        background: transparent;
    `;
    document.body.appendChild(canvas);

    // 2. 安全初始化上下文
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles = [];
    let mouse = { x: 0, y: 0 };
    const maxDistance = 100; // 通用距离阈值

    // 3. 优化边界处理（反弹式边界）
    function handleBoundary(particle) {
        if (particle.x > canvas.width) {
            particle.x = 0;
            particle.speedX = -Math.abs(particle.speedX); // 反弹
        } else if (particle.x < 0) {
            particle.x = canvas.width;
            particle.speedX = Math.abs(particle.speedX); // 反弹
        }
        
        if (particle.y > canvas.height) {
            particle.y = 0;
            particle.speedY = -Math.abs(particle.speedY); // 反弹
        } else if (particle.y < 0) {
            particle.y = canvas.height;
            particle.speedY = Math.abs(particle.speedY); // 反弹
        }
    }

    // 4. 粒子类（修复边界处理和性能）
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 2; // 速度范围扩大
            this.speedY = (Math.random() - 0.5) * 2;
            this.color = `rgba(67, 97, 238,  $ {Math.random() * 0.5 + 0.1})`;
        }

        update() {
            // 基础移动
            this.x += this.speedX;
            this.y += this.speedY;
            
            // 修复边界处理（反弹）
            handleBoundary(this);
            
            // 鼠标交互（优化距离计算）
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxDistance) {
                const angle = Math.atan2(dy, dx);
                const force = (maxDistance - distance) / maxDistance;
                this.x -= Math.cos(angle) * force * 2;
                this.y -= Math.sin(angle) * force * 2;
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 5. 优化粒子数量计算（确保小屏幕也有合理粒子数）
    function createParticles() {
        particles = [];
        const minParticles = 50; // 最小粒子数
        const maxParticles = 100; // 最大粒子数
        const area = canvas.width * canvas.height;
        
        // 动态计算粒子数：确保小屏幕至少 50 粒子
        const count = Math.min(
            maxParticles, 
            Math.max(minParticles, Math.floor(area / 15000))
        );
        
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    // 6. 优化连接线性能（减少冗余计算）
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    const opacity = 1 - (distance / maxDistance);
                    ctx.strokeStyle = `rgba(67, 97, 238,  $ {opacity * 0.2})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    // 7. 优化动画循环（添加性能保护）
    function animate() {
        // 仅在可见时渲染
        if (document.hidden) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        connectParticles();
        requestAnimationFrame(animate);
    }

    // 8. 修复鼠标坐标（考虑页面滚动）
    function updateMousePosition(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }

    // 9. 优化画布大小（使用 resizeObserver 更高效）
    function resizeCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            createParticles();
        }
    }

    // 初始化
    resizeCanvas();
    createParticles();
    animate();

    // 10. 事件监听（使用更高效的方式）
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mousemove', updateMousePosition);
}

// 在页面加载后初始化（仅当存在 hero 区域时）
if (document.querySelector('.hero')) {
    // 确保 DOM 加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initParticles);
    } else {
        initParticles();
    }
}