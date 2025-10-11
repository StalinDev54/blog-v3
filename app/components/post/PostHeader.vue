<script setup lang="ts">
import type ArticleProps from '~/types/article'
import { useLayoutStore } from '~/stores/layout'

defineOptions({ inheritAttrs: false })
const props = defineProps<ArticleProps>()

const appConfig = useAppConfig()
const layoutStore = useLayoutStore()

const categoryLabel = computed(() => props.categories?.[0])
const categoryIcon = computed(() => getCategoryIcon(categoryLabel.value))

const shareText = `【${appConfig.title}】${props.title}\n\n${props.description ? `${props.description}\n\n` : ''}${new URL(props.path!, appConfig.url).href}`

const { copy, copied } = useCopy(shareText)

// 移动端点击打开侧边栏
function handleMobileClick(event: MouseEvent) {
	// 检查是否为移动端设备 (768px 是 $breakpoint-mobile 的值)
	if (window.innerWidth <= 768) {
		event.preventDefault()
		layoutStore.toggle('sidebar')
	}
}
</script>

<!-- 💩夸克浏览器，桌面端只有IE不支持 :has() 了 -->
<template>
<div class="post-header" :class="{ 'has-cover': image, 'text-revert': meta?.coverRevert }">
	<NuxtImg v-if="image" class="post-cover" :src="image" :alt="title" @click="handleMobileClick" />
	<div class="post-nav">
		<div class="operations">
			<ZButton :icon="copied ? 'ph:check-bold' : 'ph:share-bold'" @click="copy()">
				文字分享
			</ZButton>
		</div>

		<div v-if="!meta?.hideInfo" class="post-info">
			<time v-if="date" v-tip="`创建于 ${getLocaleDatetime(props.date)}`" :datetime="getIsoDatetime(date)">
				<Icon name="ph:calendar-dots-bold" />
				{{ getPostDate(props.date) }}
			</time>

			<time v-if="isTimeDiffSignificant(date, updated, .999)" v-tip="`修改于 ${getLocaleDatetime(props.updated)}`"
				:datetime="getIsoDatetime(updated)">
				<Icon name="ph:calendar-plus-bold" />
				{{ getPostDate(props.updated) }}
			</time>

			<span v-if="categoryLabel" @click="handleMobileClick">
				<Icon :name="categoryIcon" />
				{{ categoryLabel }}
			</span>

			<span @click="handleMobileClick">
				<Icon name="ph:paragraph-bold" />
				{{ formatNumber(readingTime?.words) }} 字
			</span>
		</div>
	</div>

	<h1 class="post-title" :class="getPostTypeClassName(type)" @click="handleMobileClick">
		{{ title }}
	</h1>
</div>
</template>

<style lang="scss" scoped>
.post-header {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	gap: 1rem;
	margin: 0.5rem;
	border-radius: 1rem;
	background-color: var(--c-bg-2);
	color: var(--c-text);

	@media (max-width: $breakpoint-mobile) {
		margin: 0;
		border-radius: 0;
	}

	&:hover .operations {
		opacity: 1;
	}

	&.has-cover {
		position: relative;
		overflow: hidden;
		overflow: clip;
		min-height: 256px;
		max-height: 320px;
		color: white;
		transition: font-size 0.2s;

		&:hover {
			font-size: 0.8em;
		}

		.post-info {
			filter: drop-shadow(0 1px 2px #000);
		}

		.post-title {
			background-image: linear-gradient(transparent, #0003, #0005);
			text-shadow: 0 1px 1px #0003, 0 1px 2px #0003;

			&.text-story {
				text-align: center;
			}
		}

		&.text-revert {
			text-shadow: 0 0 2px #FFF, 0 1px 0.5em #FFF;
			color: #333;

			.post-title {
				background-image: linear-gradient(transparent, #FFF3, #FFF5);
			}
		}
	}
}

.operations {
	position: absolute;
	opacity: 0;
	inset-inline-end: 1em;
	color: var(--c-text-1);
	transition: opacity 0.2s;
	z-index: 1;
}

.post-cover {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.post-title {
	padding: 0.8em 1rem;
	font-size: 1.6em;
	line-height: 1.2;
	z-index: 1;
}

.post-nav {
	position: relative;
	opacity: 0.9;
	padding: 0.8em 1rem;

	// 如果在父级设置字体尺寸，会影响祖先字体尺寸改变的行为
	// 并且设置相对尺寸会导致过渡
	>* {
		font-size: 0.8rem;
	}

	.post-info {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em 1.2em;
		column-gap: clamp(1em, 3%, 1.5em);
	}
}
</style>
