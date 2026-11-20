---
title: 这才是给大学生最好的礼物：我把「头歌」搬到了手机里
description: 受够了讲台上照本宣科的水课 PPT，大三偶然发现国防科大团队搞的头歌（EduCoder）简直像发现新大陆。为了能随时随地掏出手机敲代码、刷考研 408 实训、甚至在手机上跑 DeepSeek 本地部署，我给「工小湖」做了一次硬核移植。
date: 2026-11-20 16:30:00
updated: 2026-11-20 16:45:00
image: https://wework.qpic.cn/wwpic3az/4644_ylY_p-EDSzuVczB_1795164646/0
categories: [经验分享]
recommend: 1
tags: [工小湖, 头歌, EduCoder, 移动端开发, 独立开发, 实践教学, 考研408, 抽屉式IDE, DeepSeek, 经验分享]
---

# 兄弟们，这才是给大学生最好的礼物：我把「头歌」搬到了手机里

> [“我当时移植的时候挺激动的，可惜大三才发现这么个好平台😭。比起课堂上的水课 PPT，头歌几乎满足了我从小就有的喜欢动手编程的需求，感谢国防科大团队！”]{.text-story}

::alert{type="info" title="写在前面：我们到底为什么需要一个能动手的平台？"}
在工科大学里待到大三，相信大部分同学都跟我有过一样的抓狂时刻：

期末考前几周，黑板投影上永远翻着几套排版凌乱、不知道哪个年代传下来的老 PPT。讲台上照本宣科念概念，台下大家听得昏昏欲睡；好不容易想自己动动手，写写操作系统内存管理、搞搞计组流水线、或者把考研 408 那些硬核算法验证一遍，却发现要么被本地繁琐的环境配置劝退，要么就是得背着几公斤重的傻大黑粗游戏本在自习室到处抢插座。

**工科和代码从来不是靠背 PPT 能学会的。** 从小到大，我最享受的一直是把想法一行行敲成代码、看到终端打印出预期结果的那个瞬间。

直到前阵子，我偶然接触到了由**国防科技大学团队**主导研发的实践教学平台——**头歌（EduCoder）**。

点进去刷了一整晚，我整个人都激动得睡不着：这里不仅有北京大学、清华大学这种顶级名校的国家一流实验课程，还堆了快 **9,000 个**真刀真枪的实训项目！从最底层的 C/C++ 内存指针、Sysy 编译器，到各种算法题，甚至还有手把手带你在 Linux 容器里配置 Ollama、本地部署 **DeepSeek R1** 的硬核实验。

但它唯一的遗憾，就是基本只能在电脑浏览器上用。

那天晚上我就在想：要是我在自习室只有一部手机、或者在床上刚想到一个解题思路时，也能随时点开敲两行代码、一键提交云端跑测试，那该有多爽？

既然官方没有专门的轻量移动端，那就自己动手，把整套实训生态移植进我自己的校园助手——**「工小湖」**。
::

::link-card
---
title: EduCoder 头歌教学研究平台
description: 高质量高校实践教学与开源创新平台，连接高校、名师与学生的动手实验社区
link: https://www.educoder.net/
icon: https://www.educoder.net/favicon.ico
---
::

---

## 1. 搞定第一道坎：在手机上写代码怎么才能不坐牢？

做移动端开发的朋友肯定都懂，把代码编辑器塞进手机屏幕，往往就是灾难的开始。

电脑上有 27 寸大屏、机械键盘、快捷键，但手机屏幕就那么巴掌大。如果只是简单粗暴地把一个 Monaco 或 CodeMirror 编辑器嵌进网页，只要手指一点输入框，输入法键盘一弹出来，直接把大半个屏幕挡得严严实实：
* 上面的实验手册和题目要求被顶没了；
* 想打个 `{}`、`[]`、`->` 或者缩进 Tab，在手机自带键盘里找特殊符号找得头晕；
* 稍微滑动一下，手滑按到刷新或者后退，刚敲的半天草稿瞬间清空。

为了不在手机上“坐牢”，我在工小湖里设计了一套**抽屉式移动代码终端（Mobile Code Drawer）**：

::pic
---
src: https://wework.qpic.cn/wwpic3az/276414_gmHYxztTSwyxCQG_1795163405/0
caption: 图 1：手机端实训交互，上面安心读指导手册，下面上滑拉出代码抽屉，符号栏与评测一应俱全
---
::

这个设计主要为了解决三个直觉体验：
1. **上推即写，下拉即读**：主屏幕默认把完整的实验指导书清清爽爽地展示出来，公式、原理图随便划；需要改代码时，从底部往上一推展开抽屉，改完往下一滑继续对照手册，绝不打架；
2. **移动端专属符号栏**：在虚拟键盘上方常驻一行辅助快捷键，把缩进 `Tab`、括号、分号、方向键和一键还原放得顺手；
3. **右下角评测大按钮**：不管抽屉是收起还是展开，右下角的【提交评测】始终吸顶常驻，写完顺手一点直接发往云端沙箱跑判题。

在前端核心组件里，我用 React + TypeScript 把抽屉的状态、防止网络慢时重复连续点击的拦截逻辑封装得明明白白：

```tsx
import { useState, useCallback, useRef } from 'react';

export interface CodeEditorState {
  code: string;
  filename: string;
  isDrawerOpen: boolean;
  isEvaluating: boolean;
  evaluationResult: string | null;
}

/**
 * 移动端代码抽屉交互与评测逻辑 Hook
 * @param initialCode 题目初始提供的模板代码
 * @param filename 当前编辑的文件名（比如 train.py 或 main.cpp）
 * @param onCommitJudge 提交云端评测的回调函数
 */
export function useMobileCodeDrawer(
  initialCode: string,
  filename: string,
  onCommitJudge: (code: string) => Promise<string>
) {
  const [code, setCode] = useState<string>(initialCode);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<string | null>(null);

  // NOTE: 用 Ref 记录提交状态，防止手机触屏误触或网络卡顿时连续多次发起沙箱构建
  const isSubmittingRef = useRef<boolean>(false);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const handleResetCode = useCallback(() => {
    // NOTE: 恢复初始题目模板，防止手滑改崩了没法还原
    setCode(initialCode);
  }, [initialCode]);

  const handleSubmitEvaluation = useCallback(async () => {
    if (isSubmittingRef.current || isEvaluating) {
      return;
    }

    try {
      isSubmittingRef.current = true;
      setIsEvaluating(true);
      setEvaluationResult(null);

      // NOTE: 唤起中继接口提交代码，等待云端判题集群吐出输出结果
      const result = await onCommitJudge(code);
      setEvaluationResult(result);
    } catch (err: unknown) {
      // FIXME: 后续针对校园网断流增加更智能的离线自动暂存逻辑
      setEvaluationResult(`评测提交失败，请检查手机网络后重试: ${String(err)}`);
    } finally {
      setIsEvaluating(false);
      isSubmittingRef.current = false;
    }
  }, [code, isEvaluating, onCommitJudge]);

  return {
    code,
    setCode,
    filename,
    isDrawerOpen,
    isEvaluating,
    evaluationResult,
    toggleDrawer,
    handleResetCode,
    handleSubmitEvaluation,
  };
}
```

---

## 2. 摸清头歌评测底细：草稿同步与沙箱中继

界面做好了，那代码敲完怎么让头歌的判题机（Judger）去跑？

抓了几天包之后，我理顺了头歌实训系统的整个执行链路：

```
1. 拉取关卡题目信息:
   GET /api/v1/shixuns/{shixun_id}/stages/{stage_id}
   
2. 把修改好的文件暂存为云端草稿:
   PUT /api/v1/shixuns/{shixun_id}/files/draft
   
3. 触发该关卡的评测任务:
   POST /api/v1/shixuns/{shixun_id}/stages/{stage_id}/evaluate
   
4. 后台沙箱调度容器执行，轮询获取测试用例日志与打分:
   GET /api/v1/jobs/{job_id}/result
```

头歌后台会给每次评测拉起一个轻量化的 Linux 隔离容器，把用户提交的文件挂载进去，执行预先配好的判题脚本，最后把标准输出（stdout）、报错（stderr）和得分吐回来。

因为官方接口自带会话 Cookie、防伪签名，直接用手机端发网络请求容易遇到跨域与鉴权失效。因此我用 Python 写了个轻量 FastAPI 中继层，替前端保管会话 Token，并负责等待沙箱跑完打分：

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import httpx
import logging

logger = logging.getLogger("gongxiaohu.educoder")

router = APIRouter(prefix="/api/educoder", tags=["EduCoder"])

EDUCODER_BASE_API = "https://www.educoder.net"

class EvaluateRequest(BaseModel):
    shixun_id: str = Field(..., description="头歌实训项目 ID")
    stage_id: str = Field(..., description="关卡 ID")
    file_path: str = Field(..., description="代码文件相对路径")
    code_content: str = Field(..., description="用户修改后的完整代码")

class EvaluateResponse(BaseModel):
    success: bool
    status: str
    output: str
    score: int = 0

class EduCoderJudgeService:
    """负责将用户代码安全投递至头歌沙箱集群并拿回结果"""

    def __init__(self, auth_token: str) -> None:
        self.headers = {
            "Authorization": f"Bearer {auth_token}",
            "User-Agent": "GongXiaoHu-Mobile-Agent/2.0",
            "Content-Type": "application/json",
        }
        self.client = httpx.AsyncClient(timeout=40.0)

    async def execute_code_evaluation(self, req: EvaluateRequest) -> EvaluateResponse:
        """
        先存草稿，再发评测，最后拉取沙箱返回结果
        """
        try:
            # 1. 保存当前代码草稿到云端，确保判题容器拉到的是最新修改
            save_url = f"{EDUCODER_BASE_API}/api/v1/shixuns/{req.shixun_id}/files/draft"
            save_payload = {"path": req.file_path, "content": req.code_content}
            save_resp = await self.client.put(save_url, json=save_payload, headers=self.headers)
            save_resp.raise_for_status()

            # 2. 触发云端评测调度任务
            judge_url = f"{EDUCODER_BASE_API}/api/v1/shixuns/{req.shixun_id}/stages/{req.stage_id}/evaluate"
            judge_resp = await self.client.post(judge_url, headers=self.headers)
            judge_resp.raise_for_status()
            job_data = judge_resp.json()
            job_id = job_data.get("job_id")

            if not job_id:
                raise HTTPException(status_code=502, detail="未能成功创建评测沙箱任务")

            # 3. 等待沙箱执行完毕，获取编译报错或测试用例输出
            # NOTE: 头歌沙箱一般 2-5 秒即可完成执行并返回结果
            poll_url = f"{EDUCODER_BASE_API}/api/v1/jobs/{job_id}/result"
            poll_resp = await self.client.get(poll_url, headers=self.headers)
            poll_resp.raise_for_status()
            res = poll_resp.json()

            return EvaluateResponse(
                success=res.get("status") == "passed",
                status=res.get("status", "unknown"),
                output=res.get("stdout", "") or res.get("stderr", "无执行输出"),
                score=res.get("score", 0),
            )
        except httpx.HTTPError as exc:
            logger.error("头歌评测服务中继异常: %s", str(exc))
            raise HTTPException(status_code=502, detail="中继通信失败，请检查网络后重试")


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_stage_code(req: EvaluateRequest):
    """
    提供给工小湖移动端的一键评测接口
    """
    # NOTE: 实际业务中从用户登录会话中注入真实 Token
    current_token = "secure_user_token_placeholder"
    service = EduCoderJudgeService(auth_token=current_token)
    return await service.execute_code_evaluation(req)
```

---

## 3. 把将近 9,000 道实训放进口袋，是种什么体验？

把整套流程跑通之后，我把工小湖原先零散的模块做了次彻底的规整，重构成了四个底部板块：

::pic
---
src: https://wework.qpic.cn/wwpic3az/580914_C2s7a67lS2WczJW_1795163385/0
caption: 图 2：工小湖·头歌移动端主界面，精选 8,930 个动手实训，底部常驻未完成的作业任务条
---
::

* **【学习】**：之前做好的雨课堂秒进班、课表、成绩和自动签到依然在；
* **【实训】**：整整 8,930 门动手项目！想做啥直接搜，做累了还能随时“换一批”；
* **【课堂】**：绑定学校班级后，老师布置的实验作业会自动挂在底部任务栏，随时一点就能继续往下闯关；
* **【我的】**：免费注册账号，所有做题进度跟官方完全云端同步。

### 计算机考研 408 核心实践，终于能随时刷了
学计算机的都知道考研 408 那几座大山：数据结构算法推导、计组的指令周期、操作系统的虚拟内存与死锁检测、计算机网络的三次握手。在手机上直接刷对应的编程实战，边敲边跑测试用例，比坐在桌子前硬啃厚厚的黑书不知道生动多少倍。

### 顶尖名校好课，不用蹭课也能免费学
比如北京大学国家一流开放课程《软件工程》（累计 7.5 万人学习、4.9 分神评）。在手机上点进去就能看完整的教学团队、大纲与讨论区，直接在手机上完成北大软件工程的几十道实训闯关。

::pic
---
src: https://wework.qpic.cn/wwpic3az/65767__gcUfIMOTECh70M_1795163443/0
caption: 图 3：北京大学《软件工程》一流课程详情，支持在线浏览 OBE 教学大纲并直接开课
---
::

---

## 4. 紧跟前沿：在手机上做 DeepSeek 大模型本地部署

更让我觉得有意思的是，头歌平台跟进最新前沿技术的速度快得出奇。

除了传统的 C++、Python、Java 语法，它把现在最火的“AI + X”跨学科实训也给做齐了——足足 11 个章节，里面甚至把 AI 跟工业设备故障排查、医学辅助诊断都连了起来：

::pic
---
src: https://wework.qpic.cn/wwpic3az/524204_Lhb3r6wiQqSLcpj_1795163423/0
caption: 图 4：涵盖 11 章的跨学科课程大纲，从提示词工程到 AI+工科/理科/医学全链路
---
::

最戳我的是其中一个实验：**《DeepSeek 大模型部署与在线实战》**。

它在云端沙箱里提供了一套完整的 Linux 环境，教你一步步使用 **Ollama** 搭建本地大模型服务，拉取并配置开源的 **DeepSeek R1**。

而在我的抽屉式代码编辑器里，你敲的不仅是 Python，还能直接写 Bash Shell 脚本（如 `t1.py` 内部 `#!/bin/bash`），运行脚本后，沙箱会自动用 curl 探针去检测本地端口、DeepSeek 官网访问记录与环境健全性，完成一次真真正正的“在手机上搞大模型部署”：

::pic
---
src: https://wework.qpic.cn/wwpic3az/472914_9jT5Da2YRpKEu9p_1795163434/0
caption: 图 5：用 Ollama 本地部署 DeepSeek R1，在抽屉式终端里用 Shell 脚本自动化检测服务环境
---
::

---

## 5. 聊聊心里话

前两天把这个功能打包推上线、顺手在频道里发了个帖子之后，看到底下很多同学留言：“大佬怎么登录”、“大佬太牛了”。

其实说实话，我做这个东西没有什么宏大的商业野心，纯粹就是作为一个大三工科学生，被大学水课折磨过、但也真心热爱敲代码写程序的那份执念。

头歌官方本身向所有大学生免费开放了这么多高质量的实训与名校资源，感谢国防科技大学团队把这套生态搭建得这么棒。而我能做的，就是写好前端与中继，做一款趁手的移动端工具，让大家随时随地掏出手机，就能把那些在水课上荒废掉的知识与实战能力，一点点补回来。

后续我还会继续给工小湖移植 AI 答疑助手，比如提交评测报错时，结合大模型给出一针见血的中文调试建议，再也不用对着满屏看瞎眼的英文 traceback 抓耳挠腮。

希望每个热爱技术的同学，都能在这个小工具里找到敲代码最初的那份快乐与踏实！
