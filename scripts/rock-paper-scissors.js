"use strict";

/**
 * Rock-Paper-Scissors
 * 
 * Animate the game of rock-paper-scissors
 */

const numObjs = 5;
const rocks = new Array(numObjs);
const papers = new Array(numObjs);
const scissors = new Array(numObjs);

const fudge = 12;

let canvas;
let ctx;


function rockPaperScissors() {
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');
    ctx.font = '24px bold'; //  Wingdings';
    ctx.fillStyle = 'black';

    // Define the moving objects
    // Rocks move down from the top, center
    for (let indx = 0; indx < rocks.length; indx++) {
        rocks[indx] = {
            x: canvas.width / 2,
            y: fudge,
            // Initial random velocity
            // vx: (Math.random() - 0.5) * 3, // Velocity X (-1 to 1)
            // vy: (Math.random() - 0.5) * 3, // Velocity Y (-1 to 1)
            // Inital velocity
            vx: 1,
            vy: 3,
            symbol: '\u{1FAA8}', // 'R', // '\u004D',
        }
    }

    // Papers: papers move up from the bottom, left corner
    for (let indx = 0; indx < papers.length; indx++) {
        papers[indx] = {
            x: fudge,
            y: canvas.height - fudge,
            vx: 3,
            vy: -1,
            symbol: '\u{1F4C4}', //  'P' // '\u0032',
        }
    }

    // Scissors: scissors move up from the bottom, right corner
    for (let indx = 0; indx < scissors.length; indx++) {
        scissors[indx] = {
            x: canvas.width - fudge,
            y: canvas.height - fudge,
            vx: -3,
            vy: -1,
            symbol: '\u{2702}', // 'S', // '\u0022',
        }
    }

    // start the game loop
    play();
}

// Animation loop function
function play() {
    moveObjs([rocks, papers, scissors]);

    handleCollisions(rocks, scissors); // rocks break scissors
    handleCollisions(scissors, papers); // scissors cut paper
    handleCollisions(papers, rocks); // paper covers rocks

    // Clear the entire canvas before drawing the next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawObjs([rocks, papers, scissors]);

    // Request the next frame, if objs remain
    if (itemsRemain([rocks, papers, scissors]))
        requestAnimationFrame(play);
}

function moveObjs(objArray) {
    for (const objs of objArray) {
        for (const obj of objs) {
            if (obj === null)
                continue;

            // Update the position with current velocity
            obj.x += obj.vx;
            obj.y += obj.vy;

            // Implement random changes in direction over time
            // Periodically change velocity slightly to simulate random, smooth wandering
            if (Math.random() < 0.6) { // ~60% chance to change direction each frame
                obj.vx += (Math.random() - 0.5) * 0.5;
                obj.vy += (Math.random() - 0.5) * 0.5;

                // Optional: Apply friction/damping to keep speeds manageable
                // obj.vx *= 0.98;
                // obj.vy *= 0.98;
            }

            // Handle boundary collisions (bounce off edges)
            if (obj.x + fudge > canvas.width || obj.x - fudge < 0) {
                obj.vx = -obj.vx;
            }
            if (obj.y + fudge > canvas.height || obj.y - fudge < 0) {
                obj.vy = -obj.vy;
            }
        }
    }

}

function handleCollisions(winners, losers) {
    for (let windx = 0; windx < winners.length; windx++) {
        const winner = winners[windx];
        if (winner === null)
            continue;
        for (let lindx = 0; lindx < losers.length; lindx++) {
            const loser = losers[lindx];
            if (loser === null)
                continue;
            if (winner.x < (loser.x + fudge) /* center overlaps horiz */
                && winner.x > (loser.x - fudge)
                && winner.y < (loser.y + fudge) /* center overlaps vert */
                && winner.y > (loser.y - fudge)) {
                console.log("winner[" + windx + "] (" + winner.symbol + ") " +
                    "beat loser[" + lindx + "] (" + loser.symbol + ")");
                losers[lindx] = null;
            }
        }
    }
}

function drawObjs(objArray) {
    for (const objs of objArray) {
        for (const obj of objs) {
            if (obj === null)
                continue;

            // console.log("drawing " + obj.symbol + " (" + obj.x + ", " + obj.y + ")");

            // ctx.strokeRect(obj.x, obj.y, fudge*2, -fudge*2);

            // Draw the obj/symbol
            ctx.fillText(obj.symbol, obj.x, obj.y);
        }
    }
}

/** itemsRemain
 * Return TRUE if items remain in more than one collection,
 * i.e. rocks AND papers remain OR rocks AND scissors remain, etc.
 * Conversely, if items remain in ONLY ONE collection, then that
 * collection wins!
 */
function itemsRemain(objArray) {
    let numCollections = 0;
    for (const objs of objArray) {
        for (const obj of objs) {
            if (obj !== null) {
                numCollections++;
                break;
            }
        }
        if (numCollections > 1)
            return true;
    }
    return false;
}

window.onload = () => {
    rockPaperScissors();
}