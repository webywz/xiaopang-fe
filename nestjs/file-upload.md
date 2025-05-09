---
outline: deep
---

# Nest.js 文件上传

Nest.js 提供了多种方式处理文件上传，支持单文件和多文件上传，并可以结合各种存储解决方案。

## 基础配置

### 安装依赖

使用 Express 的 multer 中间件处理文件上传：

```bash
npm install --save multer
npm install --save-dev @types/multer
```

### 配置模块

在 `app.module.ts` 中配置 MulterModule：

```typescript
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  ],
})
export class AppModule {}
```

## 单文件上传

### 创建控制器

```typescript
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('files')
export class FilesController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    return {
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
    };
  }
}
```

### 文件验证

添加文件类型和大小限制：

```typescript
@Post('upload')
@UseInterceptors(
  FileInterceptor('file', {
    limits: {
      fileSize: 1024 * 1024 * 5, // 5MB
    },
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('只允许上传图片文件！'), false);
      }
      callback(null, true);
    },
  }),
)
uploadFile(@UploadedFile() file: Express.Multer.File) {
  return {
    filename: file.filename,
    originalname: file.originalname,
    size: file.size,
  };
}
```

## 多文件上传

### 上传多个文件

```typescript
import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('files')
export class FilesController {
  @Post('uploads')
  @UseInterceptors(FilesInterceptor('files', 10)) // 最多10个文件
  uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const response = [];
    files.forEach(file => {
      const fileResponse = {
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
      };
      response.push(fileResponse);
    });
    return response;
  }
}
```

### 多字段文件上传

处理不同字段的多个文件：

```typescript
import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('files')
export class FilesController {
  @Post('upload-fields')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'documents', maxCount: 5 },
    ]),
  )
  uploadMultipleFileFields(@UploadedFiles() files: { 
    avatar?: Express.Multer.File[], 
    documents?: Express.Multer.File[] 
  }) {
    console.log(files);
    return {
      avatar: files.avatar ? files.avatar[0] : null,
      documents: files.documents || [],
    };
  }
}
```

## 流处理大文件

对于大文件，可以使用流处理以减少内存使用：

```typescript
import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('files')
export class FilesController {
  @Post('stream-upload')
  async streamUpload(@Req() req: Request, @Res() res: Response) {
    const filename = Date.now() + '.pdf';
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    // 创建写入流
    const writeStream = fs.createWriteStream(filePath);
    
    // 处理错误
    req.on('error', (err) => {
      console.error('请求流错误', err);
      return res.status(500).json({ message: '上传失败' });
    });
    
    writeStream.on('error', (err) => {
      console.error('写入流错误', err);
      return res.status(500).json({ message: '保存文件失败' });
    });
    
    // 当流完成时
    writeStream.on('finish', () => {
      return res.status(201).json({
        message: '文件上传成功',
        filename,
      });
    });
    
    // 将请求流通过管道传输到文件写入流
    req.pipe(writeStream);
  }
}
```

## 文件存储解决方案

### 本地存储

上面的例子都使用了本地磁盘存储，可以通过自定义配置：

```typescript
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const storageConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join(process.cwd(), 'uploads');
      
      // 确保上传目录存在
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // 基于原始文件名、时间戳和随机字符串创建唯一文件名
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `${file.originalname.split(ext)[0]}-${uniqueSuffix}${ext}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB
  },
};
```

### 使用 AWS S3 存储

为了使用 AWS S3 存储上传的文件：

```bash
npm install --save aws-sdk multer-s3
```

创建 S3 存储配置：

```typescript
import { Injectable } from '@nestjs/common';
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';

@Injectable()
export class S3ConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    const s3 = new AWS.S3();
    
    return {
      storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        acl: 'public-read', // 或根据需要设置为'private'
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}`);
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 5, // 5 MB
      },
    };
  }
}
```

在模块中使用自定义配置：

```typescript
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { S3ConfigService } from './s3-config.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: S3ConfigService,
    }),
  ],
})
export class AppModule {}
```

## 图片处理

对上传的图片进行处理：

```bash
npm install --save sharp
```

创建一个图片处理服务：

```typescript
import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { join } from 'path';

@Injectable()
export class ImageService {
  async resizeImage(file: Express.Multer.File, width: number, height: number): Promise<string> {
    const originalPath = file.path;
    const outputFilename = `resized-${width}x${height}-${file.filename}`;
    const outputPath = join(process.cwd(), 'uploads', outputFilename);
    
    await sharp(originalPath)
      .resize(width, height)
      .toFile(outputPath);
      
    return outputFilename;
  }
  
  async convertToWebp(file: Express.Multer.File): Promise<string> {
    const originalPath = file.path;
    const filenameWithoutExt = file.filename.split('.')[0];
    const outputFilename = `${filenameWithoutExt}.webp`;
    const outputPath = join(process.cwd(), 'uploads', outputFilename);
    
    await sharp(originalPath)
      .webp({ quality: 80 })
      .toFile(outputPath);
      
    return outputFilename;
  }
  
  async addWatermark(file: Express.Multer.File, watermarkText: string): Promise<string> {
    const originalPath = file.path;
    const outputFilename = `watermarked-${file.filename}`;
    const outputPath = join(process.cwd(), 'uploads', outputFilename);
    
    // 创建一个包含水印文本的SVG
    const svgBuffer = Buffer.from(
      `<svg width="500" height="100">
        <text x="50%" y="50%" font-family="Arial" font-size="24" fill="rgba(255,255,255,0.5)" text-anchor="middle">
          ${watermarkText}
        </text>
      </svg>`
    );
    
    await sharp(originalPath)
      .composite([
        {
          input: svgBuffer,
          gravity: 'southeast', // 右下角
        },
      ])
      .toFile(outputPath);
      
    return outputFilename;
  }
}
```

在控制器中使用图片处理服务：

```typescript
import { Controller, Post, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ImageService } from './image.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imageService: ImageService) {}

  @Post('resize')
  @UseInterceptors(FileInterceptor('image'))
  async resizeImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('width') width: number,
    @Body('height') height: number,
  ) {
    const resizedFilename = await this.imageService.resizeImage(file, +width, +height);
    return { filename: resizedFilename };
  }
  
  @Post('to-webp')
  @UseInterceptors(FileInterceptor('image'))
  async convertToWebp(@UploadedFile() file: Express.Multer.File) {
    const webpFilename = await this.imageService.convertToWebp(file);
    return { filename: webpFilename };
  }
  
  @Post('watermark')
  @UseInterceptors(FileInterceptor('image'))
  async addWatermark(
    @UploadedFile() file: Express.Multer.File,
    @Body('text') text: string,
  ) {
    const watermarkedFilename = await this.imageService.addWatermark(file, text);
    return { filename: watermarkedFilename };
  }
}
```

## 文件下载

从服务器提供文件下载：

```typescript
import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';

@Controller('files')
export class FilesController {
  @Get('download/:filename')
  async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', filename);
    
    try {
      // 检查文件是否存在
      await stat(filePath);
      
      // 设置响应头
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      // 创建读取流并通过管道发送到响应
      const fileStream = createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      res.status(404).json({ message: '文件不存在' });
    }
  }
  
  @Get('stream/:filename')
  async streamFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', filename);
    
    try {
      const fileStat = await stat(filePath);
      const fileSize = fileStat.size;
      
      // 处理范围请求（支持断点续传）
      const range = req.headers.range;
      
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;
        
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', chunkSize);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        const fileStream = createReadStream(filePath, { start, end });
        fileStream.pipe(res);
      } else {
        // 非范围请求
        res.setHeader('Content-Length', fileSize);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        const fileStream = createReadStream(filePath);
        fileStream.pipe(res);
      }
    } catch (error) {
      res.status(404).json({ message: '文件不存在' });
    }
  }
}
```

## 使用 API 文档描述文件上传

使用 Swagger 为文件上传 API 添加文档：

```typescript
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('文件')
@Controller('files')
export class FilesController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
    };
  }
}
```

## 安全考虑

### 文件类型验证

除了检查文件扩展名外，还可以验证文件内容类型：

```typescript
import { Injectable } from '@nestjs/common';
import * as fileType from 'file-type';
import * as fs from 'fs';

@Injectable()
export class FileValidationService {
  async validateFileContent(filePath: string, allowedMimeTypes: string[]): Promise<boolean> {
    try {
      const buffer = fs.readFileSync(filePath);
      const type = await fileType.fromBuffer(buffer);
      
      if (!type) {
        return false; // 无法确定文件类型
      }
      
      return allowedMimeTypes.includes(type.mime);
    } catch (error) {
      return false;
    }
  }
}
```

### 防止恶意文件上传

安全策略示例：

```typescript
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

// 允许的MIME类型
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
];

// 允许的文件扩展名
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];

// 文件大小限制 (5MB)
const maxFileSize = 5 * 1024 * 1024;

export const secureStorageConfig = {
  storage: diskStorage({
    destination: './uploads/secure',
    filename: (req, file, cb) => {
      // 移除可能有害的字符
      const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileExtName = extname(originalName);
      
      // 验证文件扩展名
      if (!allowedExtensions.includes(fileExtName.toLowerCase())) {
        return cb(new BadRequestException('不支持的文件类型'), null);
      }
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `${uniqueSuffix}${fileExtName}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    // 验证MIME类型
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new BadRequestException('不支持的文件类型'), false);
    }
    cb(null, true);
  },
};
```

## 进度监控

使用自定义拦截器监控上传进度：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import * as SocketIO from 'socket.io';

@Injectable()
export class UploadProgressInterceptor implements NestInterceptor {
  constructor(private readonly io: SocketIO.Server) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.id; // 假设已经通过认证

    if (userId) {
      let uploadedBytes = 0;
      const contentLength = parseInt(request.headers['content-length'], 10) || 0;
      
      request.on('data', (chunk) => {
        uploadedBytes += chunk.length;
        const progress = Math.round((uploadedBytes / contentLength) * 100);
        
        // 通过WebSocket向客户端发送进度信息
        this.io.to(`user-${userId}`).emit('upload-progress', {
          progress,
          uploaded: uploadedBytes,
          total: contentLength,
        });
      });
    }

    return next.handle();
  }
}
```

## 高级使用场景

### 分块上传

对于大文件，可以实现分块上传：

```typescript
import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('files')
export class ChunkedUploadsController {
  @Post('chunk')
  @UseInterceptors(FileInterceptor('chunk'))
  async uploadChunk(
    @UploadedFile() file: Express.Multer.File,
    @Body('fileId') fileId: string,
    @Body('chunkNumber') chunkNumber: number,
    @Body('totalChunks') totalChunks: number,
  ) {
    // 确保存储目录存在
    const chunksDir = path.join(process.cwd(), 'uploads', 'chunks', fileId);
    if (!fs.existsSync(chunksDir)) {
      fs.mkdirSync(chunksDir, { recursive: true });
    }
    
    // 保存分块
    const chunkPath = path.join(chunksDir, `${chunkNumber}`);
    fs.renameSync(file.path, chunkPath);
    
    // 检查是否所有分块都已上传
    const allChunksUploaded = this.areAllChunksUploaded(chunksDir, totalChunks);
    
    if (allChunksUploaded) {
      // 合并所有分块
      const finalFilePath = path.join(process.cwd(), 'uploads', `${fileId}-complete`);
      await this.mergeChunks(chunksDir, finalFilePath, totalChunks);
      
      // 删除分块目录
      fs.rmSync(chunksDir, { recursive: true, force: true });
      
      return {
        status: 'complete',
        filePath: finalFilePath,
      };
    }
    
    return {
      status: 'chunk_received',
      chunkNumber,
      totalChunks,
    };
  }
  
  private areAllChunksUploaded(chunksDir: string, totalChunks: number): boolean {
    const files = fs.readdirSync(chunksDir);
    return files.length === totalChunks;
  }
  
  private async mergeChunks(chunksDir: string, outputFilePath: string, totalChunks: number): Promise<void> {
    const writeStream = fs.createWriteStream(outputFilePath);
    
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(chunksDir, `${i}`);
      const chunkBuffer = fs.readFileSync(chunkPath);
      writeStream.write(chunkBuffer);
    }
    
    return new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      writeStream.end();
    });
  }
}
```

### 客户端代码示例

使用 JavaScript 实现分块上传：

```javascript
async function uploadLargeFile(file) {
  const chunkSize = 1024 * 1024; // 1MB 分块
  const totalChunks = Math.ceil(file.size / chunkSize);
  const fileId = Date.now().toString(); // 生成唯一文件ID
  
  for (let i = 0; i < totalChunks; i++) {
    const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
    const formData = new FormData();
    
    formData.append('chunk', chunk);
    formData.append('fileId', fileId);
    formData.append('chunkNumber', i.toString());
    formData.append('totalChunks', totalChunks.toString());
    
    try {
      const response = await fetch('/api/files/chunk', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      console.log(`Chunk ${i+1}/${totalChunks} uploaded`);
      
      if (result.status === 'complete') {
        console.log('File upload completed!');
        return result.filePath;
      }
    } catch (error) {
      console.error(`Error uploading chunk ${i}:`, error);
      throw error;
    }
  }
} 