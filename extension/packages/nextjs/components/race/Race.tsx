"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import BackgroundImageDark from "../assets/race-assets/background-dark.svg";
import BackgroundImage from "../assets/race-assets/background.svg";
import Car from "./Car";
import RaceEffects from "./RaceEffects";
import { useTheme } from "next-themes";
import { useRaceStore } from "~~/services/store/raceStore";

const RaceTrack: React.FC = () => {
  const { resolvedTheme } = useTheme();

  // 比赛配置
  const RACE_DURATION = 30; // 持续时间（秒）

  const {
    raceStarted,
    raceFinished,
    elapsedTime,
    cars,
    startTime,
    carSpeeds,
    setRaceStarted,
    setRaceFinished,
    setElapsedTime,
    setCars,
    setStartTime,
    setCarSpeeds,
    resetRace,
  } = useRaceStore();

  const raceInterval = useRef<NodeJS.Timeout | null>(null);

  // 以固定时长开始比赛
  const startRace = () => {
    if (raceStarted || raceFinished) {
      resetRace();

      // 等待 1 秒后再开始新一轮比赛
      setTimeout(() => {
        const newStartTime = Date.now();
        setStartTime(newStartTime);
        setCarSpeeds({
          0: 2.5 + Math.random() * 1,
          1: 2.5 + Math.random() * 1,
        });
        setRaceStarted(true);

        // 清除已有的定时器
        if (raceInterval.current) {
          clearInterval(raceInterval.current);
        }

        // 启动新的定时器
        raceInterval.current = setInterval(() => {
          const currentTime = (Date.now() - newStartTime) / 1000; // 已经过的秒数

          if (currentTime >= RACE_DURATION) {
            // 比赛结束时，设置最终位置
            setElapsedTime(RACE_DURATION);
            setCars([
              { id: 1, position: carSpeeds[0] * RACE_DURATION, lane: 0, color: "#2ecc71" },
              { id: 2, position: carSpeeds[1] * RACE_DURATION, lane: 1, color: "#e74c3c" },
            ]);
            setRaceFinished(true);
            if (raceInterval.current) clearInterval(raceInterval.current);
          } else {
            setElapsedTime(currentTime);
            // 根据随机速度更新位置
            setCars([
              { id: 1, position: carSpeeds[0] * currentTime, lane: 0, color: "#2ecc71" },
              { id: 2, position: carSpeeds[1] * currentTime, lane: 1, color: "#e74c3c" },
            ]);
          }
        }, 100); // 每 100ms 更新一次
      }, 1000); // 开始新一轮比赛前延迟 1 秒

      return;
    }

    setCarSpeeds({
      0: 2.5 + Math.random() * 1,
      1: 2.5 + Math.random() * 1,
    });
    const newStartTime = Date.now();
    setStartTime(newStartTime);
    setRaceStarted(true);

    // 清除已有的定时器
    if (raceInterval.current) {
      clearInterval(raceInterval.current);
    }

    // 启动新的定时器
    raceInterval.current = setInterval(() => {
      const currentTime = (Date.now() - newStartTime) / 1000; // 已经过的秒数

      if (currentTime >= RACE_DURATION) {
        // 比赛结束时，设置最终位置
        setElapsedTime(RACE_DURATION);
        setCars([
          { id: 1, position: carSpeeds[0] * RACE_DURATION, lane: 0, color: "#2ecc71" },
          { id: 2, position: carSpeeds[1] * RACE_DURATION, lane: 1, color: "#e74c3c" },
        ]);
        setRaceFinished(true);
        if (raceInterval.current) clearInterval(raceInterval.current);
      } else {
        setElapsedTime(currentTime);
        // 根据随机速度更新位置
        setCars([
          { id: 1, position: carSpeeds[0] * currentTime, lane: 0, color: "#2ecc71" },
          { id: 2, position: carSpeeds[1] * currentTime, lane: 1, color: "#e74c3c" },
        ]);
      }
    }, 100); // 每 100ms 更新一次
  };

  // 将已用时间格式化为 MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 处理页面可见性变化与比赛状态
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 标签页被隐藏，清除定时器
        if (raceInterval.current) {
          clearInterval(raceInterval.current);
        }
      } else if (raceStarted && !raceFinished && startTime) {
        // 标签页可见且比赛正在进行，重新启动定时器
        const currentTime = (Date.now() - startTime) / 1000;
        if (currentTime < RACE_DURATION) {
          // 清除已有的定时器
          if (raceInterval.current) {
            clearInterval(raceInterval.current);
          }

          // 启动新的定时器
          raceInterval.current = setInterval(() => {
            const updatedTime = (Date.now() - startTime) / 1000;
            if (updatedTime >= RACE_DURATION) {
              setElapsedTime(RACE_DURATION);
              setCars([
                { id: 1, position: carSpeeds[0] * RACE_DURATION, lane: 0, color: "#2ecc71" },
                { id: 2, position: carSpeeds[1] * RACE_DURATION, lane: 1, color: "#e74c3c" },
              ]);
              setRaceFinished(true);
              if (raceInterval.current) clearInterval(raceInterval.current);
            } else {
              setElapsedTime(updatedTime);
              const redPosition = carSpeeds[0] * updatedTime;
              const bluePosition = carSpeeds[1] * updatedTime;
              setCars([
                { id: 1, position: redPosition, lane: 0, color: "#2ecc71" },
                { id: 2, position: bluePosition, lane: 1, color: "#e74c3c" },
              ]);
            }
          }, 100);
        } else {
          // 比赛在标签页隐藏期间已经结束
          setElapsedTime(RACE_DURATION);
          setCars([
            { id: 1, position: carSpeeds[0] * RACE_DURATION, lane: 0, color: "#2ecc71" },
            { id: 2, position: carSpeeds[1] * RACE_DURATION, lane: 1, color: "#e74c3c" },
          ]);
          setRaceFinished(true);
        }
      }
    };

    // 如果比赛已经开始，进行初始设置
    if (raceStarted && !raceFinished && startTime) {
      const currentTime = (Date.now() - startTime) / 1000;
      if (currentTime < RACE_DURATION) {
        if (raceInterval.current) {
          clearInterval(raceInterval.current);
        }
        raceInterval.current = setInterval(() => {
          const updatedTime = (Date.now() - startTime) / 1000;
          if (updatedTime >= RACE_DURATION) {
            setElapsedTime(RACE_DURATION);
            setCars([
              { id: 1, position: carSpeeds[0] * RACE_DURATION, lane: 0, color: "#2ecc71" },
              { id: 2, position: carSpeeds[1] * RACE_DURATION, lane: 1, color: "#e74c3c" },
            ]);
            setRaceFinished(true);
            if (raceInterval.current) clearInterval(raceInterval.current);
          } else {
            setElapsedTime(updatedTime);
            const redPosition = carSpeeds[0] * updatedTime;
            const bluePosition = carSpeeds[1] * updatedTime;
            setCars([
              { id: 1, position: redPosition, lane: 0, color: "#2ecc71" },
              { id: 2, position: bluePosition, lane: 1, color: "#e74c3c" },
            ]);
          }
        }, 100);
      } else {
        setElapsedTime(RACE_DURATION);
        setCars([
          { id: 1, position: carSpeeds[0] * RACE_DURATION, lane: 0, color: "#2ecc71" },
          { id: 2, position: carSpeeds[1] * RACE_DURATION, lane: 1, color: "#e74c3c" },
        ]);
        setRaceFinished(true);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (raceInterval.current) clearInterval(raceInterval.current);
    };
  }, [raceStarted, raceFinished, startTime, RACE_DURATION, setElapsedTime, setCars, setRaceFinished, carSpeeds]);

  return (
    <div className="mt-6 w-full mx-auto">
      <div className="card bg-base-100 w-full shadow-xl indicator">
        <div className="card-body">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="card-title">
              {raceFinished ? (
                <span className="flex items-center gap-2">
                  Winner:{" "}
                  <span style={{ color: cars[0].position > cars[1].position ? "#2ecc71" : "#e74c3c" }}>
                    {cars[0].position > cars[1].position ? "Green" : "Red"} Car
                  </span>{" "}
                  🏆
                </span>
              ) : (
                `Race Time: ${formatTime(elapsedTime)}`
              )}
            </h2>
            <div className="space-x-4 flex items-center">
              <button onClick={startRace} className="btn btn-primary text-lg">
                {raceFinished ? "Race Again" : raceStarted ? "Restart Race" : "Start Race"}
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            <Image
              src={resolvedTheme === "dark" ? BackgroundImageDark : BackgroundImage}
              alt="Mountain Background"
              width={1000}
              height={1000}
              className="w-full h-auto"
              suppressHydrationWarning
            />
            <div className="relative w-full h-[200px] bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <RaceEffects isRacing={raceStarted && !raceFinished} />

              <div className="absolute top-0 bottom-0 w-4 bg-black" style={{ left: "90%", zIndex: 5 }}>
                <div className="h-full w-full grid grid-cols-2 grid-rows-4">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-full h-full ${(Math.floor(i / 2) + i) % 2 === 0 ? "bg-black" : "bg-white"}`}
                    />
                  ))}
                </div>
              </div>

              <div
                className="absolute left-0 right-[50px] h-[3px]"
                style={{
                  top: "50%",
                  background:
                    "repeating-linear-gradient(90deg, transparent 0px, transparent 50px, white 50px, white 100px)",
                }}
              ></div>

              {cars.map(car => (
                <Car
                  key={car.id}
                  position={car.position}
                  lane={car.lane}
                  color={car.color}
                  isWinner={raceFinished && car.position === Math.max(...cars.map(c => c.position))}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceTrack;
