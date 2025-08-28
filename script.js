document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');

    const actualGridRowHeight = 45;
    const actualGridColWidth = 20;

    const interactionRadius = 100;
    const maxMoveDistance = 40;
    const lerpFactor = 0.1;

    const startColor = { r: 200, g: 128, b: 253 };
    const endColor = { r: 240, g: 61, b: 42 };

    const minWidth = 1.5;
    const maxWidth = 15;

    let interactionPoint = { x: null, y: null, active: false };
    let lineElements = [];

    const lerp = (a, b, t) => a + (b - a) * t;

    const lerpColor = (color1, color2, progress) => {
        const r = Math.round(lerp(color1.r, color2.r, progress));
        const g = Math.round(lerp(color1.g, color2.g, progress));
        const b = Math.round(lerp(color1.b, color2.b, progress));
        return `rgb(${r}, ${g}, ${b})`;
    };

    const clearAllLineAnimations = () => {
        gridContainer.innerHTML = '';
        lineElements = [];
    };

    const populateGrid = () => {
        clearAllLineAnimations();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const rowsThatFit = Math.floor(viewportHeight / actualGridRowHeight);
        const colsThatFit = Math.floor(viewportWidth / actualGridColWidth);
        const numLinesToCreate = rowsThatFit * colsThatFit;

        for (let i = 0; i < numLinesToCreate; i++) {
            const line = document.createElement('div');
            line.classList.add('line');
            gridContainer.appendChild(line);
            line.currentTranslateX = 0;
            line.targetTranslateX = 0;
            line.currentWidth = minWidth;
            line.targetWidth = minWidth;
            lineElements.push(line);
        }
        requestAnimationFrame(animateLines);
    };

    const animateLines = () => {
        lineElements.forEach(line => {
            const rect = line.getBoundingClientRect();
            const lineCenterX = rect.left + rect.width / 2;
            const lineCenterY = rect.top + rect.height / 2;

            let newTargetTranslateX = 0;
            let newTargetWidth = minWidth;
            let finalColor = 'transparent';

            if (interactionPoint.active) {
                const dx = interactionPoint.x - lineCenterX;
                const dy = interactionPoint.y - lineCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < interactionRadius) {
                    const influence = 1 - (distance / interactionRadius);
                    const direction = Math.sign(dx);
                    newTargetTranslateX = -direction * influence * maxMoveDistance;
                    newTargetWidth = lerp(minWidth, maxWidth, influence);
                    const movementProgress = Math.abs(newTargetTranslateX) / maxMoveDistance;
                    finalColor = lerpColor(startColor, endColor, movementProgress);
                }
            }

            line.currentTranslateX = lerp(line.currentTranslateX, newTargetTranslateX, lerpFactor);
            line.currentWidth = lerp(line.currentWidth, newTargetWidth, lerpFactor);

            // Corrected: Combine the transforms to avoid overwriting the CSS rotation
            line.style.transform = `translateX(${line.currentTranslateX}px) rotate(var(--line-rotation))`;
            line.style.setProperty('--line-color', finalColor);
            line.style.setProperty('--line-width', `${line.currentWidth}px`);
        });

        requestAnimationFrame(animateLines);
    };

    // Use touch events for mobile compatibility
    window.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        interactionPoint.x = touch.clientX;
        interactionPoint.y = touch.clientY;
        interactionPoint.active = true;
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        interactionPoint.x = touch.clientX;
        interactionPoint.y = touch.clientY;
    });

    window.addEventListener('touchend', () => {
        interactionPoint.active = false;
        interactionPoint.x = null;
        interactionPoint.y = null;
    });

    // Also keep mouse events for desktop users
    window.addEventListener('mousemove', (e) => {
        interactionPoint.x = e.clientX;
        interactionPoint.y = e.clientY;
        interactionPoint.active = true;
    });

    window.addEventListener('mouseleave', () => {
        interactionPoint.active = false;
        interactionPoint.x = null;
        interactionPoint.y = null;
    });

    populateGrid();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            populateGrid();
        }, 200);
    });
});
