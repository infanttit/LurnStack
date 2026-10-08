/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import brandLogo from "../../assets/Logo/NewBrandLogo.png";
import loginBg3d from "../../assets/Images/login-bg-3d.png";
import { useAuth } from "../model/AuthContext";
import { PATHS } from "../../app/router/paths";
import { env } from "../../shared/config/env";
import { isValidEmail, normalizeEmail, passwordPolicyText } from "../lib/validation";
import { useSEO } from "../../shared/hooks/useSEO";

// Celebration image – place as: public/celebration-500.png  OR  src/assets/Images/celebration-500.png
const CELEBRATION_IMG = "/celebration-500.jpg";


const EyeIcon = ({ open }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

/* ─── Logo ───────────────────────────────────────────────────── */
const Logo = ({ dark = false }) => (
  <Link to="/" className="inline-flex items-center" aria-label="LurnStack home">
    <img
      src={brandLogo}
      alt="LurnStack"
      className={dark ? "h-10 w-auto object-contain" : "h-12 w-auto object-contain"}
      loading="eager"
    />
  </Link>
);

/* ─── Catch the Code Game ────────────────────────────────────── */
let sessionHighScore = 0;

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }
  init() {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn("AudioContext not supported/blocked", e);
    }
  }
  playCatch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch(e){}
  }
  playHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch(e){}
  }
  playPowerup() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.1, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.08 + 0.15);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.15);
      });
    } catch(e){}
  }
  playCombo() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [440.00, 554.37, 659.25, 880.00];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.06 + 0.2);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.2);
      });
    } catch(e){}
  }
  playBossAlarm() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(480, now + 0.25);
      osc.frequency.linearRampToValueAtTime(320, now + 0.5);
      osc.frequency.linearRampToValueAtTime(480, now + 0.75);
      osc.frequency.linearRampToValueAtTime(320, now + 1.0);
      osc.frequency.linearRampToValueAtTime(480, now + 1.25);
      osc.frequency.linearRampToValueAtTime(320, now + 1.5);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 1.5);
      osc.start(now);
      osc.stop(now + 1.5);
    } catch(e){}
  }
  playGameOver() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [293.66, 261.63, 220.00, 196.00];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.12, now + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.15 + 0.4);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.4);
      });
    } catch(e){}
  }
}

const sounds = new SoundEngine();

const GOOD_TOKENS_BY_LEVEL = {
  1: ["def", "print()", "import", "for", "if", "while", "pass", "return", "True", "False"],
  2: ["lambda", "try", "except", "finally", "class", "with", "as", "yield", "assert", "break"],
  3: ["async", "await", "global", "nonlocal", "raise", "is", "in", "and", "or", "not"],
  4: ["{ }", "[ ]", "( )", "self", "__init__", "*args", "**kwargs", "@classmethod"],
  5: ["@staticmethod", "__repr__", "__str__", "match/case", "zip()", "enumerate()", "map()", "filter()"]
};

const BAD_TOKENS = ["🐛", "Error", "None", "IndexError", "SyntaxError", "TypeError", "KeyError", "crash", "bug"];

const POWERUP_TYPES = [
  { char: "⭐", type: "widen" },
  { char: "⚡", type: "double" },
  { char: "🛡️", type: "shield" }
];

export function CatchTheCodeGame() {
  const [gameStatus, setGameStatus] = useState("start");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(sessionHighScore);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showNewBest, setShowNewBest] = useState(false);
  
  const [paddleX, setPaddleX] = useState(50);
  const [paddleWidth, setPaddleWidth] = useState(120);
  const [tokens, setTokens] = useState([]);
  const [comboPopups, setComboPopups] = useState([]);
  const [screenShake, setScreenShake] = useState(false);
  const [bossSwarmDodgeAlert, setBossSwarmDodgeAlert] = useState(false);
  const [bossBannerCountdown, setBossBannerCountdown] = useState("");

  const [activePowerups, setActivePowerups] = useState({
    widen: 0,
    doubleScore: 0,
    shield: false
  });

  const gameStatusRef = useRef("start");
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);
  const comboRef = useRef(0);
  const paddleXRef = useRef(50); // center percentage
  const paddleWidthRef = useRef(120); // pixel width
  const tokensRef = useRef([]);
  const activePowerupsRef = useRef({ widen: 0, doubleScore: 0, shield: false });
  
  const lastTimeRef = useRef(0);
  const nextSpawnTimeRef = useRef(0);
  const nextBossMilestoneRef = useRef(100);

  const keysPressed = useRef({});
  const containerRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    sounds.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowLeft", "ArrowRight", "Space"].includes(e.key) && gameStatusRef.current === "playing") {
        e.preventDefault();
      }
      keysPressed.current[e.key] = true;
    };
    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleMove = (clientX) => {
    if (!containerRef.current || gameStatusRef.current !== "playing") return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentageX = (relativeX / rect.width) * 100;
    
    const containerWidth = rect.width;
    const halfWidthPercent = (paddleWidthRef.current / 2 / containerWidth) * 100;
    const newX = Math.max(halfWidthPercent, Math.min(100 - halfWidthPercent, percentageX));
    
    paddleXRef.current = newX;
    setPaddleX(newX);
  };

  const onMouseMove = (e) => {
    handleMove(e.clientX);
  };

  const onTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const startGame = () => {
    sounds.init();
    
    // Reset refs synchronously
    gameStatusRef.current = "playing";
    scoreRef.current = 0;
    livesRef.current = 3;
    levelRef.current = 1;
    comboRef.current = 0;
    paddleXRef.current = 50;
    paddleWidthRef.current = 120;
    tokensRef.current = [];
    activePowerupsRef.current = { widen: 0, doubleScore: 0, shield: false };
    
    // Reset React state
    setScore(0);
    setLives(3);
    setLevel(1);
    setCombo(0);
    setPaddleX(50);
    setPaddleWidth(120);
    setTokens([]);
    setComboPopups([]);
    setShowNewBest(false);
    setScreenShake(false);
    setBossSwarmDodgeAlert(false);
    setActivePowerups({ widen: 0, doubleScore: 0, shield: false });
    
    setGameStatus("playing");
    
    // Reset timers
    lastTimeRef.current = Date.now();
    nextSpawnTimeRef.current = Date.now() + 1000;
    nextBossMilestoneRef.current = 100;
    
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    requestRef.current = requestAnimationFrame(loop);
  };

  const triggerBossWarning = () => {
    setGameStatus("boss_warning");
    gameStatusRef.current = "boss_warning";
    sounds.playBossAlarm();
    setBossBannerCountdown("⚠️ BUG SWARM INCOMING ⚠️");
    
    setTimeout(() => {
      setGameStatus("playing");
      gameStatusRef.current = "playing";
      const bossToken = {
        id: "boss_" + Date.now(),
        text: "🐛 BUG SWARM 🐛",
        type: "boss",
        x: Math.random() * 50 + 25, // center it a bit more
        y: -12,
        speed: 3.5,
        width: 35
      };
      tokensRef.current.push(bossToken);
      setTokens([...tokensRef.current]);
      
      nextSpawnTimeRef.current = Date.now() + 5000;
      lastTimeRef.current = Date.now();
      
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(loop);
    }, 2000);
  };

  const loop = () => {
    if (gameStatusRef.current !== "playing") return;
    
    const now = Date.now();
    const delta = now - lastTimeRef.current;
    lastTimeRef.current = now;

    const containerWidth = containerRef.current ? containerRef.current.getBoundingClientRect().width : 480;
    const halfWidthPercent = (paddleWidthRef.current / 2 / containerWidth) * 100;

    // 1. Keyboard paddle movement
    const speed = 1.8; // center percent per frame
    if (keysPressed.current["ArrowLeft"]) {
      paddleXRef.current = Math.max(halfWidthPercent, paddleXRef.current - speed);
    }
    if (keysPressed.current["ArrowRight"]) {
      paddleXRef.current = Math.min(100 - halfWidthPercent, paddleXRef.current + speed);
    }

    // 2. Power-up duration decays
    if (activePowerupsRef.current.widen > 0) {
      activePowerupsRef.current.widen = Math.max(0, activePowerupsRef.current.widen - delta);
      paddleWidthRef.current = activePowerupsRef.current.widen > 0 ? 190 : 120;
    }
    if (activePowerupsRef.current.doubleScore > 0) {
      activePowerupsRef.current.doubleScore = Math.max(0, activePowerupsRef.current.doubleScore - delta);
    }

    // 3. Spawn tokens on interval
    if (now >= nextSpawnTimeRef.current) {
      const rand = Math.random();
      let token;
      const currentLevel = levelRef.current;
      const baseSpeed = 1.0 + currentLevel * 0.12 + Math.random() * 0.4;
      const xPos = Math.random() * 80 + 10; // 10% to 90%

      if (rand < 0.65) {
        const levelVocabulary = GOOD_TOKENS_BY_LEVEL[Math.min(currentLevel, 5)];
        const word = levelVocabulary[Math.floor(Math.random() * levelVocabulary.length)];
        token = {
          id: now + "_" + Math.random(),
          text: word,
          type: "good",
          x: xPos,
          y: -10,
          speed: baseSpeed,
          width: 14
        };
      } else if (rand < 0.88) {
        const bug = BAD_TOKENS[Math.floor(Math.random() * BAD_TOKENS.length)];
        token = {
          id: now + "_" + Math.random(),
          text: bug,
          type: "bad",
          x: xPos,
          y: -10,
          speed: baseSpeed + 0.2,
          width: 14
        };
      } else {
        const pu = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
        token = {
          id: now + "_" + Math.random(),
          text: pu.char,
          type: "powerup_" + pu.type,
          x: xPos,
          y: -10,
          speed: baseSpeed * 0.95,
          width: 12
        };
      }

      tokensRef.current.push(token);
      const spawnDelay = Math.max(800, 2000 - currentLevel * 100);
      nextSpawnTimeRef.current = now + spawnDelay;
    }

    // 4. Update Token positions and collisions
    let updatedTokens = [];
    let nextScore = scoreRef.current;
    let nextLives = livesRef.current;
    let nextCombo = comboRef.current;
    let shieldActive = activePowerupsRef.current.shield;

    for (let token of tokensRef.current) {
      const nextY = token.y + (token.speed * delta * 0.06);
      const isPaddleHeight = nextY >= 84 && nextY <= 90;
      const isHorizontalOverlap = token.x >= (paddleXRef.current - halfWidthPercent) && token.x <= (paddleXRef.current + halfWidthPercent);

      if (isPaddleHeight && isHorizontalOverlap) {
        // Collision hit
        if (token.type === "good") {
          const multiplier = activePowerupsRef.current.doubleScore > 0 ? 2 : 1;
          nextScore += 10 * multiplier;
          nextCombo += 1;
          sounds.playCatch();

          if (nextCombo > 0 && nextCombo % 5 === 0) {
            nextScore += 25;
            sounds.playCombo();
            
            const popup = {
              id: Date.now() + "_" + Math.random(),
              x: token.x,
              y: 75,
              text: `🔥 Combo +25`
            };
            setComboPopups(prev => [...prev, popup]);
            setTimeout(() => {
              setComboPopups(prev => prev.filter(p => p.id !== popup.id));
            }, 1200);
          }
        } 
        else if (token.type === "bad") {
          if (shieldActive) {
            shieldActive = false;
            activePowerupsRef.current.shield = false;
            sounds.playCatch();
            const popup = {
              id: Date.now() + "_" + Math.random(),
              x: token.x,
              y: 75,
              text: `🛡️ Blocked!`
            };
            setComboPopups(prev => [...prev, popup]);
            setTimeout(() => {
              setComboPopups(prev => prev.filter(p => p.id !== popup.id));
            }, 1200);
          } else {
            nextLives -= 1;
            nextCombo = 0;
            sounds.playHit();
          }
        }
        else if (token.type === "boss") {
          if (shieldActive) {
            shieldActive = false;
            activePowerupsRef.current.shield = false;
            sounds.playCatch();
            const popup = {
              id: Date.now() + "_" + Math.random(),
              x: token.x,
              y: 75,
              text: `🛡️ Boss Blocked!`
            };
            setComboPopups(prev => [...prev, popup]);
            setTimeout(() => {
              setComboPopups(prev => prev.filter(p => p.id !== popup.id));
            }, 1200);
          } else {
            nextLives -= 1;
            nextCombo = 0;
            sounds.playHit();
            setScreenShake(true);
            setTimeout(() => setScreenShake(false), 500);
          }
        }
        else if (token.type.startsWith("powerup_")) {
          sounds.playPowerup();
          const powerupName = token.type.replace("powerup_", "");
          if (powerupName === "widen") {
            activePowerupsRef.current.widen = 5000;
            paddleWidthRef.current = 190;
          } else if (powerupName === "double") {
            activePowerupsRef.current.doubleScore = 5000;
          } else if (powerupName === "shield") {
            activePowerupsRef.current.shield = true;
            shieldActive = true;
          }
        }
      } 
      else if (nextY > 100) {
        if (token.type === "boss") {
          nextScore += 50;
          sounds.playPowerup();
          setBossSwarmDodgeAlert(true);
          setTimeout(() => setBossSwarmDodgeAlert(false), 2000);
        }
      } 
      else {
        updatedTokens.push({
          ...token,
          y: nextY
        });
      }
    }

    tokensRef.current = updatedTokens;
    
    const calculatedLevel = Math.floor(nextScore / 50) + 1;
    levelRef.current = calculatedLevel;
    
    let checkBossTrigger = false;
    if (nextScore >= nextBossMilestoneRef.current && scoreRef.current < nextBossMilestoneRef.current) {
      checkBossTrigger = true;
    }

    scoreRef.current = nextScore;
    livesRef.current = nextLives;
    comboRef.current = nextCombo;

    // Flush to React State
    setScore(nextScore);
    setLives(nextLives);
    setLevel(calculatedLevel);
    setCombo(nextCombo);
    setTokens(updatedTokens);
    setPaddleX(paddleXRef.current);
    setPaddleWidth(paddleWidthRef.current);
    setActivePowerups({
      widen: activePowerupsRef.current.widen,
      doubleScore: activePowerupsRef.current.doubleScore,
      shield: activePowerupsRef.current.shield
    });

    if (nextLives <= 0) {
      sounds.playGameOver();
      setGameStatus("gameover");
      gameStatusRef.current = "gameover";
      if (nextScore > sessionHighScore) {
        sessionHighScore = nextScore;
        setHighScore(nextScore);
        setShowNewBest(true);
      }
    } else if (checkBossTrigger) {
      nextBossMilestoneRef.current += 100;
      triggerBossWarning();
    } else {
      requestRef.current = requestAnimationFrame(loop);
    }
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full select-none font-sans text-white">
      <div className="flex justify-between items-center mb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-wider text-white font-space">LurnStack</span>
          </div>
          <span className="text-[9px] font-black tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-900/60 rounded px-1.5 py-0.5 mt-1 self-start">LIVE WORKSPACE</span>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-bold text-[#8CFF6B] font-mono bg-emerald-950/40 border border-emerald-900/40 rounded-xl px-3 py-1.5 shadow-inner">
          <div>LVL <span className="text-white text-sm">{level}</span></div>
          <div className="text-emerald-800">|</div>
          <div>SCORE <span className="text-white text-sm">{score}</span></div>
          <div className="text-emerald-800">|</div>
          <div>BEST <span className="text-white text-sm">{highScore}</span></div>
        </div>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        className={`relative flex-1 rounded-[24px] overflow-hidden bg-[#07231a] border-2 border-emerald-900/40 min-h-[300px] lg:min-h-[320px] flex flex-col justify-between p-4
          ${screenShake ? "shake-active" : ""}
          ${gameStatus === "playing" ? "cursor-none" : "cursor-default"}`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(12,61,43,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(12,61,43,0.15)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        {gameStatus === "start" && (
          <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 bg-slate-950/90 text-center rounded-[22px] backdrop-blur-sm">
            <div className="my-auto space-y-4">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#8CFF6B] font-space">Catch the Code</h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                Catch Python syntax to score. Avoid bug tokens and dodge the boss swarm every 100 points!
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-[10px] text-left max-w-xs mx-auto bg-emerald-950/40 border border-emerald-900/40 rounded-xl p-3 font-mono">
                <div>🟩 <span className="text-emerald-400 font-bold">def, class, import</span> (+10)</div>
                <div>🟥 <span className="text-red-400 font-bold">🐛, Error, None</span> (-1 Life)</div>
                <div className="col-span-2 border-t border-emerald-900/40 my-1 pt-1 text-center font-bold text-slate-300">Power-Ups</div>
                <div>⭐ Paddle Widen</div>
                <div>⚡ Double Points (5s)</div>
                <div className="col-span-2 text-center text-blue-400">🛡️ Block next bug collision</div>
              </div>
            </div>

            <button 
              onClick={startGame}
              className="w-full max-w-[200px] mx-auto py-2.5 bg-[#8CFF6B] hover:bg-[#7be65d] active:scale-[0.98] text-[#07231a] font-bold text-xs rounded-xl shadow-lg shadow-emerald-400/20 transition-all font-space uppercase"
            >
              Start Game
            </button>
          </div>
        )}

        {gameStatus === "boss_warning" && (
          <div className="absolute inset-x-0 top-1/3 z-20 boss-warning-banner py-4 text-center text-white font-extrabold uppercase border-y-2 border-red-500 shadow-xl flex flex-col items-center justify-center">
            <span className="text-lg font-space tracking-wider animate-bounce">{bossBannerCountdown}</span>
            <span className="text-[10px] font-mono font-bold mt-1 text-red-200">Prepare to Dodge!</span>
          </div>
        )}

        {bossSwarmDodgeAlert && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-20 bg-emerald-500 text-[#07231a] text-xs font-bold font-space px-4 py-1.5 rounded-full shadow-lg border border-lime-300 animate-bounce">
            🔥 Swarm Dodged! +50 pts
          </div>
        )}

        {gameStatus === "playing" && (
          <div className="flex justify-between items-center z-10 pointer-events-none">
            <div className="flex gap-1.5 items-center font-mono text-xs font-bold text-red-400 bg-red-950/40 border border-red-900/40 rounded-lg px-2.5 py-1">
              <span>LIVES: {lives}</span>
              {activePowerups.shield && (
                <span className="text-[10px] text-blue-300 ml-1.5 font-bold">
                  🛡️ Shielded
                </span>
              )}
            </div>
            
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="pointer-events-auto bg-emerald-950/60 border border-emerald-900/60 text-[#8CFF6B] hover:text-white rounded-lg p-1.5 transition-colors focus:outline-none"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
              )}
            </button>
          </div>
        )}

        {gameStatus === "playing" && tokens.map(token => (
          <div
            key={token.id}
            className={`absolute px-2.5 py-1 text-[11px] font-bold font-mono rounded-lg select-none pointer-events-none
              ${token.type === "good" ? "bg-emerald-950/80 border border-emerald-400/40 text-[#8CFF6B] shadow-[0_4px_12px_rgba(0,0,0,0.3)]" : ""}
              ${token.type === "bad" ? "bg-red-950/85 border border-red-500/40 text-red-400 shadow-[0_4px_12px_rgba(0,0,0,0.3)]" : ""}
              ${token.type === "boss" ? "bg-red-950 border-2 border-red-500 text-red-500 font-extrabold uppercase scale-125 z-10 px-4 py-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse" : ""}
              ${token.type === "powerup_widen" ? "bg-yellow-950/80 border border-yellow-400/60 text-yellow-400 shadow-[0_4px_12px_rgba(0,0,0,0.3)] scale-110" : ""}
              ${token.type === "powerup_double" ? "bg-orange-950/80 border border-orange-500/60 text-orange-400 shadow-[0_4px_12px_rgba(0,0,0,0.3)] scale-110" : ""}
              ${token.type === "powerup_shield" ? "bg-blue-950/80 border border-blue-400/60 text-blue-400 shadow-[0_4px_12px_rgba(0,0,0,0.3)] scale-110" : ""}`}
            style={{
              left: `${token.x}%`,
              top: `${token.y}%`,
              transform: `translate3d(-50%, 0, 0)`
            }}
          >
            {token.text}
          </div>
        ))}

        {comboPopups.map(popup => (
          <div
            key={popup.id}
            className="absolute z-10 text-xs font-extrabold text-[#8CFF6B] combo-popup pointer-events-none font-space bg-black/60 px-2 py-1 rounded border border-[#8CFF6B]/30"
            style={{
              left: `${popup.x}%`,
              top: `${popup.y}%`
            }}
          >
            {popup.text}
          </div>
        ))}

        {gameStatus === "gameover" && (
          <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 bg-slate-950/90 text-center rounded-[22px] backdrop-blur-sm">
            <div className="my-auto space-y-4">
              <h2 className="text-2xl font-extrabold tracking-tight text-red-500 font-space">Game Over</h2>
              
              <div className="space-y-1">
                <p className="text-slate-400 text-xs">Final Score</p>
                <p className="text-4xl font-extrabold text-white font-mono">{score}</p>
                {showNewBest && (
                  <p className="text-xs text-[#8CFF6B] font-bold font-space tracking-wide animate-pulse">
                    ⚡ New personal best! ⚡
                  </p>
                )}
              </div>

              <div className="text-[11px] text-slate-500 leading-normal max-w-[200px] mx-auto font-mono bg-emerald-950/20 border border-emerald-900/20 rounded-lg p-2.5">
                Level Reached: {level}<br />
                High Score: {highScore}
              </div>
            </div>

            <button 
              onClick={startGame}
              className="w-full max-w-[200px] mx-auto py-2.5 bg-[#8CFF6B] hover:bg-[#7be65d] active:scale-[0.98] text-[#07231a] font-bold text-xs rounded-xl shadow-lg transition-all font-space uppercase"
            >
              Play Again
            </button>
          </div>
        )}

        {(activePowerups.widen > 0 || activePowerups.doubleScore > 0) && (
          <div className="absolute bottom-16 right-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
            {activePowerups.widen > 0 && (
              <div className="bg-yellow-950/90 border border-yellow-600/50 rounded-lg p-1.5 flex items-center justify-between text-[9px] font-bold text-yellow-400 font-mono">
                <span className="flex items-center gap-1">⭐ WIDE PADDLE</span>
                <span>{(activePowerups.widen / 1000).toFixed(1)}s</span>
              </div>
            )}
            {activePowerups.doubleScore > 0 && (
              <div className="bg-orange-950/90 border border-orange-600/50 rounded-lg p-1.5 flex items-center justify-between text-[9px] font-bold text-orange-400 font-mono">
                <span className="flex items-center gap-1">⚡ DOUBLE SCORE</span>
                <span>{(activePowerups.doubleScore / 1000).toFixed(1)}s</span>
              </div>
            )}
          </div>
        )}

        {gameStatus === "playing" && (
          <div 
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: `${paddleX}%`,
              width: `${paddleWidth}px`,
              bottom: "8%",
              transform: "translateX(-50%)",
              zIndex: 10
            }}
          >
            {/* Snake Emoji rendering above paddle bar */}
            <span className="text-base mb-1 animate-bounce select-none">🐍</span>
            
            {/* Paddle Bar */}
            <div 
              className="h-3 w-full rounded-full flex-shrink-0"
              style={{
                background: "linear-gradient(90deg, #8CFF6B 0%, #4ade80 100%)",
                boxShadow: "0 0 15px rgba(140, 255, 107, 0.7), 0 0 30px rgba(74, 222, 128, 0.3)"
              }}
            />
          </div>
        )}

        <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-wider text-slate-500 font-mono pt-2 border-t border-emerald-950/40">
          <div>CATCH THE CODE • DODGE THE BUGS</div>
          <div className="hidden sm:block">← → or Move Mouse | ⭐ ⚡ 🛡️</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Global Styles ──────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap');

    .font-mono {
      font-family: 'JetBrains Mono', monospace !important;
    }
    .font-space {
      font-family: 'Space Grotesk', sans-serif !important;
    }

    @keyframes shake {
      0%, 100% { transform: translate(0, 0); }
      10%, 30%, 50%, 70%, 90% { transform: translate(-4px, -2px); }
      20%, 40%, 60%, 80% { transform: translate(4px, 2px); }
    }
    .shake-active {
      animation: shake 0.4s ease-in-out;
    }

    @keyframes comboFloat {
      0% { opacity: 0; transform: translate3d(0, 0, 0) scale(0.8); }
      15% { opacity: 1; transform: translate3d(0, -12px, 0) scale(1.2); }
      80% { opacity: 1; transform: translate3d(0, -32px, 0) scale(1.0); }
      100% { opacity: 0; transform: translate3d(0, -42px, 0) scale(0.8); }
    }
    .combo-popup {
      animation: comboFloat 1.2s forwards ease-out;
    }

    @keyframes bossPulse {
      0%, 100% { background-color: rgba(220, 38, 38, 0.8); }
      50% { background-color: rgba(239, 68, 68, 1); box-shadow: 0 0 15px rgba(239, 68, 68, 0.6); }
    }
    .boss-warning-banner {
      animation: bossPulse 0.35s infinite alternate;
    }

    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .anim-1 { animation: fade-in-up 0.3s ease-out both; }
    .anim-2 { animation: fade-in-up 0.3s ease-out 0.05s both; }
    .anim-3 { animation: fade-in-up 0.3s ease-out 0.1s both; }
    .anim-fade-in-up { animation: fade-in-up 0.6s ease-out both; }
    
    html, body, #root { min-height: 100%; margin: 0; padding: 0; overflow-x: hidden; }
    
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    .auth-shell {
      position: relative;
      isolation: isolate;
      background:
        radial-gradient(circle at 16% 10%, rgba(84, 212, 16, 0.24), transparent 28%),
        radial-gradient(circle at 90% 18%, rgba(0, 77, 61, 0.13), transparent 34%),
        linear-gradient(135deg, #f7fff3 0%, #ffffff 46%, #f2fbf6 100%);
    }
    .auth-shell::before {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(0, 77, 61, 0.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 77, 61, 0.045) 1px, transparent 1px);
      background-size: 46px 46px;
      mask-image: linear-gradient(to bottom, rgba(0,0,0,0.78), transparent 78%);
    }
    .auth-card {
      position: relative;
      border: 1px solid rgba(15, 23, 42, 0.08);
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 24px 64px rgba(15, 23, 42, 0.12);
      backdrop-filter: blur(14px);
    }
    .auth-card::before {
      content: none;
    }
    .auth-content { position: relative; z-index: 1; }
    .auth-mark { box-shadow: 0 18px 38px rgba(84, 212, 16, 0.2); }

    @keyframes progress-bar {
      from { width: 0%; }
      to   { width: 100%; }
    }
    .animate-progress {
      animation: progress-bar 3s linear forwards;
    }
    @keyframes gradient-shift {
      0%, 100% { opacity: 0.15; }
      50% { opacity: 0.3; }
    }
    .animate-glow {
      animation: gradient-shift 6s ease-in-out infinite;
    }
    @keyframes float-3d {
      0%   { transform: perspective(900px) rotateY(-6deg) rotateX(4deg) translateY(0px) scale(1); }
      50%  { transform: perspective(900px) rotateY(6deg)  rotateX(-4deg) translateY(-14px) scale(1.02); }
      100% { transform: perspective(900px) rotateY(-6deg) rotateX(4deg) translateY(0px) scale(1); }
    }
    .animate-float-3d {
      animation: float-3d 6s ease-in-out infinite;
      transform-style: preserve-3d;
    }
    @keyframes shine-slide {
      0%   { left: -80%; }
      100% { left: 140%; }
    }
    .card-shine::after {
      content: '';
      position: absolute;
      top: 0; bottom: 0;
      left: -80%;
      width: 60%;
      background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
      animation: shine-slide 4s ease-in-out infinite;
      border-radius: inherit;
      pointer-events: none;
    }
    @keyframes particle-float {
      0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.7; }
      50%  { transform: translateY(-20px) translateX(8px) scale(1.2); opacity: 1; }
      100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.7; }
    }
    .particle { animation: particle-float var(--dur, 3s) ease-in-out var(--delay, 0s) infinite; }
    @keyframes confetti-fall {
      0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(60px) rotate(360deg); opacity: 0; }
    }
    .confetti-piece { animation: confetti-fall var(--dur, 2s) ease-in var(--delay, 0s) infinite; }
  `}</style>
);

export default function LoginPage() {
  const { signIn, signInWithToken, isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [externalAuthLoading, setExternalAuthLoading] = useState(false);
  const [externalAuthError, setExternalAuthError] = useState("");
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!showSuccessBanner) return undefined;
    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [showSuccessBanner]);

  useSEO({
    title: "Login",
    description: "Sign in to your LurnStack account to access your courses, live sessions, and learning dashboard.",
    keywords: "LurnStack login, sign in, student login",
    canonical: "/login",
  });

  const externalToken = searchParams.get("token") || "";
  const externalError = searchParams.get("error") || "";

  const redirectTo = (() => {
    const from = location?.state?.from;
    const redirect = searchParams.get("redirect");
    const target =
      typeof from === "string" && from.trim()
        ? from
        : typeof redirect === "string" && redirect.trim()
          ? redirect
          : "";
    if (target && target !== PATHS.LOGIN) return target;
    return PATHS.HOME;
  })();
  const googleRedirectTo = redirectTo === PATHS.HOME ? PATHS.HOME : redirectTo;

  useEffect(() => {
    if (!externalToken && !externalError) return undefined;
    if (externalError) {
      setExternalAuthError(decodeURIComponent(externalError));
      window.history.replaceState({}, document.title, window.location.pathname);
      return undefined;
    }
    if (isAuthenticated) return undefined;
    let active = true;

    const completeGoogleLogin = async () => {
      setExternalAuthError("");
      setExternalAuthLoading(true);
      try {
        await signInWithToken({ token: externalToken, remember: true });
        if (active) {
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate(googleRedirectTo, { replace: true });
        }
      } catch (err) {
        if (active) {
          setExternalAuthError(err?.message || "Unable to sign in with Google.");
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } finally {
        if (active) {
          setExternalAuthLoading(false);
        }
      }
    };

    completeGoogleLogin();

    return () => {
      active = false;
    };
  }, [externalError, externalToken, googleRedirectTo, isAuthenticated, navigate, signInWithToken]);

  if (isAuthenticated && !showSuccessBanner) {
    const defaultTarget = userRole === "tridin" ? PATHS.TRIDIN_DASHBOARD : (userRole === "student" ? (externalToken ? googleRedirectTo : redirectTo) : PATHS.HOME);
    return (
      <Navigate
        to={defaultTarget}
        replace
      />
    );
  }

  const validate = () => {
    const errs = {};
    const email = normalizeEmail(form.email);
    if (!email) errs.email = "Email is required";
    else if (!isValidEmail(email)) errs.email = "Enter a valid email address (example: name@gmail.com)";

    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const loggedUser = await signIn({
        email: normalizeEmail(form.email),
        password: form.password,
        remember: form.remember,
        role: "student",
      });
      setShowSuccessBanner(true);
      setTimeout(() => {
        const dest = loggedUser?.role === "tridin" ? PATHS.TRIDIN_DASHBOARD : redirectTo;
        navigate(dest, {
          replace: true,
        });
      }, 3000);
    } catch (err) {
      setFormError(err?.message || "Unable to sign in.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (typeof window === "undefined") return;
    setFormError("");
    setExternalAuthError("");
    setSocialLoading(true);

    const loginUrl = new URL(PATHS.LOGIN, window.location.origin);
    if (redirectTo && redirectTo !== PATHS.HOME) {
      loginUrl.searchParams.set("redirect", redirectTo);
    }
    const configuredBaseUrl = String(env.apiBaseUrl || "").replace(/\/+$/, "");
    const baseUrl = configuredBaseUrl || "https://api.lurnstack.com";
    const redirectToLogin = loginUrl.toString();
    const authUrl = `${baseUrl}/api/auth/google?redirect=${encodeURIComponent(redirectToLogin)}`;

    window.location.assign(authUrl);
  };

  if (showSuccessBanner) {
    return (
      <>
        <GlobalStyles />
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden font-sans">
          {/* Glowing Gradients background */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none animate-glow" />
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-lime-500/10 blur-[120px] pointer-events-none animate-glow" style={{ animationDelay: "-3s" }} />

          {/* Grid Background Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

          {/* Content Container */}
          <div className="relative flex flex-col md:flex-row items-center gap-12 md:gap-20 max-w-4xl px-6 w-full justify-center">
            
            {/* Left Column: Welcome text and Redirect Indicator */}
            <div className="flex flex-col text-center md:text-left md:max-w-md anim-fade-in-up anim-1">
              <div className="inline-flex items-center justify-center md:justify-start gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-400">Login Successful</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-[1.1]">
                Welcome to <br />
                <span className="bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-transparent">LurnStack</span>
              </h1>
              <p className="text-slate-400 text-sm md:text-base font-semibold leading-relaxed mb-8">
                Prepare to master new skills and accelerate your career. Our support and training teams are here to guide you.
              </p>

              {/* Redirecting Progress */}
              <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden mb-3 border border-white/5">
                <div className="bg-gradient-to-r from-emerald-500 to-lime-400 h-full rounded-full animate-progress" />
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 tracking-wide uppercase">
                <span>Setting up dashboard...</span>
                <span className="text-emerald-400">{countdown}s</span>
              </div>
            </div>

            {/* Right Column: Sleek Phone Mock-up */}
            <div className="relative anim-fade-in-up anim-2 animate-phone select-none pointer-events-auto">
              {/* External Ring Glow */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500 to-lime-400 rounded-[52px] blur-xl opacity-30 group-hover:opacity-50 transition duration-1000" />
              
              {/* Phone Body */}
              <div className="relative w-[290px] h-[550px] bg-slate-950 rounded-[48px] border-[6px] border-slate-800/90 shadow-[0_24px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden ring-1 ring-white/10">
                {/* Notch / Dynamic Island */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-[22px] bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-black/50 mr-2 border border-slate-800" />
                  <div className="w-8 h-1 bg-black/50 rounded-full border border-slate-800" />
                </div>

                {/* Screen Content */}
                <div className="relative flex-1 flex flex-col justify-between p-6 pt-10 text-center">
                  {/* Glowing Logo Section inside phone */}
                  <div className="mt-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#54d410] mb-3">LurnStack Support</p>
                    <div className="w-14 h-14 mx-auto rounded-[20px] bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center border border-slate-800/80 shadow-inner">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>

                  {/* Contact Info Card inside phone */}
                  <div className="my-auto py-6 px-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl backdrop-blur-md flex flex-col items-center">
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-2">Learning Partner</p>
                    
                    <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                      90666 60360
                    </h2>
                    <p className="text-[11px] text-emerald-400 font-bold mb-4">
                      +91 90666 60360
                    </p>

                    {/* Calling Button */}
                    <a 
                      href="tel:9066660360"
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 font-bold text-[13px] text-slate-950 flex items-center justify-center gap-2 shadow-[0_12px_24px_rgba(16,185,129,0.25)] transition-all hover:scale-[1.03] active:scale-95 border border-emerald-400/20"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .3l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.3-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z" />
                      </svg>
                      <span>Call Support</span>
                    </a>
                  </div>

                  {/* Phone Footer */}
                  <div className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-auto">
                    Secure Session Verified
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="auth-shell flex flex-col lg:flex-row min-h-dvh lg:h-dvh lg:overflow-hidden w-full">

        {/* ── LEFT PANEL (Mobile Stacking & Desktop Split) ── */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-6 lg:py-6 lg:px-12 relative overflow-hidden bg-slate-950 text-white select-none lg:min-h-0">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[110px] pointer-events-none" />
          
          {/* Tech Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950/80" />

          {/* Top Logo */}
          <div className="relative z-10"><Logo /></div>

          {/* Middle: Catch the Code Game Showcase */}
          <div className="relative z-10 flex-1 flex flex-col justify-center py-4 w-full max-w-[480px] mx-auto">
            <CatchTheCodeGame />
          </div>
        </div>

        {/* ── RIGHT PANEL (Mobile Friendly) ── */}
        <div className="flex min-h-0 flex-1 flex-col bg-transparent">
          <div className="relative z-10 flex min-h-dvh lg:min-h-0 lg:h-full flex-1 flex-col justify-center px-4 py-6 sm:px-6 lg:px-8">
            <div className="auth-card w-full max-w-[420px] mx-auto rounded-[24px] p-6 sm:p-8">
              <div className="auth-content">
              {externalAuthLoading ? (
                <div className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 border-2 border-[#004d3d]/20 border-t-[#004d3d] rounded-full animate-spin" />
                    <p className="text-[12px] font-semibold text-slate-600">
                      Completing Google sign-in...
                    </p>
                  </div>
                </div>
              ) : null}
              {externalAuthError ? (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-700">
                  {externalAuthError}
                </div>
              ) : null}
              
              {/* Logo Badge in the Card (restored) */}
              <div className="flex justify-center mb-3">
                <div className="auth-mark rounded-full bg-white p-1.5 ring-1 ring-[#004d3d]/10">
                  <Logo dark />
                </div>
              </div>
              
              <div className="anim-1 mb-3 text-center">
                <p className="mb-0.5 text-[8px] font-black uppercase tracking-[0.24em] text-[#54d410]">LurnStack Sign In</p>
                <h1 className="text-lg lg:text-xl font-bold text-[#004d3d] mb-0.5">Sign In</h1>
                <p className="text-slate-500 text-[10px] font-semibold leading-relaxed">Access your live classes, bookings, and progress.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-2.5 anim-3">
                {formError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-700">
                    {formError}
                  </div>
                ) : null}
                <div>
                  <label htmlFor="email" className="block text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 ml-1">Email Address</label>
                  <input
                    id="email" type="email" name="email" placeholder="Enter email address"
                    value={form.email} onChange={handleChange}
                    className={`w-full h-9 px-3.5 rounded-xl bg-slate-50 border text-[12px] outline-none transition-all
                      ${errors.email ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-[#004d3d] focus:ring-4 focus:ring-[#004d3d]/5"}`}
                  />
                  {errors.email ? (
                    <div className="mt-1 ml-1 text-[10px] font-semibold text-red-600">
                      {errors.email}
                    </div>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="password" className="block text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 ml-1">Password</label>
                  <div className="relative">
                    <input
                      id="password" type={showPassword ? "text" : "password"} name="password" placeholder="Enter password"
                      value={form.password} onChange={handleChange}
                      className={`w-full h-9 px-3.5 pr-10 rounded-xl bg-slate-50 border text-[12px] outline-none transition-all
                        ${errors.password ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-[#004d3d] focus:ring-4 focus:ring-[#004d3d]/5"}`}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-[#004d3d] transition-colors"><EyeIcon open={showPassword} /></button>
                  </div>
                  {errors.password ? (
                    <div className="mt-1 ml-1 text-[10px] font-semibold text-red-600">
                      {errors.password}
                    </div>
                  ) : (
                    <div className="mt-1 ml-1 text-[10px] text-slate-500">
                      {passwordPolicyText()}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} className="w-3.5 h-3.5 rounded border-slate-300 text-[#004d3d] focus:ring-[#004d3d]/20" />
                    <span className="text-[11px] text-slate-600 font-medium">Remember me</span>
                  </label>
                  <Link to="/forgot-password" title="Forgot password?" className="text-[11px] font-bold text-[#004d3d] hover:underline animate-fade-in-up">Forgot password?</Link>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full h-9 rounded-xl bg-[#004d3d] hover:bg-[#00392d] active:scale-[0.98] text-white font-bold text-[12px] transition-all shadow-[0_12px_28px_rgba(0,77,61,0.15)] flex items-center justify-center gap-2 mt-1">
                  {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Sign In"}
                </button>
              </form>

              <p className="mt-4 text-center text-[11px] text-slate-500">
                New to LurnStack?{" "}
                <Link
                  to="/signup"
                  state={{ from: redirectTo }}
                  className="font-black text-[#004d3d] hover:underline transition-colors"
                >
                  Sign up
                </Link>
              </p>

              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
