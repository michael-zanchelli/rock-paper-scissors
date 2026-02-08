"use strict";

/**
 * Rock-Paper-Scissors
 * 
 * Animate the game of rock-paper-scissors
 */

let canvas;
let ctx;

class Position {
    x;  // left
    y;  // bottom (consistent with text positioning)
    vx; // horizontal velocity
    vy; // vertical velocity
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
    }
}

/** Base class for Rock, Paper and Scissor */
class Entity {
    symbol;
    textMetrics;    // dimensions of symbol to draw
    positions = [];
    constructor(symbol, textMetrics) {
        this.symbol = symbol;
        this.textMetrics = textMetrics;
    }
    move() {
        for (const position of this.positions) {
            if (position === null)
                continue;

            // Update the position with current velocity
            position.x += position.vx;
            position.y += position.vy;

            // Implement random changes in direction over time
            // Periodically change velocity slightly to simulate random, smooth wandering
            if (Math.random() < 0.6) { // ~60% chance to change direction each frame
                position.vx += (Math.random() - 0.5) * 0.5;
                position.vy += (Math.random() - 0.5) * 0.5;

                // Optional: Apply friction/damping to keep speeds manageable
                // position.vx *= 0.98;
                // position.vy *= 0.98;
            }

            // Handle boundary collisions (bounce off edges).
            // Reverse direction if edge reached horizontally or vertically
            if ((position.x + this.textMetrics.width) > canvas.width || position.x < 0) {
                position.vx = -position.vx;
            }
            if ((position.y > canvas.height) || (position.y < this.textMetrics.actualBoundingBoxAscent)) {
                position.vy = -position.vy;
            }
        }
    }
    handleCollisions(winners) {
        for (const winner of winners) {
            if (winner === null)
                continue;
            for (let indx = 0; indx < this.positions.length; indx++) {
                const loser = this.positions[indx];
                if (loser === null)
                    continue;
                if ((winner.x > loser.x) && // left side overlaps horizontally
                    (winner.x < (loser.x + this.textMetrics.width))
                    && (winner.y < loser.y) && // bottom overlaps vertically
                    (winner.y > (loser.y - this.textMetrics.actualBoundingBoxAscent))) {
                    this.positions[indx] = null;
                }
            }
        }
    }
    draw() {
        for (const position of this.positions) {
            if (position === null)
                continue;
            /*
            const textMetrics = this.textMetrics;
            console.log(textMetrics);
            ctx.strokeRect(position.x + textMetrics.actualBoundingBoxLeft,
                position.y + textMetrics.actualBoundingBoxDescent, textMetrics.width,
                -textMetrics.actualBoundingBoxDescent - textMetrics.actualBoundingBoxAscent);
            ctx.beginPath();
            ctx.arc(position.x + textMetrics.actualBoundingBoxLeft,
                position.y + textMetrics.actualBoundingBoxDescent, 4, 0, Math.PI * 2);
            ctx.fill();
            */
            // Draw the obj/symbol
            ctx.fillText(this.symbol, position.x, position.y);
        }
    }
    itemsRemain() {
        for (const position of this.positions) {
            if (position !== null) {
                return 1;
            }
        }
        return 0;
    }
}

class Rock extends Entity {
    constructor(num) {
        const symbol = '\u{1F4A3}'; // unicode 'rock' emoji
        // rock: '\u{1FAA8}'
        super(symbol, ctx.measureText(symbol));

        // Create 'num' objects and initialize positions and velocities
        // Rocks move down from the top, center
        const positions = new Array(num);
        for (let indx = 0; indx < positions.length; indx++) {
            // Initial random velocity
            positions[indx] = new Position(canvas.width / 2,
                this.textMetrics.actualBoundingBoxAscent,
                (Math.random() - 0.5) * 6, // horiz velocity (-3 to 3)
                (Math.random() + 1) * 2); // vert velocity (2 to 4)
        }
        this.positions = positions;
    }
}

class Paper extends Entity {
    constructor(num) {
        const symbol = '\u{1F4DC}'; // unicode 'paper' emoji
        // toilet paper: '\u{F9FB}'
        super(symbol, ctx.measureText(symbol));

        // Create 'num' objects and initialize positions and velocities
        // Papers move up from the bottom, left corner
        const positions = new Array(num);
        for (let indx = 0; indx < positions.length; indx++) {
            // Initial random velocity
            positions[indx] = new Position(-this.textMetrics.actualBoundingBoxLeft,
                canvas.height,
                (Math.random() + 1) * 2, // horiz velocity (2 to 4)
                Math.random() - 2); // vert velocity (-1 to -2)
        }
        this.positions = positions;
    }
}

class Scissor extends Entity {
    constructor(num) {
        const symbol = '\u{2702}'; // unicode 'scissor' emoji 
        super(symbol, ctx.measureText(symbol));

        // Create 'num' objects and initialize positions and velocities
        // Scissors move up from the bottom, right corner
        const positions = new Array(num);
        for (let indx = 0; indx < positions.length; indx++) {
            // Initial random velocity
            positions[indx] = new Position(canvas.width - this.textMetrics.width,
                canvas.height,
                -Math.random() * 4, // horiz velocity (0 to -4)
                -Math.random() * 2); // vert velocity (0 to -2)
        }
        this.positions = positions;
    }
}

let rock;
let paper;
let scissor;

function rockPaperScissor() {
    const numObjs = 6;
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');
    ctx.font = '28px serif';
    ctx.fillStyle = 'black';

    // NB: These class initializations depend on canvas & ctx
    rock = new Rock(numObjs);
    paper = new Paper(numObjs);
    scissor = new Scissor(numObjs);

    // start the game loop
    play();
}

// Animation loop function
function play() {
    // Move objs
    rock.move();
    paper.move();
    scissor.move();

    // Handle collisions
    scissor.handleCollisions(rock.positions); // rocks break scissors
    paper.handleCollisions(scissor.positions); // scissors cut paper
    rock.handleCollisions(paper.positions); // paper covers rocks

    // Clear the entire canvas before drawing the next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw items
    rock.draw();
    paper.draw();
    scissor.draw();

    // Request the next frame, if items remain
    if ((rock.itemsRemain() + paper.itemsRemain() + scissor.itemsRemain()) > 1)
        requestAnimationFrame(play);
}

window.onload = () => {
    rockPaperScissor();
}