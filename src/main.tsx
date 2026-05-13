import { render } from 'preact'
import { createAppStore } from './store/store'
import { createFsAdapter } from './shell/fs/detect'
import { App } from './ui/app'

const store = createAppStore()
const adapter = createFsAdapter()

const root = document.getElementById('app')
if (root) {
  render(
    <App
      store={store}
      adapter={adapter}
    />,
    root,
  )
}
