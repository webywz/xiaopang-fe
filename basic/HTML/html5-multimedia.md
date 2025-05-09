---
layout: doc
title: HTML5多媒体处理技术
description: 深入解析HTML5音视频处理技术，包括媒体元素、Web Audio API、MediaStream与WebRTC的应用实践
date: 2024-02-20
head:
  - - meta
    - name: keywords
      content: HTML5, 多媒体, audio, video, WebRTC, Web Audio API, MediaRecorder, 音视频处理
---

# HTML5多媒体处理技术

HTML5带来了强大的原生多媒体支持，使得开发者能够在不依赖第三方插件的情况下处理音频和视频内容。本文将深入探讨HTML5多媒体处理技术，包括基础的媒体元素、高级API以及实际应用场景。

## 目录

[[toc]]

## HTML5多媒体基础

HTML5引入了两个核心的多媒体元素：`<audio>`和`<video>`，它们为Web页面提供了原生的多媒体支持。这些元素不仅简化了多媒体内容的嵌入过程，还提供了丰富的JavaScript API用于控制媒体播放。

### audio元素基础

`<audio>`元素用于在网页中嵌入音频内容：

```html
<audio controls>
  <source src="audio/music.mp3" type="audio/mpeg">
  <source src="audio/music.ogg" type="audio/ogg">
  您的浏览器不支持audio元素。
</audio>
```

主要属性：

- `controls` - 显示播放控件
- `autoplay` - 自动播放（注意：现代浏览器通常会阻止自动播放）
- `loop` - 循环播放
- `muted` - 静音
- `preload` - 预加载策略（auto/metadata/none）
- `src` - 音频源（也可通过子元素`<source>`指定）

### video元素基础

`<video>`元素用于在网页中嵌入视频内容：

```html
<video width="640" height="360" controls poster="images/thumbnail.jpg">
  <source src="videos/movie.mp4" type="video/mp4">
  <source src="videos/movie.webm" type="video/webm">
  <track kind="subtitles" src="subtitles/en.vtt" srclang="en" label="English">
  <track kind="subtitles" src="subtitles/zh.vtt" srclang="zh" label="中文">
  您的浏览器不支持video元素。
</video>
```

主要属性：

- `width`/`height` - 设置视频尺寸
- `controls` - 显示播放控件
- `autoplay` - 自动播放
- `loop` - 循环播放
- `muted` - 静音（与autoplay结合可实现自动播放）
- `poster` - 视频封面图片
- `preload` - 预加载策略

### 媒体格式与兼容性

不同浏览器支持的媒体格式不同，为了最大化兼容性，通常需要准备多种格式：

**音频格式兼容性**：

| 格式 | MIME类型 | Chrome | Firefox | Safari | Edge |
|------|---------|--------|---------|--------|------|
| MP3 | audio/mpeg | ✓ | ✓ | ✓ | ✓ |
| OGG | audio/ogg | ✓ | ✓ | ✗ | ✓ |
| WAV | audio/wav | ✓ | ✓ | ✓ | ✓ |
| AAC | audio/aac | ✓ | ✓ | ✓ | ✓ |

**视频格式兼容性**：

| 格式 | MIME类型 | Chrome | Firefox | Safari | Edge |
|------|---------|--------|---------|--------|------|
| MP4 (H.264) | video/mp4 | ✓ | ✓ | ✓ | ✓ |
| WebM | video/webm | ✓ | ✓ | ✗ | ✓ |
| Ogg | video/ogg | ✓ | ✓ | ✗ | ✓ |
| HLS | application/x-mpegURL | ✗ | ✗ | ✓ | ✗ |

在实际应用中，MP3和MP4(H.264)是目前兼容性最好的格式，但为了优化性能和体积，可以考虑提供WebM格式作为辅助。

### 使用JavaScript控制媒体

HTML5媒体元素提供了丰富的JavaScript API，用于控制播放、获取媒体信息和响应媒体事件：

```javascript
// 获取媒体元素
const video = document.querySelector('video');

// 基本控制
video.play();       // 播放
video.pause();      // 暂停
video.currentTime = 30;  // 跳转到30秒位置
video.volume = 0.5;      // 设置音量为50%
video.playbackRate = 1.5; // 设置播放速度为1.5倍

// 获取媒体信息
console.log(`视频时长: ${video.duration}秒`);
console.log(`当前播放位置: ${video.currentTime}秒`);
console.log(`是否已播放结束: ${video.ended}`);
console.log(`是否暂停: ${video.paused}`);
console.log(`音量: ${video.volume}`);
console.log(`视频尺寸: ${video.videoWidth} x ${video.videoHeight}`);

// 媒体事件监听
video.addEventListener('play', () => {
  console.log('视频开始播放');
});

video.addEventListener('pause', () => {
  console.log('视频已暂停');
});

video.addEventListener('timeupdate', () => {
  // 更新进度条
  const progress = (video.currentTime / video.duration) * 100;
  progressBar.style.width = `${progress}%`;
});

video.addEventListener('ended', () => {
  console.log('视频播放结束');
  // 自动播放下一个视频
  playNextVideo();
});

video.addEventListener('loadedmetadata', () => {
  console.log('视频元数据已加载');
  // 设置视频时长显示
  durationElement.textContent = formatTime(video.duration);
});

// 格式化时间为 MM:SS 格式
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}
```

### 创建自定义播放器

使用HTML5的媒体API，我们可以创建完全自定义的媒体播放器：

```html
<div class="custom-player">
  <video id="myVideo" src="video/sample.mp4" preload="metadata"></video>
  
  <div class="controls">
    <button id="playPauseBtn" class="btn-play-pause">播放</button>
    
    <div class="progress-container">
      <div class="progress-bar">
        <div id="progress" class="progress"></div>
      </div>
      <div class="time">
        <span id="currentTime">0:00</span> / <span id="duration">0:00</span>
      </div>
    </div>
    
    <div class="volume-container">
      <button id="muteBtn" class="btn-mute">静音</button>
      <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="1">
    </div>
    
    <button id="fullscreenBtn" class="btn-fullscreen">全屏</button>
  </div>
</div>
```

```javascript
/**
 * 自定义视频播放器控制
 */
const initCustomPlayer = () => {
  const video = document.getElementById('myVideo');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const muteBtn = document.getElementById('muteBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  const progressBar = document.getElementById('progress');
  const currentTimeElement = document.getElementById('currentTime');
  const durationElement = document.getElementById('duration');
  const progressContainer = document.querySelector('.progress-bar');
  
  // 播放/暂停功能
  playPauseBtn.addEventListener('click', () => {
    if (video.paused || video.ended) {
      video.play();
      playPauseBtn.textContent = '暂停';
    } else {
      video.pause();
      playPauseBtn.textContent = '播放';
    }
  });
  
  // 静音功能
  muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? '取消静音' : '静音';
    volumeSlider.value = video.muted ? 0 : video.volume;
  });
  
  // 音量控制
  volumeSlider.addEventListener('input', () => {
    video.volume = volumeSlider.value;
    if (video.volume === 0) {
      video.muted = true;
      muteBtn.textContent = '取消静音';
    } else {
      video.muted = false;
      muteBtn.textContent = '静音';
    }
  });
  
  // 全屏功能
  fullscreenBtn.addEventListener('click', () => {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) { /* Safari */
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) { /* IE11 */
      video.msRequestFullscreen();
    }
  });
  
  // 进度条点击跳转
  progressContainer.addEventListener('click', (e) => {
    const progressWidth = progressContainer.clientWidth;
    const clickPosition = e.offsetX;
    const seekTime = (clickPosition / progressWidth) * video.duration;
    video.currentTime = seekTime;
  });
  
  // 更新进度条和时间显示
  video.addEventListener('timeupdate', () => {
    // 更新进度条
    const progress = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${progress}%`;
    
    // 更新当前时间显示
    currentTimeElement.textContent = formatTime(video.currentTime);
  });
  
  // 视频元数据加载后设置时长显示
  video.addEventListener('loadedmetadata', () => {
    durationElement.textContent = formatTime(video.duration);
  });
  
  // 格式化时间为 MM:SS 格式
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
};

// 初始化播放器
window.addEventListener('DOMContentLoaded', initCustomPlayer);
```

## 字幕与音轨支持

HTML5通过`<track>`元素提供了对字幕、标题和章节标记的支持：

```html
<video controls>
  <source src="video/movie.mp4" type="video/mp4">
  <track kind="subtitles" src="subtitles/english.vtt" srclang="en" label="English" default>
  <track kind="subtitles" src="subtitles/chinese.vtt" srclang="zh" label="中文">
  <track kind="chapters" src="chapters/chapters.vtt" srclang="en" label="Chapters">
</video>
```

### WebVTT格式

Web Video Text Tracks (WebVTT) 是HTML5视频字幕的标准格式：

```
WEBVTT

00:00:01.000 --> 00:00:05.000
欢迎使用HTML5视频字幕功能

00:00:07.000 --> 00:00:10.000
这是第二行字幕

00:00:12.000 --> 00:00:18.000 align:start position:10%
这是位置特殊的字幕
```

### 使用JavaScript控制字幕

```javascript
const video = document.querySelector('video');
const tracks = video.textTracks;

// 切换字幕语言
function switchSubtitleLanguage(language) {
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].kind === 'subtitles') {
      // 关闭所有字幕
      tracks[i].mode = 'disabled';
      
      // 启用选定语言的字幕
      if (tracks[i].language === language) {
        tracks[i].mode = 'showing';
      }
    }
  }
}

// 监听字幕变化
tracks[0].addEventListener('cuechange', () => {
  const activeCues = tracks[0].activeCues;
  if (activeCues.length > 0) {
    console.log(`当前字幕: ${activeCues[0].text}`);
    // 可以在此处更新自定义字幕显示
  }
});
```

## 音视频捕获与录制

HTML5的MediaDevices API允许我们访问用户的摄像头和麦克风，并进行录制：

### 访问摄像头和麦克风

```javascript
/**
 * 访问用户摄像头和麦克风
 * @param {boolean} audio - 是否请求音频访问权限
 * @param {boolean} video - 是否请求视频访问权限
 * @returns {Promise<MediaStream>} 媒体流
 */
async function getMediaStream(audio = true, video = true) {
  try {
    // 简单请求
    const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
    return stream;
    
    // 带约束条件的请求
    /*
    const constraints = {
      audio: true,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user" // 前置摄像头
      }
    };
    return await navigator.mediaDevices.getUserMedia(constraints);
    */
  } catch (err) {
    console.error('访问媒体设备失败:', err);
    throw err;
  }
}

// 使用示例
async function startCamera() {
  try {
    const stream = await getMediaStream(true, true);
    const videoElement = document.getElementById('webcam');
    
    // 将媒体流设置为视频元素的源
    videoElement.srcObject = stream;
    
    // 播放视频
    videoElement.onloadedmetadata = () => {
      videoElement.play();
    };
  } catch (err) {
    alert('无法访问摄像头和麦克风: ' + err.message);
  }
}
```

### 枚举可用设备

```javascript
/**
 * 列出可用的媒体输入设备
 */
async function listMediaDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    const audioDevices = devices.filter(device => device.kind === 'audioinput');
    
    console.log('可用视频设备:', videoDevices);
    console.log('可用音频设备:', audioDevices);
    
    // 创建设备选择器
    const videoSelect = document.getElementById('videoSource');
    const audioSelect = document.getElementById('audioSource');
    
    // 清空现有选项
    videoSelect.innerHTML = '';
    audioSelect.innerHTML = '';
    
    // 添加视频设备选项
    videoDevices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.text = device.label || `摄像头 ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    });
    
    // 添加音频设备选项
    audioDevices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.text = device.label || `麦克风 ${audioSelect.length + 1}`;
      audioSelect.appendChild(option);
    });
    
  } catch (err) {
    console.error('枚举媒体设备失败:', err);
  }
}

// 根据选择的设备ID获取媒体流
async function getStreamByDeviceId(videoDeviceId, audioDeviceId) {
  const constraints = {
    audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
    video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true
  };
  
  return await navigator.mediaDevices.getUserMedia(constraints);
}
```

### 使用MediaRecorder录制媒体

```javascript
/**
 * 录制媒体流
 * @param {MediaStream} stream - 要录制的媒体流
 * @param {string} mimeType - 录制的MIME类型
 * @returns {Object} 录制控制对象
 */
function createMediaRecorder(stream, mimeType = 'video/webm') {
  let chunks = [];
  let mediaRecorder = null;
  
  // 检查浏览器是否支持指定的MIME类型
  if (MediaRecorder.isTypeSupported(mimeType)) {
    mediaRecorder = new MediaRecorder(stream, { mimeType });
  } else {
    // 退回到默认类型
    mediaRecorder = new MediaRecorder(stream);
  }
  
  // 录制数据可用时的处理
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };
  
  // 录制停止时的处理
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: mimeType });
    chunks = [];
    
    // 创建可下载链接
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `recording-${new Date().toISOString()}.webm`;
    downloadLink.innerHTML = '下载录制文件';
    document.body.appendChild(downloadLink);
    
    // 可选：自动播放录制的内容
    const recordingVideo = document.getElementById('recordingPlayback');
    recordingVideo.src = url;
  };
  
  // 返回控制接口
  return {
    start: (timeslice) => {
      mediaRecorder.start(timeslice);
    },
    stop: () => {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    },
    pause: () => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
      }
    },
    resume: () => {
      if (mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
      }
    },
    getState: () => mediaRecorder.state
  };
}

// 使用示例
async function setupRecording() {
  try {
    const stream = await getMediaStream(true, true);
    const videoElement = document.getElementById('webcam');
    videoElement.srcObject = stream;
    
    const startBtn = document.getElementById('startRecording');
    const stopBtn = document.getElementById('stopRecording');
    const pauseBtn = document.getElementById('pauseRecording');
    
    const recorder = createMediaRecorder(stream);
    
    startBtn.addEventListener('click', () => {
      recorder.start(1000); // 每秒提供一个数据块
      startBtn.disabled = true;
      stopBtn.disabled = false;
      pauseBtn.disabled = false;
    });
    
    stopBtn.addEventListener('click', () => {
      recorder.stop();
      startBtn.disabled = false;
      stopBtn.disabled = true;
      pauseBtn.disabled = true;
    });
    
    pauseBtn.addEventListener('click', () => {
      if (recorder.getState() === 'recording') {
        recorder.pause();
        pauseBtn.textContent = '继续';
      } else if (recorder.getState() === 'paused') {
        recorder.resume();
        pauseBtn.textContent = '暂停';
      }
    });
    
  } catch (err) {
    console.error('设置录制失败:', err);
  }
}
```

## Web Audio API

Web Audio API是一个功能强大的JavaScript API，用于在Web应用中处理和合成音频。它提供了一个模块化的音频处理图（Audio Graph），包含音频源、效果器、分析器和目标节点。

### Audio Context

Audio Context是Web Audio API的核心，所有的音频操作都在这个上下文中进行：

```javascript
// 创建音频上下文
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 检查音频上下文状态
console.log(`音频上下文状态: ${audioContext.state}`);

// 由于浏览器策略限制，音频上下文需要用户交互才能启动
document.querySelector('#startAudio').addEventListener('click', () => {
  if (audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      console.log('音频上下文已恢复');
    });
  }
});
```

### 音频节点类型

Web Audio API提供了多种音频节点类型：

1. **源节点**：产生音频信号
   - `OscillatorNode`：振荡器，生成不同波形的音调
   - `AudioBufferSourceNode`：用于播放内存中的音频数据
   - `MediaElementAudioSourceNode`：从HTML5 audio/video元素获取音频
   - `MediaStreamAudioSourceNode`：从麦克风等媒体流获取音频

2. **处理节点**：修改音频信号
   - `GainNode`：控制音量
   - `BiquadFilterNode`：音频滤波器（低通、高通等）
   - `DelayNode`：延迟效果
   - `ConvolverNode`：卷积效果（混响等）
   - `DynamicsCompressorNode`：动态压缩效果

3. **分析节点**：分析音频数据
   - `AnalyserNode`：提供时域和频域分析

4. **目标节点**：输出音频
   - `AudioDestinationNode`：通常是扬声器

### 创建简单的音频合成器

```javascript
/**
 * 创建简单的合成器
 * @param {AudioContext} audioContext - 音频上下文
 * @returns {Object} 合成器控制接口
 */
function createSynthesizer(audioContext) {
  // 创建振荡器（音源）
  const oscillator = audioContext.createOscillator();
  oscillator.type = 'sine'; // 'sine', 'square', 'sawtooth', 'triangle'
  oscillator.frequency.value = 440; // A4音符 (440Hz)
  
  // 创建增益节点（音量控制）
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0; // 初始音量为0
  
  // 连接节点: 振荡器 -> 增益节点 -> 目标输出
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // 启动振荡器（它会一直运行）
  oscillator.start();
  
  // 返回控制接口
  return {
    /**
     * 播放指定音符
     * @param {number} frequency - 频率（Hz）
     * @param {number} duration - 持续时间（秒）
     */
    playNote: (frequency, duration = 0.5) => {
      const currentTime = audioContext.currentTime;
      
      // 设置频率
      oscillator.frequency.setValueAtTime(frequency, currentTime);
      
      // 设置音量包络（ADSR: Attack, Decay, Sustain, Release）
      gainNode.gain.cancelScheduledValues(currentTime);
      gainNode.gain.setValueAtTime(0, currentTime);
      
      // Attack - 快速上升到最大音量
      gainNode.gain.linearRampToValueAtTime(1, currentTime + 0.01);
      
      // Decay - 降到持续音量
      gainNode.gain.linearRampToValueAtTime(0.7, currentTime + 0.1);
      
      // Sustain - 保持持续音量
      gainNode.gain.setValueAtTime(0.7, currentTime + 0.1);
      
      // Release - 淡出
      gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);
    },
    
    /**
     * 设置波形类型
     * @param {string} type - 波形类型: 'sine', 'square', 'sawtooth', 'triangle'
     */
    setWaveform: (type) => {
      oscillator.type = type;
    },
    
    /**
     * 停止合成器
     */
    stop: () => {
      oscillator.stop();
    }
  };
}

// 使用示例
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const synth = createSynthesizer(audioContext);

// 播放简单旋律
document.querySelector('#playMelody').addEventListener('click', () => {
  const now = audioContext.currentTime;
  
  // C4音符频率
  const C4 = 261.63;
  
  // 简单音符序列（C大调音阶）
  const notes = [
    { freq: C4, duration: 0.5 },         // C4
    { freq: C4 * 9/8, duration: 0.5 },   // D4
    { freq: C4 * 5/4, duration: 0.5 },   // E4
    { freq: C4 * 4/3, duration: 0.5 },   // F4
    { freq: C4 * 3/2, duration: 0.5 },   // G4
    { freq: C4 * 5/3, duration: 0.5 },   // A4
    { freq: C4 * 15/8, duration: 0.5 },  // B4
    { freq: C4 * 2, duration: 1 }        // C5
  ];
  
  // 按顺序播放音符
  let startTime = now;
  notes.forEach(note => {
    setTimeout(() => {
      synth.playNote(note.freq, note.duration);
    }, (startTime - now) * 1000);
    
    startTime += note.duration;
  });
});

// 设置波形类型
document.querySelectorAll('[name="waveform"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    synth.setWaveform(e.target.value);
  });
});
```

### 音频分析与可视化

Web Audio API的AnalyserNode允许我们分析和可视化音频数据：

```javascript
/**
 * 创建音频可视化器
 * @param {AudioContext} audioContext - 音频上下文
 * @param {HTMLElement} sourceNode - 音频源节点
 * @param {HTMLCanvasElement} canvas - 用于绘制的画布
 */
function createAudioVisualizer(audioContext, sourceNode, canvas) {
  // 创建分析器节点
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048; // FFT大小，必须是2的幂
  
  // 连接源节点到分析器（不影响音频输出）
  sourceNode.connect(analyser);
  
  // 获取画布上下文
  const canvasCtx = canvas.getContext('2d');
  
  // 创建数据数组
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  // 设置画布尺寸
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  
  // 绘制函数
  function draw() {
    // 请求下一帧动画
    requestAnimationFrame(draw);
    
    // 获取频域数据
    analyser.getByteFrequencyData(dataArray);
    
    // 清空画布
    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 计算条形宽度
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    
    // 绘制频谱
    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 255 * canvas.height;
      
      // 根据频率设置不同颜色
      const r = 255 - barHeight + (25 * i / bufferLength);
      const g = 50 * i / bufferLength;
      const b = barHeight + (10 * i / bufferLength);
      
      canvasCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
  }
  
  // 开始绘制
  draw();
  
  // 返回控制接口
  return {
    analyser,
    setFFTSize: (size) => {
      analyser.fftSize = size;
    }
  };
}

// 使用示例：从音频元素创建可视化
const audioElement = document.getElementById('audioSource');
const canvas = document.getElementById('visualizer');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 从HTML5 audio元素创建源节点
const source = audioContext.createMediaElementSource(audioElement);

// 连接到输出（扬声器）
source.connect(audioContext.destination);

// 创建可视化器
const visualizer = createAudioVisualizer(audioContext, source, canvas);

// 控制FFT大小（影响分辨率）
document.getElementById('fftSize').addEventListener('change', (e) => {
  const size = parseInt(e.target.value);
  visualizer.setFFTSize(size);
});
```

## WebRTC与实时通信

WebRTC (Web Real-Time Communication) 是一组标准、协议和JavaScript API，使浏览器能够直接进行点对点的音视频通信和数据共享，无需插件或第三方软件。

### WebRTC的核心组件

WebRTC由三个主要API组成：

1. **MediaStream** (又称getUserMedia)：用于访问设备的摄像头和麦克风
2. **RTCPeerConnection**：用于在对等方之间建立和管理连接
3. **RTCDataChannel**：用于在对等方之间传输任意数据

### 简单的视频通话实现

以下是一个基本的视频通话实现示例：

```javascript
/**
 * WebRTC视频通话示例
 */
class SimpleVideoCall {
  constructor() {
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    
    // STUN服务器配置（帮助NAT穿越）
    this.iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
    
    // DOM元素
    this.localVideo = document.getElementById('localVideo');
    this.remoteVideo = document.getElementById('remoteVideo');
    this.callButton = document.getElementById('callButton');
    this.hangupButton = document.getElementById('hangupButton');
    
    // 用于简化示例，通常这些信息会通过信令服务器传递
    this.offerSDP = document.getElementById('offerSDP');
    this.answerSDP = document.getElementById('answerSDP');
    
    // 绑定事件处理器
    this.callButton.addEventListener('click', this.call.bind(this));
    this.hangupButton.addEventListener('click', this.hangup.bind(this));
    document.getElementById('createOffer').addEventListener('click', this.createOffer.bind(this));
    document.getElementById('createAnswer').addEventListener('click', this.createAnswer.bind(this));
    document.getElementById('setRemoteOffer').addEventListener('click', this.setRemoteOffer.bind(this));
    document.getElementById('setRemoteAnswer').addEventListener('click', this.setRemoteAnswer.bind(this));
  }
  
  /**
   * 初始化本地媒体流
   */
  async initLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      
      this.localVideo.srcObject = this.localStream;
      return true;
    } catch (err) {
      console.error('获取本地媒体流失败:', err);
      return false;
    }
  }
  
  /**
   * 初始化对等连接
   */
  initPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.iceServers);
    
    // 将本地流的所有轨道添加到对等连接
    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream);
    });
    
    // 监听远程流
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteVideo.srcObject = event.streams[0];
        this.remoteStream = event.streams[0];
      }
    };
    
    // 监听ICE候选
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('新的ICE候选:', event.candidate);
        // 在实际应用中，需要将候选发送给远程对等方
      } else {
        // ICE收集完成，更新SDP文本区域
        if (this.peerConnection.localDescription.type === 'offer') {
          this.offerSDP.value = JSON.stringify(this.peerConnection.localDescription);
        } else if (this.peerConnection.localDescription.type === 'answer') {
          this.answerSDP.value = JSON.stringify(this.peerConnection.localDescription);
        }
      }
    };
    
    // 监听连接状态变化
    this.peerConnection.onconnectionstatechange = (event) => {
      console.log('连接状态变化:', this.peerConnection.connectionState);
      
      switch(this.peerConnection.connectionState) {
        case 'connected':
          console.log('对等方已连接!');
          break;
        case 'disconnected':
        case 'failed':
          console.log('连接断开或失败');
          // 可以在这里处理连接失败的情况
          break;
        case 'closed':
          console.log('连接关闭');
          break;
      }
    };
  }
  
  /**
   * 创建并发送offer
   */
  async createOffer() {
    if (!this.peerConnection) {
      await this.initLocalStream();
      this.initPeerConnection();
    }
    
    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await this.peerConnection.setLocalDescription(offer);
      console.log('创建offer成功');
      
      // 在实际应用中，需要将offer发送给远程对等方
      // 这里使用文本区域模拟
    } catch (err) {
      console.error('创建offer失败:', err);
    }
  }
  
  /**
   * 设置远程offer
   */
  async setRemoteOffer() {
    if (!this.peerConnection) {
      await this.initLocalStream();
      this.initPeerConnection();
    }
    
    try {
      const offerSDP = JSON.parse(this.offerSDP.value);
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerSDP));
      console.log('设置远程offer成功');
    } catch (err) {
      console.error('设置远程offer失败:', err);
    }
  }
  
  /**
   * 创建并发送answer
   */
  async createAnswer() {
    if (!this.peerConnection) {
      console.error('需要先设置远程offer');
      return;
    }
    
    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      console.log('创建answer成功');
      
      // 在实际应用中，需要将answer发送给远程对等方
      // 这里使用文本区域模拟
    } catch (err) {
      console.error('创建answer失败:', err);
    }
  }
  
  /**
   * 设置远程answer
   */
  async setRemoteAnswer() {
    if (!this.peerConnection) {
      console.error('需要先创建offer');
      return;
    }
    
    try {
      const answerSDP = JSON.parse(this.answerSDP.value);
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerSDP));
      console.log('设置远程answer成功');
    } catch (err) {
      console.error('设置远程answer失败:', err);
    }
  }
  
  /**
   * 发起通话
   */
  async call() {
    if (!this.localStream) {
      const success = await this.initLocalStream();
      if (!success) return;
    }
    
    this.initPeerConnection();
    await this.createOffer();
    
    this.callButton.disabled = true;
    this.hangupButton.disabled = false;
  }
  
  /**
   * 挂断通话
   */
  hangup() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    // 停止所有媒体轨道
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }
    
    this.localVideo.srcObject = null;
    this.remoteVideo.srcObject = null;
    
    this.callButton.disabled = false;
    this.hangupButton.disabled = true;
    
    console.log('通话已结束');
  }
}

// 初始化视频通话
document.addEventListener('DOMContentLoaded', () => {
  window.videoCall = new SimpleVideoCall();
});
```

### 实际应用中的WebRTC架构

在实际应用中，WebRTC通常需要以下几个服务器组件：

1. **信令服务器**：处理会话建立和管理（不是WebRTC标准的一部分）
   - 用于交换SDP和ICE候选信息
   - 可以使用WebSocket、REST API或其他通信方式

2. **STUN服务器**：帮助穿越NAT，发现公网IP和端口
   - Session Traversal Utilities for NAT

3. **TURN服务器**：当直接对等连接失败时提供中继服务
   - Traversal Using Relays around NAT

完整的WebRTC应用架构如下：

```
+-------------+                   +-------------+
|             |<-- 信令服务器 --->|             |
|  浏览器 A   |                   |  浏览器 B   |
|             |<--- STUN/TURN --->|             |
+-------------+                   +-------------+
      ^                                 ^
      |                                 |
      v                                 v
+------------------------------------------+
|           ICE (交互式连接建立)           |
+------------------------------------------+
      ^                                 ^
      |                                 |
      v                                 v
+------------------------------------------+
|          DTLS/SRTP (安全传输)            |
+------------------------------------------+
      ^                                 ^
      |                                 |
      v                                 v
+-------------+                   +-------------+
| 媒体/数据通道|<--- P2P连接 ---->| 媒体/数据通道|
+-------------+                   +-------------+
```

### 使用数据通道传输数据

WebRTC不仅可以传输音视频，还可以通过DataChannel API传输任意数据：

```javascript
/**
 * 创建和使用WebRTC数据通道
 */
class DataChannelDemo {
  constructor() {
    this.peerConnection = null;
    this.dataChannel = null;
    this.isInitiator = false;
    
    // STUN服务器配置
    this.iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };
    
    // DOM元素
    this.messageInput = document.getElementById('messageInput');
    this.sendButton = document.getElementById('sendMessage');
    this.messagesBox = document.getElementById('messagesBox');
    
    // 绑定事件处理器
    this.sendButton.addEventListener('click', this.sendMessage.bind(this));
    document.getElementById('createDataChannel').addEventListener('click', () => {
      this.isInitiator = true;
      this.initConnection();
    });
    document.getElementById('joinDataChannel').addEventListener('click', () => {
      this.isInitiator = false;
      this.initConnection();
    });
  }
  
  /**
   * 初始化对等连接
   */
  initConnection() {
    this.peerConnection = new RTCPeerConnection(this.iceServers);
    
    // 监听ICE候选
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('新的ICE候选:', event.candidate);
        // 在实际应用中，需要将候选发送给远程对等方
      }
    };
    
    // 如果是发起方，创建数据通道
    if (this.isInitiator) {
      this.createDataChannel();
      this.createOffer();
    } else {
      // 如果是接收方，监听数据通道
      this.peerConnection.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setupDataChannel();
        console.log('接收到远程数据通道');
      };
      
      // 请求设置远程offer（在实际应用中，这会通过信令服务器自动完成）
      const offerSDP = prompt('请粘贴offer SDP:');
      if (offerSDP) {
        this.setRemoteOffer(JSON.parse(offerSDP));
      }
    }
  }
  
  /**
   * 创建数据通道
   */
  createDataChannel() {
    this.dataChannel = this.peerConnection.createDataChannel('chat', {
      ordered: true,            // 确保消息按顺序到达
      maxRetransmits: 3,        // 最大重传次数
      maxPacketLifeTime: 1000   // 数据包生存时间（毫秒）
    });
    
    this.setupDataChannel();
    console.log('创建数据通道成功');
  }
  
  /**
   * 设置数据通道事件处理器
   */
  setupDataChannel() {
    this.dataChannel.onopen = () => {
      console.log('数据通道已打开');
      this.sendButton.disabled = false;
      this.messageInput.disabled = false;
      
      this.addMessage('系统', '连接已建立，可以开始聊天了！');
    };
    
    this.dataChannel.onclose = () => {
      console.log('数据通道已关闭');
      this.sendButton.disabled = true;
      this.messageInput.disabled = true;
      
      this.addMessage('系统', '连接已断开。');
    };
    
    this.dataChannel.onmessage = (event) => {
      // 处理接收到的消息
      const message = JSON.parse(event.data);
      this.addMessage(message.sender, message.text);
    };
    
    this.dataChannel.onerror = (error) => {
      console.error('数据通道错误:', error);
      this.addMessage('系统', '错误: ' + error.message);
    };
  }
  
  /**
   * 创建并发送offer
   */
  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      console.log('创建offer成功');
      
      // 在实际应用中，需要将offer发送给远程对等方
      // 这里通过弹窗模拟
      alert('请将以下offer SDP发送给另一方:\n\n' + JSON.stringify(this.peerConnection.localDescription));
    } catch (err) {
      console.error('创建offer失败:', err);
    }
  }
  
  /**
   * 设置远程offer
   */
  async setRemoteOffer(offerSDP) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerSDP));
      console.log('设置远程offer成功');
      
      // 创建应答
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      // 在实际应用中，需要将answer发送给远程对等方
      // 这里通过弹窗模拟
      alert('请将以下answer SDP发送给另一方:\n\n' + JSON.stringify(this.peerConnection.localDescription));
    } catch (err) {
      console.error('处理offer失败:', err);
    }
  }
  
  /**
   * 设置远程answer
   */
  async setRemoteAnswer(answerSDP) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerSDP));
      console.log('设置远程answer成功');
    } catch (err) {
      console.error('设置远程answer失败:', err);
    }
  }
  
  /**
   * 发送消息
   */
  sendMessage() {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('数据通道未打开');
      return;
    }
    
    const text = this.messageInput.value.trim();
    if (!text) return;
    
    const message = {
      sender: '我',
      text: text,
      time: new Date().toISOString()
    };
    
    // 发送消息
    this.dataChannel.send(JSON.stringify(message));
    
    // 在本地显示消息
    this.addMessage('我', text);
    
    // 清空输入框
    this.messageInput.value = '';
  }
  
  /**
   * 在消息框中添加消息
   */
  addMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
      <strong>${sender}:</strong> ${text}
      <span class="time">${new Date().toLocaleTimeString()}</span>
    `;
    
    this.messagesBox.appendChild(messageElement);
    
    // 滚动到底部
    this.messagesBox.scrollTop = this.messagesBox.scrollHeight;
  }
}

// 初始化数据通道演示
document.addEventListener('DOMContentLoaded', () => {
  window.dataChannelDemo = new DataChannelDemo();
});
```

## 屏幕共享与媒体流处理

HTML5提供了捕获屏幕内容和处理媒体流的能力，可用于屏幕共享、录制和实时编辑等场景。

### 屏幕捕获API

使用`getDisplayMedia()`API可以捕获屏幕或应用窗口的内容：

```javascript
/**
 * 捕获屏幕内容
 */
async function captureScreen() {
  try {
    // 请求屏幕媒体
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always',       // 显示光标
        displaySurface: 'monitor', // 'monitor', 'window', 'application', 'browser'
        logicalSurface: true,   // 包括隐藏的窗口
        frameRate: { ideal: 30, max: 60 }  // 帧率设置
      },
      audio: false  // 是否捕获系统音频（部分浏览器支持）
    });
    
    // 显示屏幕内容
    const videoElement = document.getElementById('screenOutput');
    videoElement.srcObject = screenStream;
    
    // 监听停止分享事件
    const videoTrack = screenStream.getVideoTracks()[0];
    videoTrack.onended = () => {
      console.log('用户停止了屏幕共享');
      videoElement.srcObject = null;
    };
    
    return screenStream;
  } catch (err) {
    console.error('捕获屏幕失败:', err);
    return null;
  }
}

// 使用屏幕捕获进行WebRTC共享
async function shareScreen() {
  const screenStream = await captureScreen();
  if (!screenStream) return;
  
  // 假设我们已经有了一个WebRTC连接
  if (peerConnection) {
    // 移除任何现有的视频轨道
    const senders = peerConnection.getSenders();
    senders.forEach(sender => {
      if (sender.track && sender.track.kind === 'video') {
        peerConnection.removeTrack(sender);
      }
    });
    
    // 添加屏幕共享轨道
    const videoTrack = screenStream.getVideoTracks()[0];
    peerConnection.addTrack(videoTrack, screenStream);
    
    console.log('已开始共享屏幕');
  }
}
```

### 合并与处理媒体流

可以使用MediaStream API合并和处理多个媒体流：

```javascript
/**
 * 合并音视频流
 * @param {MediaStream} videoStream - 视频流
 * @param {MediaStream} audioStream - 音频流
 * @returns {MediaStream} 合并后的流
 */
function combineStreams(videoStream, audioStream) {
  // 创建新的空媒体流
  const combinedStream = new MediaStream();
  
  // 添加所有视频轨道
  videoStream.getVideoTracks().forEach(track => {
    combinedStream.addTrack(track);
  });
  
  // 添加所有音频轨道
  audioStream.getAudioTracks().forEach(track => {
    combinedStream.addTrack(track);
  });
  
  return combinedStream;
}

/**
 * 画中画效果：将摄像头视频叠加到屏幕共享上
 */
async function pictureInPicture() {
  // 捕获屏幕
  const screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false
  });
  
  // 捕获摄像头
  const cameraStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });
  
  // 获取画布和上下文
  const canvas = document.getElementById('pipCanvas');
  const ctx = canvas.getContext('2d');
  
  // 设置画布尺寸
  canvas.width = 1280;
  canvas.height = 720;
  
  // 创建视频元素
  const screenVideo = document.createElement('video');
  screenVideo.srcObject = screenStream;
  screenVideo.play();
  
  const cameraVideo = document.createElement('video');
  cameraVideo.srcObject = cameraStream;
  cameraVideo.play();
  
  // 绘制函数
  function drawPIP() {
    // 绘制屏幕共享（大画面）
    ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
    
    // 绘制摄像头（小画面，右下角）
    const pipWidth = canvas.width / 4;
    const pipHeight = canvas.height / 4;
    ctx.drawImage(
      cameraVideo,
      canvas.width - pipWidth - 20,  // 右边距20px
      canvas.height - pipHeight - 20, // 下边距20px
      pipWidth,
      pipHeight
    );
    
    // 继续下一帧
    requestAnimationFrame(drawPIP);
  }
  
  // 开始绘制
  drawPIP();
  
  // 从画布创建媒体流（用于录制或WebRTC传输）
  const canvasStream = canvas.captureStream(30); // 30fps
  
  // 添加来自摄像头的音频轨道
  cameraStream.getAudioTracks().forEach(track => {
    canvasStream.addTrack(track);
  });
  
  return canvasStream;
}
```

## 媒体处理与滤镜

HTML5 Canvas结合媒体元素和WebGL可以实现实时视频处理和滤镜效果。

### 基础视频处理

使用Canvas处理视频帧：

```javascript
/**
 * 简单的视频处理器
 * @param {HTMLVideoElement} sourceVideo - 源视频元素 
 * @param {HTMLCanvasElement} targetCanvas - 目标画布
 */
function createVideoProcessor(sourceVideo, targetCanvas) {
  const ctx = targetCanvas.getContext('2d');
  let processing = false;
  let currentFilter = 'normal';
  
  // 调整画布大小
  function resizeCanvas() {
    targetCanvas.width = sourceVideo.videoWidth;
    targetCanvas.height = sourceVideo.videoHeight;
  }
  
  // 应用滤镜
  function applyFilter(imageData) {
    const data = imageData.data;
    
    switch(currentFilter) {
      case 'grayscale':
        // 灰度滤镜
        for (let i = 0; i < data.length; i += 4) {
          const gray = (data[i] + data[i + 1] + data[i +.2]) / 3;
          data[i] = gray;     // R
          data[i + 1] = gray; // G
          data[i + 2] = gray; // B
        }
        break;
        
      case 'sepia':
        // 复古滤镜
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
        break;
        
      case 'invert':
        // 反色滤镜
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];         // R
          data[i + 1] = 255 - data[i + 1]; // G
          data[i + 2] = 255 - data[i + 2]; // B
        }
        break;
        
      case 'threshold':
        // 阈值滤镜
        const threshold = 128;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0;
          
          data[i] = data[i + 1] = data[i + 2] = v;
        }
        break;
    }
    
    return imageData;
  }
  
  // 处理每一帧
  function processFrame() {
    if (!processing) return;
    
    // 绘制视频帧到画布
    ctx.drawImage(sourceVideo, 0, 0, targetCanvas.width, targetCanvas.height);
    
    // 获取像素数据
    if (currentFilter !== 'normal') {
      const imageData = ctx.getImageData(0, 0, targetCanvas.width, targetCanvas.height);
      
      // 应用滤镜
      const processedData = applyFilter(imageData);
      
      // 将处理后的数据绘制回画布
      ctx.putImageData(processedData, 0, 0);
    }
    
    // 继续下一帧
    requestAnimationFrame(processFrame);
  }
  
  // 公开的API
  return {
    /**
     * 开始处理视频
     */
    start() {
      if (sourceVideo.readyState >= 2) { // HAVE_CURRENT_DATA
        resizeCanvas();
        processing = true;
        processFrame();
      } else {
        sourceVideo.addEventListener('loadeddata', () => {
          resizeCanvas();
          processing = true;
          processFrame();
        });
      }
    },
    
    /**
     * 停止处理
     */
    stop() {
      processing = false;
    },
    
    /**
     * 设置滤镜
     * @param {string} filter - 滤镜名称 
     */
    setFilter(filter) {
      currentFilter = filter;
    }
  };
}

// 使用视频处理器
document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('sourceVideo');
  const canvas = document.getElementById('processedCanvas');
  
  const processor = createVideoProcessor(video, canvas);
  
  // 播放视频时启动处理器
  video.addEventListener('play', () => {
    processor.start();
  });
  
  // 暂停视频时停止处理器
  video.addEventListener('pause', () => {
    processor.stop();
  });
  
  // 滤镜选择
  document.querySelectorAll('[name="filter"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      processor.setFilter(e.target.value);
    });
  });
});
```

## HTML5多媒体最佳实践

### 性能优化

1. **格式选择**
   - 使用WebM/VP9格式可以减小文件尺寸，提高加载速度
   - H.264/MP4提供最广泛的兼容性
   - 考虑提供多种格式以优化不同设备和网络条件

2. **响应式媒体**
   - 使用`<picture>`和`srcset`属性为不同设备提供不同分辨率的媒体
   - 通过媒体查询调整视频尺寸和质量

   ```html
   <picture>
     <source srcset="video/high-res.webm" media="(min-width: 1200px)" type="video/webm">
     <source srcset="video/medium-res.webm" media="(min-width: 600px)" type="video/webm">
     <source srcset="video/low-res.webm" type="video/webm">
     <video src="video/fallback.mp4" controls></video>
   </picture>
   ```

3. **延迟加载**
   - 使用`preload="none"`或`preload="metadata"`防止不必要的媒体下载
   - 使用Intersection Observer API实现视口内才加载媒体

   ```javascript
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(entry => {
       if (entry.isIntersecting) {
         const video = entry.target;
         video.src = video.dataset.src;
         video.load();
         observer.unobserve(video);
       }
     });
   });
   
   document.querySelectorAll('video[data-src]').forEach(video => {
     observer.observe(video);
   });
   ```

4. **使用媒体片段**
   - 使用Media Fragments URI规范请求媒体的特定部分

   ```html
   <!-- 加载视频的10-20秒部分 -->
   <video src="video.mp4#t=10,20" controls></video>
   ```

### 辅助功能与可访问性

1. **确保提供字幕和描述**
   - 使用`<track>`元素添加WebVTT格式的字幕
   - 提供音频描述轨道，帮助视障用户

2. **提供替代内容**
   - 在`<audio>`和`<video>`标签之间提供回退内容
   - 提供媒体内容的文本摘要或全文

3. **键盘导航支持**
   - 确保自定义媒体控件可通过键盘访问和操作
   - 使用适当的ARIA角色和属性增强辅助技术支持

4. **自动播放考量**
   - 避免自动播放有声媒体，可能会干扰屏幕阅读器
   - 如必须自动播放，请设置`muted`属性并提供控制选项

### 安全考虑

1. **CORS与跨域媒体**
   - 跨域使用媒体文件需要正确设置CORS头
   - 处理Canvas中的媒体时注意`crossorigin`属性

2. **内容安全策略(CSP)**
   - 使用CSP限制媒体文件的来源
   - 例如：`Content-Security-Policy: media-src 'self' https://trusted-cdn.com`

3. **媒体流加密**
   - 考虑使用加密媒体扩展(EME)保护敏感内容
   - 使用HTTPS传输所有媒体内容

## 总结

HTML5多媒体处理技术彻底改变了Web上的音视频体验，从简单的媒体嵌入到复杂的实时处理和通信，都不再依赖第三方插件。

本文介绍了HTML5多媒体技术的各个方面：
- 基础的`<audio>`和`<video>`元素及其JavaScript控制
- 音视频捕获与录制功能
- Web Audio API强大的音频处理能力
- WebRTC实现的实时通信
- 基于Canvas的媒体处理与滤镜

随着WebAssembly的发展，Web平台的多媒体处理能力将变得越来越强大，有可能在不久的将来完全取代传统桌面应用程序的多媒体处理功能。

## 参考资料

1. [MDN Web Docs: HTML5 Audio and Video](https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery)
2. [MDN Web Docs: MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
3. [MDN Web Docs: Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
4. [MDN Web Docs: WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
5. [MDN Web Docs: MediaStream API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
6. [WebRTC.org](https://webrtc.org/) - WebRTC官方网站
7. [W3C Web Audio API规范](https://www.w3.org/TR/webaudio/)
8. [HTML Living Standard - WHATWG](https://html.spec.whatwg.org/multipage/media.html) 