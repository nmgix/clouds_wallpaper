
export const canvas = document.getElementById("canvas") as HTMLCanvasElement;
if (!canvas) throw new Error("Canvas not found");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const abortController = new AbortController();
let debug: boolean = true

import { toFixed1 } from "./funcs";
import { addClouds, cloudsState } from "./objects/clouds";
import { wind } from "./objects/wind";
function renderLoop() {
  if (!canvas) throw new Error("Canvas not found");
  if (!ctx) throw new Error("Canat get canvas ctx");
  
  // ctx.fillStyle = "transparent";
  // ctx.fillStyle = "green";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = "white";
  
  // console.log(currentClouds.length);
  for (let cloud of cloudsState.currentClouds) {
    
    cloud.pos.x = toFixed1(cloud.pos.x+cloud.vec.x);
    cloud.pos.y = toFixed1(cloud.pos.y+cloud.vec.y);
    ctx.strokeRect(cloud.pos.x, cloud.pos.y, cloud.size.w, cloud.size.h);
    
    if(!!debug && debug == true) {
      const debugVals = [`id: ${cloud.id.slice(0, 8)}`, `pos: ${JSON.stringify(cloud.pos)}`, `vec: ${JSON.stringify(cloud.vec)}`, `size: ${JSON.stringify(cloud.size)}`, `zIdx: ${JSON.stringify(cloud.zIndex)}`]
      let y = 7, step = 7
      for(let str of debugVals) {
        ctx.fillText(str, cloud.pos.x, cloud.pos.y+y, cloud.size.w)
        y+=step
      }
    }
  }
  
  if (!abortController.signal.aborted) requestAnimationFrame(renderLoop);
}

import { MAX_CLOUDS } from "./helper/consts";
cloudsState.currentClouds = addClouds(10, wind);
wind.vec = { x: 2, y: 0 };
renderLoop();
setInterval(() => {
  // clouds.push(spawnCloud());
  let newClouds = cloudsState.currentClouds.filter(cloud => cloud.pos.x < canvas.width + cloud.size.w); //  не здесь проверять а в самом облаке в цикле рендера я думаю
  if(newClouds.length < cloudsState.currentClouds.length) {
    const randomCloudsAmount = Math.min(Math.max(cloudsState.currentClouds.length-newClouds.length+Math.ceil(Math.random()*MAX_CLOUDS), 1), MAX_CLOUDS)
    let limitedAmount = Math.min(Math.max(MAX_CLOUDS - randomCloudsAmount - newClouds.length,0), MAX_CLOUDS)
    if(newClouds.length == 0 && limitedAmount == 0) limitedAmount = 5
    console.log(MAX_CLOUDS - randomCloudsAmount - newClouds.length)
    console.log('prevNewClouds:'+newClouds.length)
    newClouds = newClouds.concat(addClouds(limitedAmount, wind))
    console.log('newClouds:'+newClouds.length)
  }
  cloudsState.currentClouds = newClouds
});
// setTimeout(() => {
//   abortController.abort("enough");
// }, 10000);

// setInterval(() => {
//   wind.vec = { x: wind.vec.x, y: toFixed1(Math.max(Math.random()*4-2, -2)) }
// }, 3000);
// хрень, но по синусойде можно менять скорость плавно
