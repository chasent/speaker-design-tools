export interface FRDLine {
  frequency: number
  level: number
  phase: number
}

export interface FRDFile {
  colour: string
  // FRD files are whitespace delimited and are i nthe format:
  // frequency [Hz] , level [dB], and phase [degrees]
  data: FRDLine[]
}

export const parseFrdFile = (name: string, data: string): FRDFile => ({
  colour: name,
  data: data
    .split('\n')
    .reduce<FRDLine[]>((collector, current) => {
      // SKip commented out lines
      if (current.charAt(0) === '"') { return collector }

      const points = current.split(/\s/)
      const frequency = parseFloat(points[0]) || 0
      const level = parseFloat(points[1]) || 0
      const phase = parseFloat(points[2]) || 0

      return [ ...collector, { frequency, level, phase } ]
  }, [])
})