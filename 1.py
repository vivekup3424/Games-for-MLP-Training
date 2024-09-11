import pygame
import random
import csv
from enum import Enum

# Initialize Pygame
pygame.init()

# Constants
WIDTH, HEIGHT = 1400, 1400
GRID_SIZE = 20
GRID_WIDTH = WIDTH // GRID_SIZE
GRID_HEIGHT = HEIGHT // GRID_SIZE
FPS = 10

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)

# Directions
class Direction(Enum):
    UP = 1
    DOWN = 2
    LEFT = 3
    RIGHT = 4

# Initialize screen
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Snake Game")
clock = pygame.time.Clock()

class SnakeGame:
    def __init__(self):
        self.reset()

    def reset(self):
        self.snake = [(GRID_WIDTH // 2, GRID_HEIGHT // 2)]
        self.direction = Direction.RIGHT
        self.food = self.spawn_food()
        self.score = 0
        self.game_over = False

    def spawn_food(self):
        while True:
            food = (random.randint(0, GRID_WIDTH - 1), random.randint(0, GRID_HEIGHT - 1))
            if food not in self.snake:
                return food

    def move(self):
        head = self.snake[0]
        if self.direction == Direction.UP:
            new_head = (head[0], (head[1] - 1) % GRID_HEIGHT)
        elif self.direction == Direction.DOWN:
            new_head = (head[0], (head[1] + 1) % GRID_HEIGHT)
        elif self.direction == Direction.LEFT:
            new_head = ((head[0] - 1) % GRID_WIDTH, head[1])
        elif self.direction == Direction.RIGHT:
            new_head = ((head[0] + 1) % GRID_WIDTH, head[1])

        if new_head in self.snake[1:]:
            self.game_over = True
        else:
            self.snake.insert(0, new_head)
            if new_head == self.food:
                self.score += 1
                self.food = self.spawn_food()
            else:
                self.snake.pop()

    def get_state(self):
        head = self.snake[0]
        return {
            'head_x': head[0],
            'head_y': head[1],
            'food_x': self.food[0],
            'food_y': self.food[1],
            'direction': self.direction.value,
            'length': len(self.snake)
        }

def log_move(state, action, logger):
    logger.writerow([
        state['head_x'], state['head_y'],
        state['food_x'], state['food_y'],
        state['direction'], state['length'],
        action
    ])

def main():
    game = SnakeGame()
    
    with open('snake_game_log.csv', 'w', newline='') as file:
        logger = csv.writer(file)
        logger.writerow(['head_x', 'head_y', 'food_x', 'food_y', 'direction', 'length', 'action'])

        while not game.game_over:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    return
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_UP and game.direction != Direction.DOWN:
                        game.direction = Direction.UP
                        log_move(game.get_state(), 'UP', logger)
                    elif event.key == pygame.K_DOWN and game.direction != Direction.UP:
                        game.direction = Direction.DOWN
                        log_move(game.get_state(), 'DOWN', logger)
                    elif event.key == pygame.K_LEFT and game.direction != Direction.RIGHT:
                        game.direction = Direction.LEFT
                        log_move(game.get_state(), 'LEFT', logger)
                    elif event.key == pygame.K_RIGHT and game.direction != Direction.LEFT:
                        game.direction = Direction.RIGHT
                        log_move(game.get_state(), 'RIGHT', logger)

            game.move()

            screen.fill(BLACK)
            for segment in game.snake:
                pygame.draw.rect(screen, GREEN, (segment[0]*GRID_SIZE, segment[1]*GRID_SIZE, GRID_SIZE, GRID_SIZE))
            pygame.draw.rect(screen, RED, (game.food[0]*GRID_SIZE, game.food[1]*GRID_SIZE, GRID_SIZE, GRID_SIZE))
            pygame.display.flip()
            clock.tick(FPS)

        print(f"Game Over! Score: {game.score}")
        pygame.quit()

if __name__ == "__main__":
    main()