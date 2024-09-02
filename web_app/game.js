// Get DOM elements
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

// Game constants
const GRID_SIZE = 20;
const GRID_WIDTH = canvas.width / GRID_SIZE;
const GRID_HEIGHT = canvas.height / GRID_SIZE;
const SHRINK_INTERVAL = 2000; // 2 seconds in milliseconds

// Game variables
let snake, food, direction, score, gameOver, gameLoop, shrinkInterval;
let justAte = false;
let gameLog = [];

// Define directions
const Direction = {
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
};

// Initialize the game
function init() {
  // Start with a single segment snake in the middle of the grid
  snake = [{ x: Math.floor(GRID_WIDTH / 2), y: Math.floor(GRID_HEIGHT / 2) }];
  direction = Direction.RIGHT;
  score = 0;
  gameOver = false;
  justAte = false;
  food = spawnFood();
  updateScore();

  // Set up the shrinking interval
  shrinkInterval = setInterval(shrinkSnake, SHRINK_INTERVAL);
  // Set up the logging interval (every 5 seconds)
  logInterval = setInterval(sendLogToServer, 5000);
}

// Spawn food at a random location
function spawnFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT),
    };
  } while (
    snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
  );
  return newFood;
}

// Move the snake
function move() {
  const head = { ...snake[0] };

  // Update head position based on direction
  switch (direction) {
    case Direction.UP:
      head.y = (head.y - 1 + GRID_HEIGHT) % GRID_HEIGHT;
      break;
    case Direction.DOWN:
      head.y = (head.y + 1) % GRID_HEIGHT;
      break;
    case Direction.LEFT:
      head.x = (head.x - 1 + GRID_WIDTH) % GRID_WIDTH;
      break;
    case Direction.RIGHT:
      head.x = (head.x + 1) % GRID_WIDTH;
      break;
  }

  // Check for collision with self
  if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    gameOver = true;
    return;
  }

  // Add new head to the snake
  snake.unshift(head);

  // Check if snake ate food
  if (head.x === food.x && head.y === food.y) {
    score++;
    updateScore();
    food = spawnFood();
    justAte = true;
    setTimeout(() => {
      justAte = false;
    }, SHRINK_INTERVAL);
  } else {
    // Remove tail if no food was eaten
    snake.pop();
  }
}

// Update score display
function updateScore() {
  scoreElement.textContent = `Score: ${score}`;
}

// Draw the game state on the canvas
function draw() {
  // Clear canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  ctx.fillStyle = "lime";
  snake.forEach((segment) => {
    ctx.fillRect(
      segment.x * GRID_SIZE,
      segment.y * GRID_SIZE,
      GRID_SIZE,
      GRID_SIZE
    );
  });

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
}

// Log move function
function logMove(action) {
  const state = {
    head_x: snake[0].x,
    head_y: snake[0].y,
    food_x: food.x,
    food_y: food.y,
    direction: direction,
    length: snake.length,
  };

  gameLog.push([
    state.head_x,
    state.head_y,
    state.food_x,
    state.food_y,
    state.direction,
    state.length,
    action,
  ]);
}

// Send log to server
function sendLogToServer() {
  if (gameLog.length > 0) {
    fetch("http://localhost:8040", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gameLog),
    })
      .then((response) => response.text())
      .then((data) => console.log("Log sent:", data))
      .catch((error) => {
        console.error("Error sending log:", error);
      });

    gameLog = []; // Clear the log after sending
  }
}

// Main game loop
function gameStep() {
  move();
  draw();

  if (gameOver) {
    clearInterval(gameLoop);
    clearInterval(shrinkInterval);
    clearInterval(logInterval);
    sendLogToServer(); // Send any remaining logs
    alert(`Game Over! Your score: ${score}`);
  }
}

// Handle keyboard input
document.addEventListener("keydown", (event) => {
  let action = "";
  switch (event.key) {
    case "ArrowUp":
      if (direction !== Direction.DOWN) {
        direction = Direction.UP;
        action = "UP";
      }
      break;
    case "ArrowDown":
      if (direction !== Direction.UP) {
        direction = Direction.DOWN;
        action = "DOWN";
      }
      break;
    case "ArrowLeft":
      if (direction !== Direction.RIGHT) {
        direction = Direction.LEFT;
        action = "LEFT";
      }
      break;
    case "ArrowRight":
      if (direction !== Direction.LEFT) {
        direction = Direction.RIGHT;
        action = "RIGHT";
      }
      break;
  }

  if (action) {
    logMove(action);
  }
});

// New function to shrink the snake
function shrinkSnake() {
  if (snake.length > 1 && !justAte) {
    snake.pop();
  }
  // End the game if the snake becomes too short
  if (snake.length === 0) {
    gameOver = true;
  }
}

// Start the game
init();
gameLoop = setInterval(gameStep, 100); // Update every 100ms
