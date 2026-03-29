/**
 * 语音唤醒模块 - 持续监听麦克风，识别唤醒词和结束语
 * 使用 Web Speech API 实现
 */

import { t } from './i18n.js'

const STORAGE_WAKEUP_CONFIG_KEY = 'clawapp-wakeup-config'

// 默认配置
const DEFAULT_CONFIG = {
  enabled: false,
  wakeupWord: '你好助手',
  endingWord: '说完了'
}

// 模块状态
let _recognition = null
let _isListening = false
let _isWoken = false
let _config = null
let _onWakeupCallback = null
let _onEndingCallback = null
let _onErrorCallback = null
let _lastTranscript = ''
let _accumulatedTranscript = ''

// 重启控制（修复无限快速重启导致 CPU/电池过度消耗）
let _restartAttempts = 0
let _restartTimer = null

/**
 * 获取唤醒配置
 */
export function getWakeupConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_WAKEUP_CONFIG_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return { ...DEFAULT_CONFIG, ...parsed }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

/**
 * 保存唤醒配置（修复：添加错误处理）
 */
export function saveWakeupConfig(config) {
  try {
    const merged = { ...getWakeupConfig(), ...config }
    localStorage.setItem(STORAGE_WAKEUP_CONFIG_KEY, JSON.stringify(merged))
    return { success: true, config: merged }
  } catch (e) {
    console.error('[voice-wakeup] save config error:', e)
    return { success: false, error: e.message }
  }
}

/**
 * 检查是否支持语音唤醒（修复：Android WebView 兼容性检测）
 */
export function isSupported() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) return false
  
  const isSecure = location.protocol === 'https:' || 
                   location.hostname === 'localhost' || 
                   location.hostname === '127.0.0.1'
  return isSecure
}

/**
 * 初始化唤醒监听
 * @param {Function} onWakeup - 唤醒回调
 * @param {Function} onEnding - 结束语回调
 * @param {Function} onError - 错误回调
 */
export function initWakeup(onWakeup, onEnding, onError) {
  _onWakeupCallback = onWakeup
  _onEndingCallback = onEnding
  _onErrorCallback = onError
  _config = getWakeupConfig()
  
  return _config.enabled
}

/**
 * 开始持续监听
 */
export function startListening() {
  if (!isSupported()) {
    console.warn('[voice-wakeup] Not supported')
    return false
  }
  
  if (_isListening) {
    console.log('[voice-wakeup] Already listening')
    return true
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  _recognition = new SpeechRecognition()
  _recognition.lang = navigator.language || 'zh-CN'
  _recognition.interimResults = true
  _recognition.continuous = true
  
  // 修复：成功后重置重启计数
  _recognition.onstart = () => {
    _isListening = true
    _restartAttempts = 0
    console.log('[voice-wakeup] Started listening')
  }
  
  // 修复：指数退避机制，避免无限快速重启
  _recognition.onend = () => {
    _isListening = false
    console.log('[voice-wakeup] Stopped listening')
    
    // 自动重启监听（除非被唤醒后主动停止）
    if (_config?.enabled && !_isWoken) {
      // 指数退避：最大 5 秒
      const delay = Math.min(1000 * Math.pow(1.5, _restartAttempts), 5000)
      _restartAttempts++
      
      clearTimeout(_restartTimer)
      _restartTimer = setTimeout(() => {
        if (_config?.enabled && !_isListening) {
          startListening()
        }
      }, delay)
    }
  }
  
  _recognition.onerror = (e) => {
    console.error('[voice-wakeup] Error:', e.error)
    
    if (e.error === 'not-allowed') {
      _onErrorCallback?.(t('voice.wakeup.permission.denied'))
    } else if (e.error === 'network') {
      _onErrorCallback?.(t('voice.wakeup.network.error'))
    } else if (e.error !== 'aborted' && e.error !== 'no-speech') {
      _onErrorCallback?.(`${t('voice.wakeup.error')} (${e.error})`)
    }
    
    // 非致命错误时尝试重启
    if (e.error !== 'not-allowed' && _config?.enabled) {
      clearTimeout(_restartTimer)
      _restartTimer = setTimeout(() => {
        if (_config?.enabled && !_isListening) {
          startListening()
        }
      }, 1000)
    }
  }
  
  // 修复：内容重复累积逻辑错误
  _recognition.onresult = (e) => {
    const results = Array.from(e.results)
    const transcript = results.map(r => r[0].transcript).join('').trim()
    const isFinal = results[results.length - 1]?.isFinal
    
    if (isFinal || !_isWoken) {
      _lastTranscript = transcript
    }
    
    // 修正：避免重复累积
    if (_isWoken) {
      const newContent = transcript.replace(_lastTranscript, '').trim()
      _accumulatedTranscript += newContent
    }
    
    // 检测唤醒词
    if (!_isWoken && transcript.includes(_config.wakeupWord)) {
      _isWoken = true
      console.log('[voice-wakeup] Wakeup detected!')
      _onWakeupCallback?.()
      return
    }
    
    // 检测结束语（仅在唤醒后）
    if (_isWoken && transcript.includes(_config.endingWord)) {
      // 提取结束语之前的内容
      const endingIndex = _accumulatedTranscript.lastIndexOf(_config.endingWord)
      const contentBeforeEnding = endingIndex > 0 
        ? _accumulatedTranscript.substring(0, endingIndex).trim()
        : _accumulatedTranscript.replace(_config.endingWord, '').trim()
      
      console.log('[voice-wakeup] Ending detected! Content:', contentBeforeEnding)
      _onEndingCallback?.(contentBeforeEnding)
      
      // 重置状态
      resetState()
      return
    }
  }
  
  try {
    _recognition.start()
    return true
  } catch (e) {
    console.error('[voice-wakeup] Start error:', e)
    _onErrorCallback?.(e.message)
    return false
  }
}

/**
 * 停止监听（修复：内存泄漏 - 事件监听器未清理 + 定时器清理）
 */
export function stopListening() {
  // 清理重启定时器
  clearTimeout(_restartTimer)
  _restartTimer = null
  
  if (_recognition) {
    try {
      // 移除所有事件监听器（修复内存泄漏）
      _recognition.onstart = null
      _recognition.onend = null
      _recognition.onerror = null
      _recognition.onresult = null
      _recognition.stop()
    } catch (e) {
      console.error('[voice-wakeup] Stop error:', e)
    }
    _recognition = null
  }
  _isListening = false
  resetState()
}

/**
 * 重置状态
 */
function resetState() {
  _isWoken = false
  _accumulatedTranscript = ''
  _lastTranscript = ''
}

/**
 * 唤醒后开始收集语音（用于自动提交模式）
 */
export function startCollecting() {
  _isWoken = true
  _accumulatedTranscript = ''
  console.log('[voice-wakeup] Started collecting after wakeup')
}

/**
 * 获取当前收集的语音内容
 */
export function getCollectedTranscript() {
  return _accumulatedTranscript
}

/**
 * 清除收集的内容
 */
export function clearCollectedTranscript() {
  _accumulatedTranscript = ''
}

/**
 * 请求麦克风权限
 */
export async function requestPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch (e) {
    console.error('[voice-wakeup] Permission error:', e)
    return false
  }
}

/**
 * 检查麦克风权限状态
 */
export async function checkPermission() {
  if (!navigator.permissions) return 'unknown'
  
  try {
    const result = await navigator.permissions.query({ name: 'microphone' })
    return result.state
  } catch (e) {
    return 'unknown'
  }
}
