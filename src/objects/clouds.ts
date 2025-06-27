
export type Cloud = {
  id: string;
  size: { w: number; h: number };
  vec: { x: number; y: number };
  pos: { x: number; y: number };
  zIndex: number;
};
type CloudsState = {
    currentClouds: Cloud[]
}

export const cloudsState: CloudsState = {
    currentClouds: []
}

import { v4 as uuidv4 } from "uuid";
import { getRandomFactor, toFixed1 } from "../helper/funcs";
import { canvas, debugState } from "../main";
import { cursorState } from "./cursor";
import { Wind } from "./wind";
export function generateCloud(wind: Wind): Cloud {
  const randomWidth = Math.min(Math.max(Math.random()*300, 50), 300);
  const randomHeight = Math.min(Math.max(Math.random()*150, 50), 200);


  const cloudX = 0-randomWidth*2
  const cloudY = 100 + (canvas.height - 400) * Math.random();
  const zIdx = Math.random() * 10;

  return {
    id: uuidv4(),
    vec: { x: wind.vec.x * getRandomFactor(), y: wind.vec.y * getRandomFactor() },
    pos: { x: cloudX, y: toFixed1(cloudY) },
    size: { w: randomWidth, h: randomHeight },
    zIndex: toFixed1(zIdx)
  };
}
export function addClouds(cloudAmount: number, wind: Wind) {
  return Array(cloudAmount).fill(null).map(()=>generateCloud(wind))
}

export function renderClouds(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "white";
  
  for (let cloud of cloudsState.currentClouds) {
    
    cloud.pos.x = toFixed1(cloud.pos.x+cloud.vec.x);
    cloud.pos.y = toFixed1(cloud.pos.y+cloud.vec.y);
    
      const { x, y } = cursorState
      const intersectionX = x>=cloud.pos.x && x<=cloud.pos.x+cloud.size.w
      const intersectionY = y>=cloud.pos.y && y<=cloud.pos.y+cloud.size.h
      if(intersectionX&&intersectionY) ctx.fillStyle = "gray";

      ctx.fillRect(cloud.pos.x, cloud.pos.y, cloud.size.w, cloud.size.h);
      
      if(intersectionX&&intersectionY) ctx.fillStyle = "white";

    if(debugState.active == true) {
      ctx.fillStyle = "black";

      const debugVals = [`id: ${cloud.id.slice(0, 8)}`, `pos: ${JSON.stringify(cloud.pos)}`, `vec: ${JSON.stringify(cloud.vec)}`, `size: ${JSON.stringify(cloud.size)}`, `zIdx: ${JSON.stringify(cloud.zIndex)}`]
      let y = 7, step = 7
      for(let str of debugVals) {
        ctx.fillText(str, cloud.pos.x, cloud.pos.y+y, cloud.size.w)
        y+=step
      }

      ctx.fillStyle = "white";
    }
  }
}