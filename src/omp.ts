import * as webglUtils from './webgl-utils'
import { Mesh2D } from './Mesh2D'
import { FRDFile } from './frdParser'
import { DataClass } from './DataClass'



const vertexShaderSource = require('./shaders/vertex.glsl')
const fragmentShaderSource = require('./shaders/fragment')



export class Renderer {
  private gl: CanvasRenderingContext2D

  redraw = false

  frameInit = 0
  framesDrawn = 0

  constructor (
    private canvas: HTMLCanvasElement,
    private data: DataClass,
    private setFramesPerSecond: React.Dispatch<React.SetStateAction<number>>,
  ) {
    const gl = canvas.getContext('2d')
    if (!gl) { throw new Error('Could not get WebGL2 context') }
    this.gl = gl

    

    this.frameInit = performance.now()
    this.drawScene()
  }

  drawScene = () => {
    requestAnimationFrame(() => {
      webglUtils.resizeCanvasToDisplaySize(this.canvas)
     



      // Redraw
      if (this.redraw) {
        this.drawScene()
      }
    })
  }
}
