// script.js

document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');

    // --- Grid cell dimensions (must match CSS) ---
    const actualGridRowHeight = 45;
    const actualGridColWidth = 20;
    // --- END Grid cell dimensions ---

    // --- Interaction parameters ---
    const interactionRadius = 100;
    const maxMoveDistance = 40;
    const lerpFactor = 0.1; // Controls the "lag" or smoothing of the movement
    // --- END Interaction parameters ---

    // --- Color parameters ---
    const startColor = { r: 200, g: 128, b: 253 };
    const endColor = { r: 240, g: 61, g: 42 };
    // --- END Color parameters ---

    // --- New width parameters ---
    const minWidth = 1.5; // The initial width of the line
    const maxWidth = 15;  // The maximum width of the line when at the center of the interaction radius
    // --- END New width parameters ---

    let interactionPoint = { x: null, y: null, active: false };
    let lineElements = [];
    let animationFrameId = null;

    const lerp = (a, b, t) => a + (b - a) * t;

    const lerpColor = (color1, color2, progress) => {
        const r = Math.round(lerp(color1.r, color2.r, progress));
        const g = Math.round(lerp(color1.g, color2.g, progress));
        const b = Math.round(lerp(color1.b, color2.b, progress));
        return `rgb(${r}, ${g}, ${b})`;
    };

    const clearAllLines = () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        gridContainer.innerHTML = '';
        lineElements = [];
    };

    const populateGrid = () => {
        clearAllLines();

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
        animationFrameId = requestAnimationFrame(animateLines);
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

            // Apply the new position, color, and width using a new CSS variable for width
            line.style.transform = `translateX(${line.currentTranslateX}px)`;
            line.style.setProperty('--line-color', finalColor);
            line.style.setProperty('--line-width', `${line.currentWidth}px`);
        });

        // Continue the animation loop only if there is an active interaction or animation in progress
        if (interactionPoint.active || lineElements.some(line => Math.abs(line.currentTranslateX) > 0.01)) {
            animationFrameId = requestAnimationFrame(animateLines);
        } else {
            animationFrameId = null;
        }
    };

    window.addEventListener('touchstart', (e) => {
        // Prevent default browser actions like scrolling or zooming
        e.preventDefault();
        const touch = e.touches[0];
        interactionPoint.x = touch.clientX;
        interactionPoint.y = touch.clientY;
        interactionPoint.active = true;
        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(animateLines);
        }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        interactionPoint.x = touch.clientX;
        interactionPoint.y = touch.clientY;
    });

    window.addEventListener('touchend', () => {
        interactionPoint.active = false;
    });

    window.addEventListener('mousemove', (e) => {
        interactionPoint.x = e.clientX;
        interactionPoint.y = e.clientY;
        interactionPoint.active = true;
        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(animateLines);
        }
    });

    window.addEventListener('mouseleave', () => {
        interactionPoint.active = false;
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
