const canvas = document.getElementById("canvas") as HTMLCanvasElement;
if (!canvas) throw new Error("Canvas not found");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const abortController = new AbortController();

type Cloud = {
  id: string;
  size: { w: number; h: number };
  vec: { x: number; y: number };
  pos: { x: number; y: number };
  zIndex: number;
};

type Wind = { vec: { x: number; y: number }; speed: number };

let currentClouds: Cloud[] = [];
const wind = new Proxy({ vec: { x: 0, y: 0 }, speed: 0 } as Wind, {
  set(target, prop, val) {
    // console.log(target.vec);
    if (prop in target) target[prop as keyof typeof target] = val;
    target.speed = normalize(target.vec).speed;
    return true;
  }
});

function normalize(vec: { x: number; y: number }) {
  let len = Math.hypot(vec.x, vec.y);
  len = ((len * 10) | 0) / 10;
  return len > 0 ? { speed: len, vec: { x: vec.x / len, y: vec.y / len } } : { speed: 0, vec: { x: 0, y: 0 } };
}

import { v4 as uuidv4 } from "uuid";
function generateCloud(wind: Wind): Cloud {
  const factor = 0.8 + Math.random() * 0.4;
  // пока что y 0, мне не нужно рандомную скорость по высоте

  const randomWidth = 100;
  const randomHeight = 50;

  // const cloudX = 0-randomWidth
  const cloudX = 0;
  const cloudY = 100 + (canvas.height - 500) * Math.random();

  const zInd = Math.random() * 10;

  return {
    id: uuidv4(),
    vec: { x: wind.vec.x * wind.speed * factor, y: 0 },
    pos: { x: cloudX, y: ((cloudY * 10) | 0) / 10 },
    size: { w: randomWidth, h: randomHeight },
    zIndex: ((zInd * 10) | 0) / 10 //битовое отделение дробной части, аналог toFixed(1) после запятой, типо 0.1 вместо 0.15345334
  };
}

function addClouds(cloudAmount: number, cloudArr: Cloud[], wind: Wind) {
  let newClouds: Cloud[] = [];
  for (let i = 0; i < cloudAmount; i++) newClouds.push(generateCloud(wind));
  // console.log({ newClouds });
  return cloudArr.concat(newClouds);
}

function renderLoop() {
  if (!canvas) throw new Error("Canvas not found");
  if (!ctx) throw new Error("Canat get canvas ctx");

  // ctx.fillStyle = "transparent";
  // ctx.fillStyle = "green";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "red";
  for (let cloud of currentClouds) {
    cloud.pos.x += cloud.vec.x;
    cloud.pos.y += cloud.vec.y;

    ctx.strokeRect(cloud.pos.x, cloud.pos.y, cloud.pos.x + cloud.size.w, cloud.pos.y + cloud.size.h);
    // console.log(cloud);
  }

  console.log("rendering happens");

  if (!abortController.signal.aborted) requestAnimationFrame(renderLoop);
}

currentClouds = addClouds(3, currentClouds, wind);
// console.log(currentClouds);

wind.vec = { x: 2, y: 1 };
console.log(wind);

renderLoop();
// setInterval(() => {
//   // clouds.push(spawnCloud());
//   currentClouds = currentClouds.filter(cloud => cloud.pos.x + cloud.size.w < canvas.width);
// });
setTimeout(() => {
  abortController.abort("enough");
}, 0.3);

// setInterval(() => {
//   wind.x = ...; // новый вектор
//   wind.y = ...;
// }, 3000);
