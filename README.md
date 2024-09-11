# Snake Game Features for MLP Training

Here's a comprehensive list of features to log for each move in the Snake game. These features will provide rich information for training your Multi-Layer Perceptron (MLP).

## Basic Game State

1. Head position (x, y)
2. Tail position (x, y)
3. Food position (x, y)
4. Current direction (UP, DOWN, LEFT, RIGHT)
5. Snake length
6. Current score

## Distance Metrics

7. Distance of head from top wall
8. Distance of head from bottom wall
9. Distance of head from left wall
10. Distance of head from right wall
11. Distance of tail from top wall
12. Distance of tail from bottom wall
13. Distance of tail from left wall
14. Distance of tail from right wall
15. Manhattan distance between head and food
16. Euclidean distance between head and food

## Danger Indicators

17. Is there a body segment immediately above the head? (boolean)
18. Is there a body segment immediately below the head? (boolean)
19. Is there a body segment immediately to the left of the head? (boolean)
20. Is there a body segment immediately to the right of the head? (boolean)

## Relative Positions

21. Is food above the head? (boolean)
22. Is food below the head? (boolean)
23. Is food to the left of the head? (boolean)
24. Is food to the right of the head? (boolean)

## Path Information

25. Number of body segments in the same row as the head
26. Number of body segments in the same column as the head
27. Number of turns in the snake's body (count of direction changes)

## Game Progression

28. Number of moves since last eating food
29. Total number of moves in the current game

## Advanced Metrics

30. Closest distance to any body segment
31. Number of enclosed spaces (areas surrounded by the snake's body)
32. Size of the largest enclosed space
33. Is the snake's tail reachable from the head? (boolean, check if there's a clear path)

## Action and Outcome

34. Action taken (UP, DOWN, LEFT, RIGHT)
35. Was food eaten on this move? (boolean)
36. Did the game end on this move? (boolean)

## Time-based Features (if applicable)

37. Time elapsed since game start
38. Time taken for this move

Remember to normalize these features appropriately before feeding them into your MLP. Some features (like distances) might need to be scaled relative to the game board size, while boolean features can be represented as 0 or 1.

This comprehensive set of features should provide your MLP with a rich representation of the game state, allowing it to learn complex strategies for playing Snake.

IP = 117.250.157.213
