import { renderReliabilityLabDocument } from '../app/render-lab-document.js'

async function bootstrapLab() {
  const mount = document.getElementById('app')

  if (!mount) {
    throw new Error('Reliability Lab mount point #app was not found.')
  }

  const html = await renderReliabilityLabDocument({
    scenarioId: 'happy-payment'
  })

  mount.innerHTML = html
}

void bootstrapLab()
