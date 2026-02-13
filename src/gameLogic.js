export const GRID_SIZE = 20;
export const INITIAL_LENGTH = 3;

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITES = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
};

export function turnDirection(current, next) {
  if (!DIRECTIONS[next]) return current;
  if (OPPOSITES[current] === next) return current;
  return next;
}

export function makeInitialSnake(length = INITIAL_LENGTH) {
  const snake = [];
  const startX = Math.floor(GRID_SIZE / 2);
  const startY = Math.floor(GRID_SIZE / 2);
  for (let i = 0; i < length; i += 1) {
    snake.push({ x: startX - i, y: startY });
  }
  return snake;
}

export function randomFreeCell(snake, rng = Math.random) {
  const occupied = new Set(snake.map((part) => `${part.x},${part.y}`));
  const free = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) free.push({ x, y });
    }
  }
  if (free.length === 0) return null;
  const index = Math.floor(rng() * free.length);
  return free[index];
}

export function createInitialState(rng = Math.random) {
  const snake = makeInitialSnake();
  return {
    snake,
    direction: 'right',
    queuedDirection: 'right',
    food: randomFreeCell(snake, rng),
    score: 0,
    isGameOver: false,
    isPaused: false
  };
}

function isOutOfBounds(point) {
  return point.x < 0 || point.y < 0 || point.x >= GRID_SIZE || point.y >= GRID_SIZE;
}

function isOnSnake(point, snake) {
  return snake.some((part) => part.x === point.x && part.y === point.y);
}

export function nextHead(snake, direction) {
  const current = snake[0];
  const delta = DIRECTIONS[direction];
  return { x: current.x + delta.x, y: current.y + delta.y };
}

export function step(state, rng = Math.random) {
  if (state.isGameOver || state.isPaused) return state;

  const direction = turnDirection(state.direction, state.queuedDirection);
  const head = nextHead(state.snake, direction);
  const willEat = state.food && head.x === state.food.x && head.y === state.food.y;
  const bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);

  if (isOutOfBounds(head) || isOnSnake(head, bodyToCheck)) {
    return {
      ...state,
      direction,
      queuedDirection: direction,
      isGameOver: true
    };
  }

  const nextSnake = [head, ...state.snake];
  if (!willEat) nextSnake.pop();

  const nextFood = willEat ? randomFreeCell(nextSnake, rng) : state.food;

  return {
    ...state,
    snake: nextSnake,
    direction,
    queuedDirection: direction,
    food: nextFood,
    score: state.score + (willEat ? 1 : 0),
    isGameOver: willEat && nextFood === null ? true : false
  };
}
