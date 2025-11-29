<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { parseMusicUrl } from '~/utils/music'

const props = defineProps<{
    url: string
}>()

const audio = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const directUrl = ref('')
const coverUrl = ref('https://wework.qpic.cn/wwpic3az/503309_zafbLebUS7KK741_1764389837/0')
const isLooping = ref(true) // 默认开启循环播放

// 解析音乐链接
async function parseUrl() {
    if (props.url) {
        try {
            const musicInfo = await parseMusicUrl(props.url)
            directUrl.value = musicInfo.url
            coverUrl.value = musicInfo.cover || 'https://wework.qpic.cn/wwpic3az/503309_zafbLebUS7KK741_1764389837/0'
            console.log('解析音乐信息:', musicInfo)
        }
        catch (error) {
            console.error('解析音乐链接失败:', error)
            // 出错时使用默认封面
            coverUrl.value = 'https://wework.qpic.cn/wwpic3az/503309_zafbLebUS7KK741_1764389837/0'
        }
    }
}

// 自动播放函数
async function autoPlay() {
    // 等待下一个tick确保DOM已更新
    await nextTick()
    if (directUrl.value && audio.value) {
        try {
            await audio.value.play()
            isPlaying.value = true
        }
        catch (error) {
            console.error('自动播放失败:', error)
        }
    }
}

// 监听directUrl变化，自动播放
watch(directUrl, async (newUrl) => {
    if (newUrl) {
        await autoPlay()
    }
})

// 播放/暂停控制
function togglePlay() {
    if (!audio.value)
        return

    if (isPlaying.value) {
        audio.value.pause()
    }
    else {
        // 在播放前确保有有效的URL
        if (directUrl.value) {
            audio.value.play()
        }
        else {
            console.warn('没有有效的音频URL')
        }
    }
    isPlaying.value = !isPlaying.value
}

// 监听音频播放结束
function onEnded() {
    if (isLooping.value) {
        // 如果是循环播放，重新开始播放
        if (audio.value) {
            audio.value.currentTime = 0
            audio.value.play()
        }
    }
    else {
        isPlaying.value = false
    }
}

// 监听URL变化
watch(() => props.url, async () => {
    await parseUrl()
    // 不再将isPlaying设置为false，因为autoPlay会处理播放状态
}, { immediate: true })

// 组件卸载时暂停音频
onUnmounted(() => {
    if (audio.value) {
        audio.value.pause()
    }
})
</script>

<template>
<div class="music-player-container">
    <audio ref="audio" :src="directUrl" loop @ended="onEnded" />
    <div id="musicPlay" :class="{ active: isPlaying }" aria-label="音乐播放器" @click="togglePlay">
        <ZRawImg :src="coverUrl" class="musicCover" alt="音乐播放器" />
    </div>
</div>
</template>

<style lang="scss" scoped>
/* 音乐播放器容器 */
.music-player-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}

/* iOS风格音乐播放器效果 */
#musicPlay {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
    
    &:hover {
        background: rgba(255, 255, 255, 0.9);
        transform: scale(1.05);
    }
}

#musicPlay.active {
    animation: rotate 3s linear infinite;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 20px rgba(0, 123, 255, 0.3);
}

.musicCover {
    border-radius: 50%;
    width: 40px;
    height: 40px;
    object-fit: cover;
    transition: all 0.3s ease;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* 深色主题适配 */
.dark #musicPlay {
    background: rgba(40, 40, 40, 0.8);
    border: 1px solid rgba(80, 80, 80, 0.5);

    &:hover {
        background: rgba(50, 50, 50, 0.9);
    }
}

.dark #musicPlay.active {
    background: rgba(60, 60, 60, 0.95);
    box-shadow: 0 0 20px rgba(10, 132, 255, 0.3);
}
</style>
