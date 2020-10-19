#version 300 es

precision mediump float;

// Passed in from the vertex shader.
in vec2 v_texcoord;

uniform vec2 u_resolution;
uniform float u_width;
uniform sampler2D u_texture;

float log20k = 4.30102999566;
float log20 = 1.30102999566;



float binarySearchFrequency(float currentFrequency) {
	float texStepSize = 1.0 / u_width;

	float lowerBound = 0.0;
	float upperBound = 1.0 - texStepSize;
	
	for (float texPosition = 0.0 ; texPosition < 1.0 ; texPosition += texStepSize) {
		float midPoint = (upperBound + lowerBound) / 2.0;
		vec2 currPoint = texture(u_texture, vec2(midPoint, 0.0)).xy;
		vec2 nextPoint = texture(u_texture, vec2(midPoint + texStepSize, 0.0)).xy;

		// Is the current frequency between these two entries of the FRD plot?
		if ((currPoint.x <= currentFrequency) && (currentFrequency <= nextPoint.x)) {
			float gradient = (currPoint.y - nextPoint.y) / (currPoint.x - nextPoint.x);
			return (gradient * (currentFrequency - currPoint.x)) + currPoint.y;
		}

		if (currPoint.x > currentFrequency) {
			upperBound = midPoint - texStepSize;
		}

		if (currPoint.x < currentFrequency) {
			lowerBound = midPoint + texStepSize;
		}
	}

	return 0.0; // TODO: LRN HW2 ch0p
}



float getDecibelsFromFrequency(float currentFrequency) {
	float texStepSize = 1.0 / u_width;
	float texPosition = 0.0;

	for (float texPosition = 0.0 ; texPosition < 1.0 ; texPosition += texStepSize) {
		vec2 currPoint = texture(u_texture, vec2(texPosition, 0.0)).xy;
		vec2 nextPoint = texture(u_texture, vec2(texPosition + texStepSize, 0.0)).xy;

		// Is the current frequency between these two entries of the FRD plot?
		if ((currPoint.x <= currentFrequency) && (currentFrequency <= nextPoint.x)) {
			float gradient = (currPoint.y - nextPoint.y) / (currPoint.x - nextPoint.x);
			return (gradient * (currentFrequency - currPoint.x)) + currPoint.y;
		}
	}

	return 0.0; // TODO: Figure out a way to snip this
}

// we need to declare an output for the fragment shader
out vec4 outColor;

float getCurrentFrequency(float coord) {
	return pow(10.0, (coord * 3.0) + 1.30102999566);
}

float normalizeLevel(float level) {
	float minLevel = 50.0;
	float maxLevel = 60.0;
	return (level - minLevel) / maxLevel;
}

float getLevelAtPosition(float position) {
	float currentFrequency = getCurrentFrequency(position);
	// float level = getDecibelsFromFrequency(currentFrequency);
	float level = binarySearchFrequency(currentFrequency);
	return normalizeLevel(level);
}

// note: averages distances over multiple samples along x, result is identical to superEval
float distAvgEval(vec2 uv){
	const int samples = 8;
	const float fsamples = float(samples);
	vec2 maxdist = 0.05 * vec2(0.1, 0.16);
	vec2 halfmaxdist = 0.5 * maxdist;
	float stepsize = maxdist.x / fsamples;

	// float initial_offset_x = -0.5 * fsamples * stepsize;
	// uv.x += initial_offset_x;

	float hit = 0.0;

	for (int i = 0; i < samples; ++i) {
		float x = uv.x + stepsize * float(i);
		float y = uv.y;
		float fx = getLevelAtPosition(x);
		float dist = y - fx;
		float vt = clamp(dist / halfmaxdist.y -1.0, -1.0, 1.0);
		hit += vt;
	}

	return 1.0 - abs(hit) / fsamples;
}





void main() {
	float g1 = distAvgEval(vec2(v_texcoord.x, v_texcoord.y));	

	outColor = vec4(1.0, 0.0, 0.0, g1);
}