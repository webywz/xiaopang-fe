# TypeScript 与主流框架集成

TypeScript已经成为现代前端开发的重要组成部分，几乎所有主流的JavaScript框架都提供了对TypeScript的一流支持。本文将详细介绍TypeScript与React、Vue、Angular和Node.js等主流框架的集成，包括如何开始、最佳实践和高级技巧。

## TypeScript 与 React

React是最流行的前端框架之一，与TypeScript搭配使用可以提供强大的类型安全保障。

### 搭建React+TypeScript项目

使用Create React App快速创建带TypeScript支持的React项目：

```bash
npx create-react-app my-app --template typescript
```

或使用Vite创建：

```bash
npm create vite@latest my-app -- --template react-ts
```

### React组件类型

在TypeScript中定义React组件有几种主要方式：

```typescript
// 函数组件 + React.FC (不推荐，因为它强制children属性)
const Greeting: React.FC<{ name: string }> = ({ name }) => {
  return <h1>Hello, {name}!</h1>;
};

// 函数组件 + 独立Props接口 (推荐)
interface GreetingProps {
  name: string;
  age?: number;
}

const Greeting = ({ name, age }: GreetingProps) => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      {age !== undefined && <p>You are {age} years old</p>}
    </div>
  );
};

// 类组件
interface CounterProps {
  initialCount: number;
}

interface CounterState {
  count: number;
}

class Counter extends React.Component<CounterProps, CounterState> {
  constructor(props: CounterProps) {
    super(props);
    this.state = {
      count: props.initialCount
    };
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}
```

### React Hooks的TypeScript类型

```typescript
// useState
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);

// useRef
const inputRef = useRef<HTMLInputElement>(null);

// useReducer
interface State {
  count: number;
}

type Action = 
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset'; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: action.payload };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0 });

// 使用dispatch
dispatch({ type: 'increment' });
dispatch({ type: 'reset', payload: 0 });

// useContext
const ThemeContext = createContext<'light' | 'dark'>('light');

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// 在子组件中使用
const theme = useContext(ThemeContext);
```

### 事件处理

React事件在TypeScript中有特定的类型：

```typescript
interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button = ({ onClick }: ButtonProps) => (
  <button onClick={onClick}>Click me</button>
);

// 表单事件
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  console.log(event.target.value);
};

// 表单提交
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // 处理表单提交
};

// 键盘事件
const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key === 'Enter') {
    // 处理Enter键
  }
};
```

### 子组件与泛型组件

```typescript
// 子组件类型
interface ContainerProps {
  children: React.ReactNode;
  title: string;
}

const Container = ({ children, title }: ContainerProps) => (
  <div>
    <h2>{title}</h2>
    {children}
  </div>
);

// 泛型组件
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// 使用泛型组件
interface User {
  id: number;
  name: string;
}

const users: User[] = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];

<List
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
/>
```

### React Router

React Router与TypeScript集成：

```typescript
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Link, 
  useParams, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';

// 路由参数类型
interface UserParams {
  userId: string;
}

const UserProfile = () => {
  // 使用泛型指定参数类型
  const { userId } = useParams<UserParams>();
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div>
      <h1>User Profile: {userId}</h1>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  );
};

// 应用路由
const App = () => (
  <BrowserRouter>
    <nav>
      <Link to="/">Home</Link>
      <Link to="/users/1">User 1</Link>
    </nav>
    
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/users/:userId" element={<UserProfile />} />
    </Routes>
  </BrowserRouter>
);
```

## TypeScript 与 Vue.js

Vue.js对TypeScript的支持也非常好，尤其是Vue 3，它的核心代码就是用TypeScript编写的。

### 搭建Vue+TypeScript项目

使用Vue CLI创建TypeScript项目：

```bash
npm install -g @vue/cli
vue create my-vue-app
# 选择"Manually select features"，然后选择TypeScript
```

或使用Vite创建：

```bash
npm create vite@latest my-vue-app -- --template vue-ts
```

### 组件定义

Vue 3提供了多种定义组件的方式：

```typescript
// 选项式API (Options API)
<script lang="ts">
import { defineComponent } from 'vue';

interface User {
  id: number;
  name: string;
}

export default defineComponent({
  name: 'UserProfile',
  props: {
    user: {
      type: Object as () => User,
      required: true
    },
    isAdmin: Boolean
  },
  data() {
    return {
      message: 'Hello' as string
    };
  },
  computed: {
    userDisplayName(): string {
      return `${this.user.name} (ID: ${this.user.id})`;
    }
  },
  methods: {
    updateUser(newName: string): void {
      // 更新用户
    }
  }
});
</script>

// 组合式API (Composition API)
<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';

interface User {
  id: number;
  name: string;
}

// 定义props
const props = defineProps<{
  user: User;
  isAdmin?: boolean;
}>();

// 定义emit
const emit = defineEmits<{
  (e: 'update', id: number, name: string): void;
  (e: 'delete', id: number): void;
}>();

// 响应式状态
const message = ref<string>('Hello');
const count = ref<number>(0);

// 计算属性
const userDisplayName = computed(() => {
  return `${props.user.name} (ID: ${props.user.id})`;
});

// 方法
const increment = () => {
  count.value++;
};

// 事件处理
const handleUpdate = (newName: string) => {
  emit('update', props.user.id, newName);
};
</script>
```

### Pinia (Vue状态管理)

Vue 3的推荐状态管理库Pinia与TypeScript集成：

```typescript
// store/counter.ts
import { defineStore } from 'pinia';

interface CounterState {
  count: number;
  lastUpdated: Date | null;
}

export const useCounterStore = defineStore('counter', {
  state: (): CounterState => ({
    count: 0,
    lastUpdated: null
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
    isPositive: (state) => state.count > 0
  },
  actions: {
    increment() {
      this.count++;
      this.lastUpdated = new Date();
    },
    async fetchInitialCount() {
      try {
        const response = await fetch('/api/count');
        const data = await response.json();
        this.count = data.count;
      } catch (error) {
        console.error('Failed to fetch count:', error);
      }
    }
  }
});

// 在组件中使用
<script setup lang="ts">
import { useCounterStore } from '@/store/counter';

const counter = useCounterStore();

// 访问状态和getters
console.log(counter.count);
console.log(counter.doubleCount);

// 调用actions
counter.increment();
counter.fetchInitialCount();
</script>
```

### Vue Router

Vue Router 4与TypeScript集成：

```typescript
// router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import About from '@/views/About.vue';
import UserProfile from '@/views/UserProfile.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/users/:id',
    name: 'UserProfile',
    component: UserProfile,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

// UserProfile.vue
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

// 定义props
const props = defineProps<{
  id?: string;
}>();

const route = useRoute();
const router = useRouter();

// 如果通过props传入id，则使用props.id，否则使用route.params.id
const userId = props.id || route.params.id as string;

const goBack = () => {
  router.push('/');
};
</script>
```

## TypeScript 与 Angular

Angular是完全基于TypeScript构建的框架，对TypeScript的支持非常深入。

### 搭建Angular项目

使用Angular CLI创建新项目：

```bash
npm install -g @angular/cli
ng new my-angular-app
```

Angular CLI默认就使用TypeScript。

### 组件定义

```typescript
// user.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-user',
  template: `
    <div>
      <h2>{{ user.name }}</h2>
      <p>Email: {{ user.email }}</p>
      <button (click)="onEdit()">Edit</button>
    </div>
  `,
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  @Input() user!: User;
  @Output() edit = new EventEmitter<number>();

  onEdit(): void {
    this.edit.emit(this.user.id);
  }
}
```

### 服务与依赖注入

```typescript
// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://api.example.com/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

// 在组件中使用
// user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { UserService, User } from './user.service';

@Component({
  selector: 'app-user-list',
  template: `
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="error">{{ error }}</div>
    <ul *ngIf="users.length">
      <li *ngFor="let user of users">
        {{ user.name }}
      </li>
    </ul>
  `
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
```

### 路由与导航

```typescript
// app-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserListComponent } from './users/user-list.component';
import { UserDetailComponent } from './users/user-detail.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'users', 
    component: UserListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'users/:id', 
    component: UserDetailComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

// user-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, User } from './user.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-user-detail',
  template: `
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="user">
      <h2>{{ user.name }}</h2>
      <p>Email: {{ user.email }}</p>
      <button (click)="goBack()">Back</button>
    </div>
  `
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return this.userService.getUser(id);
      })
    ).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load user:', err);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
```

## TypeScript 与 Node.js

Node.js与TypeScript集成可以增强服务器端代码的类型安全。

### 搭建Node.js+TypeScript项目

```bash
mkdir my-node-app
cd my-node-app
npm init -y
npm install typescript ts-node @types/node --save-dev
```

创建`tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Express.js与TypeScript

```bash
npm install express
npm install @types/express --save-dev
```

基本示例：

```typescript
// src/index.ts
import express, { Request, Response, NextFunction } from 'express';

// 扩展Request类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
      };
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件示例
const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

app.use(express.json());
app.use(loggerMiddleware);

// 定义路由处理
interface CreateUserRequest {
  name: string;
  email: string;
  age: number;
}

app.post('/users', (req: Request, res: Response) => {
  try {
    const { name, email, age } = req.body as CreateUserRequest;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // 创建用户的逻辑...
    const user = { id: 1, name, email, age };
    
    return res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/users/:id', (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  // 获取用户的逻辑...
  const user = { id: userId, name: 'John Doe', email: 'john@example.com' };
  
  return res.json(user);
});

// 错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 使用TypeORM进行数据库操作

```bash
npm install typeorm reflect-metadata pg
npm install @types/pg --save-dev
```

```typescript
// src/entity/User.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  age!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}

// src/index.ts
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import express from 'express';
import { User } from './entity/User';

// 初始化数据库连接
createConnection({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'test',
  entities: [User],
  synchronize: true
}).then(connection => {
  const userRepository = connection.getRepository(User);
  const app = express();
  
  app.use(express.json());
  
  // 创建用户
  app.post('/users', async (req, res) => {
    try {
      const user = userRepository.create(req.body);
      const results = await userRepository.save(user);
      return res.status(201).json(results);
    } catch (error) {
      return res.status(500).json({ error: 'Error creating user' });
    }
  });
  
  // 获取所有用户
  app.get('/users', async (req, res) => {
    try {
      const users = await userRepository.find();
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Error retrieving users' });
    }
  });
  
  // 根据ID获取用户
  app.get('/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await userRepository.findOne({ where: { id } });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Error retrieving user' });
    }
  });
  
  app.listen(3000, () => {
    console.log('Server started on port 3000');
  });
}).catch(error => console.log('TypeORM connection error:', error));
```

## TypeScript 与 NestJS

NestJS是一个基于TypeScript构建的服务端框架，它完全利用了TypeScript的类型系统。

### 搭建NestJS项目

```bash
npm i -g @nestjs/cli
nest new my-nest-app
```

### 控制器和服务

```typescript
// user.controller.ts
import { Controller, Get, Post, Body, Param, Delete, Put, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.userService.create(createUserDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findOne(+id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(+id);
  }
}

// user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id) as Promise<User>;
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}

// dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsInt, Min } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;
}

// dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

// entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  age?: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## 总结

TypeScript已经成为现代JavaScript框架的重要组成部分，几乎所有主流框架都对TypeScript提供了一流的支持：

1. **React**：通过类型定义为组件、hooks和事件处理提供类型安全
2. **Vue**：通过单文件组件中的`<script lang="ts">`和组合式API提供强大的类型支持
3. **Angular**：完全基于TypeScript构建，提供了丰富的类型注解和装饰器
4. **Node.js**：可以通过TypeScript提升服务器端代码的类型安全性
5. **NestJS**：基于TypeScript构建的全功能服务端框架

无论你使用哪种框架，TypeScript都能显著提高代码质量和开发效率，特别是在大型项目中。通过IDE的智能提示和编译时类型检查，TypeScript可以帮助我们减少错误，编写更可维护的代码。 