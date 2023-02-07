import { ref, nextTick, computed } from 'vue'

export default function useScroll() {
    const scrollTop = ref(0)
    const oldScrollTop = ref(0)

    const scroll = (e: any) => {
        oldScrollTop.value = e.detail.scrollTop
    }

    const goTop = () => {
        scrollTop.value = oldScrollTop.value
        nextTick(() => {
            scrollTop.value = 0
        })
    }

    const isGoTo = computed(() => oldScrollTop.value > 200)

    return {
        scrollTop,
        oldScrollTop,
        isGoTo,
        scroll,
        goTop
    }
}