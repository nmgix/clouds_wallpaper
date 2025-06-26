const canvas = document.getElementById("canvas") as HTMLCanvasElement;
if (!canvas) throw new Error("Canvas not found");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const MAX_CLOUDS = 30

const abortController = new AbortController();
let debug: boolean = true

let currentClouds: Cloud[] = [];
const wind = new Proxy({ vec: { x: 0, y: 0 }, speed: 0 } as Wind, {
  set(target, prop, val) {
    // console.log(target.vec);
    if (prop in target) target[prop as keyof typeof target] = val;
    target.speed = normalize(target.vec).speed;
    for(let cloud of currentClouds) {
      // console.log('calc')
      const ratio = cloud.size.w/cloud.size.h
      cloud.vec.x = wind.vec.x * wind.speed * getRandomFactor() * ratio*0.5; //дорого слишком
    // для cloud.vec.y пока не надо
    }
    return true;
  }
});


import { v4 as uuidv4 } from "uuid";
import { getRandomFactor, normalize, toFixed1 } from "./funcs";
import { Cloud, Wind } from "./types";
function generateCloud(wind: Wind): Cloud {
  // пока что y 0, мне не нужно рандомную скорость по высоте

  // const randomWidth = 100;
  // const randomHeight = 50;
  const randomWidth = Math.min(Math.max(Math.random()*300, 50), 300);
  const randomHeight = Math.min(Math.max(Math.random()*150, 50), 200);


  const cloudX = 0-randomWidth*2
  // const cloudX = 0;
  const cloudY = 100 + (canvas.height - 400) * Math.random();

  const zInd = Math.random() * 10;

  return {
    id: uuidv4(),
    vec: { x: wind.vec.x * wind.speed * getRandomFactor(), y: 0 },
    pos: { x: cloudX, y: toFixed1(cloudY) },
    size: { w: randomWidth, h: randomHeight },
    zIndex: toFixed1(zInd) //битовое отделение дробной части, аналог toFixed(1) после запятой, типо 0.1 вместо 0.15345334
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "red";
  
  // console.log(currentClouds.length);
  for (let cloud of currentClouds) {
    
    cloud.pos.x += cloud.vec.x;
    cloud.pos.y += cloud.vec.y;
    
    // console.log({ pos: cloud.pos });
    // console.log({ vec: cloud.vec });
    
    const vals = [`id: ${cloud.id.slice(0, 8)}`, `pos: ${JSON.stringify(cloud.pos)}`, `vec: ${JSON.stringify(cloud.vec)}`, `size: ${JSON.stringify(cloud.size)}`, `zIdx: ${JSON.stringify(cloud.zIndex)}`]
    let y = 7, step = 7
    for(let str of vals) {
      ctx.fillText(str, cloud.pos.x, cloud.pos.y+y, cloud.size.w)
      y+=step
    }
    
    ctx.strokeRect(cloud.pos.x, cloud.pos.y, cloud.size.w, cloud.size.h);
    // console.log(cloud);
  }

  console.log("rendering happens");

  if (!abortController.signal.aborted) requestAnimationFrame(renderLoop);
}

// console.log(currentClouds);
currentClouds = addClouds(10, currentClouds, wind);

wind.vec = { x: 2, y: 0 };
console.log(wind);

renderLoop();
// setInterval(() => {
//   // clouds.push(spawnCloud());
//   const newClouds = currentClouds.filter(cloud => cloud.pos.x < canvas.width + cloud.size.w);
//   const randomCloudsAmount = Math.max(Math.min(currentClouds.length-newClouds.length+Math.ceil(Math.random()*4), 0), MAX_CLOUDS)
//   if(newClouds.length < currentClouds.length) addClouds(randomCloudsAmount, newClouds, wind)
//   currentClouds = newClouds
// console.log(currentClouds)
// });
// не работает




// setTimeout(() => {
//   abortController.abort("enough");
// }, 10000);

// setInterval(() => {
//   wind.x = ...; // новый вектор
//   wind.y = ...;
// }, 3000);
