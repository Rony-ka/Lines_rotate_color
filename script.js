// script.js

document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');

    // --- CHANGE THESE VALUES to match the NEW updated CSS cell dimensions ---
    const actualGridRowHeight = 80; // Now 80px (for zero vertical space and 80px line length)
    const actualGridColWidth = 9;   // Now 9px (1px line + 8px horizontal space)
    // --- END CHANGE ---

    const spinSpeed = 20000;
    const easeOutDelay = 2000;

    const lineStates = new Map();
    const lineTimeouts = new Map();

    const clearAllLineAnimations = () => {
        lineStates.forEach(state => {
            if (state.animationFrameId) {
                cancelAnimationFrame(state.animationFrameId);
            }
            state.isActive = false;
            state.animationFrameId = null;
        });
        lineTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        lineTimeouts.clear();
        lineStates.clear();
    };

    const populateGrid = () => {
        clearAllLineAnimations();
        gridContainer.innerHTML = '';

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const rowsThatFit = Math.floor(viewportHeight / actualGridRowHeight);
        const colsThatFit = Math.ceil(viewportWidth / actualGridColWidth);

        const numLinesToCreate = rowsThatFit * colsThatFit;

        for (let i = 0; i < numLinesToCreate; i++) {
            const line = document.createElement('div');
            line.classList.add('line');
            gridContainer.appendChild(line);

            lineStates.set(line, {
                currentRotation: 0,
                isActive: false,
                animationFrameId: null,
                lastTime: performance.now()
            });

            line.addEventListener('mouseover', () => {
                if (lineTimeouts.has(line)) {
                    clearTimeout(lineTimeouts.get(line));
                    lineTimeouts.delete(line);
                }

                const state = lineStates.get(line);
                if (!state.isActive) {
                    state.isActive = true;
                    state.lastTime = performance.now();
                    line.classList.add('is-spinning');
                    const animateLineSpin = (currentTime) => {
                        if (!state.isActive) {
                            line.classList.remove('is-spinning');
                            state.animationFrameId = null;
                            return;
                        }

                        const deltaTime = currentTime - state.lastTime;
                        state.currentRotation += (spinSpeed * (deltaTime / 1000));
                        state.currentRotation %= 360;

                        line.style.setProperty('--line-rotation', `${state.currentRotation}deg`);
                        line.style.transform = `rotate(${state.currentRotation}deg)`;

                        state.lastTime = currentTime;
                        state.animationFrameId = requestAnimationFrame(animateLineSpin);
                    };
                    state.animationFrameId = requestAnimationFrame(animateLineSpin);
                }
            });

            line.addEventListener('mouseout', () => {
                const state = lineStates.get(line);
                if (state.isActive) {
                    state.isActive = false;
                    if (state.animationFrameId) {
                        cancelAnimationFrame(state.animationFrameId);
                        state.animationFrameId = null;
                    }

                    const timeoutId = setTimeout(() => {
                        line.style.setProperty('--line-rotation', '0deg');
                        line.style.transform = `rotate(0deg)`;
                        lineTimeouts.delete(line);
                        line.classList.remove('is-spinning');
                    }, easeOutDelay);

                    lineTimeouts.set(line, timeoutId);
                }
            });
        }
    };

    populateGrid();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(populateGrid, 200);
    });
});