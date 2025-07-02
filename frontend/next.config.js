/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'lh3.googleusercontent.com',  // Google 用户头像域名
      'googleusercontent.com',
      'graph.facebook.com',         // Facebook 用户头像域名
      'platform-lookaside.fbsbx.com', // 另一个 Facebook 域名
      'avatars.githubusercontent.com', // GitHub 用户头像域名
      'pbs.twimg.com',              // Twitter 用户头像域名
      'localhost'                   // 本地开发
    ],
  },
};

export default nextConfig;