/**
 * 语音唤醒功能测试套件
 * ClawApp Voice Wakeup Test Suite
 */

// ==================== 测试配置 ====================
const TEST_CONFIG = {
  WAKEUP_WORD: '你好助手',
  ENDING_WORD: '说完了',
  MAX_RESTART_ATTEMPTS: 10,
  MAX_DELAY: 5000
}

// ==================== 模拟环境 ====================
// 模拟 localStorage
global.localStorage = {
  _data: {},
  getItem(key) { return this._data[key] || null },
  setItem(key, value) { this._data[key] = value },
  removeItem(key) { delete this._data[key] },
  clear() { this._data = {} }
}

// 模拟 window 对象
global.window = {
  SpeechRecognition: class MockSpeechRecognition {
    constructor() {
      this.lang = ''
      this.interimResults = false
      this.continuous = false
      this.onstart = null
      this.onend = null
      this.onerror = null
      this.onresult = null
      this._started = false
    }
    start() { 
      this._started = true
      setTimeout(() => this.onstart?.(), 0)
    }
    stop() { 
      this._started = false
      setTimeout(() => this.onend?.(), 0)
    }
  },
  webkitSpeechRecognition: class MockWebkitSpeechRecognition {
    constructor() {
      this.lang = ''
      this.interimResults = false
      this.continuous = false
      this.onstart = null
      this.onend = null
      this.onerror = null
      this.onresult = null
      this._started = false
    }
    start() { 
      this._started = true
      setTimeout(() => this.onstart?.(), 0)
    }
    stop() { 
      this._started = false
      setTimeout(() => this.onend?.(), 0)
    }
  },
  location: {
    protocol: 'https:',
    hostname: 'localhost'
  },
  navigator: {
    language: 'zh-CN',
    mediaDevices: {
      async getUserMedia() {
        return { getTracks: () => [{ stop: () => {} }] }
      }
    },
    permissions: {
      async query() {
        return { state: 'granted' }
      }
    }
  }
}

global.location = global.window.location
global.navigator = global.window.navigator

// 模拟 document
global.document = {
  createElement(tag) {
    return {
      tagName: tag,
      className: '',
      innerHTML: '',
      textContent: '',
      style: {},
      dataset: {},
      children: [],
      parentElement: null,
      querySelector: () => null,
      querySelectorAll: () => [],
      appendChild: function(child) { this.children.push(child) },
      remove: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      click: () => {},
      focus: () => {},
      blur: () => {}
    }
  },
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  body: {
    appendChild: () => {},
    removeChild: () => {}
  },
  documentElement: {
    dataset: {}
  }
}

// 模拟 console
global.console = {
  log: () => {},
  error: () => {},
  warn: () => {}
}

// 模拟 setTimeout/clearTimeout
const timeouts = []
global.setTimeout = (fn, delay) => {
  const id = timeouts.length + 1
  timeouts.push({ id, fn, delay, executed: false })
  return id
}
global.clearTimeout = (id) => {
  const timeout = timeouts.find(t => t.id === id)
  if (timeout) timeout.executed = true
}

// ==================== 测试结果收集器 ====================
class TestResults {
  constructor() {
    this.passed = []
    this.failed = []
    this.errors = []
  }

  addPass(testName) {
    this.passed.push({ name: testName, status: 'PASS' })
  }

  addFail(testName, reason) {
    this.failed.push({ name: testName, status: 'FAIL', reason })
  }

  addError(testName, error) {
    this.errors.push({ name: testName, status: 'ERROR', error: error.message })
  }

  getStats() {
    return {
      total: this.passed.length + this.failed.length + this.errors.length,
      passed: this.passed.length,
      failed: this.failed.length,
      errors: this.errors.length,
      passRate: ((this.passed.length / (this.passed.length + this.failed.length + this.errors.length)) * 100).toFixed(1)
    }
  }
}

const results = new TestResults()

// ==================== 断言工具 ====================
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`)
  }
}

function assertTrue(value, message) {
  if (value !== true) {
    throw new Error(`${message}: expected true, got ${value}`)
  }
}

function assertFalse(value, message) {
  if (value !== false) {
    throw new Error(`${message}: expected false, got ${value}`)
  }
}

function assertNotNull(value, message) {
  if (value === null || value === undefined) {
    throw new Error(`${message}: expected non-null value`)
  }
}

function assertThrows(fn, message) {
  let threw = false
  try {
    fn()
  } catch (e) {
    threw = true
  }
  if (!threw) {
    throw new Error(`${message}: expected function to throw`)
  }
}

// ==================== 导出测试结果 ====================
module.exports = {
  TEST_CONFIG,
  results,
  assertEqual,
  assertTrue,
  assertFalse,
  assertNotNull,
  assertThrows
}
