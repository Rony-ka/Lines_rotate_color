// script.js

document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');

    // --- Grid cell dimensions (must match CSS) ---
    const actualGridRowHeight = 45;
    const actualGridColWidth = 20;
    // --- END Grid cell dimensions ---

    // --- Interaction parameters ---
    const interactionRadius = 150; // Increased for better mobile interaction
    const maxMoveDistance = 40;
    const lerpFactor = 0.1; // Controls the "lag" or smoothing of the movement
    // --- END Interaction parameters ---

    // --- Color and width parameters ---
    const startColor = { r: 240, g: 61, b: 42 };
    const endColor = { r: 200, g: 128, b: 253 };
    const minWidth = 1.5;
    const maxWidth = 15;
    const minHeight = 45;
    const maxHeight = 80;
    // --- END Color and width parameters ---

    let interactionPoint = { x: null, y: null, active: false };
    let lineElements = [];
    let isMouseActive = false;
    let isTouchActive = false;

    const lerp = (a, b, t) => a + (b - a) * t;

    const lerpColor = (color1, color2, progress) => {
        const r = Math.round(lerp(color1.r, color2.r, progress));
        const g = Math.round(lerp(color1.g, color2.g, progress));
        const b = Math.round(lerp(color1.b, color2.b, progress));
        return `rgb(${r}, ${g}, ${b})`;
    };

    const clearGrid = () => {
        gridContainer.innerHTML = '';
        lineElements = [];
    };

    const populateGrid = () => {
        clearGrid();

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
            line.currentTranslateY = 0;
            line.targetTranslateY = 0;
            line.currentWidth = minWidth;
            line.targetWidth = minWidth;
            line.currentHeight = minHeight;
            line.targetHeight = minHeight;

            lineElements.push(line);
        }
        animateLines(); // Start the animation loop
    };

    const animateLines = () => {
        lineElements.forEach(line => {
            const rect = line.getBoundingClientRect();
            const lineCenterX = rect.left + rect.width / 2;
            const lineCenterY = rect.top + rect.height / 2;

            let newTargetTranslateX = 0;
            let newTargetTranslateY = 0;
            let newTargetWidth = minWidth;
            let newTargetHeight = minHeight;
            let finalColor = 'transparent';

            if (interactionPoint.active) {
                const dx = interactionPoint.x - lineCenterX;
                const dy = interactionPoint.y - lineCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < interactionRadius) {
                    const influence = 1 - (distance / interactionRadius);
                    const directionX = Math.sign(dx);
                    const directionY = Math.sign(dy);

                    newTargetTranslateX = -directionX * influence * maxMoveDistance;
                    newTargetTranslateY = -directionY * influence * maxMoveDistance;
                    newTargetWidth = lerp(minWidth, maxWidth, influence);
                    newTargetHeight = lerp(minHeight, maxHeight, influence);
                    finalColor = lerpColor(startColor, endColor, influence);
                }
            }

            line.currentTranslateX = lerp(line.currentTranslateX, newTargetTranslateX, lerpFactor);
            line.currentTranslateY = lerp(line.currentTranslateY, newTargetTranslateY, lerpFactor);
            line.currentWidth = lerp(line.currentWidth, newTargetWidth, lerpFactor);
            line.currentHeight = lerp(line.currentHeight, newTargetHeight, lerpFactor);

            line.style.transform = `translate(${line.currentTranslateX}px, ${line.currentTranslateY}px)`;
            line.style.setProperty('--line-color', finalColor);
            line.style.setProperty('--line-width', `${line.currentWidth}px`);
            line.style.setProperty('--line-height', `${line.currentHeight}px`);
        });

        requestAnimationFrame(animateLines);
    };

    // --- Event Listeners ---
    // Touch Events
    window.addEventListener('touchstart', (e) => {
        isTouchActive = true;
        isMouseActive = false; // Disable mouse events
        const touch = e.touches[0];
        interactionPoint.x = touch.clientX;
        interactionPoint.y = touch.clientY;
        interactionPoint.active = true;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (isTouchActive) {
            const touch = e.touches[0];
            interactionPoint.x = touch.clientX;
            interactionPoint.y = touch.clientY;
        }
    }, { passive: true });

    window.addEventListener('touchend', () => {
        isTouchActive = false;
        interactionPoint.active = false;
        interactionPoint.x = null;
        interactionPoint.y = null;
    });

    // Mouse Events
    window.addEventListener('mousemove', (e) => {
        if (!isTouchActive) { // Only run if not a touch interaction
            interactionPoint.x = e.clientX;
            interactionPoint.y = e.clientY;
            interactionPoint.active = true;
        }
    });

    window.addEventListener('mouseleave', () => {
        if (!isTouchActive) {
            interactionPoint.active = false;
            interactionPoint.x = null;
            interactionPoint.y = null;
        }
    });

    // Handle initial load and window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            populateGrid();
        }, 200);
    });

    populateGrid();
});
