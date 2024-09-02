// Get DOM elements
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

// Game constants
const GRID_SIZE = 20;
const GRID_WIDTH = canvas.width / GRID_SIZE;
const GRID_HEIGHT = canvas.height / GRID_SIZE;

// Game variables
let snake,
  food,
  direction,
  score,
  gameOver,
  gameLoop,
  shrinkInterval,
  logInterval;
let gameLog = [];
let totalMoves = 0;
let movesSinceEating = 0;
let gameStartTime;

// Define directions
const Direction = {
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
};

// Initialize the game
function init() {
  totalMoves = 0;
  movesSinceEating = 0;
  gameStartTime = Date.now();
  // Start with a single segment snake in the middle of the grid
  snake = [{ x: Math.floor(GRID_WIDTH / 2), y: Math.floor(GRID_HEIGHT / 2) }];
  direction = Direction.RIGHT;
  score = 0;
  gameOver = false;
  justAte = false;
  food = spawnFood();
  updateScore();

  // Set up the logging interval (every 5 seconds)
  logInterval = setInterval(sendLogToServer, 5000);
}
// Calculate distance between two points
function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Calculate Manhattan distance between two points
function manhattanDistance(x1, y1, x2, y2) {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

// Check if there's a clear path between two points, using BFS
function isClearPath(start, end) {
  const queue = [start];
  const visited = new Set();
  const directions = [
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 }, // down
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }, // right
  ];

  function isValid(x, y) {
    return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
  }

  function isObstacle(x, y) {
    return snake.some((segment, index) => {
      // Ignore the head (index 0) and the last segment
      return (
        index > 0 &&
        index < snake.length - 1 &&
        segment.x === x &&
        segment.y === y
      );
    });
  }

  while (queue.length > 0) {
    const current = queue.shift();
    const key = `${current.x},${current.y}`;

    if (current.x === end.x && current.y === end.y) {
      return true; // Path found
    }

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);

    for (const dir of directions) {
      const newX = (current.x + dir.dx + GRID_WIDTH) % GRID_WIDTH;
      const newY = (current.y + dir.dy + GRID_HEIGHT) % GRID_HEIGHT;

      if (!isObstacle(newX, newY) && !visited.has(`${newX},${newY}`)) {
        queue.push({ x: newX, y: newY });
      }
    }
  }

  return false; // No path found
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
    gameLog[gameLog.length - 1].food_eaten = true;
    movesSinceEating = 0;
  } else {
    // Snake Poop
    //snake.poop();
    snake.pop();
    movesSinceEating++;
  }

  totalMoves++;
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
    fetch("http://192.168.0.105:8000", {
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

// Count enclosed spaces
function countEnclosedSpaces() {
  // Implementation to count and measure enclosed spaces
  // This is a placeholder and needs to be implemented
  return { count: 0, largestSize: 0 };
}

// Count the number of turns in the snake's body
function countBodyTurns() {
  let turns = 0;
  for (let i = 1; i < snake.length - 1; i++) {
    const prev = snake[i - 1];
    const curr = snake[i];
    const next = snake[i + 1];
    if (
      (prev.x === curr.x && curr.x !== next.x) ||
      (prev.y === curr.y && curr.y !== next.y)
    ) {
      turns++;
    }
  }
  return turns;
}

// Log move function
function logMove(action) {
  const head = snake[0];
  const tail = snake[snake.length - 1];
  const enclosedSpaces = countEnclosedSpaces();

  const state = {
    head_x: head.x,
    head_y: head.y,
    tail_x: tail.x,
    tail_y: tail.y,
    food_x: food.x,
    food_y: food.y,
    direction: direction,
    snake_length: snake.length,
    score: score,
    head_top_distance: head.y,
    head_bottom_distance: GRID_HEIGHT - head.y,
    head_left_distance: head.x,
    head_right_distance: GRID_WIDTH - head.x,
    tail_top_distance: tail.y,
    tail_bottom_distance: GRID_HEIGHT - tail.y,
    tail_left_distance: tail.x,
    tail_right_distance: GRID_WIDTH - tail.x,
    manhattan_distance_to_food: manhattanDistance(
      head.x,
      head.y,
      food.x,
      food.y
    ),
    euclidean_distance_to_food: distance(head.x, head.y, food.x, food.y),
    danger_up: snake.some(
      (segment) =>
        segment.x === head.x &&
        segment.y === (head.y - 1 + GRID_HEIGHT) % GRID_HEIGHT
    ),
    danger_down: snake.some(
      (segment) =>
        segment.x === head.x && segment.y === (head.y + 1) % GRID_HEIGHT
    ),
    danger_left: snake.some(
      (segment) =>
        segment.y === head.y &&
        segment.x === (head.x - 1 + GRID_WIDTH) % GRID_WIDTH
    ),
    danger_right: snake.some(
      (segment) =>
        segment.y === head.y && segment.x === (head.x + 1) % GRID_WIDTH
    ),
    food_above: food.y < head.y,
    food_below: food.y > head.y,
    food_left: food.x < head.x,
    food_right: food.x > head.x,
    body_segments_same_row:
      snake.filter((segment) => segment.y === head.y).length - 1,
    body_segments_same_column:
      snake.filter((segment) => segment.x === head.x).length - 1,
    body_turns: countBodyTurns(),
    moves_since_eating: movesSinceEating,
    total_moves: totalMoves,
    closest_body_distance: Math.min(
      ...snake
        .slice(1)
        .map((segment) => distance(head.x, head.y, segment.x, segment.y))
    ),
    enclosed_spaces_count: enclosedSpaces.count,
    largest_enclosed_space: enclosedSpaces.largestSize,
    tail_reachable: isClearPath(head, tail),
    food_eaten: false,
    game_ended: gameOver,
    time_elapsed: (Date.now() - gameStartTime) / 1000, // in seconds
    action: action,
  };

  gameLog.push(Object.values(state));
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
function setupSwipeControls() {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  canvas.addEventListener("touchstart", function (event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
  });

  canvas.addEventListener("touchend", function (event) {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;

    handleSwipe();
  });

  function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY) {
      if (deltaX > 0) {
        triggerKeyPress("ArrowRight"); // Swipe right
      } else {
        triggerKeyPress("ArrowLeft"); // Swipe left
      }
    } else {
      if (deltaY > 0) {
        triggerKeyPress("ArrowDown"); // Swipe down
      } else {
        triggerKeyPress("ArrowUp"); // Swipe up
      }
    }
  }

  function triggerKeyPress(key) {
    const event = new KeyboardEvent("keydown", { key: key });
    document.dispatchEvent(event);
  }
}

// Start the game
init();
setupSwipeControls();
gameLoop = setInterval(gameStep, 100); // Update every 100ms
