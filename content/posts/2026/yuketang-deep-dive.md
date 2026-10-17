---
title: 工小湖：给雨课堂与学校教务做了个小程序
description: 梳理雨课堂核心接口，搞定免扫码秒进班、超时补交测验、课件流畅拖拽预览，聊聊在「工小湖」里重构雨课堂体验的技术细节。
date: 2026-10-17 18:30:00
updated: 2026-10-17 18:30:00
image: https://img.jiclub.site/file/1792241072122_cover.jpg
categories: [经验分享]
recommend: 1
tags: [工小湖, 雨课堂, 逆向工程, 架构设计, 微信小程序, Python, 协议分析, 性能优化]
---

清华开发的雨课堂官方小程序有多卡，上过大学早八的应该都深有体会：开课全班举着手机对大屏幕动态码对焦半天、切后台看个微信回来直接白屏重载、测验倒计时差一秒没点上就锁屏交不了卷、两百多页的课件划两下手机就开始发烫……

既然如此，不如彻底抓包摸清协议，把核心逻辑抽出来，用微信小程序原生组件手搓一套轻量、秒开的客户端。


::pic
---
src: https://img.jiclub.site/file/1792241071949_01_status_motto.png
caption: 工小湖顶栏：实时感知开课状态
---
::

---

## 1. 免扫码秒进班

每节课都要扫大屏幕二维码，其实完全是多此一举。

::pic
---
src: https://img.jiclub.site/file/1792241070901_02_home_live_class.png
caption: 首页开课识别：检测到开课自动提示，一键直达课堂
---
::

抓包看了下投屏端的二维码，本质就是个带短期时间戳签名的临时进班链接：

```
https://changjiang.ykt.io/v2/web/join_lesson?lesson_id=123456&sign=ab8f...&ts=1729158000
```

这玩意儿主要是给**旁听生**扫的。

正经在读选了课的学生，学号本来就在班级名单里。老师端一旦点“开始上课”，后台这条课堂记录的状态就变成了进行中（`status: 1`）。

进班逻辑其实就三步：
1. 小程序冷启动或切回前台时，调 `get_user_course_list` 查课表；
2. 过滤出处于 `status == 1` 的正在上课的课堂；
3. 拿本地的 `session_key` 直接换取课堂凭据入班。

上课只要打开小程序，顶栏就会提示已进班，完全不用再抬手举着手机找角度扫大屏。

---

## 2. 账号绑定：30 秒阻塞长轮询

首次把雨课堂绑定到工小湖，需要走一次微信扫码鉴权。

如果用前端写 `setInterval` 每秒去轮询一次接口，不仅发一堆无意义的 HTTP 请求，而且用户在手机点完“确认登录”后，通常要等个 1~2 秒才能跳页面，顿挫感很强。

这里我把后端中继做成了和官方一致的 30 秒阻塞长轮询：前端发一次请求，后端把连接挂起最多 30 秒。用户手机按下确认的瞬间，服务端立刻返回凭证，页面瞬间完成跳转。

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

官方网页端最搞人心态的一点：倒计时一旦归零，前端 JS 立刻弹个不可关闭的遮罩把输入框死死锁住。很多同学主观题刚在草稿纸算完，输入法还没收起就直接判了白卷。

但抓包后发现：
* **服务端并没有在倒计时归零时掐死接口**。考虑到客户端时钟漂移和基站网络延迟，服务端留了较宽松的缓冲期；
* 只要老师没有点“结束课堂”或者“生成成绩分析”，提交答案的接口其实一直能用，且重复提交只会幂等覆盖。

因此在小程序端，我重做了答题交互：
1. **本地实时存草稿**：每敲一个字自动暂存本地 Storage，哪怕误触退出或者网络断开，重新打开草稿还在；
2. **多图直传**：主观题支持直接拍 9 张草稿图直传；
3. **超时补交**：倒计时结束后，界面虽然标为“可补交”，但提交按钮依然可用，依然能把答案送达后台。

::pic
---
src: https://img.jiclub.site/file/1792241066942_03_quiz_timeout_makeup.png
caption: 主观题作答：倒计时超时后仍支持补交，支持 9 张解题草稿图
---
::

顺便做了一个自动签到：只要检测到开课广播，自动调接口完成打卡，弹出一条轻量提示，避免课前打盹漏签。

---

## 4. 课件预览：虚拟列表 + WebP

很多老师动辄放两三百页 PPT，官方网页翻页卡、缩放难，稍微拖两下就闪退。

::pic
---
src: https://img.jiclub.site/file/1792241072350_05_slides_bgp_preview.png
caption: 课件流：支持百页课件拖拽预览与手势无级缩放
---
::

为了让课件看起像本地相册一样丝滑，做了几处处理：
* **清洗无用字段**：课件接口返回的冗长结构全部砍掉，只留关键的页码与图片链接；
* **虚拟列表渲染**：小程序 `scroll-view` 不做几百张图全量加载，只挂载屏幕可见区前后的几页，内存占用非常平稳；
* **WebP 压缩转换**：服务端统一做一层 WebP 格式转码，图片流量相比原版降低了 60% 以上；
* **原生手势**：支持双指无级缩放与拖动，不会卡死网页。

---

## 5. 课件与测验分层

官方网页把课件和测验全搅在一页里，弹题时课件直接看不见。

工小湖把它们拆成了两个独立 Tab：
* **提前预览题目**：抓包发现随堂客观题列表其实是一起推下来的，提前捕获到“习题”栏里，想预习可以提前看；
* **弹窗即点即交**：老师真正发题时，用轻量的底部弹窗弹出，选项一点直接提交，完全不遮挡正在看的课件页面。

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

## 6. 数据安全与隐私

做校园类工具，账号安全是红线：

```
[ 客户端微信小程序 (本地加密存储) ]
                │
                ▼
[ 工小湖轻量网关 (纯内存流式中继) ]
                │
                ▼
[ 雨课堂 / 教务云端 ]
```

* **凭证本地加密**：账号密码或 Token 使用 AES 加密存在手机本地 Storage，绝不上传到服务器数据库；
* **无状态中继**：网关只充当网络请求代理转发，不留存任何学生隐私数据；
* **界面脱敏**：自习室和课堂名单等涉及姓名的公开信息，统一做掩码打码展示。

---

## 7. 体验方式

::pic
---
src: https://img.jiclub.site/file/1792241080029_08_qrcode_search.jpg
caption: 微信扫一扫或搜一搜「工小湖」
如果你也受够了官方网页的卡顿和误超时，可以在微信直接体验：

1. **微信搜一搜**：搜索 **「工小湖」** 即可找到小程序；
2. **扫码进入**：使用微信扫描下方小程序码直接打开；
3. **视频演示**：前往哔哩哔哩观看完整实机效果 [【工小湖】雨课堂神器，彻底让你的课堂起飞](https://www.bilibili.com/video/BV11WJe6WEhK/)。
::video-embed{type="bilibili" id="BV11WJe6WEhK"}
::


---
::
