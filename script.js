// script.js

document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');

    // ... (rest of the script remains the same)

    // Use touch events for mobile compatibility
    gridContainer.addEventListener('touchstart', (e) => {
        // Prevent default browser actions like scrolling or zooming
        e.preventDefault();
        const touch = e.touches[0];
        interactionPoint.x = touch.clientX;
        interactionPoint.y = touch.clientY;
        interactionPoint.active = true;
        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(animateLines);
        }
    }, { passive: false }); // { passive: false } allows preventDefault to work

    gridContainer.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        interactionPoint.x = touch.clientX;
        interactionPoint.y = touch.clientY;
    });

    gridContainer.addEventListener('touchend', () => {
        // Deactivate the interaction point to return lines to their original state
        interactionPoint.active = false;
        // Don't set x and y to null so the lines can smoothly return
    });

    // Also keep mouse events for desktop users
    gridContainer.addEventListener('mousemove', (e) => {
        interactionPoint.x = e.clientX;
        interactionPoint.y = e.clientY;
        interactionPoint.active = true;
        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(animateLines);
        }
    });

    // Add mouseleave to reset on desktop when mouse leaves the grid container
    gridContainer.addEventListener('mouseleave', () => {
        interactionPoint.active = false;
    });

    // ... (rest of the script remains the same)
});
