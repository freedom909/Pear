import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

const Custom404: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="mt-6 text-center text-6xl font-extrabold text-gray-900">
            404
          </h1>
          <h2 className="mt-4 text-center text-3xl font-bold text-gray-900">
            页面未找到
          </h2>
          <div className="mt-4">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="mt-6 text-center text-lg text-gray-600">
            抱歉，您访问的页面不存在或已被移除
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <button
            onClick={() => router.back()}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            返回上一页
          </button>

          <Link
            href="/"
            className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
              />
            </svg>
            返回首页
          </Link>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900">您可能想要访问：</h3>
          <div className="mt-4 space-y-2">
            <Link
              href="/dashboard"
              className="block text-blue-600 hover:text-blue-500"
            >
              控制面板
            </Link>
            <Link
              href="/profile"
              className="block text-blue-600 hover:text-blue-500"
            >
              个人资料
            </Link>
            <Link
              href="/contact"
              className="block text-blue-600 hover:text-blue-500"
            >
              联系我们
            </Link>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>
            如果您是通过书签或外部链接访问此页面，该页面可能已被移动或删除。
            <br />
            建议您使用网站导航或搜索功能找到所需内容。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Custom404;