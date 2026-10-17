---
title: 工小湖：雨课堂神器的深度解构与原生重构
description: 拆解雨课堂扫码长轮询、免扫码进班推导、随堂测试时序容灾与课件流重构，记录我在「工小湖」中将雨课堂原生化的技术细节与踩坑实录。
date: 2026-10-17 18:30:00
updated: 2026-10-17 18:30:00
image: https://img.jiclub.site/file/1792241072122_cover.jpg
categories: [经验分享]
recommend: 1
tags: [工小湖, 雨课堂, 逆向工程, 架构设计, 微信小程序, Python, 协议分析, 性能优化]
---

# 工小湖怎么来的

> [解决真问题，不做自我感动的玩具。把割裂、低效的校园交互，收敛进一个干净好用的原生小程序里。]{.text-story}

::alert{type="tip" title="为什么不直接嵌个 Webview？"}
在小程序里内嵌官方 `<web-view>` 网页最省事，但我从一开始就否决了。

官方移动端打包了极度沉重的前端运行时，校园弱网下经常白屏几十秒；大屏动态码对焦慢、测试超时直接锁定、PPT 翻页无法自由回看，痛点极多。

与其忍受臃肿的页面，不如**逆向抓包梳理核心协议，抛弃所有冗余开销，用微信小程序原生组件手搓一套轻量、秒开的客户端。**
::

::pic
---
src: https://img.jiclub.site/file/1792241071949_01_status_motto.png
caption: 工小湖顶栏：开课状态实时感知与一言卡片
---
::

---

## 一、免扫码秒进课堂

雨课堂每次上课，全班举着手机对大屏幕动态码反复对焦极其低效。

::pic
---
src: https://img.jiclub.site/file/1792241070901_02_home_live_class.png
caption: 首页开课识别：顶栏胶囊提示「已免扫码进入」，卡片一键直达课堂
---
::

### 1. 动态二维码的本质
抓包分析官方投屏端，大屏幕动态码并不是物理防伪，本质只是一个附带短效时间戳签名的引导 URL：

```
https://changjiang.ykt.io/v2/web/join_lesson?lesson_id=123456&sign=ab8f...&ts=1729158000
```

它是给**非在册旁听生**临时验票入班的。

### 2. 在册学生的状态穿透
在读学生的学号早就在班级花名册中。老师点击开课，服务端的课次状态即流转为活动态：

$$\text{LessonState}: \{\text{lesson\_id}, \text{course\_id}, \text{status}: 1 (\text{ONGOING})\}$$

在册学生无需扫码：
1. 小程序冷启动或切前台时，调用 `get_user_course_list` 获取在读课程树；
2. 过滤当前处于 `status == 1` 的活动课堂；
3. 直接使用本地有效的 `session_key` 换取上下文凭证入班。

在工小湖首页，顶栏灵动岛实时感知开课事件，点击即可一秒进班。

---

## 二、扫码鉴权：30秒阻塞长轮询

绑定雨课堂账号时，微信扫码是跨端同步身份的合法途径。

普通定时短轮询（`setInterval`）不仅频繁空转耗费服务器资源，且用户点击确认后有 1~2 秒明显的等待顿挫感。

我将后端的认证中继改成了与官方认证端对齐的长轮询机制：前端发起监听，服务端保持最高 30 秒长连接挂起。用户在手机按下确认的瞬间，服务端立即响应并返回凭证：

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
            # 网络中断或超时安全处理
            return None
```

扫码成功和页面跳转之间几乎零时差。

---

## 三、考勤与随堂测试：时序容灾与补答机制

::pic
---
src: https://img.jiclub.site/file/1792241069155_04_advanced_sign_settings.png
caption: 高级设置面板：教务静默续签、雨课堂设定（自动签到与超时补答）
---
::

### 1. 自动签到
开启自动签到后，灵动岛一旦捕获开课广播，小程序自动调用接口提交打卡凭据，并在顶栏轻量 Toast 提醒，告别遗忘。

### 2. 随堂测试的时序容差与补答
官方网页端倒计时归零时，前端 JS 会弹出遮罩锁定输入框，导致很多主观题刚写完草稿来不及上传的同学直接交白卷。

但底层网络协议表明：
* **服务端时间窗口宽容度**：考虑基站延迟与客户端时钟漂移，服务器并不会在归零瞬间物理切断收题通道，存在缓冲时间窗口；
* **伴随答题接口的幂等性**：只要老师未点击“生成成绩分析”或结束课堂，题目存储集依然接收补正提交。

工小湖重构了答题状态机：
1. **草稿本地持久化**：主客观题实时暂存本地 Storage，断网或误退出不丢数据；
2. **多图直传流**：主观题支持最高 9 张解题草稿拍照并直传云端；
3. **超时容灾提交**：检测到前端倒计时超时，依然允许点击“可补交”触发补答通道完成提交。

::pic
---
src: https://img.jiclub.site/file/1792241066942_03_quiz_timeout_makeup.png
caption: 随堂主观简答题作答：突破超时限制支持「可补交」，支持上传9张解题草稿
---
::

---

## 四、课件流原生化：拒绝被动跟翻

老师讲课翻页快，官方网页版虽然能看课件，但翻页卡顿、缩放困难，200 多页课件极易导致手机浏览器卡死。

::pic
---
src: https://img.jiclub.site/file/1792241072350_05_slides_bgp_preview.png
caption: 课件高清图流：147/230 页自由拖动预览与双指无级缩放
---
::

我用**纯数据管道模式**重构了课件浏览：
1. **结构清洗**：服务端将课件树精简为仅包含 `slideId`、`coverUrl`、`originalUrl` 的轻量元数据；
2. **虚拟列表按需加载**：小程序原生 `scroll-view` 仅挂载可视区前后各一页的图片节点，内存开销严格受控；
3. **WebP 编码转换**：课件大图统一走 WebP 压缩，流量占用比官方网页下降 **60% 以上**；
4. **手势操作**：原生支持双指无级缩放与拖拽，帧率稳定在 60 FPS。

---

## 五、全题型原生兼容：习题预判与单选弹窗

题目与课件被解构为平行的两个选项卡：
* **习题提前预判**：随堂布置的客观测验题会被提前捕获在“习题”列表中，便于课前预习；
* **原生轻量弹窗作答**：题目发布后，以原生 ActionSheet 弹窗快速作答，点选即交，不遮挡正在浏览的课件。

<div style="width: 100%; max-width: 100%; min-width: 0; overflow-x: auto; -webkit-overflow-scrolling: touch; box-sizing: border-box; margin: 1.2rem 0;">
  <div style="display: flex; gap: 14px; width: max-content; padding: 4px 4px 14px;">
    <figure style="flex: 0 0 240px; width: 240px; margin: 0; text-align: center;">
      <img src="https://img.jiclub.site/file/1792241074493_06_quiz_list_python.png" alt="随堂习题列表" style="width: 240px; height: auto; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);" />
      <figcaption style="margin-top: 6px; font-size: 0.8em; color: var(--c-text-2, #888);">随堂习题列表：提前捕获待发布客观题</figcaption>
    </figure>
    <figure style="flex: 0 0 240px; width: 240px; margin: 0; text-align: center;">
      <img src="https://img.jiclub.site/file/1792241077211_07_quiz_single_choice.png" alt="单选题弹窗作答" style="width: 240px; height: auto; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);" />
      <figcaption style="margin-top: 6px; font-size: 0.8em; color: var(--c-text-2, #888);">单选题原生弹窗作答：点选选项即时提交</figcaption>
    </figure>
  </div>
</div>

---

## 六、安全底线：本地沙盒机制

校园工具的生命线是安全：

```
[ 客户端微信小程序 (本地加密存储) ]
                │
                ▼
[ 工小湖轻量网关 (纯内存流水中继) ]
                │
                ▼
[ 雨课堂 / 教务云端 ]
```

* **端侧独立加密**：教务凭据采用 AES-ECB + PKCS7 在本地 Storage 加密，服务端不存明文；
* **无状态中继**：网关只做流式转发，**不在任何数据库或持久化存储中留存学生凭证**；
* **数据脱敏**：自习室与课堂名单公开展示字段统一打码脱敏（如 `张** · 信息与计算科学`）。

---

## 七、微信扫一扫与体验方式

科技的意义是让生活更纯粹，而不是把时间浪费在繁琐的反复操作上。

你可以通过以下两种方式直接体验「工小湖」：

1. **微信扫一扫**：使用微信扫描下方小程序码直接打开；
2. **微信搜一搜**：在微信搜索栏输入 **「工小湖」** 即可秒开使用。

::pic
---
src: https://img.jiclub.site/file/1792241080029_08_qrcode_search.jpg
caption: 微信扫一扫或搜一搜「工小湖」即可直接体验
---
::

告别抢动态码和手忙脚乱的随堂点名，从容高效地面对每一堂大学早八。
