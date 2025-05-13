---
title: 测试与运维
---

# Python DevOps 与运维详解

## 1.1 主题简介
Python 在 DevOps 和自动化运维领域应用广泛，支持自动化脚本、远程管理、CI/CD、监控、容器编排等。

---

## 1.2 DevOps 基础
- DevOps 是开发（Development）与运维（Operations）的结合，强调自动化、持续集成、持续交付、协作与监控。
- 目标：提升交付效率、降低故障率、加快响应速度。

---

## 1.3 自动化运维常用库
### 1.3.1 os、subprocess —— 系统与进程管理
```python
import os, subprocess
os.system('ls')
subprocess.run(['ls', '-l'])
```
### 1.3.2 paramiko —— SSH 远程运维
```python
import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('host', username='user', password='pwd')
stdin, stdout, stderr = ssh.exec_command('ls')
print(stdout.read().decode())
```
### 1.3.3 fabric —— 批量远程运维
```python
from fabric import Connection
c = Connection('host')
c.run('ls')
```
### 1.3.4 psutil —— 系统监控
```python
import psutil
print(psutil.cpu_percent(), psutil.virtual_memory())
```
### 1.3.5 docker-py —— 容器管理
```python
import docker
client = docker.from_env()
for c in client.containers.list():
    print(c.name)
```
### 1.3.6 requests —— 接口自动化
```python
import requests
r = requests.get('https://api.github.com')
print(r.json())
```

---

## 1.4 CI/CD 持续集成与交付
- Jenkins：主流开源 CI 工具，支持流水线、插件丰富。
- GitHub Actions：云原生 CI/CD，支持自动化测试、部署。
- Python 可用于编写自定义构建、测试、部署脚本。

---

## 1.5 配置管理与自动化
- Ansible：基于 SSH 的自动化运维工具，支持批量配置、部署。
- SaltStack：支持大规模集群管理。
- Python 可自定义模块、扩展自动化能力。

---

## 1.6 日志与监控
- 日志采集：logging、ELK（Elasticsearch、Logstash、Kibana）。
- 监控告警：psutil、Prometheus、Grafana、Zabbix。
- Python 可实现自定义监控脚本、自动告警。

---

## 1.7 自动化测试
- pytest、unittest：单元测试、集成测试。
- requests/selenium：接口与端到端自动化测试。

---

## 1.8 容器与云原生
- docker-py：管理 Docker 容器。
- kubernetes-client：K8s 集群自动化。
- 云平台 API：AWS boto3、Aliyun SDK。

---

## 1.9 典型案例
### 1.9.1 自动化部署脚本
```python
import os
os.system('git pull && systemctl restart myapp')
```
### 1.9.2 远程批量执行命令
```python
from fabric import Connection
hosts = ['host1', 'host2']
for h in hosts:
    c = Connection(h)
    c.run('uptime')
```
### 1.9.3 监控并自动重启服务
```python
import psutil, os, time
while True:
    if 'nginx' not in [p.name() for p in psutil.process_iter()]:
        os.system('systemctl start nginx')
    time.sleep(60)
```
### 1.9.4 自动化测试与报告
```python
import pytest
pytest.main(['--html=report.html'])
```

---

## 1.10 常见问题与解决
- SSH 连接失败：检查主机、端口、防火墙、密钥。
- 权限不足：用 sudo 或调整权限。
- 依赖冲突：用虚拟环境隔离。
- 日志丢失：用文件日志或集中采集。
- 容器管理失败：检查 Docker/K8s 版本与权限。

## 1.11 最佳实践
- 自动化脚本加日志、异常处理、参数校验。
- 配置、密钥、敏感信息用环境变量管理。
- 用虚拟环境隔离依赖，定期更新。
- 监控与告警自动化，及时发现故障。
- 代码、脚本、配置纳入版本管理。

## 1.12 JSDoc 注释示例
```python
# @param host {str} 主机名
# @param cmd {str} 命令
# @returns {str} 执行结果

def remote_exec(host, cmd):
    """
    远程执行命令
    :param host: 主机名
    :type host: str
    :param cmd: 命令
    :type cmd: str
    :return: 执行结果
    :rtype: str
    """
    from fabric import Connection
    c = Connection(host)
    r = c.run(cmd, hide=True)
    return r.stdout
```

## 1.13 相关资源
- [paramiko 官方文档](https://www.paramiko.org/)
- [fabric 官方文档](https://docs.fabfile.org/)
- [psutil 官方文档](https://psutil.readthedocs.io/)
- [docker-py 官方文档](https://docker-py.readthedocs.io/)
- [Jenkins 官方文档](https://www.jenkins.io/zh/doc/)
- [Ansible 官方文档](https://docs.ansible.com/)
- [pytest 官方文档](https://docs.pytest.org/zh/latest/)

---

> DevOps 与自动化运维重在实践，建议多用主流工具和库，注意安全与合规。

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