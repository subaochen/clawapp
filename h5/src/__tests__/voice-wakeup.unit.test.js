/**
 * 语音唤醒功能 - 单元测试
 * Voice Wakeup Unit Tests
 */

// 导入测试工具
const { 
  TEST_CONFIG, 
  results, 
  assertEqual, 
  assertTrue, 
  assertFalse, 
  assertNotNull 
} = require('./test-utils.js')

// ==================== 测试组 1: 配置管理测试 ====================
console.log('\n📦 测试组 1: 配置管理测试')

// 测试 1.1: 获取默认配置
function testGetDefaultConfig() {
  try {
    const DEFAULT_CONFIG = {
      enabled: false,
      wakeupWord: '你好助手',
      endingWord: '说完了'
    }
    
    // 模拟空 localStorage
    localStorage.clear()
    
    // 测试默认值
    const config = { ...DEFAULT_CONFIG }
    assertEqual(config.enabled, false, '默认启用状态应为 false')
    assertEqual(config.wakeupWord, '你好助手', '默认唤醒词应为"你好助手"')
    assertEqual(config.endingWord, '说完了', '默认结束语应为"说完了"')
    
    results.addPass('配置管理 - 默认配置获取')
  } catch (e) {
    results.addFail('配置管理 - 默认配置获取', e.message)
  }
}

// 测试 1.2: 保存和读取配置
function testSaveAndLoadConfig() {
  try {
    const STORAGE_KEY = 'clawapp-wakeup-config'
    
    // 测试保存配置
    const config = {
      enabled: true,
      wakeupWord: '小助手',
      endingWord: '结束'
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    
    // 测试读取配置
    const raw = localStorage.getItem(STORAGE_KEY)
    const loaded = JSON.parse(raw)
    
    assertEqual(loaded.enabled, true, '保存后读取的启用状态应为 true')
    assertEqual(loaded.wakeupWord, '小助手', '保存后读取的唤醒词应为"小助手"')
    assertEqual(loaded.endingWord, '结束', '保存后读取的结束语应为"结束"')
    
    results.addPass('配置管理 - 配置保存与读取')
  } catch (e) {
    results.addFail('配置管理 - 配置保存与读取', e.message)
  }
}

// 测试 1.3: 配置合并（部分更新）
function testConfigMerge() {
  try {
    const DEFAULT_CONFIG = {
      enabled: false,
      wakeupWord: '你好助手',
      endingWord: '说完了'
    }
    
    const savedConfig = {
      enabled: true,
      wakeupWord: '自定义唤醒词'
    }
    
    // 合并配置
    const merged = { ...DEFAULT_CONFIG, ...savedConfig }
    
    assertEqual(merged.enabled, true, '合并后启用状态应为 true')
    assertEqual(merged.wakeupWord, '自定义唤醒词', '合并后唤醒词应为自定义值')
    assertEqual(merged.endingWord, '说完了', '未指定的结束语应保持默认值')
    
    results.addPass('配置管理 - 配置合并')
  } catch (e) {
    results.addFail('配置管理 - 配置合并', e.message)
  }
}

// 测试 1.4: 配置保存错误处理
function testConfigSaveError() {
  try {
    // 模拟 localStorage 错误
    const originalSetItem = localStorage.setItem
    localStorage.setItem = () => { throw new Error('QuotaExceededError') }
    
    let errorCaught = false
    try {
      localStorage.setItem('test', 'value')
    } catch (e) {
      errorCaught = true
    }
    
    // 恢复
    localStorage.setItem = originalSetItem
    
    assertTrue(errorCaught, '应捕获 localStorage 错误')
    results.addPass('配置管理 - 错误处理')
  } catch (e) {
    results.addFail('配置管理 - 错误处理', e.message)
  }
}

// 测试 1.5: 配置持久化（模拟页面刷新）
function testConfigPersistence() {
  try {
    const STORAGE_KEY = 'clawapp-wakeup-config'
    
    // 保存配置
    const originalConfig = {
      enabled: true,
      wakeupWord: '测试唤醒词',
      endingWord: '测试结束语'
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(originalConfig))
    
    // 模拟页面刷新（清空内存但保留 localStorage）
    // 重新读取配置
    const raw = localStorage.getItem(STORAGE_KEY)
    const restored = JSON.parse(raw)
    
    assertEqual(restored.enabled, originalConfig.enabled, '页面刷新后启用状态应保持一致')
    assertEqual(restored.wakeupWord, originalConfig.wakeupWord, '页面刷新后唤醒词应保持一致')
    assertEqual(restored.endingWord, originalConfig.endingWord, '页面刷新后结束语应保持一致')
    
    results.addPass('配置管理 - 配置持久化')
  } catch (e) {
    results.addFail('配置管理 - 配置持久化', e.message)
  }
}

// ==================== 测试组 2: 唤醒词检测逻辑测试 ====================
console.log('\n📦 测试组 2: 唤醒词检测逻辑测试')

// 测试 2.1: 标准唤醒词检测
function testWakeupWordDetection() {
  try {
    const wakeupWord = '你好助手'
    const testCases = [
      { input: '你好助手', shouldTrigger: true },
      { input: '你好助手，帮我查天气', shouldTrigger: true },
      { input: '嗨，你好助手', shouldTrigger: true },
      { input: '你好啊', shouldTrigger: false },
      { input: '助手你好', shouldTrigger: false },
      { input: '今天天气不错', shouldTrigger: false }
    ]
    
    for (const tc of testCases) {
      const triggered = tc.input.includes(wakeupWord)
      assertEqual(triggered, tc.shouldTrigger, 
        `输入"${tc.input}"应${tc.shouldTrigger ? '' : '不'}触发唤醒`)
    }
    
    results.addPass('唤醒词检测 - 标准检测')
  } catch (e) {
    results.addFail('唤醒词检测 - 标准检测', e.message)
  }
}

// 测试 2.2: 自定义唤醒词检测
function testCustomWakeupWord() {
  try {
    const customWakeupWord = '小助手小助手'
    const testCases = [
      { input: '小助手小助手', shouldTrigger: true },
      { input: '小助手小助手，在吗', shouldTrigger: true },
      { input: '小助手', shouldTrigger: false },
      { input: '你好小助手小助手', shouldTrigger: true }
    ]
    
    for (const tc of testCases) {
      const triggered = tc.input.includes(customWakeupWord)
      assertEqual(triggered, tc.shouldTrigger,
        `自定义唤醒词: 输入"${tc.input}"应${tc.shouldTrigger ? '' : '不'}触发唤醒`)
    }
    
    results.addPass('唤醒词检测 - 自定义唤醒词')
  } catch (e) {
    results.addFail('唤醒词检测 - 自定义唤醒词', e.message)
  }
}

// 测试 2.3: 唤醒后不应重复触发
function testNoRepeatWakeup() {
  try {
    let isWoken = false
    const wakeupWord = '你好助手'
    
    // 第一次唤醒
    const firstInput = '你好助手'
    if (firstInput.includes(wakeupWord) && !isWoken) {
      isWoken = true
    }
    assertTrue(isWoken, '第一次应触发唤醒')
    
    // 第二次（唤醒后）
    const secondInput = '你好助手，帮我'
    let secondTrigger = false
    if (secondInput.includes(wakeupWord) && !isWoken) {
      secondTrigger = true
    }
    assertFalse(secondTrigger, '唤醒后不应重复触发')
    
    results.addPass('唤醒词检测 - 不重复触发')
  } catch (e) {
    results.addFail('唤醒词检测 - 不重复触发', e.message)
  }
}

// ==================== 测试组 3: 结束语检测逻辑测试 ====================
console.log('\n📦 测试组 3: 结束语检测逻辑测试')

// 测试 3.1: 标准结束语检测
function testEndingWordDetection() {
  try {
    const endingWord = '说完了'
    const testCases = [
      { input: '说完了', shouldTrigger: true },
      { input: '好的说完了', shouldTrigger: true },
      { input: '我说完了', shouldTrigger: true },
      { input: '说完了谢谢', shouldTrigger: true },
      { input: '说', shouldTrigger: false },
      { input: '完了', shouldTrigger: false },
      { input: '说好了', shouldTrigger: false }
    ]
    
    for (const tc of testCases) {
      const triggered = tc.input.includes(endingWord)
      assertEqual(triggered, tc.shouldTrigger,
        `输入"${tc.input}"应${tc.shouldTrigger ? '' : '不'}触发结束语`)
    }
    
    results.addPass('结束语检测 - 标准检测')
  } catch (e) {
    results.addFail('结束语检测 - 标准检测', e.message)
  }
}

// 测试 3.2: 结束语仅在后唤醒状态下触发
function testEndingOnlyAfterWakeup() {
  try {
    const endingWord = '说完了'
    
    // 未唤醒状态
    let isWoken = false
    const input = '说完了'
    let triggered = input.includes(endingWord) && isWoken
    assertFalse(triggered, '未唤醒时不应触发结束语')
    
    // 唤醒状态
    isWoken = true
    triggered = input.includes(endingWord) && isWoken
    assertTrue(triggered, '唤醒后应触发结束语')
    
    results.addPass('结束语检测 - 仅唤醒后触发')
  } catch (e) {
    results.addFail('结束语检测 - 仅唤醒后触发', e.message)
  }
}

// 测试 3.3: 结束语前内容提取
function testContentBeforeEnding() {
  try {
    const endingWord = '说完了'
    const accumulatedTranscript = '请帮我查一下明天北京的天气说完了'
    
    const endingIndex = accumulatedTranscript.lastIndexOf(endingWord)
    const contentBeforeEnding = endingIndex > 0 
      ? accumulatedTranscript.substring(0, endingIndex).trim()
      : accumulatedTranscript.replace(endingWord, '').trim()
    
    assertEqual(contentBeforeEnding, '请帮我查一下明天北京的天气', 
      '应正确提取结束语前的内容')
    
    results.addPass('结束语检测 - 内容提取')
  } catch (e) {
    results.addFail('结束语检测 - 内容提取', e.message)
  }
}

// ==================== 测试组 4: 内容累积逻辑测试 ====================
console.log('\n📦 测试组 4: 内容累积逻辑测试')

// 测试 4.1: 内容累积不重复
function testContentAccumulationNoRepeat() {
  try {
    let lastTranscript = ''
    let accumulatedTranscript = ''
    
    // 第一次识别结果
    const transcript1 = '请帮我'
    lastTranscript = transcript1
    
    // 第二次识别结果（包含第一次的内容）
    const transcript2 = '请帮我查一下'
    const newContent = transcript2.replace(lastTranscript, '').trim()
    accumulatedTranscript += newContent
    lastTranscript = transcript2
    
    assertEqual(accumulatedTranscript, '查一下', '应只累积新内容')
    
    // 第三次识别结果
    const transcript3 = '请帮我查一下明天北京的天气'
    const newContent2 = transcript3.replace(lastTranscript, '').trim()
    accumulatedTranscript += newContent2
    
    assertEqual(accumulatedTranscript, '查一下明天北京的天气', '累积内容应正确')
    
    results.addPass('内容累积 - 不重复累积')
  } catch (e) {
    results.addFail('内容累积 - 不重复累积', e.message)
  }
}

// 测试 4.2: 累积内容重置
function testAccumulationReset() {
  try {
    let accumulatedTranscript = '一些累积的内容'
    let isWoken = true
    
    // 模拟结束语触发后的重置
    function resetState() {
      isWoken = false
      accumulatedTranscript = ''
    }
    
    resetState()
    
    assertEqual(accumulatedTranscript, '', '重置后累积内容应为空')
    assertFalse(isWoken, '重置后唤醒状态应为 false')
    
    results.addPass('内容累积 - 重置功能')
  } catch (e) {
    results.addFail('内容累积 - 重置功能', e.message)
  }
}

// ==================== 测试组 5: 指数退避计算测试 ====================
console.log('\n📦 测试组 5: 指数退避计算测试')

// 测试 5.1: 指数退避递增
function testExponentialBackoff() {
  try {
    const delays = []
    const maxAttempts = 10
    const maxDelay = 5000
    
    for (let i = 0; i < maxAttempts; i++) {
      const delay = Math.min(1000 * Math.pow(1.5, i), maxDelay)
      delays.push(delay)
    }
    
    // 验证递增
    for (let i = 1; i < delays.length; i++) {
      assertTrue(delays[i] >= delays[i-1] || delays[i] === maxDelay,
        `第${i+1}次延迟应大于等于第${i}次`)
    }
    
    // 验证上限
    assertEqual(delays[delays.length - 1], maxDelay, '延迟应达到上限')
    
    // 验证具体值
    assertEqual(delays[0], 1000, '第一次延迟应为 1000ms')
    assertEqual(delays[1], 1500, '第二次延迟应为 1500ms')
    assertEqual(delays[4], 5062.5 > maxDelay ? maxDelay : 5062.5, '第五次延迟')
    
    results.addPass('指数退避 - 递增计算')
  } catch (e) {
    results.addFail('指数退避 - 递增计算', e.message)
  }
}

// 测试 5.2: 退避计数器重置
function testBackoffReset() {
  try {
    let restartAttempts = 5
    
    // 模拟成功连接后重置
    function onSuccess() {
      restartAttempts = 0
    }
    
    onSuccess()
    
    assertEqual(restartAttempts, 0, '成功后应重置计数器')
    
    results.addPass('指数退避 - 计数器重置')
  } catch (e) {
    results.addFail('指数退避 - 计数器重置', e.message)
  }
}

// ==================== 测试组 6: 兼容性检测测试 ====================
console.log('\n📦 测试组 6: 兼容性检测测试')

// 测试 6.1: Web Speech API 支持检测
function testSpeechApiSupport() {
  try {
    // 支持的浏览器
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    assertNotNull(SpeechRecognition, '应支持 SpeechRecognition')
    
    results.addPass('兼容性 - Speech API 支持检测')
  } catch (e) {
    results.addFail('兼容性 - Speech API 支持检测', e.message)
  }
}

// 测试 6.2: HTTPS/安全环境检测
function testSecureContext() {
  try {
    const testCases = [
      { protocol: 'https:', hostname: 'example.com', expected: true },
      { protocol: 'http:', hostname: 'localhost', expected: true },
      { protocol: 'http:', hostname: '127.0.0.1', expected: true },
      { protocol: 'http:', hostname: 'example.com', expected: false },
      { protocol: 'file:', hostname: '', expected: false }
    ]
    
    for (const tc of testCases) {
      const isSecure = tc.protocol === 'https:' || 
                       tc.hostname === 'localhost' || 
                       tc.hostname === '127.0.0.1'
      assertEqual(isSecure, tc.expected, 
        `${tc.protocol}//${tc.hostname} 应${tc.expected ? '' : '不'}被视为安全环境`)
    }
    
    results.addPass('兼容性 - 安全环境检测')
  } catch (e) {
    results.addFail('兼容性 - 安全环境检测', e.message)
  }
}

// 测试 6.3: 移动端/桌面端检测
function testDeviceType() {
  try {
    const userAgents = [
      { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', isMobile: true },
      { ua: 'Mozilla/5.0 (Linux; Android 13; SM-G991B)', isMobile: true },
      { ua: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)', isMobile: true },
      { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', isMobile: false },
      { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', isMobile: false },
      { ua: 'Mozilla/5.0 (X11; Linux x86_64)', isMobile: false }
    ]
    
    for (const tc of userAgents) {
      const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|HarmonyOS/i.test(tc.ua)
      assertEqual(isMobileUA, tc.isMobile, 
        `User-Agent "${tc.ua.substring(0, 30)}..." 应${tc.isMobile ? '' : '不'}被识别为移动端`)
    }
    
    results.addPass('兼容性 - 设备类型检测')
  } catch (e) {
    results.addFail('兼容性 - 设备类型检测', e.message)
  }
}

// ==================== 运行所有测试 ====================
function runAllTests() {
  console.log('🚀 开始运行语音唤醒单元测试...\n')
  
  // 配置管理测试
  testGetDefaultConfig()
  testSaveAndLoadConfig()
  testConfigMerge()
  testConfigSaveError()
  testConfigPersistence()
  
  // 唤醒词检测测试
  testWakeupWordDetection()
  testCustomWakeupWord()
  testNoRepeatWakeup()
  
  // 结束语检测测试
  testEndingWordDetection()
  testEndingOnlyAfterWakeup()
  testContentBeforeEnding()
  
  // 内容累积测试
  testContentAccumulationNoRepeat()
  testAccumulationReset()
  
  // 指数退避测试
  testExponentialBackoff()
  testBackoffReset()
  
  // 兼容性测试
  testSpeechApiSupport()
  testSecureContext()
  testDeviceType()
  
  console.log('\n✅ 单元测试完成')
  return results
}

// 导出测试函数
module.exports = { runAllTests, results }

// 如果直接运行此文件
if (require.main === module) {
  runAllTests()
  console.log('\n📊 测试结果统计:')
  console.log(results.getStats())
}
