
export const resizeCanvasToDisplaySize = (canvas: HTMLCanvasElement) => {
  const cssToRealPixels = window.devicePixelRatio || 1

  const width = canvas.clientWidth
  const height = canvas.clientHeight

  canvas.width = Math.floor(width  * cssToRealPixels);
  canvas.height = Math.floor(height * cssToRealPixels);
}

const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type)

  if (!shader) { throw new Error('Could not create shader') }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (success) {
    return shader
  }

  console.log(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)

  throw new Error('Could not create shader!')
}

const _createProgram = (gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
  const program = gl.createProgram()
  if (!program) { throw new Error('Could not create program') }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!success) {
    console.log(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
  
    throw new Error('Could not create program!')
  }

  return program
}

export const createProgram = (gl: WebGL2RenderingContext, shaders: { vertexShaderSource: string, fragmentShaderSource: string }) => {
  // create GLSL shaders, upload the GLSL source, compile the shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, shaders.vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shaders.fragmentShaderSource);

  // Link the two shaders into a program
  return _createProgram(gl, vertexShader, fragmentShader)
}

// Fill the buffer with the values that define a rectangle.
export const setRectangle = (gl: WebGL2RenderingContext, x: number, y: number, width: number, height: number) => {
  const x1 = x
  const x2 = x + width
  const y1 = y
  const y2 = y + height

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW)
}

export const createUniformLocation = (gl: WebGL2RenderingContext, program: WebGLProgram, name: string) => {
  const loc = gl.getUniformLocation(program, name)

  if (loc) { return loc }
  else {
    console.error(gl.getProgramInfoLog(program))
    throw new Error(`Failed to create uniform ${name}`) }
}

export const createBuffer = (gl: WebGL2RenderingContext, program: WebGLProgram) => {
  const buffer = gl.createBuffer()

  if (buffer) { return buffer }
  else {
    console.error(gl.getProgramInfoLog(program))
    throw new Error(`Failed to create buffer`)
  }
}

export const createVao = (gl: WebGL2RenderingContext, program: WebGLProgram) => {
  const vao = gl.createVertexArray()

  if (vao) { return vao }
  else {
    console.error(gl.getProgramInfoLog(program))
    throw new Error(`Failed to create buffer`)
  }
}
