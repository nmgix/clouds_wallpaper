
export type Cloud = {
  id: string;
  size: { w: number; h: number };
  vec: { x: number; y: number };
  pos: { x: number; y: number };
  zIndex: number;
  variant: string;
};
type CloudsState = {
    currentClouds: Cloud[]
}

export const cloudsState: CloudsState = new Proxy({
    currentClouds: []
}, {
  set(target, prop, value) {
      target.currentClouds
      if(prop == 'currentClouds') value = (value as CloudsState['currentClouds']).sort((c1, c2) => c1.zIndex - c2.zIndex)
      target[prop as keyof typeof target] = value
      return true
  },
})

import { v4 as uuidv4 } from "uuid";
import { CLOUDS_NAMES, CLOUDS_PATH } from "../helper/consts";
import { getRandomFactor, memoize, toFixed1 } from "../helper/funcs";
import { canvas, debugState } from "../main";
import { cursorState } from "./cursor";
import { Wind } from "./wind";
export async function generateCloud(wind: Wind): Promise<Cloud> {
  
  // https://stackoverflow.com/a/23976260/14889638
  const variant = CLOUDS_NAMES[getEnumKeysCached(CLOUDS_NAMES).length*Math.random()|0]
  const image = await memoizeLoadImage(CLOUDS_PATH+variant)
  
  // const randomWidth = Math.min(Math.max(Math.random()*300, 50), 300);
  // const randomHeight = Math.min(Math.max(Math.random()*150, 50), 200);

  const cloudX = 0-image.width*2
  const cloudY = 100 + (canvas.height - 400) * Math.random();
  const zIdx = Math.random() * 10;

  return {
    id: uuidv4(),
    vec: { x: wind.vec.x * getRandomFactor(), y: wind.vec.y * getRandomFactor() },
    pos: { x: cloudX, y: toFixed1(cloudY) },
    size: { w: image.width, h: image.height },
    zIndex: toFixed1(zIdx),
    variant
  };
}
export async function addClouds(cloudAmount: number, wind: Wind) {
  return Promise.all(Array(cloudAmount).fill(null).map(()=> generateCloud(wind)))
}

const loadImage = (src : string) : Promise<HTMLImageElement> => {
  console.log(`loading ${src}`)
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.src = src;
  })
}

export const memoizeLoadImage = memoize(loadImage)

export async function renderClouds(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "white";
  
  for (let cloud of cloudsState.currentClouds) {
    
    cloud.pos.x = toFixed1(cloud.pos.x+cloud.vec.x);
    cloud.pos.y = toFixed1(cloud.pos.y+cloud.vec.y);
    
      const { x, y } = cursorState
      const intersectionX = x>=cloud.pos.x && x<=cloud.pos.x+cloud.size.w
      const intersectionY = y>=cloud.pos.y && y<=cloud.pos.y+cloud.size.h
      if(intersectionX&&intersectionY) ctx.fillStyle = "gray";

      const image = await memoizeLoadImage(CLOUDS_PATH+cloud.variant)

      ctx.drawImage(image,cloud.pos.x, cloud.pos.y, cloud.size.w, cloud.size.h)
      // ctx.fillRect(cloud.pos.x, cloud.pos.y, cloud.size.w, cloud.size.h);

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

const enumKeysCache = new WeakMap<object, string[]>();

export function getEnumKeysCached<T extends object>(enumObj: T): (keyof T)[] {
  if (enumKeysCache.has(enumObj)) return enumKeysCache.get(enumObj)! as (keyof T)[];
  const keys = Object.keys(enumObj).filter(k => isNaN(Number(k))) as (keyof T)[];
  enumKeysCache.set(enumObj, keys as string[]);
  return keys;
}

export async function cacheClouds() {
  return Promise.all(getEnumKeysCached(CLOUDS_NAMES).map(cln => memoizeLoadImage(CLOUDS_PATH+cln)))
}