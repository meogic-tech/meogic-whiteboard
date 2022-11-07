import {useTabManager, useDecorators} from "../";
import {defineComponent} from "vue";


export default defineComponent({
    setup() {
        const editor = useTabManager()
        // @ts-ignore
        const decorators = useDecorators(editor)

        return () => decorators.value
    },
})
