---
outline: deep
---

# Nest.js GraphQL

Nest通过`@nestjs/graphql`模块提供了对GraphQL的支持，可以灵活配置为代码优先或模式优先的开发方式。

## 安装

首先安装必要的依赖：

```bash
npm i @nestjs/graphql @nestjs/apollo graphql apollo-server-express
```

## 基本设置

在应用模块中配置GraphQL模块：

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // 使用代码优先方法
      // 或者使用模式优先方法
      // typePaths: ['./**/*.graphql'],
      playground: true, // 开发环境启用playground
    }),
    // 其他模块...
  ],
})
export class AppModule {}
```

## 代码优先方法

在代码优先方法中，使用TypeScript类和装饰器定义GraphQL模式。

### 对象类型

定义GraphQL对象类型：

```typescript
// author.model.ts
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Post } from './post.model';

@ObjectType()
export class Author {
  @Field(type => Int)
  id: number;

  @Field({ description: '作者姓名' })
  name: string;

  @Field(type => [Post], { nullable: true })
  posts?: Post[];
}

// post.model.ts
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Post {
  @Field(type => Int)
  id: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  content?: string;

  @Field(type => Int)
  authorId: number;
}
```

### 解析器

创建解析器来处理GraphQL查询和变更：

```typescript
// authors.resolver.ts
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AuthorsService } from './authors.service';
import { PostsService } from './posts.service';
import { Author } from './models/author.model';
import { Post } from './models/post.model';
import { CreateAuthorInput } from './dto/create-author.input';

@Resolver(of => Author)
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query(returns => Author, { name: 'author' })
  async getAuthor(@Args('id', { type: () => Int }) id: number): Promise<Author> {
    return this.authorsService.findOne(id);
  }

  @Query(returns => [Author], { name: 'authors' })
  async getAuthors(): Promise<Author[]> {
    return this.authorsService.findAll();
  }

  @Mutation(returns => Author)
  async createAuthor(
    @Args('createAuthorInput') createAuthorInput: CreateAuthorInput,
  ): Promise<Author> {
    return this.authorsService.create(createAuthorInput);
  }

  @ResolveField('posts', returns => [Post])
  async getPosts(@Parent() author: Author): Promise<Post[]> {
    const { id } = author;
    return this.postsService.findAllByAuthor(id);
  }
}
```

### 输入类型

定义输入对象类型用于变更操作：

```typescript
// create-author.input.ts
import { Field, InputType } from '@nestjs/graphql';
import { MinLength } from 'class-validator';

@InputType()
export class CreateAuthorInput {
  @Field()
  @MinLength(3)
  name: string;
}
```

## 模式优先方法

在模式优先方法中，先定义GraphQL SDL模式文件。

### 定义模式

```graphql
# author.graphql
type Author {
  id: Int!
  name: String!
  posts: [Post]
}

type Post {
  id: Int!
  title: String!
  content: String
  authorId: Int!
}

input CreateAuthorInput {
  name: String!
}

type Query {
  author(id: Int!): Author
  authors: [Author]
}

type Mutation {
  createAuthor(createAuthorInput: CreateAuthorInput!): Author
}
```

### 解析器

```typescript
// authors.resolver.ts
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AuthorsService } from './authors.service';
import { PostsService } from './posts.service';

@Resolver('Author')
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query('author')
  async getAuthor(@Args('id', { type: () => Int }) id: number) {
    return this.authorsService.findOne(id);
  }

  @Query('authors')
  async getAuthors() {
    return this.authorsService.findAll();
  }

  @Mutation('createAuthor')
  async createAuthor(@Args('createAuthorInput') createAuthorInput) {
    return this.authorsService.create(createAuthorInput);
  }

  @ResolveField('posts')
  async getPosts(@Parent() author) {
    const { id } = author;
    return this.postsService.findAllByAuthor(id);
  }
}
```

## 订阅

GraphQL支持实时更新的订阅功能：

```typescript
// posts.resolver.ts
import { Args, Int, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './models/post.model';
import { CreatePostInput } from './dto/create-post.input';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

@Resolver(of => Post)
export class PostsResolver {
  constructor(private postsService: PostsService) {}

  @Query(returns => [Post])
  async posts(): Promise<Post[]> {
    return this.postsService.findAll();
  }

  @Mutation(returns => Post)
  async createPost(@Args('createPostInput') createPostInput: CreatePostInput): Promise<Post> {
    const post = await this.postsService.create(createPostInput);
    pubSub.publish('postAdded', { postAdded: post });
    return post;
  }

  @Subscription(returns => Post, {
    filter: (payload, variables) => 
      payload.postAdded.authorId === variables.authorId,
  })
  postAdded(@Args('authorId', { type: () => Int }) authorId: number) {
    return pubSub.asyncIterator('postAdded');
  }
}
```

## 指令

使用GraphQL指令自定义行为：

```typescript
// app.module.ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  buildSchemaOptions: {
    directives: [
      new GraphQLDirective({
        name: 'upper',
        locations: [DirectiveLocation.FIELD_DEFINITION],
      }),
    ],
  },
}),
```

实现指令解析器：

```typescript
// upper-case.directive.ts
import { SchemaDirectiveVisitor } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLField } from 'graphql';

export class UpperCaseDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field;

    field.resolve = async function(...args) {
      const result = await resolve.apply(this, args);
      if (typeof result === 'string') {
        return result.toUpperCase();
      }
      return result;
    };
  }
}
```

## 复杂类型

### 枚举类型

```typescript
// post-status.enum.ts
import { registerEnumType } from '@nestjs/graphql';

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

registerEnumType(PostStatus, {
  name: 'PostStatus',
  description: '文章的状态',
});
```

使用枚举：

```typescript
// post.model.ts
@ObjectType()
export class Post {
  // 其他字段...
  
  @Field(type => PostStatus, { defaultValue: PostStatus.DRAFT })
  status: PostStatus;
}
```

### 联合类型

```typescript
// search-result.union.ts
import { createUnionType } from '@nestjs/graphql';
import { Author } from './author.model';
import { Post } from './post.model';

export const SearchResultUnion = createUnionType({
  name: 'SearchResult',
  types: () => [Author, Post],
  resolveType(value) {
    if ('name' in value) {
      return Author;
    }
    if ('title' in value) {
      return Post;
    }
    return null;
  },
});
```

使用联合类型：

```typescript
// search.resolver.ts
@Query(returns => [SearchResultUnion])
async search(@Args('keyword') keyword: string): Promise<Array<typeof SearchResultUnion>> {
  const authors = await this.authorsService.search(keyword);
  const posts = await this.postsService.search(keyword);
  return [...authors, ...posts];
}
```

### 接口类型

```typescript
// node.interface.ts
import { Field, ID, InterfaceType } from '@nestjs/graphql';

@InterfaceType()
export abstract class Node {
  @Field(type => ID)
  id: string;
}
```

实现接口：

```typescript
// author.model.ts
@ObjectType({ implements: Node })
export class Author implements Node {
  @Field(type => ID)
  id: string;
  
  // 其他字段...
}
```

## 认证和授权

设置认证守卫：

```typescript
// auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from './auth.service';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return false;
    }
    
    const token = authHeader.split(' ')[1];
    const user = this.authService.validateToken(token);
    if (!user) {
      return false;
    }
    
    request.user = user;
    return true;
  }
}
```

应用守卫：

```typescript
// authors.resolver.ts
@Resolver(of => Author)
export class AuthorsResolver {
  // ...
  
  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Author)
  async createAuthor(
    @Args('createAuthorInput') createAuthorInput: CreateAuthorInput,
    @Context() context,
  ): Promise<Author> {
    const user = context.req.user;
    // 检查权限等...
    return this.authorsService.create(createAuthorInput);
  }
}
```

## 数据加载器

使用DataLoader解决N+1查询问题：

```typescript
// authors.loader.ts
import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { AuthorsService } from './authors.service';
import { Author } from './models/author.model';

@Injectable({ scope: Scope.REQUEST })
export class AuthorsLoader {
  constructor(private authorsService: AuthorsService) {}

  public readonly batchAuthors = new DataLoader<number, Author>(
    async (ids: readonly number[]) => {
      const authors = await this.authorsService.findByIds(ids);
      const authorsMap = new Map(authors.map(author => [author.id, author]));
      return ids.map(id => authorsMap.get(id));
    },
  );
}
```

在解析器中使用：

```typescript
// posts.resolver.ts
@Resolver(of => Post)
export class PostsResolver {
  constructor(
    private postsService: PostsService,
    private authorsLoader: AuthorsLoader,
  ) {}

  @ResolveField('author', returns => Author)
  async getAuthor(@Parent() post: Post): Promise<Author> {
    return this.authorsLoader.batchAuthors.load(post.authorId);
  }
}
```

## 文件上传

配置文件上传：

```typescript
// app.module.ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  uploads: {
    maxFileSize: 10000000, // 10 MB
    maxFiles: 5,
  },
}),
```

实现文件上传：

```typescript
// upload.resolver.ts
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { UploadService } from './upload.service';

@Resolver()
export class UploadResolver {
  constructor(private uploadService: UploadService) {}

  @Mutation(() => Boolean)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename }: FileUpload,
  ): Promise<boolean> {
    return this.uploadService.uploadFile(createReadStream, filename);
  }
}
```

## 错误处理

自定义错误处理：

```typescript
// app.module.ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  formatError: (error) => {
    // 添加自定义错误处理逻辑
    const originalError = error.originalError;
    
    // 对特定错误类型做特殊处理
    if (originalError instanceof ValidationError) {
      return {
        message: '数据校验错误',
        code: 'VALIDATION_ERROR',
        details: originalError.validationErrors,
      };
    }
    
    // 隐藏内部错误细节
    if (process.env.NODE_ENV !== 'development') {
      delete error.extensions.exception.stacktrace;
    }
    
    return error;
  },
}),
```

## 高级功能

### 模式拼接

合并多个GraphQL模式：

```typescript
// app.module.ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
  },
  mergeSchemas: true,
}),
```

### 委托

使用Schema委托功能，将查询委托给其他解析器：

```typescript
import { delegateToSchema } from '@graphql-tools/delegate';

@Resolver('Author')
export class AuthorsResolver {
  // ...
  
  @ResolveField('posts')
  async getPosts(@Parent() author, @Context() { schema }) {
    return delegateToSchema({
      schema,
      operation: 'query',
      fieldName: 'postsByAuthor',
      args: { authorId: author.id },
      context,
      info,
    });
  }
}
```

### 缓存

配置查询缓存：

```typescript
// app.module.ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  cache: 'bounded',
  persistedQueries: {
    ttl: 900, // 15分钟
  },
}),
``` 