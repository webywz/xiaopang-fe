---
outline: deep
---

# Nest.js 数据库集成

Nest.js 提供了与各种数据库的集成方案，本文详细介绍其使用方法。

## TypeORM 集成
TypeORM 是最成熟的对象关系映射器（ORM），它可以与 TypeScript 很好地工作。

### 安装
首先安装必要的依赖：

```bash
npm install @nestjs/typeorm typeorm mysql2
```

### 配置
将 TypeORM 集成到 Nest.js 应用中：

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // 生产环境请设为 false
    }),
  ],
})
export class AppModule {}
```

### 实体定义
定义数据库实体：

```typescript
// user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ default: true })
  isActive: boolean;
}
```

### 仓库模式
在模块中注册实体并使用：

```typescript
// users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}

// users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
```

## Mongoose 集成
Mongoose 是最流行的 MongoDB 对象建模工具。

### 安装
首先安装必要的依赖：

```bash
npm install @nestjs/mongoose mongoose
```

### 配置
将 Mongoose 集成到 Nest.js 应用中：

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
  ],
})
export class AppModule {}
```

### 模式定义
定义 MongoDB 模式：

```typescript
// cat.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CatDocument = Cat & Document;

@Schema()
export class Cat {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;
}

export const CatSchema = SchemaFactory.createForClass(Cat);
```

### 使用模式
在模块中注册模式并使用：

```typescript
// cats.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { Cat, CatSchema } from './cat.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }]),
  ],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}

// cats.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cat, CatDocument } from './cat.schema';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(
    @InjectModel(Cat.name) private catModel: Model<CatDocument>,
  ) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<Cat[]> {
    return this.catModel.find().exec();
  }

  async findOne(id: string): Promise<Cat> {
    return this.catModel.findById(id).exec();
  }
}
```

## Prisma 集成
Prisma 是一个下一代 ORM，它可以帮助你构建更快、更可靠的应用程序。

### 安装
首先安装必要的依赖：

```bash
npm install prisma @prisma/client
npx prisma init
```

### 配置
配置 Prisma，创建模型：

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

### 服务定义
创建 Prisma 服务：

```typescript
// prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

### 使用 Prisma
在服务中使用 Prisma：

```typescript
// users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
```

## MySQL 与 Nest.js 集成

### 安装依赖

首先需要安装必要的依赖包：

```bash
npm install @nestjs/typeorm typeorm mysql2
```

### 基本配置

在 `app.module.ts` 中配置 TypeORM：

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'nest'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNC', false),
        logging: configService.get('DB_LOGGING', false),
        charset: 'utf8mb4',
      }),
    }),
    UsersModule,
  ],
})
export class AppModule {}
```

### 环境变量配置

在项目根目录创建 `.env.development` 文件：

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=nest_demo
DB_SYNC=true
DB_LOGGING=true
```

## 实体定义

### 创建实体类

在 Nest.js 中，数据库表通过实体类来定义：

```typescript
// src/users/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  username: string;

  @Column({ length: 100 })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 关系映射

#### 一对多关系

```typescript
// src/blogs/entities/post.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, user => user.posts)
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

```typescript
// src/users/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Post } from '../../blogs/entities/post.entity';

@Entity('users')
export class User {
  // ... 其他字段

  @OneToMany(() => Post, post => post.author)
  posts: Post[];
}
```

#### 多对多关系

```typescript
// src/blogs/entities/tag.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Post } from './post.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @ManyToMany(() => Post, post => post.tags)
  posts: Post[];
}
```

```typescript
// src/blogs/entities/post.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tag } from './tag.entity';

@Entity('posts')
export class Post {
  // ... 其他字段

  @ManyToMany(() => Tag, tag => tag.posts)
  @JoinTable({
    name: 'post_tags', // 指定中间表名称
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' }
  })
  tags: Tag[];
}
```

## 模块配置

在功能模块中导入实体：

```typescript
// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

## 基本 CRUD 操作

### 注入 Repository

```typescript
// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 服务方法实现
}
```

### 创建

```typescript
async create(createUserDto: CreateUserDto): Promise<User> {
  const user = this.usersRepository.create(createUserDto);
  return this.usersRepository.save(user);
}
```

### 查询

```typescript
async findAll(options?: { skip?: number; take?: number }): Promise<User[]> {
  return this.usersRepository.find({
    skip: options?.skip || 0,
    take: options?.take || 10,
  });
}

async findOne(id: number): Promise<User> {
  const user = await this.usersRepository.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  return user;
}

async findByEmail(email: string): Promise<User> {
  return this.usersRepository.findOne({ where: { email } });
}
```

### 更新

```typescript
async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
  const user = await this.findOne(id);
  this.usersRepository.merge(user, updateUserDto);
  return this.usersRepository.save(user);
}
```

### 删除

```typescript
async remove(id: number): Promise<void> {
  const result = await this.usersRepository.delete(id);
  if (result.affected === 0) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
}
```

## 高级查询

### 关系查询

```typescript
async findOneWithPosts(id: number): Promise<User> {
  return this.usersRepository.findOne({
    where: { id },
    relations: { posts: true },
  });
}

async findPostsWithTags(userId: number): Promise<Post[]> {
  return this.postsRepository.find({
    where: { author: { id: userId } },
    relations: { tags: true },
  });
}
```

### 复杂条件查询

```typescript
async findByCondition(params: {
  status?: boolean;
  username?: string;
  email?: string;
}): Promise<User[]> {
  const queryBuilder = this.usersRepository.createQueryBuilder('user');
  
  if (params.status !== undefined) {
    queryBuilder.andWhere('user.isActive = :status', { status: params.status });
  }
  
  if (params.username) {
    queryBuilder.andWhere('user.username LIKE :username', { username: `%${params.username}%` });
  }
  
  if (params.email) {
    queryBuilder.andWhere('user.email = :email', { email: params.email });
  }
  
  return queryBuilder.getMany();
}
```

### 分页查询

```typescript
async findAllPaginated(page: number = 1, limit: number = 10): Promise<{ data: User[]; total: number; page: number; lastPage: number }> {
  const [data, total] = await this.usersRepository.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
  });
  
  return {
    data,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
}
```

## 事务处理

### 使用 QueryRunner

```typescript
async transferCredits(fromUserId: number, toUserId: number, amount: number): Promise<void> {
  const queryRunner = this.dataSource.createQueryRunner();
  
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    // 扣减发送方余额
    await queryRunner.manager.decrement(
      User,
      { id: fromUserId },
      'credits', 
      amount
    );
    
    // 增加接收方余额
    await queryRunner.manager.increment(
      User,
      { id: toUserId },
      'credits', 
      amount
    );
    
    // 记录交易历史
    const transaction = queryRunner.manager.create(Transaction, {
      fromUserId,
      toUserId,
      amount,
      type: 'transfer',
    });
    await queryRunner.manager.save(transaction);
    
    await queryRunner.commitTransaction();
  } catch (err) {
    // 发生错误时回滚事务
    await queryRunner.rollbackTransaction();
    throw new InternalServerErrorException('Transaction failed');
  } finally {
    // 释放QueryRunner
    await queryRunner.release();
  }
}
```

### 装饰器方式

```typescript
import { DataSource } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    private dataSource: DataSource,
    // ...其他依赖
  ) {}

  @Transaction()
  async createUserWithProfile(createUserDto: CreateUserDto, createProfileDto: CreateProfileDto) {
    const user = await this.usersRepository.save(createUserDto);
    
    const profile = this.profilesRepository.create({
      ...createProfileDto,
      user,
    });
    await this.profilesRepository.save(profile);
    
    return user;
  }
}

// 事务装饰器实现
export function Transaction() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const dataSource = this.dataSource;
      const queryRunner = dataSource.createQueryRunner();
      
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try {
        const result = await originalMethod.apply(this, args);
        await queryRunner.commitTransaction();
        return result;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    };
    
    return descriptor;
  };
}
```

## 迁移与种子数据

### 创建迁移

配置 `package.json` 的脚本：

```json
"scripts": {
  "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js",
  "migration:create": "npm run typeorm -- migration:create -n",
  "migration:generate": "npm run typeorm -- migration:generate -n",
  "migration:run": "npm run typeorm -- migration:run",
  "migration:revert": "npm run typeorm -- migration:revert"
}
```

配置 TypeORM 数据库连接（创建 `ormconfig.ts`）：

```typescript
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 3306),
  username: configService.get('DB_USERNAME', 'root'),
  password: configService.get('DB_PASSWORD', ''),
  database: configService.get('DB_DATABASE', 'nest'),
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: configService.get('DB_LOGGING', false),
});
```

生成迁移文件：

```bash
npm run migration:generate -- CreateUsersTable
```

迁移文件示例：

```typescript
// src/migrations/1625000000000-CreateUsersTable.ts
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1625000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'username',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

运行迁移：

```bash
npm run migration:run
```

### 种子数据

创建种子数据服务：

```typescript
// src/database/seeders/user.seeder.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async seed() {
    const adminExists = await this.usersRepository.findOne({
      where: { email: 'admin@example.com' },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('password', 10);
      await this.usersRepository.save({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        isActive: true,
      });
      console.log('Admin user seeded successfully');
    }

    // 创建测试用户
    const testUsers = [];
    for (let i = 1; i <= 20; i++) {
      const hashedPassword = await bcrypt.hash('password', 10);
      testUsers.push({
        username: `user${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        isActive: i % 5 !== 0, // 每5个用户中有1个不活跃
      });
    }

    await this.usersRepository.save(testUsers);
    console.log('Test users seeded successfully');
  }
}
```

创建主种子模块：

```typescript
// src/database/seeders/seeder.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity';
import { UserSeeder } from './user.seeder';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'nest'),
        entities: [User],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserSeeder, SeederService],
})
export class SeederModule {}
```

创建种子服务：

```typescript
// src/database/seeders/seeder.service.ts
import { Injectable } from '@nestjs/common';
import { UserSeeder } from './user.seeder';

@Injectable()
export class SeederService {
  constructor(private readonly userSeeder: UserSeeder) {}

  async seed() {
    await this.userSeeder.seed();
    console.log('Database seeding completed');
  }
}
```

创建种子命令：

```typescript
// src/database/seeders/seed.ts
import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(SeederModule);
  const seeder = app.get(SeederService);
  await seeder.seed();
  await app.close();
}

bootstrap();
```

配置 `package.json` 的脚本：

```json
"scripts": {
  "seed": "ts-node -r tsconfig-paths/register src/database/seeders/seed.ts"
}
```

运行种子脚本：

```bash
npm run seed
```

## 数据库优化

### 索引优化

实体类定义中添加索引：

```typescript
@Entity('users')
@Index('idx_user_email', ['email'], { unique: true })
@Index('idx_user_username', ['username'])
export class User {
  // 实体字段定义
}
```

或在迁移文件中创建索引：

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  // 创建表...
  
  await queryRunner.createIndex('users', new TableIndex({
    name: 'idx_user_email',
    columnNames: ['email'],
    isUnique: true,
  }));
  
  await queryRunner.createIndex('users', new TableIndex({
    name: 'idx_user_username',
    columnNames: ['username'],
  }));
}
```

### 查询优化

使用 `QueryBuilder` 进行复杂查询优化：

```typescript
async findUsersWithPostCount(): Promise<any[]> {
  return this.usersRepository
    .createQueryBuilder('user')
    .leftJoin('user.posts', 'post')
    .select('user.id', 'id')
    .addSelect('user.username', 'username')
    .addSelect('user.email', 'email')
    .addSelect('COUNT(post.id)', 'postCount')
    .groupBy('user.id')
    .having('COUNT(post.id) > 0')
    .orderBy('postCount', 'DESC')
    .getRawMany();
}
```

### 连接池配置

在 TypeORM 配置中添加连接池配置：

```typescript
TypeOrmModule.forRootAsync({
  // ...其他配置
  useFactory: (configService: ConfigService) => ({
    // ...其他选项
    extra: {
      connectionLimit: configService.get('DB_CONNECTION_LIMIT', 10),
      waitForConnections: true,
      queueLimit: 0,
    },
  }),
}),
```

## 使用 DTO 与实体转换

### 定义 DTO

```typescript
// src/users/dto/create-user.dto.ts
import { IsString, IsEmail, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

```typescript
// src/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

### 使用 DTO 转换

可以使用类转换器（class-transformer）进行实体和 DTO 之间的转换：

```typescript
// src/users/dto/user.dto.ts
import { Exclude, Expose, Transform } from 'class-transformer';
import { User } from '../entities/user.entity';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  isActive: boolean;

  @Expose()
  @Transform(({ value }) => value ? value.toISOString() : null)
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Expose()
  @Transform(({ obj }) => obj.posts ? obj.posts.length : 0)
  postCount: number;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
```

在控制器中转换：

```typescript
@Get()
async findAll() {
  const users = await this.usersService.findAll();
  return users.map(user => new UserDto(user));
}
```

## 总结

这个文档详细介绍了如何在 Nest.js 中使用 TypeORM 集成 MySQL 数据库，包括了从基本配置到高级查询、关系映射、事务处理、迁移与种子数据，以及数据库优化的各个方面。使用这些实践可以帮助开发者构建高效、稳定的 Nest.js 应用程序。

## 参考资源

- [Nest.js 官方文档 - Database](https://docs.nestjs.com/techniques/database)
- [TypeORM 官方文档](https://typeorm.io/)
- [MySQL 官方文档](https://dev.mysql.com/doc/) 