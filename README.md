# SmartLIS - 智能实验室管理系统

一个现代化的实验室信息管理系统，基于 React + TypeScript + Node.js 构建，提供完整的实验室样本管理、实验流程管理、报告生成和设备管理功能。

## 🚀 项目特性

- **现代化技术栈**：React 18 + TypeScript + Vite + Node.js + Express
- **响应式设计**：基于 Tailwind CSS 的现代化 UI 界面
- **完整的权限系统**：基于角色的访问控制（RBAC）
- **实时数据同步**：支持实时数据更新和状态同步
- **模块化架构**：前后端分离，易于维护和扩展
- **数据库支持**：集成 Supabase 数据库服务

## 📋 功能模块

### 核心功能
- 🧪 **样本管理**：样本登记、追踪、状态管理
- 🔬 **实验管理**：实验流程管理、数据录入、结果追踪
- 📊 **报告系统**：自动化报告生成、模板管理
- 🏥 **设备管理**：设备状态监控、维护记录
- 👥 **用户管理**：用户账户、角色权限管理
- 📈 **数据看板**：实时统计、数据可视化

### 技术特性
- ⚡ **性能优化**：虚拟滚动、数据缓存、防抖搜索
- 🔒 **安全保障**：JWT 认证、权限验证、数据加密
- 📱 **移动适配**：响应式设计，支持移动端访问
- 🌐 **国际化**：多语言支持（中文/英文）

## 🛠️ 技术栈

### 前端
- **框架**：React 18 + TypeScript
- **构建工具**：Vite
- **路由**：React Router v7
- **状态管理**：Zustand
- **UI 框架**：Tailwind CSS + Lucide React
- **表单处理**：React Hook Form
- **数据请求**：Fetch API

### 后端
- **运行时**：Node.js
- **框架**：Express.js + TypeScript
- **数据库**：Supabase (PostgreSQL)
- **认证**：JWT
- **API 文档**：自动生成的 API 文档
- **日志系统**：Winston

## 📦 项目结构

```
smartlis/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/       # 通用组件
│   │   ├── pages/           # 页面组件
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── lib/             # 工具库
│   │   ├── services/        # API 服务
│   │   ├── stores/          # 状态管理
│   │   └── utils/           # 工具函数
│   ├── public/              # 静态资源
│   └── package.json
├── backend/                  # 后端应用
│   ├── api/
│   │   ├── routes/          # API 路由
│   │   ├── middleware/      # 中间件
│   │   ├── config/          # 配置文件
│   │   ├── types/           # 类型定义
│   │   └── utils/           # 工具函数
│   ├── docs/                # API 文档
│   └── package.json
├── supabase/                 # 数据库迁移
│   └── migrations/          # 数据库迁移文件
├── .trae/                    # 项目文档
│   ├── documents/           # 设计文档
│   └── rules/               # 项目规范
├── TASK.md                   # 任务管理
└── README.md                 # 项目说明
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0 或 pnpm >= 8.0.0
- Git

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-org/smartlis.git
cd smartlis

# 安装所有依赖
npm run install:all
# 或使用 pnpm
pnpm install
```

### 环境配置

1. 复制环境变量文件：
```bash
# 后端环境变量
cp backend/.env.example backend/.env

# 前端环境变量
cp frontend/.env.example frontend/.env
```

2. 配置数据库连接和其他环境变量

### 启动开发服务器

```bash
# 同时启动前后端服务
npm run dev

# 或分别启动
npm run dev:frontend  # 前端服务 (http://localhost:5000)
npm run dev:backend   # 后端服务 (http://localhost:3000)
```

### 构建生产版本

```bash
# 构建前后端
npm run build

# 分别构建
npm run build:frontend
npm run build:backend
```

## 📚 开发指南

### 代码规范
- 使用 ESLint + Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- API 接口遵循 RESTful 设计

### 提交规范
```bash
# 功能开发
git commit -m "feat: 添加用户管理功能"

# 问题修复
git commit -m "fix: 修复登录页面样式问题"

# 文档更新
git commit -m "docs: 更新 API 文档"
```

### 测试
```bash
# 运行 ESLint 检查
npm run lint

# 修复 ESLint 问题
npm run lint:fix
```

## 🔧 配置说明

### 前端配置
- **Vite 配置**：`frontend/vite.config.ts`
- **Tailwind 配置**：`frontend/tailwind.config.js`
- **TypeScript 配置**：`frontend/tsconfig.json`

### 后端配置
- **Express 配置**：`backend/api/app.ts`
- **数据库配置**：`backend/api/config/database.ts`
- **TypeScript 配置**：`backend/tsconfig.json`

## 📖 API 文档

启动后端服务后，访问 `http://localhost:3000/api-docs` 查看完整的 API 文档。

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👥 团队

- **项目经理**：Erikwang
- **技术负责人**：Erikwang
- **联系邮箱**：erikwang@smartlis.com

## 🔗 相关链接

- [项目文档](./docs/)
- [API 文档](http://localhost:3000/api-docs)
- [问题反馈](https://github.com/your-org/smartlis/issues)
- [更新日志](./CHANGELOG.md)

---

**最后更新时间**：2025年8月28日  
**版本**：v1.0.0  
**维护者**：SmartLIS 开发团队
