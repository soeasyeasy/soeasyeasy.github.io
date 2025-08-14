import { defineUserConfig } from "vuepress";
import recoTheme from "vuepress-theme-reco";
import { viteBundler } from '@vuepress/bundler-vite'
import { webpackBundler } from '@vuepress/bundler-webpack'

// .vuepress/config.js

export default defineUserConfig({
  title: "soeasyeasy",
  description: "soeasyeasy",
  bundler: viteBundler(),
  // bundler: webpackBundler(),
  theme: recoTheme({
    docsDir: '/docs',
    colorMode: 'auto',
    logo: "/see.gif",
    author: "Exceptions",
    authorAvatar: "/head.jpg",
    docsRepo: "https://github.com/soeasyeasy",
    docsBranch: "main",
    lastUpdatedText: "",
    // series 为原 sidebar
    series: {
      "/blogs/工作/xxl-job/": [
        {
          text: 'xxl-job',
          children: [ '/工作/xxl-job/xxl-job代码逻辑.md','/工作/xxl-job/xxl-job saas化 ai建议.md', '/工作/xxl-job/xxl-job saas化.md' ]
        }
      ],
      "/blogs/工作/elk/": [
        {
          text: 'xxl-job',
          children: [ '/工作/elk/完整elk脚本.md','/工作/elk/efk脚本.md', '/工作/elk/elk window下docker部署.md' ]
        }
      ],
      
    },
    // autoSetSeries: true,
    commentConfig: {
      type: 'valine',
      options: {
        appId: '...', // your appId
        appKey: '...', // your appKey
        hideComments: true, // 全局隐藏评论，默认 false
      },
    },
    navbar: [
      { text: "首页", link: "/" },
      { text: "博客", link: "/posts/1.html" },
      { text: "分类", link: "/categories/linux/1.html" },
      { text: "标签", link: "/tags/rizhi/1.html" },
      // {
      //   text: "文档",
      //   children: [
      //     { text: "xxl-job合集", link: "/docs/xxljob/xxl-job代码逻辑" },
      //     { text: "杂记", link: "/docs/theme-reco/home" }
      //   ],
      // },
      { text: "时间轴", link: "/timeline.html" },
      { text: "常用网站", link: "/friendship-link.html" }
    ],
    friendshipLinks: [
      {
        title: 'vuepress-recovuepress-recovuepress-recovuepress-reco',
        logo: 'https://avatars.githubusercontent.com/u/54167020?s=200&v=4',
        link: 'https://github.com/vuepress-reco'
      }
    ],
    bulletin: {
      // body: [
      //   {
      //     type: "text",
      //     content: `🎉🎉🎉 reco 主题 2.x 已经接近 Beta 版本，在发布 Latest 版本之前不会再有大的更新，大家可以尽情尝鲜了，并且希望大家在 QQ 群和 GitHub 踊跃反馈使用体验，我会在第一时间响应。`,
      //     style: "font-size: 12px;",
      //   },
      //   {
      //     type: "hr",
      //   },
      //   {
      //     type: "title",
      //     content: "QQ 群",
      //   },
      //   {
      //     type: "text",
      //     content: `
      //     <ul>
      //       <li>QQ群1：1037296104</li>
      //       <li>QQ群2：1061561395</li>
      //       <li>QQ群3：962687802</li>
      //     </ul>`,
      //     style: "font-size: 12px;",
      //   },
      //   {
      //     type: "hr",
      //   },
      //   {
      //     type: "title",
      //     content: "GitHub",
      //   },
      //   {
      //     type: "text",
      //     content: `
      //     <ul>
      //       <li><a href="https://github.com/vuepress-reco/vuepress-theme-reco-next/issues">Issues<a/></li>
      //       <li><a href="https://github.com/vuepress-reco/vuepress-theme-reco-next/discussions/1">Discussions<a/></li>
      //     </ul>`,
      //     style: "font-size: 12px;",
      //   },
      //   {
      //     type: "hr",
      //   },
      //   {
      //     type: "buttongroup",
      //     children: [
      //       {
      //         text: "打赏",
      //         link: "/docs/others/donate.html",
      //       },
      //     ],
      //   },
      // ],
    },
    // commentConfig: {
    //   type: 'valine',
    //   // options 与 1.x 的 valineConfig 配置一致
    //   options: {
    //     // appId: 'xxx',
    //     // appKey: 'xxx',
    //     // placeholder: '填写邮箱可以收到回复提醒哦！',
    //     // verify: true, // 验证码服务
    //     // notify: true,
    //     // recordIP: true,
    //     // hideComments: true // 隐藏评论
    //   },
    // },
  }),
  // debug: true,
});
