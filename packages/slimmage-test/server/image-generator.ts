/**
 * Generate SVG placeholder images with dimensions as text.
 * Color varies by width step for visual debugging.
 */

const COLORS = [
  '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c',
  '#3498db', '#9b59b6', '#34495e', '#e91e63', '#00bcd4',
];

function colorForWidth(width: number): string {
  const step = Math.floor(width / 160);
  return COLORS[step % COLORS.length];
}

export function generateSvg(width: number, height: number): string {
  const w = width || 160;
  const h = height || Math.round(w * 0.75);
  const bg = colorForWidth(w);
  const fontSize = Math.max(12, Math.min(w / 8, 48));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="${bg}" />
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="sans-serif" font-size="${fontSize}" fill="white" font-weight="bold">
    ${w}×${h}
  </text>
</svg>`;
}

export function svgResponse(width: number, height: number): Response {
  const svg = generateSvg(width, height);
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache',
    },
  });
}
