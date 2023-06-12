import { createSSRApp } from 'vue'
import App from './App.vue'

import * as Pinia from 'pinia'
import piniaPersist from '@/plugins/pinia-plugin-persist'

// #ifdef H5 || APP-PLUS
import { Popup, Cell, CellGroup, Field, Button, Icon } from 'vant'
import 'vant/lib/index.css'
// #endif
import 'virtual:windi.css'
import './main.css'

import mixin from '@/mixin'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = Pinia.createPinia()
  pinia.use(piniaPersist)
  app.use(pinia)
  app.mixin(mixin)
  // #ifdef H5 || APP-PLUS
  app.use(Popup)
  app.use(Cell)
  app.use(CellGroup)
  app.use(Field)
  app.use(Button)
  app.use(Icon)
  // #endif
  return {
    app,
    Pinia,
  }
}
