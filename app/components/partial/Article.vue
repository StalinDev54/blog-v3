<script setup lang="ts">
import type ArticleProps from '~/types/article'
import { ref, watch } from 'vue'
import { parseMusicUrl } from '~/utils/music'

const props = defineProps<{
	useUpdated?: boolean
	meta?: any
} & ArticleProps>()

const appConfig = useAppConfig()

const showAllDate = isTimeDiffSignificant(props.date, props.updated)

const categoryLabel = computed(() => props.categories?.[0])
const categoryColor = computed(() => appConfig.article.categories[categoryLabel.value!]?.color)
const categoryIcon = computed(() => getCategoryIcon(categoryLabel.value))

// 音乐信息相关
const musicInfo = ref<{ name?: string, artist?: string } | null>(null)
const isMusicInfoLoading = ref(false)

// 解析音乐信息
async function parseMusicInfo() {
	if (props.meta?.music) {
		isMusicInfoLoading.value = true
		try {
			const info = await parseMusicUrl(props.meta.music)
			musicInfo.value = {
				name: info.name,
				artist: info.artist,
			}
		}
		catch (error) {
			console.error('解析音乐信息失败:', error)
			musicInfo.value = null
		}
		finally {
			isMusicInfoLoading.value = false
		}
	}
}

// 监听音乐元数据变化
watch(() => props.meta?.music, () => {
	parseMusicInfo()
}, { immediate: true })
</script>

<template>
<ZRawLink class="article-card card">
	<NuxtImg v-if="image" class="article-cover" :src="image" :alt="title" />
	<article>
		<h2 class="article-title text-creative">
			{{ title }}
		</h2>

		<p v-if="description" class="article-description">
			{{ description }}
		</p>

		<div class="article-info">
			<time v-if="showAllDate || !useUpdated" :datetime="getIsoDatetime(date)" :title="getLocaleDatetime(date)">
				<Icon name="ph:calendar-dots-bold" />
				{{ getPostDate(date) }}
			</time>

			<time v-if="showAllDate || useUpdated" :class="{ 'use-updated': useUpdated }"
				:datetime="getIsoDatetime(updated)" :title="getLocaleDatetime(updated)">
				<Icon name="ph:calendar-plus-bold" />
				{{ getPostDate(props.updated) }}
			</time>

			<!-- 带查询参数时会水合错误 -->
			<ClientOnly>
				<span v-if="categoryLabel" class="article-category" :style="{ '--cg-color': categoryColor }">
					<Icon :name="categoryIcon" />
					{{ categoryLabel }}
				</span>
			</ClientOnly>

			<span v-if="readingTime?.words" class="article-words">
				<Icon name="ph:paragraph-bold" />
				{{ formatNumber(readingTime?.words) }}字
			</span>

			<span v-if="readingTime?.minutes" class="article-reading-time">
				<Icon name="ph:clock-bold" />
				{{ Math.ceil(readingTime?.minutes) }}分钟

			</span>

			<span v-if="meta?.music" class="article-music-info">
				<Icon name="ph:music-note-bold" />
				<span v-if="isMusicInfoLoading">解析中...</span>
				<span v-else-if="musicInfo?.name">{{ musicInfo.name }}</span>
				<span v-else>内置音乐</span>
				<span v-if="musicInfo?.artist" class="music-artist"> - {{ musicInfo.artist }}</span>
			</span>
		</div>
	</article>
</ZRawLink>
</template>

<style lang="scss" scoped>
.article-card {
	container-type: inline-size;
	position: relative;
	margin: 1rem 0;
	border-radius: 0.8rem;
	color: var(--c-text);
	animation: float-in 0.2s var(--delay) backwards;

	>article {
		display: grid;
		gap: 0.5rem;
		padding: 1rem;
	}
}

.article-info {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5em clamp(1em, 5%, 1.5em);
	font-size: 0.8em;
	color: var(--c-text-2);

	&:empty {
		display: none;
	}

	.use-updated {
		order: -1;
	}
}

.article-title {
	font-size: 1.2em;
	color: var(--c-text);
}

.article-description {
	font-size: 0.9em;
	color: var(--c-text-2);
}

.article-category {
	color: var(--cg-color);
}

// CSR 前空 category 产生 double gap，同时需避免误伤 iconify
span:not([class]):empty {
	display: none;
}

.article-cover {
	position: absolute;
	opacity: 0.8;
	top: 0;
	inset-inline-end: 0;
	width: min(320px, 50%);
	height: 100%;
	margin: 0;
	mask-image: linear-gradient(to var(--end), transparent, #FFF 50%);
	transition: all 0.2s;
	object-fit: cover;

	:hover>& {
		opacity: 1;
	}

	&+article {
		position: relative;
		width: 60%;
		text-shadow: 0 0 0.5rem var(--ld-bg-card), 0 0 1rem var(--ld-bg-card);
	}

	@mixin cover-narrow {
		position: revert;
		width: 100%;
		height: auto;
		max-width: none;
		max-height: 256px;
		aspect-ratio: 2.4;
		margin-bottom: -10%;
		mask-image: linear-gradient(#FFF 50%, transparent);

		&+article {
			width: auto;
		}
	}

	@media (max-width: $breakpoint-phone) {
		@include cover-narrow;
	}

	@container (max-width: #{$breakpoint-phone}) {
		@include cover-narrow;
	}
}

// 音乐信息样式
.article-music-info {
	display: flex;
	align-items: center;
	gap: 0.25em;

	.music-artist {
		color: var(--c-text-3);
		font-style: italic;
	}
}
</style>
