#version 300 es

precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;

uniform sampler2D u_texture;

// we need to declare an output for the fragment shader
out vec4 outColor;

float normalisePosition (float level) {
	return (level / 80.0) - (50.0 / 110.0);
}

float functionX (float x) {
	float texSize = float(textureSize(u_texture, 0).x);
	float texStepSize = 1.0 / texSize;

	float levelA = texture(u_texture, vec2(x, 0.0)).x;
	float levelB = texture(u_texture, vec2(x + texStepSize, 0.0)).x;

	float mixStep = mod((x * texSize), texStepSize * texSize);

	float level = mix(levelA, levelB, mixStep);
	return normalisePosition(level);
}

float distAvgEval(vec2 uv) {
	const int samples = 1;
	const float fsamples = float(samples);
	vec2 maxdist = vec2(0.004);
	vec2 halfmaxdist = 0.5 * maxdist;
	float stepsize = maxdist.x / fsamples;

	float hit = 0.0;
	for (int i = 0; i < samples; ++i ) {
		float x = uv.x + stepsize * float(i);
		float y = uv.y;
		float fx = functionX(uv.x);
		float dist = y - fx;
		float vt = clamp(dist / halfmaxdist.y - 1.0, -2.0, 2.0);
		hit += vt;
	}

	return 1.0 - (abs(hit) / fsamples);
}

void main() {
	vec2 uv_norm = v_texcoord.xy;

	float hitDistAvgStoch = distAvgEval(uv_norm);

	outColor = vec4(1.0, 0.0 , 0.0, hitDistAvgStoch);
}
