import './app.css'

export const App = () => {
  return (
    <div class="app">
      <header class="app-topbar">
        <h1>Joinery3D</h1>
      </header>
      <main class="app-main">
        <aside class="app-sidebar-left">
          {/* SlotList and LibraryPanel will go here */}
        </aside>
        <div class="app-viewport">
          {/* Viewport mount target */}
        </div>
        <aside class="app-sidebar-right">
          {/* PropertiesPanel will go here */}
        </aside>
      </main>
    </div>
  )
}
