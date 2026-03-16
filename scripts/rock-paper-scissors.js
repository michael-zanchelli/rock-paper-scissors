"use strict";

/**
 * Rock-Paper-Scissors
 * 
 * Animate the game of rock-paper-scissors
 */

let _canvas;
let _ctx;

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
  #symbol;
  metrics;    // dimensions of symbol to draw
  positions = [];
  constructor(symbol, metrics) {
    this.#symbol = symbol;
    this.metrics = metrics;
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
      // Reverse direction if the edge is reached horizontally or vertically
      if ((position.x + this.metrics.width) > _canvas.width || position.x < 0) {
        position.vx = -position.vx;
      }
      if ((position.y > _canvas.height) || (position.y < this.metrics.actualBoundingBoxAscent)) {
        position.vy = -position.vy;
      }
    }
  }

  handleCollisions(winningObj) {
    for (const winningItem of winningObj.positions) {
      if (winningItem === null)
        continue;
      for (let indx = 0; indx < this.positions.length; indx++) {
        const losingItem = this.positions[indx];
        if (losingItem === null)
          continue;
        if (this.#overlapsHoriz(winningItem, winningObj.metrics, losingItem, this.metrics)
          && this.#overlapsVert(winningItem, winningObj.metrics, losingItem, this.metrics)) {
          this.positions[indx] = null;
        }
      }
    }
  }

  /**
   * Determine whether item1 overlaps with item2 horizontally
   */
  #overlapsHoriz(item1, item1Metrics, item2, item2Metrics) {
    return (
      ((item1.x > item2.x) && // left side overlaps
        (item1.x < (item2.x + item2Metrics.width)))
      ||
      (((item1.x + item1Metrics.width) > item2.x) && // right side overlaps
        ((item1.x + item1Metrics.width) < (item2.x + this.metrics.width)))
    )
  }

  #overlapsVert(item1, item1Metrics, item2, item2Metrics) {
    return (
      ((item1.y < item2.y) && // bottom overlaps
        (item1.y > (item2.y - item2Metrics.actualBoundingBoxAscent)))
      ||
      ((((item1.y - item1Metrics.actualBoundingBoxAscent) > item2.y) && // top overlaps
        ((item1.y - item1Metrics.actualBoundingBoxAscent) < item2.y)))
    )
  }

  draw() {
    for (const position of this.positions) {
      if (position === null)
        continue;
      /*
      const metrics = this.metrics;
      console.log(metrics);
      _ctx.strokeRect(position.x + metrics.actualBoundingBoxLeft,
          position.y + metrics.actualBoundingBoxDescent, metrics.width,
          -metrics.actualBoundingBoxDescent - metrics.actualBoundingBoxAscent);
      _ctx.beginPath();
      _ctx.arc(position.x, position.y, 3, 0, Math.PI * 2);
      _ctx.fill();
      */
      // Draw the obj/symbol
      _ctx.fillText(this.#symbol, position.x, position.y);
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
    const metrics = _ctx.measureText(symbol);
    super(symbol, metrics);

    // Create 'num' objects and initialize positions and velocities
    // Rocks move down from the top, center
    const positions = new Array(num);
    for (let indx = 0; indx < positions.length; indx++) {
      // Initial random velocity
      positions[indx] = new Position(_canvas.width / 2,
        metrics.actualBoundingBoxAscent,
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
    const metrics = _ctx.measureText(symbol);
    super(symbol, metrics);

    // Create 'num' objects and initialize positions and velocities
    // Papers move up from the bottom, left corner
    const positions = new Array(num);
    for (let indx = 0; indx < positions.length; indx++) {
      // Initial random velocity
      positions[indx] = new Position(-metrics.actualBoundingBoxLeft,
        _canvas.height - metrics.actualBoundingBoxDescent,
        (Math.random() + 1) * 2, // horiz velocity (2 to 4)
        Math.random() - 2); // vert velocity (-1 to -2)
    }
    this.positions = positions;
  }
}

class Scissor extends Entity {
  constructor(num) {
    const symbol = '\u{2702}'; // unicode 'scissor' emoji
    const metrics = _ctx.measureText(symbol);
    super(symbol, metrics);

    // Create 'num' objects and initialize positions and velocities
    // Scissors move up from the bottom, right corner
    const positions = new Array(num);
    for (let indx = 0; indx < positions.length; indx++) {
      // Initial random velocity
      positions[indx] = new Position(_canvas.width - metrics.width,
        _canvas.height - metrics.actualBoundingBoxDescent,
        -Math.random() * 4, // horiz velocity (0 to -4)
        -Math.random() * 2); // vert velocity (0 to -2)
    }
    this.positions = positions;
  }
}

let _rock;
let _paper;
let _scissor;
let _countControl;
let _button;

/**
 * Initialize game and wait for Go
 */
function init() {
  _canvas = document.getElementById('canvas');
  _ctx = _canvas.getContext('2d');
  _ctx.font = '20px serif';
  _ctx.fillStyle = 'black';

  _countControl = document.querySelector("div#rockPaperScissorWidget #count");
  _button = document.querySelector("div#rockPaperScissorWidget button");
  _button.onclick = buttonClickHandler;

  // NB: These class initializations depend on canvas & ctx
  new Rock(1).draw();
  new Paper(1).draw();
  new Scissor(1).draw();
}

function rockPaperScissor() {
  const count = Number(_countControl.value);

  // NB: These class initializations depend on canvas & ctx
  _rock = new Rock(count);
  _paper = new Paper(count);
  _scissor = new Scissor(count);

  play();
}

// Animation loop function
function play() {
  // Move objs
  _rock.move();
  _paper.move();
  _scissor.move();

  // Handle collisions
  _scissor.handleCollisions(_rock); // rocks break scissors
  _paper.handleCollisions(_scissor); // scissors cut paper
  _rock.handleCollisions(_paper); // paper covers rocks

  // Clear the entire canvas before drawing the next frame
  _ctx.clearRect(0, 0, _canvas.width, _canvas.height);

  // Draw items
  _rock.draw();
  _paper.draw();
  _scissor.draw();

  // Request the next frame, if items remain
  if ((_rock.itemsRemain() + _paper.itemsRemain() + _scissor.itemsRemain()) > 1)
    requestAnimationFrame(play);
  else
    finish();
}

function buttonClickHandler() {
  _button.disabled = true;
  _countControl.disabled = true;
  rockPaperScissor();
}

function finish() {
  _countControl.disabled = false;
  _button.disabled = false;
}

window.onload = () => {
  init();
}