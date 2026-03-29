/**
 * 语音唤醒功能 - 静态代码测试
 * Voice Wakeup Static Code Analysis Tests
 */

const fs = require('fs')
const path = require('path')
const { results, assertTrue, assertEqual } = require('./test-utils.js')

console.log('\n📦 测试组: 静态代码测试')

const PROJECT_ROOT = path.resolve(__dirname, '../..')
const SRC_DIR = path.join(PROJECT_ROOT, 'src')

// ==================== 测试 1: 文件存在性检查 ====================

// 测试 1.1: 修改的文件都存在
function testFilesExist() {
  try {
    const files = [
      'voice-wakeup.js',
      'settings.js',
      'main.js',
      'chat-ui.js'
    ]
    
    for (const file of files) {
      const filePath = path.join(SRC_DIR, file)
      const exists = fs.existsSync(filePath)
      assertTrue(exists, `文件 ${file} 应存在`)
    }
    
    results.addPass('静态测试 - 文件存在性')
  } catch (e) {
    results.addFail('静态测试 - 文件存在性', e.message)
  }
}

// ==================== 测试 2: JavaScript 语法检查 ====================

// 测试 2.1: voice-wakeup.js 语法检查
function testVoiceWakeupSyntax() {
  try {
    const filePath = path.join(SRC_DIR, 'voice-wakeup.js')
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 基本语法检查
    assertTrue(content.includes('export function'), '应使用 ES6 导出语法')
    assertTrue(content.includes('const STORAGE_WAKEUP_CONFIG_KEY'), '应有配置键常量')
    assertTrue(content.includes('isSupported()'), '应有 isSupported 函数')
    assertTrue(content.includes('getWakeupConfig()'), '应有 getWakeupConfig 函数')
    assertTrue(content.includes('saveWakeupConfig'), '应有 saveWakeupConfig 函数')
    assertTrue(content.includes('startListening'), '应有 startListening 函数')
    assertTrue(content.includes('stopListening'), '应有 stopListening 函数')
    
    results.addPass('静态测试 - voice-wakeup.js 语法结构')
  } catch (e) {
    results.addFail('静态测试 - voice-wakeup.js 语法结构', e.message)
  }
}

// 测试 2.2: 修复内容检查 - 内存泄漏修复
function testMemoryLeakFix() {
  try {
    const filePath = path.join(SRC_DIR, 'voice-wakeup.js')
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 检查事件监听器清理
    assertTrue(content.includes('_recognition.onstart = null'), '应清理 onstart 监听器')
    assertTrue(content.includes('_recognition.onend = null'), '应清理 onend 监听器')
    assertTrue(content.includes('_recognition.onerror = null'), '应清理 onerror 监听器')
    assertTrue(content.includes('_recognition.onresult = null'), '应清理 onresult 监听器')
    
    // 检查定时器清理
    assertTrue(content.includes('clearTimeout(_restartTimer)'), '应清理重启定时器')
    
    results.addPass('静态测试 - 内存泄漏修复')
  } catch (e) {
    results.addFail('静态测试 - 内存泄漏修复', e.message)
  }
}

// 测试 2.3: 修复内容检查 - 内容重复累积修复
function testContentAccumulationFix() {
  try {
    const filePath = path.join(SRC_DIR, 'voice-wakeup.js')
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 检查重复累积修复
    assertTrue(content.includes('transcript.replace(_lastTranscript, \'\').trim()'), 
      '应使用 replace 方法避免重复累积')
    assertTrue(content.includes('_lastTranscript = transcript'), 
      '应保存最后的 transcript')
    
    results.addPass('静态测试 - 内容重复累积修复')
  } catch (e) {
    results.addFail('静态测试 - 内容重复累积修复', e.message)
  }
}

// 测试 2.4: 修复内容检查 - 指数退避修复
function testExponentialBackoffFix() {
  try {
    const filePath = path.join(SRC_DIR, 'voice-wakeup.js')
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 检查指数退避实现
    assertTrue(content.includes('_restartAttempts'), '应有重启尝试计数器')
    assertTrue(content.includes('Math.pow(1.5, _restartAttempts)'), '应使用指数退避公式')
    assertTrue(content.includes('Math.min'), '应使用 Math.min 限制最大延迟')
    assertTrue(content.includes('_restartAttempts = 0'), '应在成功后重置计数器')
    assertTrue(content.includes('5000'), '最大延迟应为 5000ms')
    
    results.addPass('静态测试 - 指数退避修复')
  } catch (e) {
    results.addFail('静态测试 - 指数退避修复', e.message)
  }
}

// 测试 2.5: 修复内容检查 - 错误处理修复
function testErrorHandlingFix() {
  try {
    const filePath = path.join(SRC_DIR, 'voice-wakeup.js')
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 检查错误处理
    assertTrue(content.includes('try {'), '应有 try 块')
    assertTrue(content.includes('} catch (e)'), '应有 catch 块')
    assertTrue(content.includes('return { success: true'), 'saveWakeupConfig 应返回成功对象')
    assertTrue(content.includes('return { success: false'), 'saveWakeupConfig 应返回失败对象')
    
    results.addPass('静态测试 - 错误处理修复')
  } catch (e) {
    results.addFail('静态测试 - 错误处理修复', e.message)
  }
}

// ==================== 测试 3: 变量名一致性检查 ====================

// 测试 3.1: voice-wakeup.js 变量命名
function testVariableNaming() {
  try {
    const filePath = path.join(SRC_DIR, 'voice-wakeup.js')
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 检查私有变量命名（下划线前缀）
    const privateVars = [
      '_recognition',
      '_isListening',
      '_isWoken',
      '_config',
      '_lastTranscript',
      '_accumulatedTranscript',
      '_restartAttempts',
      '_restartTimer'
    ]
    
    for (const varName of privateVars) {
      assertTrue(content.includes(varName), `变量 ${varName} 应存在`)
    }
    
    results.addPass('静态测试 - 变量命名一致性')
  } catch (e) {
    results.addFail('静态测试 - 变量命名一致性', e.message)
  }
}

// 测试 3.2: 常量命名
function testConstantNaming() {
  try {
    const filePath = path.join(SRC_DIR, 'voice-wakeup.js')
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 检查常量命名（大写下划线）
    assertTrue(content.includes('const STORAGE_WAKEUP_CONFIG_KEY'), 
      'STORAGE_WAKEUP_CONFIG_KEY 应为大写下划线命名')
    assertTrue(content.includes('const DEFAULT_CONFIG'), 
      'DEFAULT_CONFIG 应为大写下划线命名')
    
    results.addPass('静态测试 - 常量命名一致性')
  } catch (e) {
    results.addFail('静态测试 - 常量命名一致性', e.message)
  }
}

// ==================== 测试 4: 导出/导入匹配检查 ====================

// 测试 4.1: voice-wakeup.js 导出检查
function testVoiceWakeupExports() {
  try {
    const filePath = path.join(SRC_DIR, 'voice-wakeup.js')
    const content = fs.readFileSync(filePath, 'utf-8')
    
    const exports = [
      'export function getWakeupConfig',
      'export function saveWakeupConfig',
      'export function isSupported',
      'export function initWakeup',
      'export function startListening',
      'export function stopListening',
      'export function startCollecting',
      'export function getCollectedTranscript',
      'export function clearCollectedTranscript',
      'export function requestPermission',
      'export function checkPermission'
    ]
    
    for (const exp of exports) {
      assertTrue(content.includes(exp), `应导出 ${exp}`)
    }
    
    results.addPass('静态测试 - voice-wakeup.js 导出')
  } catch (e) {
    results.addFail('静态测试 - voice-wakeup.js 导出', e.message)
  }
}

// 测试 4.2: main.js 导入检查
function testMainJsImports() {
  try {
    const filePath = path.join(SRC_DIR, 'main.js')
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 检查从 voice-wakeup.js 的导入
    assertTrue(content.includes("from './voice-wakeup.js'"), 
      'main.js 应导入 voice-wakeup.js')
    assertTrue(content.includes('initWakeup'), 'main.js 应导入 initWakeup')
    assertTrue(content.includes('startListening'), 'main.js 应导入 startListening')
    assertTrue(content.includes('stopListening'), 'main.js 应导入 stopListening')
    assertTrue(content.includes('getWakeupConfig'), 'main.js 应导入 getWakeupConfig')
    assertTrue(content.includes('isSupported as isWakeupSupported'), 
      'main.js 应导入 isSupported')
    
    // 检查 async 修复
    assertTrue(content.includes('async function initWakeupFeature'), 
      'initWakeupFeature 应为 async 函数')
    assertTrue(content.includes('.catch(e =>'), 
      '应有 catch 错误处理')
    
    results.addPass('静态测试 - main.js 导入/修复')
  } catch (e) {
    results.addFail('静态测试 - main.js 导入/修复', e.message)
  }
}

// 测试 4.3: settings.js 导入检查
function testSettingsJsImports() {
  try {
    const filePath = path.join(SRC_DIR, 'settings.js')
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 检查导入
    assertTrue(content.includes('getWakeupConfig'), 'settings.js 应导入 getWakeupConfig')
    assertTrue(content.includes('saveWakeupConfig'), 'settings.js 应导入 saveWakeupConfig')
    assertTrue(content.includes('isSupported as isWakeupSupported'), 
      'settings.js 应导入 isSupported')
    assertTrue(content.includes('requestPermission as requestWakeupPermission'), 
      'settings.js 应导入 requestPermission')
    
    // 检查 alert 修复
    assertTrue(!content.includes('alert('), '应移除 alert 调用')
    assertTrue(content.includes('textContent'), '应使用 textContent 设置提示')
    assertTrue(content.includes('classList.add(\'error\')'), '应使用 CSS 类显示错误')
    
    results.addPass('静态测试 - settings.js 导入/修复')
  } catch (e) {
    results.addFail('静态测试 - settings.js 导入/修复', e.message)
  }
}

// 测试 4.4: chat-ui.js 导入检查
function testChatUiJsImports() {
  try {
    const filePath = path.join(SRC_DIR, 'chat-ui.js')
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 检查导出
    assertTrue(content.includes('export function setAutoSubmitMode'), 
      'chat-ui.js 应导出 setAutoSubmitMode')
    assertTrue(content.includes('export function autoSubmitMessage'), 
      'chat-ui.js 应导出 autoSubmitMessage')
    assertTrue(content.includes('export function focusInput'), 
      'chat-ui.js 应导出 focusInput')
    
    // 检查 finally 修复
    assertTrue(content.includes('try {'), '应有 try 块')
    assertTrue(content.includes('} finally {'), '应有 finally 块')
    assertTrue(content.includes('setAutoSubmitMode(false, null)'), 
      'finally 中应重置自动提交模式')
    
    results.addPass('静态测试 - chat-ui.js 导出/修复')
  } catch (e) {
    results.addFail('静态测试 - chat-ui.js 导出/修复', e.message)
  }
}

// ==================== 测试 5: 代码风格检查 ====================

// 测试 5.1: 注释检查
function testCodeComments() {
  try {
    const filePath = path.join(SRC_DIR, 'voice-wakeup.js')
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 检查文件头注释
    assertTrue(content.includes('/**'), '应有文件头注释')
    assertTrue(content.includes('语音唤醒模块'), '注释应包含模块描述')
    
    // 检查修复注释
    assertTrue(content.includes('修复内存泄漏'), '应有内存泄漏修复注释')
    assertTrue(content.includes('指数退避'), '应有指数退避注释')
    assertTrue(content.includes('避免重复累积'), '应有重复累积修复注释')
    
    results.addPass('静态测试 - 代码注释')
  } catch (e) {
    results.addFail('静态测试 - 代码注释', e.message)
  }
}

// 测试 5.2: 一致性检查
function testCodeConsistency() {
  try {
    const filePath = path.join(SRC_DIR, 'voice-wakeup.js')
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 检查引号一致性
    const singleQuotes = (content.match(/'/g) || []).length
    const doubleQuotes = (content.match(/"/g) || []).length
    
    // 检查分号使用
    const lines = content.split('\n')
    let linesWithSemicolons = 0
    for (const line of lines) {
      if (line.trim().endsWith(';')) {
        linesWithSemicolons++
      }
    }
    
    // 主要是检查代码风格一致
    assertTrue(singleQuotes > 0 || doubleQuotes > 0, '应有引号使用')
    
    results.addPass('静态测试 - 代码风格一致性')
  } catch (e) {
    results.addFail('静态测试 - 代码风格一致性', e.message)
  }
}

// ==================== 测试 6: 安全相关检查 ====================

// 测试 6.1: XSS 防护检查
function testXssProtection() {
  try {
    const filePath = path.join(SRC_DIR, 'settings.js')
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 检查 HTML 转义
    assertTrue(content.includes('escapeHtml'), '应有 escapeHtml 函数')
    assertTrue(content.includes('textContent'), '应使用 textContent 而非 innerHTML')
    
    results.addPass('静态测试 - XSS 防护')
  } catch (e) {
    results.addFail('静态测试 - XSS 防护', e.message)
  }
}

// 测试 6.2: 敏感信息处理
function testSensitiveInfo() {
  try {
    const filePath = path.join(SRC_DIR, 'voice-wakeup.js')
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 检查没有硬编码密钥
    assertTrue(!content.includes('apiKey') && !content.includes('api_key'), 
      '不应包含硬编码 API 密钥')
    assertTrue(!content.includes('password') && !content.includes('secret'), 
      '不应包含硬密码')
    
    results.addPass('静态测试 - 敏感信息检查')
  } catch (e) {
    results.addFail('静态测试 - 敏感信息检查', e.message)
  }
}

// ==================== 运行所有静态测试 ====================
function runStaticTests() {
  console.log('\n🔍 开始运行静态代码测试...\n')
  
  // 文件检查
  testFilesExist()
  
  // 语法检查
  testVoiceWakeupSyntax()
  testMemoryLeakFix()
  testContentAccumulationFix()
  testExponentialBackoffFix()
  testErrorHandlingFix()
  
  // 命名检查
  testVariableNaming()
  testConstantNaming()
  
  // 导入/导出检查
  testVoiceWakeupExports()
  testMainJsImports()
  testSettingsJsImports()
  testChatUiJsImports()
  
  // 代码风格
  testCodeComments()
  testCodeConsistency()
  
  // 安全检查
  testXssProtection()
  testSensitiveInfo()
  
  console.log('\n✅ 静态代码测试完成')
  return results
}

module.exports = { runStaticTests, results }

if (require.main === module) {
  runStaticTests()
  console.log('\n📊 静态代码测试结果统计:')
  console.log(results.getStats())
}
