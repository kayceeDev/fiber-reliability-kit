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
    '<body>',
    '  <header>',
    '    <h1>Fiber Reliability Lab</h1>',
    '    <p>Local operator-provided RPC remains optional; mocked fixture data stays the default.</p>',
    '  </header>',
    '  <main>',
    '    <section>',
    app,
    '    </section>',
    '  </main>',
    '</body>',
    '</html>'
  ].join('\n')
}
