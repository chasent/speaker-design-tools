#version 300 es

precision mediump float;

// Passed in from the vertex shader.
in vec2 v_texcoord;

uniform int u_width;
uniform sampler2D u_texture;


vec2 getDataPoint(int index) {
	return texture(u_texture, vec2(float(index) / float(u_width), 0)).xy;
}

// we need to declare an output for the fragment shader
out vec4 outColor;

float log2k = 4.30102999566;
float log20 = 1.30102999566;

vec2 get_distance_vector(vec2 a, vec2 b) {
  vec2 ba = b - a;
  return a + ba * clamp( -dot(a,ba)/dot(ba,ba), 0.0, 1.0 );
}

float approx_distance(vec2 p, vec2 b0, vec2 b2) {
  return length(get_distance_vector(b0 - p, b2 - p));
}


float log10(float value) {
	if (value < 1.0e-10) { return log(1.0e-10)/log(10.0); }
	else { return log(value)/log(10.0); }
}

vec2 log10(vec2 value) {
	float v1;
	float v2 = value[1];

	if (value[0] < 1.0e-10) { v1 = log(1.0e-10)/log(10.0);	}
	else 					{ v1 = log(value[0])/log(10.0);	}

	return vec2(v1, v2);
}

float getDistance(int index) {
	if (index < 0) {
		return 1000000.0;
	}

	if (index > u_width) {
		return 1000000.0;
	}

	vec2 xy = gl_FragCoord.xy;
	vec2 b0 = getDataPoint(index);
	b0.x = ((log10(b0[0]) - log20) / 3.0);
	b0.y = (b0[1] - 65.0) / 40.0;

	vec2 b2 = getDataPoint(index + 1);
	b2.x = ((log10(b2[0]) - log20) / 3.0);
	b2.y = (b2[1] - 65.0) / 40.0;

	return approx_distance(xy, b0 * vec2(1600, 900), b2 * vec2(1600, 900));
}




vec4 drawFrd() {
	int index = 0;

	int arrlen = u_width;

	for (int i = 0; i <= arrlen; i++)
	{
		float dx = (log10(getDataPoint(i).x) - log20) / 3.0;
		float dxn = (log10(getDataPoint(i + 1).x) - log20) / 3.0;

		if ( (dx <= v_texcoord.x) && (v_texcoord.x <= dxn) )
		{
			index = i;
			break;
		}

		if (dxn < v_texcoord.x)
		{
			index = arrlen - 1;
		}
	}

	if (index >= 0)
	{
		float d = getDistance(index);

		float d2 = getDistance(index - 1);
		if (d2 < d) { d = d2; }
		float d3 = getDistance(index + 1);
		if (d3 < d) { d = d3; }

		float thickness = 0.5;
		
		float a = 0.0;
		
		if(d < thickness) {
			a = 0.0;
		} else {
			// Anti-alias the edge.
			a = smoothstep(d, thickness, thickness + 0.15);
		}

		return vec4(1.0 - a, 1.0 - a, 1.0 - a, 1.0);
	}
	else
	{
		return vec4(0.0, 0.0, 0.0, 0.0);
	}
}



float frqInt[28] = float[](
	20.0,
	30.0,
	40.0,
	50.0,
	60.0,
	70.0,
	80.0,
	90.0,
	100.0,
	200.0,
	300.0,
	400.0,
	500.0,
	600.0,
	700.0,
	800.0,
	900.0,
	1000.0,
	2000.0,
	3000.0,
	4000.0,
	5000.0,
	6000.0,
	7000.0,
	8000.0,
	9000.0,
	10000.0,
	20000.0
);


void main() {

	float arp = 0.0;

	for (int i = 0; i <= 28; i++)
	{
		float rlog = ((log10(frqInt[i]) - log20) / 3.0);

		float xp = v_texcoord.x;

		float d = abs(rlog - xp);

		float arss = clamp((d * - 1600.0) + 1.0, 0.0, 1.0);

		if (arss > 0.0 && arss > arp) {
			arp = 0.25;
		}
	}

	
	vec4 grph = vec4(arp, arp, arp, 1.0);
	vec4 frdCol = drawFrd();

	outColor = frdCol;

	// outColor = vec4(v_texcoord.x, 0.0, 0.0, 1.0);
}