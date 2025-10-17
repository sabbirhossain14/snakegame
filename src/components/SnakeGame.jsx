import React, { useState, useEffect, useRef } from "react";

const BOARD_SIZE = 24;
const DEFAULT_SPEED = 150; // Default speed (ms)

// Generate random food position
const getRandomPosition = (snake = []) => {
  let newPos;
  do {
    newPos = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  } while (snake.some((seg) => seg.x === newPos.x && seg.y === newPos.y));
  return newPos;
};

const SnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState(getRandomPosition());
  const [direction, setDirection] = useState("RIGHT");
  const [speed, setSpeed] = useState(DEFAULT_SPEED); // Manual control
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const moveRef = useRef(direction);
  moveRef.current = direction;

  // Handle keyboard input
  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowUp":
        if (moveRef.current !== "DOWN") setDirection("UP");
        break;
      case "ArrowDown":
        if (moveRef.current !== "UP") setDirection("DOWN");
        break;
      case "ArrowLeft":
        if (moveRef.current !== "RIGHT") setDirection("LEFT");
        break;
      case "ArrowRight":
        if (moveRef.current !== "LEFT") setDirection("RIGHT");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameRunning || paused) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };

        // Move snake one cell
        switch (moveRef.current) {
          case "UP":
            head.y -= 1;
            break;
          case "DOWN":
            head.y += 1;
            break;
          case "LEFT":
            head.x -= 1;
            break;
          case "RIGHT":
            head.x += 1;
            break;
          default:
            break;
        }

        // Wall collision
        if (
          head.x < 0 ||
          head.x >= BOARD_SIZE ||
          head.y < 0 ||
          head.y >= BOARD_SIZE
        ) {
          setGameRunning(false);
          setGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some((seg) => seg.x === head.x && seg.y === head.y)) {
          setGameRunning(false);
          setGameOver(true);
          return prevSnake;
        }

        // Add new head
        const newSnake = [head, ...prevSnake];

        // Food eaten
        if (head.x === food.x && head.y === food.y) {
          setScore((prev) => prev + 5);
          setFood(getRandomPosition(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [gameRunning, paused, speed, food]);

  // Start or restart game
  const startGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(getRandomPosition());
    setDirection("RIGHT");
    setScore(0);
    setSpeed(DEFAULT_SPEED);
    setGameRunning(true);
    setPaused(false);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-300 via-pink-200 to-indigo-300 p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.3),transparent_70%)] blur-2xl"></div>

      {/* Header */}
      <div className="z-10 flex flex-wrap items-center justify-center gap-6 mb-6 bg-white/40 backdrop-blur-lg px-6 py-3 rounded-2xl shadow-lg border border-white/30">
        <h1 className="text-3xl font-extrabold text-purple-800 drop-shadow-md">
          🐍Snake Game
        </h1>

        <button
          onClick={startGame}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow hover:scale-105 hover:from-purple-700 hover:to-indigo-700 transition-transform duration-200"
        >
          {gameRunning ? "Restart" : "Start"}
        </button>

        {/* Speed Control */}
        <div className="flex flex-col items-center gap-1">
          <label className="text-purple-700 font-semibold text-sm">
            Speed
          </label>
          <input
            type="range"
            min="50"
            max="500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-32 accent-purple-600 cursor-pointer hover:accent-purple-700 transition-colors"
          />
          <span className="text-purple-900 font-medium text-sm">{speed} ms</span>
        </div>

        {/* Score */}
        <div className="text-lg font-bold text-purple-900 bg-purple-100 px-4 py-1 rounded-lg shadow border border-purple-300">
          Score: <span className="text-red-500">{score}</span>
        </div>
      </div>

      {/* Pause / Resume Button */}
      <button
        onClick={() => setPaused((prev) => !prev)}
        className={`z-10 px-8 py-3 mb-4 text-2xl font-bold text-white rounded-full shadow-lg transition-all duration-300 ${
          paused
            ? "bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600"
            : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
        }`}
      >
        {paused ? "▶ Resume" : "⏸ Pause"}
      </button>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 p-8 rounded-2xl border-4 border-red-600 text-red-700 text-5xl font-extrabold z-20 shadow-2xl flex flex-col items-center gap-4">
          Game Over!
          <button
            onClick={startGame}
            className="px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition text-xl"
          >
            Restart
          </button>
        </div>
      )}

      {/* Game Board (Grid Layout) */}
      <div
        className={`z-10 grid border-4 border-purple-700 rounded-2xl shadow-xl bg-white/40 backdrop-blur-md ${
          gameOver ? "opacity-60" : ""
        }`}
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 25px)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 25px)`,
        }}
      >
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
          const x = index % BOARD_SIZE;
          const y = Math.floor(index / BOARD_SIZE);
          const isSnake = snake.some((seg) => seg.x === x && seg.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={index}
              className={`w-[25px] h-[25px] border border-purple-200 ${
                isFood
                  ? "bg-red-500 rounded-full shadow-inner"
                  : isSnake
                  ? isHead
                    ? "bg-purple-900 rounded-md"
                    : "bg-purple-700 rounded-md"
                  : "bg-purple-100"
              }`}
            ></div>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="z-10 mt-8 w-full flex justify-center">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full shadow-lg text-lg font-semibold backdrop-blur-md border border-white/30">
          Sabbir Hossain 
        </div>
      </footer>
    </div>
  );
};

export default SnakeGame;
