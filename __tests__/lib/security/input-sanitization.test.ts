// Tests for Input Sanitization
// Comprehensive testing of XSS and NoSQL injection protection

import {
  XSSProtection,
  NoSQLProtection,
  RequestSanitizer,
  FileValidator,
} from '@/lib/security/input-sanitization'

describe('XSSProtection', () => {
  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      const input = '<script>alert("XSS")</script>'
      const result = XSSProtection.escapeHtml(input)
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;')
    })

    it('should escape ampersands', () => {
      expect(XSSProtection.escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
    })

    it('should escape quotes', () => {
      expect(XSSProtection.escapeHtml('He said "Hello"')).toContain('&quot;')
    })
  })

  describe('sanitize', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("XSS")</script>Hello'
      const result = XSSProtection.sanitize(input)
      expect(result).not.toContain('<script>')
      expect(result).toContain('Hello')
    })

    it('should remove iframe tags', () => {
      const input = '<iframe src="evil.com"></iframe>Content'
      const result = XSSProtection.sanitize(input)
      expect(result).not.toContain('<iframe>')
    })

    it('should remove javascript: protocol', () => {
      const input = '<a href="javascript:alert()">Click</a>'
      const result = XSSProtection.sanitize(input)
      expect(result).not.toContain('javascript:')
    })

    it('should remove event handlers', () => {
      const input = '<div onclick="alert()">Click</div>'
      const result = XSSProtection.sanitize(input)
      expect(result).not.toContain('onclick=')
    })
  })

  describe('sanitizeObject', () => {
    it('should sanitize strings in objects', () => {
      const input = {
        name: '<script>alert()</script>John',
        email: 'test@example.com',
      }
      const result = XSSProtection.sanitizeObject(input)
      expect(result.name).not.toContain('<script>')
      expect(result.name).toContain('John')
      expect(result.email).toBe('test@example.com')
    })

    it('should sanitize nested objects', () => {
      const input = {
        user: {
          name: '<script>alert()</script>',
        },
      }
      const result = XSSProtection.sanitizeObject(input)
      expect(result.user.name).not.toContain('<script>')
    })

    it('should sanitize arrays', () => {
      const input = ['<script>alert()</script>', 'safe']
      const result = XSSProtection.sanitizeObject(input)
      expect(result[0]).not.toContain('<script>')
      expect(result[1]).toBe('safe')
    })
  })
})

describe('NoSQLProtection', () => {
  describe('hasInjectionPattern', () => {
    it('should detect $gt operator', () => {
      const input = { $gt: 0 }
      expect(NoSQLProtection.hasInjectionPattern(input)).toBe(true)
    })

    it('should detect $ne operator', () => {
      const input = { password: { $ne: null } }
      expect(NoSQLProtection.hasInjectionPattern(input)).toBe(true)
    })

    it('should detect $regex operator', () => {
      const input = { email: { $regex: '.*' } }
      expect(NoSQLProtection.hasInjectionPattern(input)).toBe(true)
    })

    it('should not flag safe objects', () => {
      const input = { email: 'test@example.com', age: 25 }
      expect(NoSQLProtection.hasInjectionPattern(input)).toBe(false)
    })

    it('should detect nested operators', () => {
      const input = {
        user: {
          email: { $ne: null },
        },
      }
      expect(NoSQLProtection.hasInjectionPattern(input)).toBe(true)
    })
  })

  describe('sanitizeQuery', () => {
    it('should remove dangerous operators', () => {
      const input = {
        email: 'test@example.com',
        password: { $ne: null },
      }
      const result = NoSQLProtection.sanitizeQuery(input)
      expect(result.email).toBe('test@example.com')
      expect(result.password).toBeUndefined()
    })

    it('should sanitize string values', () => {
      const input = {
        name: '<script>alert()</script>John',
      }
      const result = NoSQLProtection.sanitizeQuery(input)
      expect(result.name).not.toContain('<script>')
    })
  })
})

describe('FileValidator', () => {
  describe('validate', () => {
    it('should accept valid image files', () => {
      const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' })
      const result = FileValidator.validate(file)
      expect(result.valid).toBe(true)
    })

    it('should accept valid PDF files', () => {
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' })
      const result = FileValidator.validate(file)
      expect(result.valid).toBe(true)
    })

    it('should reject files that are too large', () => {
      const largeContent = new Uint8Array(11 * 1024 * 1024) // 11MB
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' })
      const result = FileValidator.validate(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('size')
    })

    it('should reject disallowed MIME types', () => {
      const file = new File(['content'], 'script.exe', { type: 'application/x-msdownload' })
      const result = FileValidator.validate(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('type not allowed')
    })

    it('should reject disallowed extensions', () => {
      const file = new File(['content'], 'script.js', { type: 'text/plain' })
      const result = FileValidator.validate(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('extension not allowed')
    })
  })
})
