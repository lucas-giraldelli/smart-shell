#version 440

// Tray icon tint (components/Tray.qml): greys and dims an app icon so it sits
// quietly on the glass, but keeps strongly saturated pixels in full colour -
// those are status badges (Slack's unread / mention dot) whose colour carries
// meaning. `color` = 1 shows the whole icon in colour (hover).
// Build: /usr/lib/qt6/bin/qsb --qt6 -o tray-icon.frag.qsb tray-icon.frag

layout(location = 0) in vec2 qt_TexCoord0;
layout(location = 0) out vec4 fragColor;

layout(std140, binding = 0) uniform buf {
    mat4 qt_Matrix;
    float qt_Opacity;
    float dim;      // opacity of the greyed parts
    float color;    // 0..1, how much of the rest comes back in colour
};
layout(binding = 1) uniform sampler2D source;

void main() {
    vec4 c = texture(source, qt_TexCoord0);    // premultiplied
    vec3 rgb = c.a > 0.0 ? c.rgb / c.a : vec3(0.0);
    float hi = max(rgb.r, max(rgb.g, rgb.b));
    float lo = min(rgb.r, min(rgb.g, rgb.b));
    float sat = hi > 0.0 ? (hi - lo) / hi : 0.0;
    // a badge: vivid and not dark
    float badge = smoothstep(0.45, 0.7, sat) * smoothstep(0.25, 0.45, hi);
    float keep = max(color, badge);
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    float a = c.a * mix(dim, 1.0, keep);
    fragColor = vec4(mix(vec3(luma), rgb, keep) * a, a) * qt_Opacity;
}
