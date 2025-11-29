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
    const match = url.match(/music\.163\.com[^\d]*(\d+)/i)
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
export async function getNeteaseMusicInfo(id: string): Promise<{ url: string; cover: string }> {
    try {
        // 使用第三方API获取音乐信息
        const response = await fetch(`https://music.cenguigui.cn/?type=song&id=${id}`)
        const data = await response.json()
        return {
            url: data.url || '',
            cover: data.pic || 'https://wework.qpic.cn/wwpic3az/503309_zafbLebUS7KK741_1764389837/0'
        }
    } catch (error) {
        console.error('获取网易云音乐信息失败:', error)
        return {
            url: '',
            cover: 'https://wework.qpic.cn/wwpic3az/503309_zafbLebUS7KK741_1764389837/0'
        }
    }
}

/**
 * 解析音乐链接，返回可播放的直链和封面
 * @param url 原始音乐链接
 * @returns 音乐信息对象
 */
export async function parseMusicUrl(url: string): Promise<{ url: string; cover: string }> {
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
        cover: 'https://wework.qpic.cn/wwpic3az/503309_zafbLebUS7KK741_1764389837/0'
    }
}