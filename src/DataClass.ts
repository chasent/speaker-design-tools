import { FRDFile } from './frdParser'



export class DataClass {
  data: Float32Array;
  dataLength: number

  constructor (frdFile: FRDFile) {
    const entries = this.getDivisionsAndEdges(frdFile)
    this.data = new Float32Array(entries.flatMap(x => [ x, 0.0]))
    this.dataLength = entries.length
  }

  frequencyRange = { start: 20, end: 20000 }

  nDivisions: number = 16

  getDivisionsAndEdges = (frdFile: FRDFile) => {
    const start = Math.log10(this.frequencyRange.start)
    const end = Math.log10(this.frequencyRange.end)

    const calcBucketSize = (this.nDivisions * 2)

    const pile = [ ...frdFile.data ]
    let pilePosition = 0

    const stepSize = (end - start) / calcBucketSize
    const buckets = Array(this.nDivisions + 1)
      .fill(null)
      .map((_, i) => i * 2)
      .map(i => {
        const data = new Array<number>()
        const lowerFrq = Math.pow(10, ((i - 1) * stepSize) + start)
        const upperFrq = Math.pow(10, ((i + 1) * stepSize) + start)

        while (true) {
          const currentPileElement = pile[pilePosition]
          pilePosition++
          if (!currentPileElement) { break }
          const {  frequency, level } = currentPileElement
          if ((lowerFrq < frequency) && (frequency < upperFrq)) {
            data.push(level)
          } else {
            break
          }
        }

        let level = 0
        if (data.length > 0) {
          level = data.reduce((p, c) => p + c, 0) / data.length
        }

        return level
      })

    return buckets
  }
}
