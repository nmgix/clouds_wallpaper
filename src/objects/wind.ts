import { getRandomFactor, normalize } from "../helper/funcs";
import { debugState, windspeed_controller } from "../main";
import { cloudsState, Cloud } from "./clouds";

export type Wind = { vec: { x: number; y: number }; speed: number };

export const wind = new Proxy({ vec: { x: 0, y: 0 }, speed: 0 } as Wind, {
  set(target, prop, val) {
    if (prop in target) {
      target[prop as keyof typeof target] = val;
      if(prop === 'vec') windspeed_controller.value = String(Number(val*10).toFixed(0))

      target.speed = normalize(target.vec).speed;
      for(let cloud of cloudsState.currentClouds) {
        // cloud.vec.x = Math.max(wind.vec.x  * getRandomFactor() * ratio*0.5, 0.3);
        // cloud.vec.y = Math.max(wind.vec.y  * getRandomFactor() * ratio*0.5, 0);
        assignWindToCloud(cloud)
      }
      if(debugState.active) console.log(target)
      return true;
    } else return false
  }
});

export function assignWindToCloud(cloud: Cloud) {
  if(!cloud || !cloud.size) {
    if(debugState.active) console.log('cloud properties not found')
    return 
  }
  const ratio = cloud.size.w/cloud.size.h
  cloud.vec.x = wind.vec.x  * getRandomFactor() * ratio*0.5;
  cloud.vec.y = wind.vec.y  * getRandomFactor() * ratio*0.5;
}