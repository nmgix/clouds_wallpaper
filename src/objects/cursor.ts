import { canvas } from "../main";

export const cursorState = new Proxy({ x:0, y: 0, active: false }, {
    set(target, prop, value) {
        target[prop as keyof typeof target]=value as never
        if(prop =='active') document.body.style.cursor = value === true ? "pointer" : 'auto'; 
        return true
    },
})
document.addEventListener('mousemove', ev => {
    const rect = canvas.getBoundingClientRect();
    cursorState.x = ev.clientX-rect.left
    cursorState.y = ev.clientY-rect.top
})

export function renderCursor(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle= 'red'
    ctx.fillRect(cursorState.x,cursorState.y,10,10)
}