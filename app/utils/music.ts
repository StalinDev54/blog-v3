/**
 * 解析音乐链接，支持网易云音乐和直链
 */

/**
 * 解析网易云音乐链接，提取歌曲ID
 * @param url 网易云音乐链接
 * @returns 歌曲ID或null
 */
export function parseNeteaseMusicUrl(url: string): string | null {
    // 匹配网易云音乐链接中的ID - 更宽松的匹配规则
    const match = url.match(/music\.163\.com\D*(\d+)/i)
    if (match && match[1]) {
        return match[1]
    }

    return null
}
/**
 * 通过API获取网易云音乐信息（包括直链和封面）
 * @param id 网易云音乐歌曲ID
 * @returns 音乐信息对象
 */
// 定义返回值类型（更清晰，便于复用）
interface NeteaseMusicInfo {
    url: string
    cover: string
    name?: string
    artist?: string
}

// 默认封面图常量（抽离出来，便于维护）
const DEFAULT_COVER = 'https://wework.qpic.cn/wwpic3az/503309_zafbLebUS7KK741_1764389837/0'

export async function getNeteaseMusicInfo(id: string): Promise<NeteaseMusicInfo> {
    try {
        // 1. 校验入参（避免空ID请求）
        if (!id) {
            console.warn('网易云音乐ID不能为空')
            return { url: '', cover: DEFAULT_COVER, name: '', artist: '' }
        }

        // 2. 请求第三方API
        const response = await fetch(`https://api.qijieya.cn/meting/?type=song&id=${id}`)

        // 3. 校验响应状态（非200/201直接抛错）
        if (!response.ok) {
            throw new Error(`请求失败，状态码：${response.status}`)
        }

        // 4. 解析JSON（API返回的是数组，需处理）
        const rawData = await response.json()
        // 核心修正：取数组第一个元素，兜底空对象（避免数组为空/非数组报错）
        const musicData = Array.isArray(rawData) ? rawData[0] || {} : {}

        // 5. 提取字段（用可选链+空值合并，更健壮）
        return {
            url: musicData.url ?? '', // 音频直链，默认空字符串
            cover: musicData.pic ?? DEFAULT_COVER, // 封面，默认兜底图
            name: musicData.name ?? '', // 歌曲名，默认空字符串
            artist: musicData.artist ?? '', // 歌手名，默认空字符串
        }
    }
    catch (error) {
        // 细化错误日志，便于排查问题
        const errorMsg = error instanceof Error ? error.message : '未知错误'
        console.error('获取网易云音乐信息失败:', errorMsg)
        // 异常兜底返回默认值
        return {
            url: '',
            cover: DEFAULT_COVER,
            name: '',
            artist: '',
        }
    }
}

/**
 * 解析音乐链接，返回可播放的直链和封面
 * @param url 原始音乐链接
 * @returns 音乐信息对象
 */
export async function parseMusicUrl(url: string): Promise<{ url: string, cover: string, name?: string, artist?: string }> {
    // 检查是否为网易云音乐链接
    const neteaseId = parseNeteaseMusicUrl(url)
    if (neteaseId) {
        console.log('解析到网易云音乐ID:', neteaseId)
        return await getNeteaseMusicInfo(neteaseId)
    }

    // 如果不是特殊链接，则认为是直链
    console.log('使用直链:', url)
    return {
        url,
        cover: 'https://wework.qpic.cn/wwpic3az/503309_zafbLebUS7KK741_1764389837/0',
        name: '',
        artist: '',
    }
}
