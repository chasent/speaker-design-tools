#version 300 es


in vec2 a_position;
in vec2 a_texcoord;
uniform mat3 u_matrix;

out vec2 v_texcoord;

void main() {
  vec2 position = (u_matrix * vec3(a_position, 1)).xy;

  v_texcoord = a_texcoord;
  gl_Position = vec4(position, 0, 1);
}