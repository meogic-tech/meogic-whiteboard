import { createApp } from 'vue'
import './assets/style.scss'
import App from './App.vue'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
    locale: 'en',
    messages: {
        "en": {
            "language": "Language",
            "hello": "Hello, world!",
            "name": "name",
            "gender": "gender",
            "male": "male",
            "female": "female"
        },
        "cn": {
            "language": "语言",
            "hello": "你好世界！",
            "name": "姓名",
            "gender": "性别",
            "male": "男",
            "female": "女"
        }
    }
})

createApp(App)
    .use(i18n)
    .mount('#app')
