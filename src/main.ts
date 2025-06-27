import { wind } from "./objects/wind";

// dev settings
const abortController = new AbortController();
export let debugState = new Proxy({ active: false }, {
  get(target, prop) {
    const val = target[prop as keyof typeof target]
      if(prop == 'active') windspeed_controller.style.display = val?'flex':'none'
      return val
  },
  set(target, prop, value) {
      if(prop == 'active') windspeed_controller.style.display = value?'flex':'none'
      target[prop as keyof typeof target] = value
      return true
  },
})

// basic setup
export const canvas = document.getElementById("canvas") as HTMLCanvasElement;
if (!canvas) throw new Error("Canvas not found");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
export const windspeed_controller = document.querySelector('.wind-speed_wrapper') as HTMLInputElement
if(debugState.active==true && !!windspeed_controller) {
  windspeed_controller.addEventListener('input', (ev) => {
    console.log((ev.target as HTMLInputElement).value)
    wind.vec = { ...wind.vec, x: Number((ev.target as HTMLInputElement).value)/10 }
  })
}

// render loop
import { addClouds, cacheClouds, cloudsState, renderClouds } from "./objects/clouds";
// import { renderCursor } from "./objects/cursor";
function renderLoop() {
  if (!canvas) throw new Error("Canvas not found");
  if (!ctx) throw new Error("Canat get canvas ctx");
  
  // ctx.fillStyle = "transparent";
  // ctx.fillStyle = "green";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // renderCursor(ctx)
  renderClouds(ctx)
  
  if (!abortController.signal.aborted) requestAnimationFrame(renderLoop);
}

// actual scene setup
import { MAX_CLOUDS } from "./helper/consts";
(async() => {
  cacheClouds()
  cloudsState.currentClouds =await addClouds(10, wind);
  wind.vec = { x: 2, y: 0 };
  renderLoop();
})()
setInterval(async () => {
  let newClouds = cloudsState.currentClouds.filter(cloud => cloud.pos.x < canvas.width + cloud.size.w); //  не здесь проверять а в самом облаке в цикле рендера я думаю
  if(newClouds.length < cloudsState.currentClouds.length) {
    const randomCloudsAmount = Math.min(Math.max(cloudsState.currentClouds.length-newClouds.length+Math.ceil(Math.random()*MAX_CLOUDS), 1), MAX_CLOUDS)
    let limitedAmount = Math.min(Math.max(MAX_CLOUDS - randomCloudsAmount - newClouds.length,0), MAX_CLOUDS)
    if(newClouds.length == 0 && limitedAmount == 0) limitedAmount = 5
    // console.log(MAX_CLOUDS - randomCloudsAmount - newClouds.length)
    // console.log('prevNewClouds:'+newClouds.length)
    newClouds = newClouds.concat(await addClouds(limitedAmount, wind))
    // console.log('newClouds:'+newClouds.length)
  }
  cloudsState.currentClouds = newClouds
});
// abortController.abort("enough")
// setTimeout(() => {
//   abortController.abort("enough");
// }, 10000);

// setInterval(() => {
//   wind.vec = { x: wind.vec.x, y: toFixed1(Math.max(Math.random()*4-2, -2)) }
// }, 3000);
// хрень, но по синусойде можно менять скорость плавно
