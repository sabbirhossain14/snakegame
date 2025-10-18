import React, { useState, useEffect, useRef } from "react";
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from "react-icons/fa";

const BOARD_SIZE = 24;
const DEFAULT_SPEED = 150;

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
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const moveRef = useRef(direction);
  moveRef.current = direction;

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

  useEffect(() => {
    if (!gameRunning || paused) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };
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

        if (
          head.x < 0 ||
          head.x >= BOARD_SIZE ||
          head.y < 0 ||
          head.y >= BOARD_SIZE ||
          prevSnake.some((seg) => seg.x === head.x && seg.y === head.y)
        ) {
          setGameRunning(false);
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];
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

  const handleDirection = (dir) => {
    if (dir === "UP" && moveRef.current !== "DOWN") setDirection("UP");
    if (dir === "DOWN" && moveRef.current !== "UP") setDirection("DOWN");
    if (dir === "LEFT" && moveRef.current !== "RIGHT") setDirection("LEFT");
    if (dir === "RIGHT" && moveRef.current !== "LEFT") setDirection("RIGHT");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-300 via-pink-200 to-indigo-300 p-4 relative overflow-hidden">
      {/* Header */}
      <div className="z-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6 bg-white/50 backdrop-blur-lg px-6 py-3 rounded-2xl shadow-lg border border-white/30">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-purple-800 drop-shadow-md">
          🐍 Snake Game
        </h1>

        <button
          onClick={startGame}
          className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow hover:scale-105 transition-transform duration-200"
        >
          {gameRunning ? "Restart" : "Start"}
        </button>

        <div className="flex flex-col items-center gap-1">
          <label className="text-purple-700 font-semibold text-sm">Speed</label>
          <input
            type="range"
            min="50"
            max="500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-28 accent-purple-600 cursor-pointer"
          />
          <span className="text-purple-900 font-medium text-xs">{speed} ms</span>
        </div>

        <div className="text-lg font-bold text-purple-900 bg-purple-100 px-4 py-1 rounded-lg border border-purple-300 shadow">
          Score: <span className="text-red-500">{score}</span>
        </div>
      </div>

      {/* Pause */}
      <button
        onClick={() => setPaused((prev) => !prev)}
        className={`z-10 px-6 py-3 mb-4 text-lg font-bold text-white rounded-full shadow-lg ${
          paused
            ? "bg-gradient-to-r from-green-500 to-lime-500"
            : "bg-gradient-to-r from-red-500 to-pink-500"
        }`}
      >
        {paused ? "▶ Resume" : "⏸ Pause"}
      </button>

      {/* Game Board */}
      <div
        className="relative z-10 grid border-4 border-purple-700 rounded-2xl shadow-xl bg-white/40 backdrop-blur-md"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 20px)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 20px)`,
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
              className={`w-[20px] h-[20px] border border-purple-200 ${
                isFood
                  ? "bg-red-500 rounded-full"
                  : isSnake
                  ? isHead
                    ? "bg-purple-900 rounded-md"
                    : "bg-purple-700 rounded-md"
                  : "bg-purple-100"
              }`}
            ></div>
          );
        })}

        {/* Game Over (Old Style) */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-4xl font-extrabold text-red-600 drop-shadow-lg">
              GAME OVER
            </h2>
          </div>
        )}
      </div>

      {/* Joystick (Bottom Center) */}
      <div className="mt-10 mb-6 flex justify-center items-center">
        <div className="relative w-36 h-36 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full border-4 border-gray-500 shadow-inner flex justify-center items-center">
          <div className="absolute top-3">
            <button
              onClick={() => handleDirection("UP")}
              className="bg-gray-800 text-white p-3 rounded-full shadow-md hover:bg-gray-900 active:scale-95"
            >
              <FaArrowUp size={20} />
            </button>
          </div>
          <div className="absolute bottom-3">
            <button
              onClick={() => handleDirection("DOWN")}
              className="bg-gray-800 text-white p-3 rounded-full shadow-md hover:bg-gray-900 active:scale-95"
            >
              <FaArrowDown size={20} />
            </button>
          </div>
          <div className="absolute left-3">
            <button
              onClick={() => handleDirection("LEFT")}
              className="bg-gray-800 text-white p-3 rounded-full shadow-md hover:bg-gray-900 active:scale-95"
            >
              <FaArrowLeft size={20} />
            </button>
          </div>
          <div className="absolute right-3">
            <button
              onClick={() => handleDirection("RIGHT")}
              className="bg-gray-800 text-white p-3 rounded-full shadow-md hover:bg-gray-900 active:scale-95"
            >
              <FaArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
