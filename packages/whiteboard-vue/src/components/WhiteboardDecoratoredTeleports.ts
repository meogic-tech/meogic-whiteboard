import {useWhiteboard, useDecorators} from "../";
import {defineComponent} from "vue";


export default defineComponent({
    setup() {
        const editor = useWhiteboard()
        // @ts-ignore
        const decorators = useDecorators(editor)

        return () => decorators.value
    },
})
