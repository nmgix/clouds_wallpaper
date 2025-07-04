
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
import { cursorIntersects as cursorIntersectsCheck, CursorState, cursorState } from "./cursor";
import { assignWindToCloud, Wind } from "./wind";
export async function generateCloud(wind: Wind, generateAtScreen = false): Promise<Cloud | void> {
  
  // https://stackoverflow.com/a/23976260/14889638
  const variant = CLOUDS_NAMES[getEnumKeysCached(CLOUDS_NAMES).length*Math.random()|0]
  try {
    const image = await memoizeLoadImage(CLOUDS_PATH+variant)
    if(!image) return console.log('ошибка при создании облака: не загрузилось избражение')
  
  // const randomWidth = Math.min(Math.max(Math.random()*300, 50), 300);
  // const randomHeight = Math.min(Math.max(Math.random()*150, 50), 200);

  // const cloudX = 0-image.width*2
  const cloudX = toFixed1(generateAtScreen ? 0 + (canvas.width - image.width)*Math.random(): 0-image.width*2)
  const cloudY = toFixed1(100 + (canvas.height - 400) * Math.random());
  const zIdx = toFixed1(Math.random() * 10);

  return {
    id: uuidv4(),
    vec: { x: wind.vec.x * getRandomFactor(), y: wind.vec.y * getRandomFactor() },
    pos: { x: cloudX, y: cloudY },
    size: { w: image.width, h: image.height },
    zIndex: zIdx,
    variant
  };
  } catch (error) {
    console.log(error)
  }
}
export async function addClouds(cloudAmount: number, wind: Wind, generateAtScreen = false) {
  return Promise.all(Array(cloudAmount).fill(null).map(()=> generateCloud(wind, generateAtScreen)))
}

const loadImage = (src : string) : Promise<HTMLImageElement> => {
  if(debugState.active) console.log(`loading ${src}`)
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => { console.log(`loaded: ${src}`); resolve(image) });
    image.addEventListener('error', (err) => { console.log(`didnt load ${src}`); console.log(err); reject(err) });
    image.src = src;
  })
}

export const memoizeLoadImage = memoize(loadImage)

// let intersectsWith:Map<string, number> = new Proxy(new Map(), {
  
//   // get(target, prop: string | symbol, receiver) {
//   //     if (prop === "set") {
//   //       return (key: string, value: number) => {
//   //         target.set(key, value);
//   //         const sortedEntries = [...target.entries()].sort(([, v1], [, v2]) => {
//   //           return (v1 as number) - (v2 as number);
//   //         });
//   //         target.clear();
//   //         for (const [k, v] of sortedEntries) {
//   //           target.set(k, v);
//   //         }

//   //         return receiver;
//   //       };
//   //     }

//   //     return Reflect.get(target, prop, receiver);
//   //   }
//   get(target, prop, receiver) {
//     // Perform the normal non-proxied behavior.
//     let value = Reflect.get(target, prop, receiver);

//     // If something is accessing the property `proxy.set`, override it
//     // to automatically do `proxy.set.bind(map)` so that when the
//     // function is called `this` will be `map` instead of `proxy`.
//     if (prop === "set" && typeof value === "function") value = value.bind(target);

//     return value;
//   }
// })
let intersectsWith:Map<string, number> = new Map()
let hoverOver: CursorState['hoverOver'] = null

// гоняется в 60+фпс, частоте экрана
export async function renderClouds(ctx: CanvasRenderingContext2D) {
  // ctx.fillStyle = "white";
  
  if(hoverOver!==null) hoverOver=null // мне кажется в 60+фпс эта проверка немного грузит излишне

  for(let cloud of cloudsState.currentClouds) {
      const { intersectionX, intersectionY } = cursorIntersectsCheck({ ...cursorState }, { ...cloud.pos, ...cloud.size })
      if(intersectionX&&intersectionY) {
        // intersectsWith.push(cloud.id)
        if(!intersectsWith.has(cloud.id)) {
          intersectsWith.set(cloud.id, cloud.zIndex)
          intersectsWith = new Map([...intersectsWith.entries()].sort(([, v1], [, v2]) => v2 - v1));
        }
        hoverOver=cloud.id // мне кажется в 60+фпс эта проверка немного грузит излишне
      } else {
        if(intersectsWith.has(cloud.id)) intersectsWith.delete(cloud.id)
      }
  }
  if(cursorState.hoverOver !== hoverOver) cursorState.hoverOver = hoverOver


  for (let cloud of cloudsState.currentClouds) {      
      const intersects = intersectsWith.has(cloud.id)

      if(!!cursorState.grabs) {
        if(intersects && cloud.id === cursorState.grabs.id) {
          ctx.save() // https://stackoverflow.com/a/18955967/14889638
          ctx.filter = 'brightness(75%)'
          cursorState.hoverOver = hoverOver
        }
      } else {
        // затемнение облака если пересечение с курсором
        if(intersects && cloud.id == intersectsWith.keys().next().value) {
          ctx.save() // https://stackoverflow.com/a/18955967/14889638
          ctx.filter = 'brightness(85%)'
          cursorState.hoverOver = hoverOver
        }
      }

      // рендер облака
      const image = await memoizeLoadImage(CLOUDS_PATH+cloud.variant)
      if(!image) return console.log('error rendering image')

      if(!!cursorState.grabs && cursorState.grabs.id === cloud.id) {
        // рендер где курсор находится
        const newCloudX = cursorState.x-cursorState.grabs.localGrabX
        const newCloudY = cursorState.y-cursorState.grabs.localGrabY

        cloud.pos.x = newCloudX
        cloud.pos.y = newCloudY
        

        ctx.drawImage(image,newCloudX, newCloudY, cloud.size.w, cloud.size.h)
      } else{
        cloud.pos.x = toFixed1(cloud.pos.x+cloud.vec.x);
        cloud.pos.y = toFixed1(cloud.pos.y+cloud.vec.y);
        // рендер дефолт
        ctx.drawImage(image,cloud.pos.x, cloud.pos.y, cloud.size.w, cloud.size.h)
      }

      // ctx.fillRect(cloud.pos.x, cloud.pos.y, cloud.size.w, cloud.size.h);
      if(intersects) ctx.restore()

      // рендер дебаг значений
      if(debugState.active == true) {
        ctx.save()
        ctx.fillStyle = "black";

        const debugVals = [`id: ${cloud.id.slice(0, 8)}`, `pos: ${JSON.stringify(cloud.pos)}`, `vec: ${JSON.stringify(cloud.vec)}`, `size: ${JSON.stringify(cloud.size)}`, `zIdx: ${JSON.stringify(cloud.zIndex)}`]
        let y = 7, step = 7
        for(let str of debugVals) {
          ctx.fillText(str, cloud.pos.x, cloud.pos.y+y, cloud.size.w)
          y+=step
        }

        ctx.restore()
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

export function grabCloud() {
if(cursorState.hoverOver !== null){
            const cloud = cloudsState.currentClouds.find(cl => cl.id===cursorState.hoverOver)
            if(!cloud) {
              if(debugState.active) console.log('при захвате облака произошла ошибка: облако не найдено, лол');
              return
            }
            cursorState.grabs = { localGrabX: toFixed1(cursorState.x-cloud.pos.x), localGrabY: toFixed1(cursorState.y-cloud.pos.y), id: cloud.id }
            cloud.vec = { x: 0, y: 0 }
            if(debugState.active) console.log(cursorState.grabs)
        }
}

export function releaseCloud() {
  let cloud = cloudsState.currentClouds.find(cl => cl.id == cursorState.grabs?.id)
  if(!cloud) {
    if(debugState.active) console.log('перетаскиваемое облако не найдено, оно станет статичным')
    return
  }
  
  assignWindToCloud(cloud)
  cursorState.grabs = null
}