uniform vec2 uRes;
uniform sampler2D uTexture;

void main() {
    vec2 uv = gl_FragCoord.xy / uRes.xy;
    vec4 color = texture2D(uTexture, uv);

    gl_FragColor = color;
}
