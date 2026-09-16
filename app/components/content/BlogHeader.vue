<script setup lang="ts">
/**
 * BlogHeader 组件：可在 Markdown/MDC 内容中调用的博客头部组件 (:blog-header)
 * 支持悬浮时的动画 Emoji、阿里妈妈方圆体变形字重动画与自定义属性配置
 */
const appConfig = useAppConfig()

interface Props {
	title?: string
	subtitle?: string
	logo?: string
	emojiTail?: string[]
}

const props = defineProps<Props>()

const title = computed(() => props.title || appConfig.title)
const subtitle = computed(() => props.subtitle || appConfig.header?.subtitle)
const logo = computed(() => props.logo || appConfig.header?.logo)
const emojis = computed(() => props.emojiTail || appConfig.header?.emojiTail || ['📄', '🦌', '🙌', '🐟', '🏖️'])
</script>

<template>
<div class="blog-header-wrapper">
	<ZRawLink class="blog-header-card" to="/">
		<!-- 悬浮背景浮动动画 Emoji -->
		<div v-if="emojis.length" class="emoji-tail">
			<span
				v-for="(emoji, emojiIndex) in emojis"
				:key="emojiIndex"
				class="split-char"
				:style="{ '--delay': `${emojiIndex * 0.6 - 3}s` }"
				v-text="emoji"
			/>
		</div>

		<!-- Logo -->
		<NuxtImg
			v-if="logo"
			:src="logo"
			class="header-logo"
			:alt="title"
		/>

		<!-- 标题与副标题 -->
		<div class="header-content">
			<div class="header-title">
				<span
					v-for="(char, charIndex) in title"
					:key="charIndex"
					class="split-char"
					:style="{ '--delay': `${(charIndex + 1) * 0.1}s` }"
					v-text="char"
				/>
			</div>
			<div v-if="subtitle" class="header-subtitle">
				{{ subtitle }}
			</div>
		</div>
	</ZRawLink>
</div>
</template>

<style lang="scss" scoped>
.blog-header-wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 2rem 0;
}

.blog-header-card {
	display: inline-flex;
	align-items: center;
	gap: 1rem;
	position: relative;
	overflow: hidden;
	padding: 0.9rem 1.8rem;
	border-radius: 1.2rem;
	background-color: var(--c-bg-2);
	border: 1px solid var(--c-border);
	line-height: 1.4;
	color: var(--c-text);
	user-select: none;
	text-decoration: none;
	box-shadow: 0 4px 16px -4px var(--c-border);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		transform: translateY(-2px);
		border-color: var(--c-primary);
		box-shadow: 0 8px 24px -4px var(--c-primary-soft);
	}
}

.header-logo {
	height: 3.2rem;
	width: 3.2rem;
	border-radius: 50%;
	object-fit: cover;
	flex-shrink: 0;
	z-index: 1;
}

.header-content {
	position: relative;
	z-index: 1;
}

@font-face {
	font-family: AlimamaFangYuanTi;
	src: url("/fonts/AlimamaFangYuanTi.woff2");
}

.header-title {
	font-family: AlimamaFangYuanTi, "Noto Sans SC", sans-serif;
	font-size: 1.6rem;
	font-synthesis: none;
	font-variation-settings: "wght" 600, "BEVL" 100;
	letter-spacing: 0.05em;

	> .split-char {
		display: inline-block;
		animation: 3.14s infinite alternate vf-weight, 2.72s infinite alternate vf-bevel;
		animation-delay: var(--delay);
		animation-play-state: paused;
	}
}

.header-subtitle {
	opacity: 0.65;
	font-size: 0.85rem;
	margin-top: 0.2rem;
}

@keyframes vf-weight {
	0% {
		font-weight: 600;
	}
	38.2% {
		font-weight: 300;
	}
	100% {
		font-weight: 900;
	}
}

@keyframes vf-bevel {
	from {
		font-variation-settings: "BEVL" 100;
	}
	to {
		font-variation-settings: "BEVL" 1;
	}
}

.emoji-tail {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
	align-content: center;
	justify-items: center;
	position: absolute;
	opacity: 0.12;
	inset: 0;
	font-size: 3.5rem;
	transition: opacity 0.5s ease;
	filter: blur(2px);
	pointer-events: none;
	z-index: 0;

	> .split-char {
		display: inline-block;
		animation: 5s infinite alternate emoji-floating;
		animation-delay: var(--delay);
		animation-play-state: paused;
	}
}

.blog-header-card:hover {
	.emoji-tail {
		opacity: 0.45;
	}

	.split-char {
		animation-play-state: running;
	}
}

@keyframes emoji-floating {
	50% {
		transform: translate(-12px, -4px) scale(1.2);
		filter: blur(3px);
	}
	100% {
		transform: translate(-4px, -12px) scale(0.9);
		filter: blur(1px);
	}
}
</style>
