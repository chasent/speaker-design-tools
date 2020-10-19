import * as webglUtils from './webgl-utils'
import * as m3 from './Matrix3x3'
import { DataClass } from './DataClass'



export class Mesh2D {
  private program: WebGLProgram
  private positionAttributeLocation: number
  private textureCoordAttributeLocation: number
  private matrixLocation: WebGLUniformLocation
  // private widthLocation: WebGLUniformLocation
  // private textureLocation: WebGLUniformLocation
  // private resolutionLocation: WebGLUniformLocation

  private vao: WebGLVertexArrayObject

  private meshLength: number

  translationX = 0.0
  translationY = 0.0
  scaleX = 1.0
  scaleY = 1.0
  angleInRadians = 0.0

  constructor (
    gl: WebGL2RenderingContext,
    mesh: Float32Array,
    vertexShaderSource: string,
    fragmentShaderSource: string,
    private readonly dataClass: DataClass,
  ) {
    // setup GLSL program
    this.program = webglUtils.createProgram(gl, { vertexShaderSource, fragmentShaderSource })

    this.positionAttributeLocation = gl.getAttribLocation(this.program, 'a_position')
    this.textureCoordAttributeLocation = gl.getAttribLocation (this.program, 'a_texcoord')

    this.matrixLocation = webglUtils.createUniformLocation(gl, this.program, 'u_matrix')
    // this.widthLocation = webglUtils.createUniformLocation(gl, this.program, 'u_width')
    // this.textureLocation = webglUtils.createUniformLocation(gl, this.program, 'u_texture')
    // this.resolutionLocation = webglUtils.createUniformLocation(gl, this.program, 'u_resolution')

    // ---------------------- Create the mesh buffer ----------------------
    // Create a buffer
    var positionBuffer = gl.createBuffer()

    // Create a vertex array object (attribute state)
    this.vao = webglUtils.createVao(gl, this.program)

    // and make it the one we're currently working with
    gl.bindVertexArray(this.vao)

    // Turn on the attribute
    gl.enableVertexAttribArray(this.positionAttributeLocation)

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    // Set Geometry.
    gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW)

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)
        
    this.meshLength = mesh.length / 2


    // ---------------------- Create the texture buffer ----------------------

    // create the texcoord buffer, make it the current ARRAY_BUFFER
    // and copy in the texcoord values
    const texcoordBuffer = gl.createBuffer()
    gl.bindBuffer (gl.ARRAY_BUFFER, texcoordBuffer)
    const texPos = new Float32Array([
      0, 0,
      0, 1.0,
      1.0, 0,
      1.0, 1.0,
      0, 1.0,
      1.0, 0,
    ])
    
    gl.bufferData (gl.ARRAY_BUFFER,  texPos, gl.STATIC_DRAW)

    // Turn on the attribute
    gl.enableVertexAttribArray(this.textureCoordAttributeLocation)

    gl.vertexAttribPointer(this.textureCoordAttributeLocation, 2.0, gl.FLOAT, false, 0.0, 0.0)

    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1.0)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0.0,
      gl.RG32F,
      dataClass.dataLength,
      1.0,
      0.0,
      gl.RG,
      gl.FLOAT,
      dataClass.data)

    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  draw = (gl: WebGL2RenderingContext) => {
    // Tell it to use our program (pair of shaders)
    gl.useProgram(this.program)

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(this.vao)

    // Compute the matrices
    var translationMatrix = m3.translation(this.translationX, this.translationY)
    var rotationMatrix = m3.rotation(this.angleInRadians)
    var scaleMatrix = m3.scaling(this.scaleX, this.scaleY)

    // Multiply the matrices.
    var matrix = m3.multiply(translationMatrix, rotationMatrix)
    matrix = m3.multiply(matrix, scaleMatrix)

    // Update uniforms
    // gl.uniform1f(this.widthLocation, 0) // this.frdFile.data.length)
    // gl.uniform1i(this.textureLocation, 0.0)
    gl.uniformMatrix3fv(this.matrixLocation, false, matrix)
    //gl.uniform2f(this.matrixLocation, gl.canvas.width, gl.canvas.height)

    // Draw the geometry.
    gl.drawArrays(gl.TRIANGLES, 0, this.meshLength)
  }
}
