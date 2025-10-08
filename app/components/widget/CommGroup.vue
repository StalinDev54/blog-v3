<template>
<ZWidget card dim title="其他项目" bg-img="https://p.qlogo.cn/gh/169994096/169994096/100/" bg-right>
	<div class="title text-creative">
		极乐音乐
	</div>

	<ProseA href="https://jiclub.site/music" icon="tabler:music-cancel">
		音乐网站
	</ProseA>
</ZWidget>
</template>

<style lang="scss" scoped>
.title {
	// background-clip: text;
	// background-image: linear-gradient(60deg, var(--c-accent) -30%, var(--c-primary), var(--c-text-1));
	// background-position: 100% 0;
	// background-size: 200%;
	font-size: 1.8em;
	font-weight: 800;
	letter-spacing: 0.05em;
	// color: transparent;
	// transition: background-position 0.2s;

	.widget:hover & {
		background-position: 0 0;
	}
}

.tip {
	font-size: 0.9em;
	line-height: 2;
}

:deep(.bg-img).bg-img.bg-img {
	opacity: 0.5;
}
</style>
