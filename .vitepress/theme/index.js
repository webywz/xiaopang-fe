import DefaultTheme from 'vitepress/theme'
import './custom.css' // 可选：如果你有自定义CSS
import CustomFooter from '../components/CustomFooter.vue'

// 你可以在这里注册全局组件
// import MyComponent from '../components/MyComponent.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // 注册组件
    // app.component('MyComponent', MyComponent)
    app.component('CustomFooter', CustomFooter)
    
    // 这里可以做更多自定义增强
  },
  setup() {
    // 可以在这里添加全局组件挂载逻辑
  }
} 