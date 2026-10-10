# SET 燃烬 · BurningAsh 展示站

面向 Barotrauma 模组的静态展示页。纯 HTML、CSS、JavaScript，无需构建或运行服务器后端。

- 网站：<https://sth-skylight.github.io/set-burning-ash/>
- 模组：<https://steamcommunity.com/sharedfiles/filedetails/?id=3236043692>
- 文案与结构：`index.html`
- 样式与响应式布局：`styles.css`
- 手机导航、系统切换、开屏、章节转场、鼠标反馈与音乐控制：`script.js`
- 网站素材：`assets/`，来自模组已有素材；`main.png` 保持原图，其余为网页优化版本或物品贴图裁切。

本地可直接打开 `index.html`，或在此目录运行 `python -m http.server 8080` 后访问 `http://localhost:8080`。

系统卡片和档案右上角的箭头打开详情视图，复用首页内容；支持左右切换、Esc 返回和浏览器后退。详情链接使用 `#system-cyber`、`#system-arsenal`、`#system-medical`、`#system-transit`、`#archive-1`、`#archive-2`，可以直接分享，GitHub Pages 无需额外路由配置。

全站音乐为 `assets/set_market_neutral.ogg`，循环播放，切换详情不中断。右下角及详情工具栏的波形按钮控制开关并记住选择；浏览器禁止自动播放时，首次点击后启动。切到后台暂停，返回后按开关状态恢复。开屏每次会话只播放一次；系统开启“减少动态效果”时关闭主要动效。

GitHub Pages 使用 `main` 分支根目录发布。修改文件并提交到该分支即可更新网站；无需部署 DLL、模组源码或整个 Assets 目录。网站可用性取决于 GitHub Pages 服务与访问者网络。

排版参考 Enderli 网站的工业档案风格，本站代码独立编写。医疗与运输图形是系统示意，不是游戏截图。模组功能、前置要求及安装方式以创意工坊当前说明为准。素材版权归各自权利人所有。
