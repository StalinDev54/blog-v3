---
title: 工小湖：给雨课堂和学校教务做了个小程序
description: 梳理雨课堂核心接口，搞定免扫码秒进班、超时补交测验、课件流畅拖拽预览与教务联动，聊聊「工小湖」多端校园助手的设计与技术实现。
date: 2026-10-17 18:30:00
updated: 2026-10-18 18:00:00
image: https://img.jiclub.site/file/1792241072122_cover.jpg
categories: [经验分享]
recommend: 1
tags: [工小湖, 雨课堂, 逆向工程, 架构设计, 微信小程序, Android, 校园助手, Python, 协议分析, 性能优化]
---

平时在大学阶梯教室上课，相信不少同学都被雨课堂折磨过：
* **坐后排扫码根本扫不上**：大教室离黑板大屏几十米远，动态码闪得飞快，举着手机拉长焦对半天进不去班；
* **倒计时一到答案全清空**：主观计算题好不容易算完，倒计时一到网页直接弹锁死遮罩，未提交的草稿瞬间化为乌有；
* **一发题就遮住课件**：老师随堂推题，全屏弹窗挡得严严实实，想看着 PPT 题目板书推导公式根本看不到；
* **切后台直接离线断联**：中途切出去回个微信或查资料，后台立刻掉线，切回来白屏卡死重载……

受够了这些痛点，我决定彻底抓包摸清协议，把核心业务逻辑抽离出来，打造了 **「工小湖 (GongXiaoHu)」** —— **集成雨课堂联动、课表、成绩与专注，把校园生活化繁为简**。

::link-card
---
title: GitHub - StalinDev54/gongxiaohu
description: 集成雨课堂联动、课表、成绩与专注，把校园生活化繁为简
link: https://github.com/StalinDev54/gongxiaohu
icon: https://github.githubassets.com/favicons/favicon.svg
---
::

::pic
---
src: https://img.jiclub.site/file/1792241071949_01_status_motto.png
caption: 工小湖顶栏：实时感知开课状态与快捷导航
---
::

---

## 1. 免扫码秒进班

每节课都要举着手机扫大屏幕动态码，在很多场景下完全是多此一举。

::pic
---
src: https://img.jiclub.site/file/1792241070901_02_home_live_class.png
caption: 首页开课识别：检测到开课自动提示，一键直达课堂
---
::

抓包分析投屏端的二维码，本质上是一个附带短期时间戳签名的临时进班链接：

```
https://changjiang.ykt.io/v2/web/join_lesson?lesson_id=123456&sign=ab8f...&ts=1729158000
```

这种扫码机制本质上是给**旁听生**使用的。

对于已经在选课系统里的正规在读学生，学号本身就在班级学生名单库中。任课老师只要在讲台端点击“开始上课”，服务端对应的课堂记录状态就会立即变更为进行中（`status: 1`）。

因此，自动化免扫码入班的逻辑非常清晰：
1. 客户端冷启动或从后台唤醒时，主动请求 `get_user_course_list` 获取当前课程表；
2. 过滤出状态为正在上课（`status == 1`）的进行中课堂；
3. 直接使用本地持久化的 `session_key` 换取课堂凭据一键入班。

上课只需点亮屏幕打开工小湖，顶栏就会即时提示已进入课堂，彻底告别后排举手机四处找对焦角度的尴尬。

---

## 2. 账号绑定：30 秒阻塞长轮询

首次将雨课堂账号绑定至工小湖时，需要进行一次微信扫码授权鉴权。

如果采用传统前端 `setInterval` 每秒发送一次轮询探测，不仅会产生大量无效的 HTTP 请求，而且当用户在手机端点击“确认登录”后，通常还要等 1~2 秒才会被下一次轮询捕获，体验有明显的顿挫感。

在后端中继层，我们设计了与官方一致的 **30 秒阻塞长轮询（Long Polling）** 机制：前端发起单次挂起请求，服务端异步保持连接最多 30 秒。手机点击“确认登录”的瞬间，服务端立刻响应凭证，页面实现零延迟毫秒级跳转。

```python
import httpx
from typing import Optional, Dict, Any

class RainClassroomAuthService:
    """雨课堂扫码登录长轮询服务"""

    def __init__(self, base_url: str = "https://changjiang.ykt.io") -> None:
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=35.0)

    async def poll_auth_status(self, ticket: str) -> Optional[Dict[str, Any]]:
        """
        保持30秒阻塞长连接，监听微信扫码授权状态
        :param ticket: 二维码生成时获得的票据
        :return: 授权成功的凭据字典，超时或失败返回 None
        """
        url = f"{self.base_url}/custom/auth/v1/auth/status"
        params = {"ticket": ticket, "format": "json"}

        try:
            # NOTE: 保持长连接挂起，扫码确认瞬间立即触发返回，实现0延迟跳转
            resp = await self.client.get(url, params=params)
            resp.raise_for_status()
            res_data = resp.json()

            if res_data.get("data", {}).get("status") == "success":
                return {
                    "userId": res_data["data"]["user_id"],
                    "sessionKey": res_data["data"]["session_key"],
                }
            return None
        except httpx.RequestError:
            return None
```

---

## 3. 高级设置：超时补答与草稿防丢

::pic
---
src: https://img.jiclub.site/file/1792241069155_04_advanced_sign_settings.png
caption: 设置面板：支持自动签到与超时补答开关
---
::

官方客户端最让人焦虑的问题之一就是答题遮罩：倒计时一旦归零，前端 JS 脚本会瞬间弹出一个不可关闭的全屏遮罩锁死所有表单。不少同学刚刚在草稿纸上演算完核心推导，输入法还未来得及收起就直接被判定为未交卷。

深入抓包协议后我们发现：
* **服务端并没有在倒计时到达的瞬间掐死接口**。出于应对移动网络延迟与客户端本地时钟漂移的考量，服务端预留了较宽裕的容错缓冲期；
* 只要任课老师尚未点击“结束作答”或“生成课堂成绩分析”，提交答案的 API 接口实际上始终可接收数据，且多次提交天然支持幂等覆盖。

针对这一特性，工小湖重新构筑了随堂作答体系：
1. **本地实时存储草稿**：输入的每一个字符均实时持久化暂存到本地 Storage，即便误切应用或遭遇断网，重新打开草稿依旧完整保留；
2. **多图直传**：主观题支持直接拍照选取最多 9 张草稿演练图并发上传；
3. **超时安全补交**：倒计时结束后界面虽明确标识“可补交”，但提交按钮依然激活，仍然能将你的答案正常送达后台完成计分。

::pic
---
src: https://img.jiclub.site/file/1792241066942_03_quiz_timeout_makeup.png
caption: 主观题作答：倒计时超时后仍支持补交，支持 9 张解题草稿图
---
::

此外，系统还提供了**自动签到打卡**功能：一旦监听到开课广播与签到事件，自动调用接口完成打卡并弹出轻量 Toast 提醒，彻底杜绝打盹或迟到时漏签的问题。

---

## 4. 课件预览：虚拟列表 + WebP 压缩

高校不少理工类课程的课件动辄长达两三百页。官方网页版在翻阅长幻灯片时极易出现卡顿、缩放失灵，稍加快速滑动便可能导致页面崩溃重载。

::pic
---
src: https://img.jiclub.site/file/1792241072350_05_slides_bgp_preview.png
caption: 课件流：支持百页课件拖拽预览与手势无级缩放
---
::

为了让课件浏览体验媲美原生相册，我们在多个层面进行了深度优化：
* **结构清洗精简**：剥离原接口返回的冗余嵌套字段，只保留关键的页码与高清图片资源地址；
* **虚拟列表渲染（Virtual List）**：避免一次性将数百张大图全量挂载在 DOM 树中，仅在可视区域及前后缓冲区渲染可见页，使得内存开销平稳受控；
* **WebP 高效转码**：中继链路统一将图片转为高压缩率的 WebP 格式，在保证高清晰度的同时降低了 60% 以上的网络传输流量；
* **原生手势适配**：完整支持双指捏合无级缩放与自如拖动，不再出现网页端手势冲突卡死的现象。

---

## 5. 课件与随堂测验分层解耦

在官方客户端中，课件内容与测验弹题经常混杂在同一界面上，一旦老师推送测试，课件内容就会被完全遮蔽。

工小湖将这两套核心功能拆分为相互独立的双 Tab 结构：
* **习题提前透视预览**：抓包证实随堂题目通常在课前或开课时已打包下发，工小湖提前解析并将其收录在“习题”栏中，便于课前快速预习；
* **轻量弹窗即点即交**：老师正式发布题目时，仅以半屏底部 Sheet 形式轻量滑出，选定答案即可毫秒级提交，完全不影响正在对照阅读的课件板书。

<div style="width: 100%; max-width: 100%; min-width: 0; overflow-x: auto; -webkit-overflow-scrolling: touch; box-sizing: border-box; margin: 1.2rem 0;">
  <div style="display: flex; gap: 14px; width: max-content; padding: 4px 4px 14px;">
    <figure style="flex: 0 0 240px; width: 240px; margin: 0; text-align: center;">
      <img src="https://img.jiclub.site/file/1792241074493_06_quiz_list_python.png" alt="随堂习题列表" style="width: 240px; height: auto; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);" />
      <figcaption style="margin-top: 6px; font-size: 0.8em; color: var(--c-text-2, #888);">随堂习题列表：提前看待发题</figcaption>
    </figure>
    <figure style="flex: 0 0 240px; width: 240px; margin: 0; text-align: center;">
      <img src="https://img.jiclub.site/file/1792241077211_07_quiz_single_choice.png" alt="单选题弹窗作答" style="width: 240px; height: auto; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);" />
      <figcaption style="margin-top: 6px; font-size: 0.8em; color: var(--c-text-2, #888);">原生弹窗作答：点选即交，不遮挡课件</figcaption>
    </figure>
  </div>
</div>

---

## 6. 不止雨课堂：课表、成绩与专注的校园生态

除了重构雨课堂的核心体验外，「工小湖」还进一步整合了大学校园生活高频使用的基础场景：

* **智能课表联动**：对接教务接口一键同步学期日程，与雨课堂上课状态实时联动，到点自动展示教室、课程与开课提醒；
* **成绩与绩点追踪**：无需忍受期末教务系统的高峰拥堵，本地缓存历年成绩单与学分绩点（GPA）统计分析；
* **专注与自习打卡**：内置番茄钟与沉浸专注模式，记录每日学习时长，帮助早八人在课后保持高效节奏。

将课堂签到、随堂测验、日程课表与期末成绩汇集于一处，把复杂的校园工具生态化繁为简。

---

## 7. 数据安全与隐私防线

做校园类工具，用户数据与账号隐私是不可逾越的底线原则：

```
[ 客户端微信小程序 / Android (本地 AES 加密存储) ]
                       │
                       ▼
        [ 工小湖轻量网关 (纯内存流式中继) ]
                       │
                       ▼
              [ 雨课堂 / 教务官方云端 ]
```

* **凭证本地加密存储**：用户的学号、Token 及鉴权凭据均使用 AES 算法加密保存在移动设备本地 Storage 中，绝不上报或留存在开发者云端数据库；
* **无状态流式转发**：服务端中继网关仅负责协议代理与转码，不落地、不留存任何个人隐私日志；
* **敏感信息前端脱敏**：在排行榜、自习室及班级名单等界面中，所有涉及个人姓名及学号的公开展示均强制执行掩码打码。

---

## 8. 客户端下载与体验方式

无论你是想免安装即开即用，还是追求极速原生的流畅体验，工小湖都提供了完善的终端覆盖：

| 平台 / 载体 | 版本状态 | 体验与获取方式 |
| :--- | :--- | :--- |
| **Android 原生客户端** | **v2.0.1 稳定版 (15MB)** | [点击前往夸克网盘极速下载](https://pan.quark.cn/s/236c3ee4c001) |
| **微信小程序端** | **在线体验中** | 微信搜一搜 **「工小湖」** 或扫描下方小程序码 |
| **官方网站** | **正式上线** | [访问项目主页 (ykt.jiclub.site)](https://ykt.jiclub.site/) |
| **开源仓库** | **公开维护中** | [GitHub: StalinDev54/gongxiaohu](https://github.com/StalinDev54/gongxiaohu) |
| **iOS 客户端** | **正在规划构建中** | iOS 用户当前建议优先通过微信小程序直接体验 |

::alert{type="info" title="🔒 关于开源进度说明"}
工小湖代码仓库已公开托管于 GitHub：[StalinDev54/gongxiaohu](https://github.com/StalinDev54/gongxiaohu)。目前仓库已开源 Web 官网展示页与多端交互演示工程（基于 React + Vite + Tailwind CSS 构建）。雨课堂底层核心协议库、自动化打卡引擎及客户端核心代码正在进行二次脱敏与整理，后续会陆续逐步开放，欢迎大家前往 Star ⭐ 关注支持！
::

### 1. 微信小程序码扫码即用

使用微信扫描下方小程序码，即可直接打开工小湖小程序体验：

::pic
---
src: https://img.jiclub.site/file/1792241080029_08_qrcode_search.jpg
caption: 微信扫一扫或搜一搜「工小湖」直接体验
---
::

### 2. 实机演示视频

前往哔哩哔哩观看完整实机效果演示 [【工小湖】雨课堂神器，彻底让你的课堂起飞](https://www.bilibili.com/video/BV11WJe6WEhK/)：

::video-embed{type="bilibili" id="BV11WJe6WEhK"}
::

### 3. 加入 QQ 频道与社区交流

欢迎加入工小湖 QQ 频道，与其他同学一起探讨使用心得、反馈功能缺陷或提出新功能建议：

<div style="text-align: center; margin: 1.5rem 0;">
  <img src="https://wework.qpic.cn/wwpic3az/293176_jW9PC57HTTWfUfS_1791909756/0" alt="工小湖 QQ 频道二维码" style="width: 200px; max-width: 80%; border-radius: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); padding: 6px; background: white;" />
  <p style="margin-top: 8px; font-size: 0.85em; opacity: 0.7;">使用手机 QQ 扫描上方二维码加入频道</p>
</div>

### 4. 赞助与支持

工小湖为个人业余兴趣驱动的独立开发项目。如果工小湖确实改善了你的课堂与日常校园体验，欢迎通过自愿赞助支持项目的服务器运营与后续更新维护：

<div style="text-align: center; margin: 1.5rem 0;">
  <img src="https://wework.qpic.cn/wwpic3az/909499_WvdscmByRpCV43Z_1791805126/0" alt="工小湖自愿赞助二维码" style="width: 200px; max-width: 80%; border-radius: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); padding: 6px; background: white;" />
  <p style="margin-top: 8px; font-size: 0.85em; opacity: 0.7;">扫码自愿支持工小湖，感谢每一位朋友的鼓励</p>
</div>
