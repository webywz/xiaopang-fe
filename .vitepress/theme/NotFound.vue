<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>页面没有找到</h2>
      <p>抱歉，您访问的页面不存在或已被移动。</p>
      <div class="suggestions">
        <h3>您可能想要访问：</h3>
        <ul>
          <li><a href="/">返回首页</a></li>
          <li><a href="/blog/">浏览所有文章</a></li>
          <li><a href="/vue/">Vue教程</a></li>
          <li><a href="/react/">React教程</a></li>
        </ul>
      </div>
      <div class="search-container">
        <p>或者搜索内容：</p>
        <input type="text" placeholder="搜索..." />
        <button>搜索</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  text-align: center;
}

.not-found-content h1 {
  font-size: 6rem;
  margin-bottom: 0;
  color: #3eaf7c;
}

.suggestions {
  margin-top: 2rem;
}

.suggestions ul {
  list-style: none;
  padding: 0;
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-container {
  margin-top: 2rem;
}

input {
  padding: 0.5rem;
  width: 60%;
  max-width: 300px;
}

button {
  padding: 0.5rem 1rem;
  background: #3eaf7c;
  color: white;
  border: none;
  cursor: pointer;
}
</style> 