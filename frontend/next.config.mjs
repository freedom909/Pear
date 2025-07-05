/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'googleusercontent.com',
      'graph.facebook.com',
      'platform-lookaside.fbsbx.com',
      'avatars.githubusercontent.com',
      'pbs.twimg.com',
      'localhost'
    ],
  },
};

export default nextConfig;
