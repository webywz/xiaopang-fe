---
title: 测试与运维
---

# Python 测试与运维

## 目录
- 单元测试（unittest/pytest）
- 自动化运维（fabric/ansible）
- CI/CD
- JSDoc 注释示例

## 单元测试（unittest/pytest）
- unittest 为标准库，pytest 更强大
```python
import unittest
class TestAdd(unittest.TestCase):
    def test_add(self):
        self.assertEqual(1+1, 2)

if __name__ == '__main__':
    unittest.main()
```

## 自动化运维（fabric/ansible）
- fabric 用于远程命令执行，ansible 适合大规模自动化
```python
from fabric import Connection
c = Connection('localhost')
c.run('ls')
```

## CI/CD
- 常用工具：GitHub Actions、Jenkins、GitLab CI
- 可用 Python 脚本实现自动化测试、部署

## JSDoc 注释示例
```python
# @returns {bool} 测试是否通过

def test_add():
    """
    测试加法
    :return: 测试是否通过
    :rtype: bool
    """
    return 1 + 1 == 2
```

---

> 建议每个项目都编写单元测试，并结合 CI/CD 自动化流程。 