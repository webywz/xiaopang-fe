---
title: 测试与运维
---

# Python 测试与运维

## 目录
- 单元测试（unittest/pytest）
- 自动化运维（fabric/ansible）
- CI/CD 持续集成与部署
- 日志与监控
- 常用工具与脚本
- 常见坑与最佳实践
- FAQ
- 扩展阅读

## 单元测试（unittest/pytest）
- unittest 为标准库，pytest 更强大，支持参数化、夹具、自动发现
```python
import unittest
class TestAdd(unittest.TestCase):
    def test_add(self):
        self.assertEqual(1+1, 2)

if __name__ == '__main__':
    unittest.main()
```
- pytest 示例：
```python
def add(a, b):
    return a + b

def test_add():
    assert add(1, 2) == 3
```
- 推荐用 pytest 进行自动化测试，支持覆盖率、并发、mock

## 自动化运维（fabric/ansible）
- fabric：远程命令执行、批量部署、自动化脚本
```python
from fabric import Connection
c = Connection('localhost')
c.run('ls')
```
- ansible：无 agent，适合大规模自动化，支持 playbook、模块化
- 常见场景：批量发布、远程备份、配置管理、自动化巡检

## CI/CD 持续集成与部署
- 常用工具：GitHub Actions、Jenkins、GitLab CI、Travis CI
- 典型流程：代码提交 → 自动测试 → 构建打包 → 自动部署
- Python 项目可用 tox/nox 做多版本测试
- 推荐用 Docker 容器化部署

## 日志与监控
- logging 标准库，支持多级日志、文件输出、格式化
```python
import logging
logging.basicConfig(level=logging.INFO, filename='app.log')
logging.info('启动服务')
```
- 推荐用 ELK、Prometheus、Grafana 做监控和告警

## 常用工具与脚本
- supervisor、pm2：进程守护
- crontab：定时任务
- rsync/scp：文件同步
- curl/httpie：接口测试

## 常见坑与最佳实践
- 测试用例要覆盖边界和异常
- 自动化脚本建议加日志和异常处理
- CI/CD 流程建议加自动回滚
- 运维脚本建议用虚拟环境隔离依赖
- 生产环境配置与密钥不要写死在代码里

## FAQ
- Q: pytest 如何只运行部分测试？
  A: `pytest test_x.py::test_func`
- Q: 如何生成测试覆盖率报告？
  A: `pytest --cov=src`
- Q: fabric/ansible 如何批量执行命令？
  A: fabric 用 for 循环，ansible 用 hosts 列表

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

## 扩展阅读
- [unittest 官方文档](https://docs.python.org/zh-cn/3/library/unittest.html)
- [pytest 官方文档](https://docs.pytest.org/zh/latest/)
- [fabric 官方文档](https://www.fabfile.org/)
- [ansible 官方文档](https://docs.ansible.com/)
- [GitHub Actions 文档](https://docs.github.com/actions)
- [Python logging 文档](https://docs.python.org/zh-cn/3/library/logging.html)

---

> 建议每个项目都编写单元测试，结合 CI/CD 自动化流程，生产环境注意日志、监控和配置安全。 