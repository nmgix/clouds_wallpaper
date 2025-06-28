import { canvas } from "../main";
import { grabCloud, releaseCloud } from "./clouds";

export type CursorState = {
    x: number, y: number, hoverOver: null|string, grabs: {
        localGrabX: number, localGrabY: number, id: string
    } | null
}

export const cursorState = new Proxy({ x:0, y: 0, hoverOver: null, grabs: null } as CursorState, {
    set(target, prop, value) {
        target[prop as keyof typeof target]=value as never
        if(prop == 'hoverOver') {
            if(!target.grabs) {
                document.body.style.cursor = typeof value === 'string' ? "grab" : 'auto'
            }
        }; 
        return true
    },
})
window.addEventListener('mousemove', ev => {
    const rect = canvas.getBoundingClientRect();
    cursorState.x = ev.clientX-rect.left
    cursorState.y = ev.clientY-rect.top
})

function myInterval() {
      var setIntervalId = setInterval(function() {
        if (!cursorState.grabs) clearInterval(setIntervalId);
        // getCursorPosition(canvas, mousePosition);
      }, 100); //set your wait time between consoles in milliseconds here
    }

window.addEventListener('mousedown', function() {
        grabCloud()
        document.body.style.cursor='grabbing'
        myInterval();
    })
    window.addEventListener('mouseup', function() {
        releaseCloud()
        document.body.style.cursor='auto'
        myInterval();
    })
    window.addEventListener('mouseleave', function() {
        releaseCloud()
        document.body.style.cursor='auto'
        myInterval();
    })


export function renderCursor(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle= 'red'
    ctx.fillRect(cursorState.x,cursorState.y,10,10)
}

export function cursorIntersects(cursor: { x:number,y:number },rect:{ x:number,y:number,w:number,h:number }) {
    const intersectionX = cursor.x>=rect.x && cursor.x<=rect.x+rect.w
      const intersectionY = cursor.y>=rect.y && cursor.y<=rect.y+rect.h
      return { intersectionX, intersectionY }
}