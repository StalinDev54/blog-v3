<script setup lang="ts">
const appConfig = useAppConfig()

useSeoMeta({
	title: '关于',
	description: `关于 ${appConfig.author.name} 以及这个博客的一切。`,
})

const layoutStore = useLayoutStore()
layoutStore.setAside([])

const birthYear = appConfig.component.stats.birthYear || 2006
const age = new Date().getFullYear() - birthYear

// 技能专长数据
const skills = [
	{ name: '前端开发', level: 90, desc: 'Vue / Nuxt / TypeScript' },
	{ name: '后端开发', level: 75, desc: 'Python / Node.js / API' },
	{ name: 'UI / UX 设计', level: 80, desc: '极简美学 / 交互动效' },
	{ name: '系统架构', level: 70, desc: '工程化 / 性能优化' },
]

// 爱好标签与图标
const hobbies = [
	{ name: '阅读', icon: 'ph:book-bookmark-bold' },
	{ name: '音乐', icon: 'ph:music-notes-bold' },
	{ name: '旅行', icon: 'ph:airplane-tilt-bold' },
	{ name: '摄影', icon: 'ph:camera-bold' },
	{ name: '编程', icon: 'ph:code-bold' },
	{ name: '骑行', icon: 'ph:bicycle-bold' },
]

// 关注领域
const focusAreas = [
	{ title: '前沿科技', desc: '探索未来人机交互与 AI 工具', icon: 'ph:cpu-bold' },
	{ title: '生活记录', desc: '保持热爱，奔赴山海与烟火', icon: 'ph:heartbeat-bold' },
	{ title: '无限可能', desc: '持续构建与长期主义', icon: 'ph:infinity-bold' },
]
</script>

<template>
<div class="about-page">
	<!-- 顶部 Header：苹果风格极简 Hero -->
	<header class="hero-header">
		<div class="hero-tag">
			ABOUT ME
		</div>
		<div class="hero-main">
			<div class="hero-text">
				<h1 class="hero-title">
					关于我
				</h1>
				<p class="hero-subtitle">
					你独留我思维混淆却独有神志。
				</p>
			</div>
			<div class="avatar-wrapper">
				<img :src="appConfig.author.avatar" :alt="appConfig.author.name" class="avatar-image">
			</div>
		</div>
	</header>

	<!-- Bento Grid 主布局 -->
	<div class="bento-grid">
		<!-- 核心个人介绍卡片 (大尺寸主卡) -->
		<section class="apple-card card-intro">
			<div class="card-badge">
				<Icon name="ph:sparkle-bold" class="badge-icon" />
				<span>HELLO WORLD</span>
			</div>
			<div class="intro-body">
				<h2 class="intro-headline">
					你好，我是 <span class="gradient-text">{{ appConfig.author.name }}</span>
				</h2>
				<p class="intro-desc">
					一名专注于现代 Web 体验与极简工程的开发者。追求如流水般顺畅的交互设计与稳健的代码架构。
				</p>
			</div>
			<div class="intro-footer">
				<span class="status-pill">
					<span class="status-dot" />
					正在专注创造与沉淀
				</span>
			</div>
		</section>

		<!-- 基础规格参数卡片 (苹果芯片风格数据) -->
		<section class="apple-card card-specs">
			<div class="card-badge">
				<span>SPECS</span>
			</div>
			<div class="specs-content">
				<div class="spec-block">
					<span class="spec-label">出生年份</span>
					<span class="spec-number">{{ birthYear }}</span>
				</div>
				<div class="spec-divider" />
				<div class="spec-block">
					<span class="spec-label">当前年龄</span>
					<span class="spec-number">{{ age }} <span class="spec-unit">岁</span></span>
				</div>
			</div>
		</section>

		<!-- 座右铭卡片 -->
		<section class="apple-card card-motto">
			<div class="card-badge">
				<span>MOTTO</span>
			</div>
			<div class="motto-wrap">
				<blockquote class="motto-quote">
					“ 人生得意须尽欢 ”
				</blockquote>
				<p class="motto-author">
					— 李白《将进酒》
				</p>
			</div>
		</section>

		<!-- 性格卡片 (MBTI) -->
		<section class="apple-card card-mbti">
			<div class="card-badge">
				<span>PERSONALITY</span>
			</div>
			<div class="mbti-content">
				<div class="mbti-type">
					INFP-T
				</div>
				<div class="mbti-role">
					调停者
				</div>
				<p class="mbti-desc">
					理想主义、温和而坚定，渴望用创意为世界带来微小而美好的改变。
				</p>
				<a
					href="https://www.16personalities.com/ch/infp-%E4%BA%BA%E6%A0%BC"
					target="_blank"
					rel="noopener noreferrer"
					class="apple-pill-btn"
				>
					<span>了解更多</span>
					<Icon name="ph:arrow-up-right-bold" />
				</a>
			</div>
		</section>

		<!-- 技能专长卡片 -->
		<section class="apple-card card-skills">
			<div class="card-badge">
				<span>CRAFT & SKILLS</span>
			</div>
			<div class="skills-list">
				<div v-for="skill in skills" :key="skill.name" class="skill-item">
					<div class="skill-info">
						<div class="skill-meta">
							<span class="skill-title">{{ skill.name }}</span>
							<span class="skill-desc">{{ skill.desc }}</span>
						</div>
						<span class="skill-num">{{ skill.level }}%</span>
					</div>
					<div class="skill-track">
						<div class="skill-fill" :style="{ width: `${skill.level}%` }" />
					</div>
				</div>
			</div>
		</section>

		<!-- 音乐生活卡片 (仿 Apple Music 正在播放胶囊) -->
		<section class="apple-card card-music">
			<div class="card-badge">
				<span>SOUND & VIBE</span>
			</div>
			<div class="music-inner">
				<div class="music-head">
					<div class="music-disc">
						<Icon name="ph:vinyl-record-bold" class="disc-icon" />
					</div>
					<div class="music-meta">
						<h3 class="music-title">
							Avicii & 电子音乐
						</h3>
						<p class="music-subtitle">
							律动 · 能量 · 灵感迸发
						</p>
					</div>
				</div>
				<div class="sound-wave">
					<span class="bar bar-1" />
					<span class="bar bar-2" />
					<span class="bar bar-3" />
					<span class="bar bar-4" />
					<span class="bar bar-5" />
					<span class="bar bar-6" />
					<span class="bar bar-7" />
				</div>
			</div>
		</section>

		<!-- 关注焦点卡片 -->
		<section class="apple-card card-focus">
			<div class="card-badge">
				<span>FOCUS & VISION</span>
			</div>
			<div class="focus-grid">
				<div v-for="item in focusAreas" :key="item.title" class="focus-item">
					<div class="focus-icon-box">
						<Icon :name="item.icon" class="focus-icon" />
					</div>
					<div class="focus-text">
						<div class="focus-title">
							{{ item.title }}
						</div>
						<div class="focus-desc">
							{{ item.desc }}
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 爱好卡片 (iOS 控制中心小磁贴样式) -->
		<section class="apple-card card-hobbies">
			<div class="card-badge">
				<span>LIFESTYLE & HOBBIES</span>
			</div>
			<div class="hobbies-grid">
				<div v-for="hobby in hobbies" :key="hobby.name" class="hobby-tile">
					<div class="hobby-icon-wrap">
						<Icon :name="hobby.icon" class="hobby-icon" />
					</div>
					<span class="hobby-label">{{ hobby.name }}</span>
				</div>
			</div>
		</section>

		<!-- 特长标语 -->
		<section class="apple-card card-specialty">
			<div class="card-badge">
				<span>SPECIALTY</span>
			</div>
			<div class="specialty-inner">
				<span class="specialty-text">历史与哲学思辨</span>
				<span class="specialty-level">MAX</span>
			</div>
		</section>

		<!-- 底部联络通道 (Connect) -->
		<section class="apple-card card-contact">
			<div class="contact-left">
				<span class="card-badge inline-badge">GET IN TOUCH</span>
				<h3 class="contact-title">
					欢迎交流与探讨
				</h3>
				<p class="contact-desc">
					无论是技术讨论、项目合作，还是灵感碰撞，期待与你的连接。
				</p>
			</div>
			<div class="contact-buttons">
				<a
					href="https://github.com/stalindev54"
					target="_blank"
					rel="noopener noreferrer"
					class="contact-link"
					title="GitHub: stalindev54"
				>
					<Icon name="ph:github-logo-bold" class="contact-btn-icon" />
					<span>GitHub</span>
				</a>
				<a
					href="mailto:1545433540@qq.com"
					target="_blank"
					rel="noopener noreferrer"
					class="contact-link"
					title="Email"
				>
					<Icon name="ph:envelope-simple-bold" class="contact-btn-icon" />
					<span>Email</span>
				</a>
				<a
					v-if="appConfig.author.homepage"
					:href="appConfig.author.homepage"
					target="_blank"
					rel="noopener noreferrer"
					class="contact-link"
					title="个人主页"
				>
					<Icon name="ph:globe-hemisphere-west-bold" class="contact-btn-icon" />
					<span>主页</span>
				</a>
			</div>
		</section>
	</div>
</div>
</template>

<style lang="scss" scoped>
.about-page {
	max-width: 1040px;
	margin: 0 auto;
	padding: 2.5rem 1.25rem 4rem;
}

/* 顶部 Header */
.hero-header {
	margin-bottom: 2rem;

	.hero-tag {
		display: inline-block;
		margin-bottom: 0.5rem;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--c-primary);
	}

	.hero-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
	}

	.hero-title {
		margin: 0 0 0.4rem;
		font-size: 2.6rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1.15;
		color: var(--c-text);
	}

	.hero-subtitle {
		margin: 0;
		font-size: 1.1rem;
		letter-spacing: -0.01em;
		color: var(--c-text-2);
	}

	.avatar-wrapper {
		flex-shrink: 0;
		position: relative;
		width: 88px;
		height: 88px;
		padding: 3px;
		border-radius: 50%;
		box-shadow: 0 10px 24px -6px var(--ld-shadow);
		background: linear-gradient(135deg, var(--c-primary), var(--c-primary-soft), transparent);

		.avatar-image {
			display: block;
			width: 100%;
			height: 100%;
			border-radius: 50%;
			background-color: var(--c-bg-2);
			object-fit: cover;
		}
	}
}

/* Bento 网格布局 */
.bento-grid {
	display: grid;
	grid-template-columns: repeat(12, 1fr);
	gap: 1.25rem;
}

/* 苹果风格卡片通用样式 */
.apple-card {
	position: relative;
	overflow: hidden;
	padding: 1.75rem;
	border: 1px solid var(--c-border);
	border-radius: 1.5rem;
	box-shadow: 0 4px 20px -2px var(--ld-shadow);
	background-color: var(--ld-bg-card);
	transition:
		transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
		box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
		border-color 0.3s ease;

	&:hover {
		border-color: var(--c-primary-soft);
		box-shadow: 0 12px 30px -4px var(--ld-shadow);
		transform: translateY(-3px);
	}

	.card-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		margin-bottom: 1rem;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--c-text-3);

		.badge-icon {
			font-size: 0.85rem;
			color: var(--c-primary);
		}

		&.inline-badge {
			margin-bottom: 0.5rem;
		}
	}
}

/* 渐变文字效果 */
.gradient-text {
	background: linear-gradient(120deg, var(--c-text), var(--c-primary));
	background-clip: text;
	-webkit-text-fill-color: transparent;
	font-weight: 800;
}

/* 1. Intro 主卡片 */
.card-intro {
	display: flex;
	flex-direction: column;
	grid-column: span 8;
	justify-content: space-between;
	min-height: 230px;

	.intro-headline {
		margin: 0 0 0.75rem;
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.25;
		color: var(--c-text);
	}

	.intro-desc {
		max-width: 90%;
		margin: 0;
		font-size: 1rem;
		line-height: 1.6;
		color: var(--c-text-2);
	}

	.intro-footer {
		margin-top: 1.5rem;
	}

	.status-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.85rem;
		border-radius: 999px;
		background-color: var(--c-bg-2);
		font-size: 0.82rem;
		color: var(--c-text-2);
	}

	.status-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		box-shadow: 0 0 8px rgb(16 185 129 / 60%);
		background-color: #10B981;
		animation: pulse-dot 2s infinite ease-in-out;
	}
}

@keyframes pulse-dot {
	0%, 100% { opacity: 1;
		transform: scale(1); }

	50% { opacity: 0.4;
		transform: scale(0.85); }
}

/* 2. Specs 参数卡片 (4 列) */
.card-specs {
	display: flex;
	flex-direction: column;
	grid-column: span 4;
	justify-content: space-between;

	.specs-content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1.2rem;
		height: 100%;
	}

	.spec-block {
		display: flex;
		flex-direction: column;
	}

	.spec-label {
		margin-bottom: 0.2rem;
		font-size: 0.82rem;
		color: var(--c-text-3);
	}

	.spec-number {
		font-size: 2.3rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1;
		color: var(--c-text);
	}

	.spec-unit {
		margin-left: 0.15rem;
		font-size: 1.1rem;
		font-weight: 500;
		color: var(--c-text-2);
	}

	.spec-divider {
		opacity: 0.8;
		height: 1px;
		background: var(--c-border);
	}
}

/* 3. Motto 卡片 (5 列) */
.card-motto {
	display: flex;
	flex-direction: column;
	grid-column: span 5;
	justify-content: space-between;

	.motto-wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 100%;
		padding: 0.5rem 0;
	}

	.motto-quote {
		margin: 0;
		font-size: 1.55rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.4;
		color: var(--c-text);
	}

	.motto-author {
		margin: 0.8rem 0 0;
		font-size: 0.88rem;
		color: var(--c-text-3);
	}
}

/* 4. MBTI 卡片 (7 列) */
.card-mbti {
	display: flex;
	flex-direction: column;
	grid-column: span 7;
	justify-content: space-between;

	.mbti-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.mbti-type {
		margin-bottom: 0.2rem;
		font-size: 2.4rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		line-height: 1;
		color: var(--c-primary);
	}

	.mbti-role {
		margin-bottom: 0.5rem;
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--c-text);
	}

	.mbti-desc {
		max-width: 85%;
		margin: 0 0 1.25rem;
		font-size: 0.92rem;
		line-height: 1.55;
		color: var(--c-text-2);
	}

	.apple-pill-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.45rem 1rem;
		border-radius: 999px;
		background-color: var(--c-bg-2);
		font-size: 0.85rem;
		font-weight: 600;
		text-decoration: none;
		color: var(--c-text);
		transition: all 0.2s ease;

		&:hover {
			background-color: var(--c-primary);
			color: #FFF;
			transform: scale(1.02);
		}
	}
}

/* 5. 技能专长卡片 (7 列) */
.card-skills {
	grid-column: span 7;

	.skills-list {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}

	.skill-info {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		margin-bottom: 0.45rem;
	}

	.skill-meta {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}

	.skill-title {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--c-text);
	}

	.skill-desc {
		font-size: 0.78rem;
		color: var(--c-text-3);
	}

	.skill-num {
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--c-primary);
	}

	.skill-track {
		overflow: hidden;
		width: 100%;
		height: 6px;
		border-radius: 999px;
		background-color: var(--c-bg-2);
	}

	.skill-fill {
		height: 100%;
		border-radius: 999px;
		background: linear-gradient(90deg, var(--c-primary), hsl(var(--hue-theme) 100% 65%));
		transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
	}
}

/* 6. 音乐与律动 (5 列) */
.card-music {
	display: flex;
	flex-direction: column;
	grid-column: span 5;
	justify-content: space-between;

	.music-inner {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
	}

	.music-head {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.music-disc {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 52px;
		height: 52px;
		border-radius: 50%;
		background-color: var(--c-bg-2);
		font-size: 1.8rem;
		color: var(--c-primary);
		animation: spin 10s linear infinite;
	}

	.music-title {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--c-text);
	}

	.music-subtitle {
		margin: 0.25rem 0 0;
		font-size: 0.82rem;
		color: var(--c-text-3);
	}

	.sound-wave {
		display: flex;
		align-items: flex-end;
		gap: 5px;
		height: 38px;
		padding-top: 1.5rem;

		.bar {
			flex: 1;
			opacity: 0.85;
			border-radius: 999px;
			background-color: var(--c-primary);
			animation: audio-pulse 1.2s ease-in-out infinite alternate;

			&.bar-1 { height: 35%;
				animation-delay: 0.1s; }

			&.bar-2 { height: 75%;
				animation-delay: 0.3s; }

			&.bar-3 { height: 100%;
				animation-delay: 0.15s; }

			&.bar-4 { height: 50%;
				animation-delay: 0.4s; }

			&.bar-5 { height: 85%;
				animation-delay: 0.2s; }

			&.bar-6 { height: 40%;
				animation-delay: 0.35s; }

			&.bar-7 { height: 60%;
				animation-delay: 0.05s; }
		}
	}
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

@keyframes audio-pulse {
	0% { transform: scaleY(0.25); }
	100% { transform: scaleY(1); }
}

/* 7. 关注与视野 (6 列) */
.card-focus {
	grid-column: span 6;

	.focus-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.focus-item {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 0.6rem 0.8rem;
		border-radius: 1rem;
		background-color: var(--c-bg-1);
		transition: background-color 0.2s ease;

		&:hover {
			background-color: var(--c-bg-2);
		}
	}

	.focus-icon-box {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		border-radius: 0.75rem;
		background-color: var(--c-bg-2);
		font-size: 1.25rem;
		color: var(--c-primary);
	}

	.focus-title {
		margin-bottom: 0.15rem;
		font-size: 0.92rem;
		font-weight: 600;
		color: var(--c-text);
	}

	.focus-desc {
		font-size: 0.78rem;
		color: var(--c-text-3);
	}
}

/* 8. 爱好与生活 (6 列) */
.card-hobbies {
	grid-column: span 6;

	.hobbies-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
	}

	.hobby-tile {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0.85rem 0.5rem;
		border-radius: 1rem;
		background-color: var(--c-bg-1);
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

		&:hover {
			background-color: var(--c-bg-2);
			transform: scale(1.03);

			.hobby-icon {
				color: var(--c-primary);
			}
		}
	}

	.hobby-icon-wrap {
		margin-bottom: 0.35rem;
		font-size: 1.5rem;
		color: var(--c-text-2);
		transition: color 0.2s ease;
	}

	.hobby-label {
		font-size: 0.82rem;
		font-weight: 500;
		color: var(--c-text-2);
	}
}

/* 9. 特长标语 (4 列) */
.card-specialty {
	display: flex;
	grid-column: span 12;
	align-items: center;
	justify-content: space-between;
	padding: 1.25rem 1.75rem;

	.specialty-inner {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.specialty-text {
		font-size: 1.2rem;
		font-weight: 600;
		color: var(--c-text);
	}

	.specialty-level {
		display: inline-block;
		padding: 0.2rem 0.6rem;
		border-radius: 6px;
		background-color: var(--c-primary);
		font-size: 0.8rem;
		font-weight: 800;
		letter-spacing: 0.05em;
		color: #FFF;
	}
}

/* 10. 底部联络 (12 列通栏) */
.card-contact {
	display: flex;
	flex-wrap: wrap;
	grid-column: span 12;
	align-items: center;
	justify-content: space-between;
	gap: 1.5rem;
	background: linear-gradient(135deg, var(--ld-bg-card), var(--c-bg-2));

	.contact-title {
		margin: 0 0 0.35rem;
		font-size: 1.35rem;
		font-weight: 700;
		color: var(--c-text);
	}

	.contact-desc {
		margin: 0;
		font-size: 0.92rem;
		color: var(--c-text-2);
	}

	.contact-buttons {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
	}

	.contact-link {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.65rem 1.25rem;
		border: 1px solid var(--c-border);
		border-radius: 999px;
		box-shadow: 0 2px 6px var(--ld-shadow);
		background-color: var(--c-bg);
		font-size: 0.9rem;
		font-weight: 600;
		text-decoration: none;
		color: var(--c-text);
		transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

		.contact-btn-icon {
			font-size: 1.15rem;
		}

		&:hover {
			border-color: var(--c-primary);
			box-shadow: 0 6px 16px -2px var(--ld-shadow);
			background-color: var(--c-primary);
			color: #FFF;
			transform: translateY(-2px);
		}
	}
}

/* 响应式断点适配 */
@media (max-width: 960px) {
	.card-intro { grid-column: span 12; }
	.card-specs { grid-column: span 12; }
	.card-motto { grid-column: span 12; }
	.card-mbti { grid-column: span 12; }
	.card-skills { grid-column: span 12; }
	.card-music { grid-column: span 12; }
	.card-focus { grid-column: span 12; }
	.card-hobbies { grid-column: span 12; }
	.card-specialty { grid-column: span 12; }
	.card-contact { grid-column: span 12; }
}

@media (max-width: 640px) {
	.about-page {
		padding: 1.5rem 1rem 3rem;
	}

	.hero-main {
		flex-direction: column-reverse;
		align-items: flex-start;
	}

	.hero-title {
		font-size: 2.1rem;
	}

	.avatar-wrapper {
		width: 72px;
		height: 72px;
	}

	.apple-card {
		padding: 1.25rem;
		border-radius: 1.25rem;
	}

	.card-intro .intro-headline {
		font-size: 1.6rem;
	}

	.contact-buttons {
		width: 100%;

		.contact-link {
			flex: 1;
			justify-content: center;
		}
	}
}
</style>

