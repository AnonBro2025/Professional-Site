import test from 'node:test';
import assert from 'node:assert/strict';

import {
  GRID_SIZE,
  createInitialState,
  randomFreeCell,
  step,
  turnDirection
} from '../src/gameLogic.js';

test('snake moves one cell per tick', () => {
  const state = createInitialState(() => 0);
  const next = step(state, () => 0);
  assert.equal(next.snake[0].x, state.snake[0].x + 1);
  assert.equal(next.snake[0].y, state.snake[0].y);
  assert.equal(next.score, 0);
});

test('snake grows and score increments when food is eaten', () => {
  const state = createInitialState(() => 0);
  const foodAtHeadNext = { ...state, food: { x: state.snake[0].x + 1, y: state.snake[0].y } };
  const next = step(foodAtHeadNext, () => 0);
  assert.equal(next.snake.length, state.snake.length + 1);
  assert.equal(next.score, 1);
});

test('collision with wall ends game', () => {
  const y = Math.floor(GRID_SIZE / 2);
  const state = {
    snake: [
      { x: GRID_SIZE - 1, y },
      { x: GRID_SIZE - 2, y },
      { x: GRID_SIZE - 3, y }
    ],
    direction: 'right',
    queuedDirection: 'right',
    food: { x: 0, y: 0 },
    score: 0,
    isGameOver: false,
    isPaused: false
  };

  const next = step(state, () => 0);
  assert.equal(next.isGameOver, true);
});

test('collision with self ends game', () => {
  const state = {
    snake: [
      { x: 6, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 7, y: 6 },
      { x: 7, y: 5 }
    ],
    direction: 'left',
    queuedDirection: 'down',
    food: { x: 0, y: 0 },
    score: 0,
    isGameOver: false,
    isPaused: false
  };

  const next = step(state, () => 0);
  assert.equal(next.isGameOver, true);
});

test('food placement avoids snake and uses deterministic rng', () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 }
  ];
  const pickFirst = randomFreeCell(snake, () => 0);
  assert.deepEqual(pickFirst, { x: 2, y: 0 });

  const pickLast = randomFreeCell(snake, () => 0.999999);
  assert.notDeepEqual(pickLast, { x: 0, y: 0 });
  assert.notDeepEqual(pickLast, { x: 1, y: 0 });
});

test('reverse direction input is ignored', () => {
  assert.equal(turnDirection('left', 'right'), 'left');
  assert.equal(turnDirection('up', 'down'), 'up');
  assert.equal(turnDirection('left', 'up'), 'up');
});
