import {
  renderReliabilityLabApp,
  type RenderReliabilityLabAppInput
} from './render-lab-app.js'

export async function renderReliabilityLabDocument(
  input: RenderReliabilityLabAppInput
): Promise<string> {
  const app = await renderReliabilityLabApp(input)

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    '  <title>Fiber Reliability Lab</title>',
    '</head>',
    '<body class="min-h-screen bg-slate-100 text-slate-950 antialiased">',
    '  <main aria-label="Fiber Reliability Lab">',
    app,
    '  </main>',
    '</body>',
    '</html>'
  ].join('\n')
}
