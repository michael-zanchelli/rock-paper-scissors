"use strict";

/**
 * The Game of Rock-Paper-Scissors
 * 
 * Animate the game of rock-paper-scissors
 */
class RockPaperScissors {
}

// Get the canvas element and its context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Define the moving object
const particle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    // Initial random velocity
    vx: (Math.random() - 0.5) * 2, // Velocity X (-1 to 1)
    vy: (Math.random() - 0.5) * 2, // Velocity Y (-1 to 1)
    color: 'blue'
};

// Animation loop function
function animate() {
    // 1. Clear the entire canvas before drawing the next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Update the particle's position with current velocity
    particle.x += particle.vx;
    particle.y += particle.vy;

    // 3. Implement random changes in direction over time
    // Periodically change velocity slightly to simulate random, smooth wandering
    if (Math.random() < 0.05) { // 5% chance to change direction each frame
        particle.vx += (Math.random() - 0.5) * 0.5;
        particle.vy += (Math.random() - 0.5) * 0.5;

        // Optional: Apply friction/damping to keep speeds manageable
        particle.vx *= 0.98;
        particle.vy *= 0.98;
    }

    // 4. Handle boundary collisions (bounce off edges)
    if (particle.x + particle.radius > canvas.width || particle.x - particle.radius < 0) {
        particle.vx *= -1;
    }
    if (particle.y + particle.radius > canvas.height || particle.y - particle.radius < 0) {
        particle.vy *= -1;
    }

    // 5. Draw the particle
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
    ctx.closePath();

    // 6. Request the next frame
    requestAnimationFrame(animate);
}

// Start the animation
animate();