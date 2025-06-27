
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
import { getRandomFactor, toFixed1 } from "../funcs";
import { canvas } from "../main";
import { Wind } from "./wind";
export function generateCloud(wind: Wind): Cloud {
  const randomWidth = Math.min(Math.max(Math.random()*300, 50), 300);
  const randomHeight = Math.min(Math.max(Math.random()*150, 50), 200);


  const cloudX = 0-randomWidth*2
  const cloudY = 100 + (canvas.height - 400) * Math.random();

  const zInd = Math.random() * 10;

  return {
    id: uuidv4(),
    vec: { x: wind.vec.x * getRandomFactor(), y: wind.vec.y * getRandomFactor() },
    pos: { x: cloudX, y: toFixed1(cloudY) },
    size: { w: randomWidth, h: randomHeight },
    zIndex: toFixed1(zInd)
  };
}
export function addClouds(cloudAmount: number, wind: Wind) {
  return Array(cloudAmount).fill(null).map(()=>generateCloud(wind))
}