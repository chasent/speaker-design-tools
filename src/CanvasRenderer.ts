import * as webglUtils from './webgl-utils'
import { FRDFile, FRDLine } from './frdParser'



interface Point { x: number, y: number }

export class Renderer {
  private ctx: CanvasRenderingContext2D

  redraw = false

  frameInit = 0
  framesDrawn = 0

  levelMin = 50
  levelMax = 110

  frequencyMin = Math.log2(20)
  frequencyMax = Math.log2(20000)

  pixelDistanceThershold = 4

  // frdData: FRDFile[]

  constructor (
    private canvas: HTMLCanvasElement,
    private frdData: FRDFile[],
    private setFramesPerSecond: React.Dispatch<React.SetStateAction<number>>,
  ) {
    const ctx = canvas.getContext('2d')
    if (!ctx) { throw new Error('Could not get WebGL2 context') }
    this.ctx = ctx
    this.frameInit = performance.now()
    this.drawScene()
  }

  sliceToLocation = (slice: FRDLine): Point => {
    const { width, height } = this.canvas

    const frqLog = Math.log2(slice.frequency)
    const frequencyRange = this.frequencyMax - this.frequencyMin
    const x = ((frqLog - this.frequencyMin) / frequencyRange) * width

    const levelRange = this.levelMax - this.levelMin
    const y = (1 - ((slice.level - this.levelMin) / levelRange)) * height

    return { x, y }
  }

  pixelDistance = (a: Point, b: Point) =>
    Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y))

  sliceDistance = (sliceA: FRDLine, sliceB: FRDLine) => {
    const sliceALoc = this.sliceToLocation(sliceA)
    const sliceBLoc = this.sliceToLocation(sliceB)
    return this.pixelDistance(sliceALoc, sliceBLoc)
  }

  drawScene = () => {
    webglUtils.resizeCanvasToDisplaySize(this.canvas)

    // Plot decades
    for (let decade = 10; decade < 20000; decade *= 10) {
      this.ctx.beginPath()
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      const { x } = this.sliceToLocation({ frequency: decade, level: 0, phase: 0 })
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.canvas.height)

      this.ctx.lineWidth = 2
      this.ctx.stroke()

      for (let curF = decade * 2; curF < (decade * 10); curF += decade) {
        this.ctx.beginPath()
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.075)"
        const { x } = this.sliceToLocation({ frequency: curF, level: 0, phase: 0 })
        this.ctx.moveTo(x, 0)
        this.ctx.lineTo(x, this.canvas.height)
        this.ctx.lineWidth = 1
        this.ctx.stroke()
      }
    }

    // Plot level divisions
    for (let curL = (this.levelMin + 5); curL < this.levelMax; curL += 5) {
      this.ctx.beginPath()
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.075)"
      const { y } = this.sliceToLocation({ frequency: 20, level: curL, phase: 0 })
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.canvas.width, y)
      this.ctx.lineWidth = 1
      this.ctx.stroke()
    }

    for (const frdFile of this.frdData) {
      let prevSlice = frdFile.data[0]

      this.ctx.beginPath()
      this.ctx.strokeStyle = frdFile.colour
      this.ctx.lineWidth = 4

      const initalLoc = this.sliceToLocation(prevSlice)
      console.log('initalLoc', initalLoc)
      this.ctx.moveTo(initalLoc.x, initalLoc.y)

      for (const slice of frdFile.data) {
        const currentDistance = this.sliceDistance(prevSlice, slice)
        if (currentDistance > this.pixelDistanceThershold) {
          const loc = this.sliceToLocation(slice)
          this.ctx.lineTo(loc.x, loc.y)
          prevSlice = slice
        }
      }

      this.ctx.stroke()
    }
  }
}
