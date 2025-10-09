<script setup lang="ts">
const blogLog = [
	{ label: '2025-10-8', value: '个人博客上线' },

	{ label: '2025-09-9', value: '推出实时视奸项目' },
	{ label: '2025-07-16', value: '推出极乐音乐线上版' },
	{ label: '2024-10-19', value: '极乐Pro上线' },
	{ label: '2024-09-1', value: '朋友圈小窝上线' },
	{ label: '2021年 暑期', value: '12.0全新架构升级' },
	{ label: '2020-09-1', value: '极乐App开发上线' },
]
</script>

<template>
<ZWidget card title="更新日志">
	<div class="log-timeline-wrapper">
		<ZDlGroup size="large" :items="blogLog" />
	</div>
</ZWidget>
</template>

<style lang="scss" scoped>
.log-timeline-wrapper {
	:deep(.dl-group.large) {
		--line-color: #C9C9C9;
		--c-text-2: var(--custom-c-text-2, #374151);
		--c-text-3: var(--custom-c-text-3, #9CA3AF);
		--font-monospace: var(--custom-font-monospace, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);

		&.dark,
		.dark & {
			--line-color: #4B5563;
			--c-text-2: var(--custom-dark-c-text-2, #D1D5DB);
			--c-text-3: var(--custom-dark-c-text-3, #9CA3AF);
		}

		position: relative;
		list-style: none;

		>dl {
			display: block;
			position: relative;
			margin-bottom: 0.3rem;
			padding-left: 1.25rem;

			&:last-child {
				margin-bottom: 0;
			}

			&::before {
				content: "";
				position: absolute;
				top: 0.5em;
				left: 0.25rem;
				width: 0.5rem;
				height: 0.5rem;
				border-radius: 50%;
				background-color: var(--c-text-2);
				transform: translateY(-50%) translateX(-50%);
				transition: transform 0.3s ease, box-shadow 0.3s ease;
				z-index: 1;
			}

			&::after {
				content: "";
				position: absolute;
				top: 0.5em;
				left: 0.25rem;
				width: 1px;
				background-color: var(--line-color);
				transform: translateX(-50%);
				z-index: 0;
			}

			&:not(:last-child)::after {
				height: calc(100% + 0.8rem);
			}

			&:last-child::after {
				bottom: 0.2em;
			}
		}

		>dl>dt {
			display: block;
			margin-bottom: 0.1rem;
			font-family: var(--font-monospace);
			font-size: 0.8em;
			font-weight: normal;
			line-height: 1;
			text-align: left;
			color: var(--c-text-3);
		}

		>dl>dd {
			margin: 0;
			font-size: 0.875rem;
			line-height: 1.4;
			color: var(--c-text-2);
		}
	}
}
</style>
