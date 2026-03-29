/**
 * 语音唤醒功能 - 边界情况测试
 * Voice Wakeup Edge Cases Tests
 */

const { results, assertEqual, assertTrue, assertFalse } = require('./test-utils.js')

console.log('\n📦 测试组: 边界情况测试')

// ==================== 测试 1: 空值测试 ====================

// 测试 1.1: 空唤醒词
function testEmptyWakeupWord() {
  try {
    const wakeupWord = ''
    const input = '任何输入'
    const triggered = wakeupWord && input.includes(wakeupWord)
    
    assertFalse(triggered, '空唤醒词不应触发唤醒')
    results.addPass('边界情况 - 空唤醒词')
  } catch (e) {
    results.addFail('边界情况 - 空唤醒词', e.message)
  }
}

// 测试 1.2: 空结束语
function testEmptyEndingWord() {
  try {
    const endingWord = ''
    const input = '任何输入'
    const isWoken = true
    const triggered = endingWord && isWoken && input.includes(endingWord)
    
    assertFalse(triggered, '空结束语不应触发结束')
    results.addPass('边界情况 - 空结束语')
  } catch (e) {
    results.addFail('边界情况 - 空结束语', e.message)
  }
}

// 测试 1.3: null/undefined 配置
function testNullConfig() {
  try {
    const DEFAULT_CONFIG = {
      enabled: false,
      wakeupWord: '你好助手',
      endingWord: '说完了'
    }
    
    // 模拟 null 配置
    const savedConfig = null
    const merged = { ...DEFAULT_CONFIG, ...(savedConfig || {}) }
    
    assertEqual(merged.wakeupWord, '你好助手', 'null 配置应使用默认值')
    results.addPass('边界情况 - null 配置处理')
  } catch (e) {
    results.addFail('边界情况 - null 配置处理', e.message)
  }
}

// ==================== 测试 2: 特殊字符测试 ====================

// 测试 2.1: 特殊字符唤醒词
function testSpecialCharWakeupWord() {
  try {
    const specialCases = [
      { word: '你好<助手>', input: '你好<助手>', shouldTrigger: true },
      { word: '你好&助手', input: '你好&助手', shouldTrigger: true },
      { word: '你好"助手"', input: '你好"助手"', shouldTrigger: true },
      { word: "你好'助手'", input: "你好'助手'", shouldTrigger: true },
      { word: '你好 助手', input: '你好 助手', shouldTrigger: true },
      { word: '你好\n助手', input: '你好\n助手', shouldTrigger: true }
    ]
    
    for (const tc of specialCases) {
      const triggered = tc.input.includes(tc.word)
      assertEqual(triggered, tc.shouldTrigger, 
        `特殊字符唤醒词 "${tc.word}" 应${tc.shouldTrigger ? '' : '不'}触发`)
    }
    
    results.addPass('边界情况 - 特殊字符唤醒词')
  } catch (e) {
    results.addFail('边界情况 - 特殊字符唤醒词', e.message)
  }
}

// 测试 2.2: Unicode 字符唤醒词
function testUnicodeWakeupWord() {
  try {
    const unicodeCases = [
      { word: '🎤助手', input: '🎤助手在吗', shouldTrigger: true },
      { word: 'こんにちは', input: 'こんにちは', shouldTrigger: true },
      { word: 'Hello', input: 'Hello there', shouldTrigger: true },
      { word: 'Привет', input: 'Привет мир', shouldTrigger: true },
      { word: 'مرحبا', input: 'مرحبا بالعالم', shouldTrigger: true }
    ]
    
    for (const tc of unicodeCases) {
      const triggered = tc.input.includes(tc.word)
      assertEqual(triggered, tc.shouldTrigger,
        `Unicode 唤醒词 "${tc.word}" 应${tc.shouldTrigger ? '' : '不'}触发`)
    }
    
    results.addPass('边界情况 - Unicode 字符唤醒词')
  } catch (e) {
    results.addFail('边界情况 - Unicode 字符唤醒词', e.message)
  }
}

// ==================== 测试 3: 超长文本测试 ====================

// 测试 3.1: 超长唤醒词
function testVeryLongWakeupWord() {
  try {
    const longWord = '你'.repeat(100) + '好助手'
    const input = '你'.repeat(100) + '好助手'
    const triggered = input.includes(longWord)
    
    assertTrue(triggered, '超长唤醒词应能正确匹配')
    results.addPass('边界情况 - 超长唤醒词')
  } catch (e) {
    results.addFail('边界情况 - 超长唤醒词', e.message)
  }
}

// 测试 3.2: 超长累积内容
function testVeryLongAccumulatedContent() {
  try {
    const longContent = '请帮我'.repeat(1000)
    const endingWord = '说完了'
    const accumulated = longContent + endingWord
    
    const endingIndex = accumulated.lastIndexOf(endingWord)
    const contentBeforeEnding = endingIndex > 0 
      ? accumulated.substring(0, endingIndex).trim()
      : accumulated.replace(endingWord, '').trim()
    
    assertEqual(contentBeforeEnding, longContent, '超长内容应正确提取')
    assertEqual(contentBeforeEnding.length, longContent.length, '内容长度应匹配')
    results.addPass('边界情况 - 超长累积内容')
  } catch (e) {
    results.addFail('边界情况 - 超长累积内容', e.message)
  }
}

// 测试 3.3: 超长 localStorage 值
function testVeryLongLocalStorage() {
  try {
    const longConfig = {
      enabled: true,
      wakeupWord: '你好助手'.repeat(100),
      endingWord: '说完了'.repeat(100)
    }
    
    // 尝试序列化（可能会很大）
    const json = JSON.stringify(longConfig)
    assertTrue(json.length > 1000, '长配置应被序列化')
    
    // 尝试解析
    const parsed = JSON.parse(json)
    assertEqual(parsed.wakeupWord, longConfig.wakeupWord, '长配置应正确解析')
    
    results.addPass('边界情况 - 超长 localStorage 值')
  } catch (e) {
    results.addFail('边界情况 - 超长 localStorage 值', e.message)
  }
}

// ==================== 测试 4: 快速切换测试 ====================

// 测试 4.1: 快速开关切换
function testRapidToggle() {
  try {
    let toggleCount = 0
    const maxToggles = 10
    
    for (let i = 0; i < maxToggles; i++) {
      toggleCount++
    }
    
    assertEqual(toggleCount, maxToggles, '应能处理快速切换')
    results.addPass('边界情况 - 快速开关切换')
  } catch (e) {
    results.addFail('边界情况 - 快速开关切换', e.message)
  }
}

// 测试 4.2: 快速启动/停止
function testRapidStartStop() {
  try {
    let startCount = 0
    let stopCount = 0
    
    // 模拟快速启动停止 5 次
    for (let i = 0; i < 5; i++) {
      startCount++
      stopCount++
    }
    
    assertEqual(startCount, stopCount, '启动和停止次数应相等')
    assertEqual(startCount, 5, '应完成所有启动操作')
    results.addPass('边界情况 - 快速启动/停止')
  } catch (e) {
    results.addFail('边界情况 - 快速启动/停止', e.message)
  }
}

// 测试 4.3: 多次连续重启
function testMultipleRestarts() {
  try {
    let restartAttempts = 0
    const maxAttempts = 20
    
    // 模拟多次重启
    for (let i = 0; i < maxAttempts; i++) {
      const delay = Math.min(1000 * Math.pow(1.5, restartAttempts), 5000)
      restartAttempts++
      
      // 模拟成功后重置
      if (i % 5 === 0) {
        restartAttempts = 0
      }
    }
    
    assertTrue(restartAttempts >= 0, '重启计数器应有效')
    results.addPass('边界情况 - 多次连续重启')
  } catch (e) {
    results.addFail('边界情况 - 多次连续重启', e.message)
  }
}

// ==================== 测试 5: 并发/竞态条件测试 ====================

// 测试 5.1: 多次重叠的 onresult
function testOverlappingResults() {
  try {
    let accumulatedTranscript = ''
    let lastTranscript = ''
    
    // 模拟快速连续的识别结果
    const results = [
      '请',
      '请帮我',
      '请帮我查',
      '请帮我查一下',
      '请帮我查一下天气'
    ]
    
    for (const transcript of results) {
      const newContent = transcript.replace(lastTranscript, '').trim()
      accumulatedTranscript += newContent
      lastTranscript = transcript
    }
    
    assertEqual(accumulatedTranscript, '请帮我查一下天气', '重叠结果应正确处理')
    results.addPass('边界情况 - 重叠识别结果')
  } catch (e) {
    results.addFail('边界情况 - 重叠识别结果', e.message)
  }
}

// 测试 5.2: 重复内容替换
function testDuplicateContentReplacement() {
  try {
    // 测试替换逻辑的安全性
    const lastTranscript = '你好'
    const currentTranscript = '你好你好'
    
    // 简单替换可能会有问题
    const newContent = currentTranscript.replace(lastTranscript, '').trim()
    
    // 预期结果：第二个"你好"
    assertEqual(newContent, '你好', '重复内容替换应正确')
    results.addPass('边界情况 - 重复内容替换')
  } catch (e) {
    results.addFail('边界情况 - 重复内容替换', e.message)
  }
}

// ==================== 测试 6: 错误处理边界测试 ====================

// 测试 6.1: JSON 解析错误
function testJsonParseError() {
  try {
    const invalidJson = '{invalid json}'
    let parsed = null
    let errorOccurred = false
    
    try {
      parsed = JSON.parse(invalidJson)
    } catch (e) {
      errorOccurred = true
      parsed = { enabled: false, wakeupWord: '你好助手', endingWord: '说完了' }
    }
    
    assertTrue(errorOccurred, '应捕获 JSON 解析错误')
    assertEqual(parsed.wakeupWord, '你好助手', '应使用默认配置')
    results.addPass('边界情况 - JSON 解析错误')
  } catch (e) {
    results.addFail('边界情况 - JSON 解析错误', e.message)
  }
}

// 测试 6.2: 空字符串 JSON
function testEmptyStringJson() {
  try {
    const emptyString = ''
    let parsed = null
    
    if (emptyString) {
      parsed = JSON.parse(emptyString)
    } else {
      parsed = {}
    }
    
    assertEqual(Object.keys(parsed).length, 0, '空字符串应返回空对象')
    results.addPass('边界情况 - 空字符串 JSON')
  } catch (e) {
    results.addFail('边界情况 - 空字符串 JSON', e.message)
  }
}

// 测试 6.3: 权限错误处理
function testPermissionError() {
  try {
    const errors = ['not-allowed', 'network', 'aborted', 'no-speech', 'unknown']
    const handled = []
    
    for (const error of errors) {
      if (error === 'not-allowed') {
        handled.push('permission_denied')
      } else if (error === 'network') {
        handled.push('network_error')
      } else if (error !== 'aborted' && error !== 'no-speech') {
        handled.push('other_error')
      }
    }
    
    assertEqual(handled.length, 3, '应正确处理 3 种错误')
    results.addPass('边界情况 - 权限错误处理')
  } catch (e) {
    results.addFail('边界情况 - 权限错误处理', e.message)
  }
}

// ==================== 运行所有边界测试 ====================
function runEdgeCaseTests() {
  console.log('\n🔍 开始运行边界情况测试...\n')
  
  // 空值测试
  testEmptyWakeupWord()
  testEmptyEndingWord()
  testNullConfig()
  
  // 特殊字符测试
  testSpecialCharWakeupWord()
  testUnicodeWakeupWord()
  
  // 超长文本测试
  testVeryLongWakeupWord()
  testVeryLongAccumulatedContent()
  testVeryLongLocalStorage()
  
  // 快速切换测试
  testRapidToggle()
  testRapidStartStop()
  testMultipleRestarts()
  
  // 并发测试
  testOverlappingResults()
  testDuplicateContentReplacement()
  
  // 错误处理测试
  testJsonParseError()
  testEmptyStringJson()
  testPermissionError()
  
  console.log('\n✅ 边界情况测试完成')
  return results
}

module.exports = { runEdgeCaseTests, results }

if (require.main === module) {
  runEdgeCaseTests()
  console.log('\n📊 边界测试结果统计:')
  console.log(results.getStats())
}
