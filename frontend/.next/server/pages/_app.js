/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./contexts/UserContext.js":
/*!*********************************!*\
  !*** ./contexts/UserContext.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   UserContext: () => (/* binding */ UserContext),\n/* harmony export */   UserProvider: () => (/* binding */ UserProvider),\n/* harmony export */   fetchWithAuth: () => (/* binding */ fetchWithAuth),\n/* harmony export */   useUser: () => (/* binding */ useUser),\n/* harmony export */   withAuth: () => (/* binding */ withAuth)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nconst UserContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)();\nfunction UserProvider({ children }) {\n    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    // 初始化时从localStorage加载用户数据\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        const storedUser = localStorage.getItem(\"user\");\n        if (storedUser) {\n            try {\n                setUser(JSON.parse(storedUser));\n            } catch (error) {\n                console.error(\"Error parsing stored user data:\", error);\n                localStorage.removeItem(\"user\");\n            }\n        }\n        setIsLoading(false);\n    }, []);\n    // 登录函数\n    const login = (userData)=>{\n        setUser(userData);\n        localStorage.setItem(\"user\", JSON.stringify(userData));\n    };\n    // 注销函数\n    const logout = ()=>{\n        setUser(null);\n        localStorage.removeItem(\"user\");\n    };\n    // 更新用户信息\n    const updateUser = (updates)=>{\n        const updatedUser = {\n            ...user,\n            ...updates\n        };\n        setUser(updatedUser);\n        localStorage.setItem(\"user\", JSON.stringify(updatedUser));\n    };\n    // 检查用户是否已认证\n    const isAuthenticated = ()=>{\n        return !!user;\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(UserContext.Provider, {\n        value: {\n            user,\n            isLoading,\n            login,\n            logout,\n            updateUser,\n            isAuthenticated\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\iear\\\\Pear\\\\frontend\\\\contexts\\\\UserContext.js\",\n        lineNumber: 49,\n        columnNumber: 5\n    }, this);\n}\n// 自定义钩子，用于在组件中访问用户上下文\nfunction useUser() {\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(UserContext);\n    if (context === undefined) {\n        throw new Error(\"useUser must be used within a UserProvider\");\n    }\n    return context;\n}\n// 高阶组件，用于保护需要认证的路由\nfunction withAuth(WrappedComponent) {\n    return function AuthenticatedComponent(props) {\n        const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n        const { user, isLoading } = useUser();\n        (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n            if (!isLoading && !user) {\n                router.push(`/login?redirect=${router.pathname}`);\n            }\n        }, [\n            user,\n            isLoading,\n            router\n        ]);\n        // 显示加载状态\n        if (isLoading) {\n            return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                style: {\n                    minHeight: \"100vh\",\n                    display: \"flex\",\n                    alignItems: \"center\",\n                    justifyContent: \"center\"\n                },\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    children: \"Loading...\"\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\iear\\\\Pear\\\\frontend\\\\contexts\\\\UserContext.js\",\n                    lineNumber: 94,\n                    columnNumber: 11\n                }, this)\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\iear\\\\Pear\\\\frontend\\\\contexts\\\\UserContext.js\",\n                lineNumber: 88,\n                columnNumber: 9\n            }, this);\n        }\n        // 如果用户未登录，返回null（重定向会在useEffect中处理）\n        if (!user) {\n            return null;\n        }\n        // 如果用户已登录，渲染组件\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(WrappedComponent, {\n            ...props\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\iear\\\\Pear\\\\frontend\\\\contexts\\\\UserContext.js\",\n            lineNumber: 105,\n            columnNumber: 12\n        }, this);\n    };\n}\n// 用于API请求的辅助函数\nasync function fetchWithAuth(url, options = {}) {\n    const user = JSON.parse(localStorage.getItem(\"user\") || \"null\");\n    if (!user) {\n        throw new Error(\"No authenticated user\");\n    }\n    const defaultOptions = {\n        headers: {\n            \"Content-Type\": \"application/json\",\n            \"Authorization\": `Bearer ${user.token}`\n        }\n    };\n    try {\n        const response = await fetch(url, {\n            ...defaultOptions,\n            ...options,\n            headers: {\n                ...defaultOptions.headers,\n                ...options.headers\n            }\n        });\n        if (!response.ok) {\n            // 如果响应状态是401（未授权），清除用户数据并重定向到登录页面\n            if (response.status === 401) {\n                localStorage.removeItem(\"user\");\n                window.location.href = \"/login\";\n                throw new Error(\"Session expired\");\n            }\n            throw new Error(`HTTP error! status: ${response.status}`);\n        }\n        return await response.json();\n    } catch (error) {\n        console.error(\"API request failed:\", error);\n        throw error;\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QixpQkFBaUI7UUFDckJDLFNBQVM7WUFDUCxnQkFBZ0I7WUFDaEIsaUJBQWlCLENBQUMsT0FBTyxFQUFFNUMsS0FBSzZDLEtBQUssQ0FBQyxDQUFDO1FBQ3pDO0lBQ0Y7SUFFQSxJQUFJO1FBQ0YsTUFBTUMsV0FBVyxNQUFNQyxNQUFNTixLQUFLO1lBQ2hDLEdBQUdFLGNBQWM7WUFDakIsR0FBR0QsT0FBTztZQUNWRSxTQUFTO2dCQUNQLEdBQUdELGVBQWVDLE9BQU87Z0JBQ3pCLEdBQUdGLFFBQVFFLE9BQU87WUFDcEI7UUFDRjtRQUVBLElBQUksQ0FBQ0UsU0FBU0UsRUFBRSxFQUFFO1lBQ2hCLGtDQUFrQztZQUNsQyxJQUFJRixTQUFTRyxNQUFNLEtBQUssS0FBSztnQkFDM0I1QyxhQUFhTSxVQUFVLENBQUM7Z0JBQ3hCdUMsT0FBT0MsUUFBUSxDQUFDQyxJQUFJLEdBQUc7Z0JBQ3ZCLE1BQU0sSUFBSTFCLE1BQU07WUFDbEI7WUFDQSxNQUFNLElBQUlBLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRW9CLFNBQVNHLE1BQU0sQ0FBQyxDQUFDO1FBQzFEO1FBRUEsT0FBTyxNQUFNSCxTQUFTTyxJQUFJO0lBQzVCLEVBQUUsT0FBTzVDLE9BQU87UUFDZEMsUUFBUUQsS0FBSyxDQUFDLHVCQUF1QkE7UUFDckMsTUFBTUE7SUFDUjtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZnJvbnRlbmQvLi9jb250ZXh0cy9Vc2VyQ29udGV4dC5qcz8wMDJlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNvbnRleHQsIHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNvbnRleHQgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IHVzZVJvdXRlciB9IGZyb20gJ25leHQvcm91dGVyJztcclxuXHJcbmV4cG9ydCBjb25zdCBVc2VyQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQoKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBVc2VyUHJvdmlkZXIoeyBjaGlsZHJlbiB9KSB7XHJcbiAgY29uc3QgW3VzZXIsIHNldFVzZXJdID0gdXNlU3RhdGUobnVsbCk7XHJcbiAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xyXG5cclxuICAvLyDliJ3lp4vljJbml7bku45sb2NhbFN0b3JhZ2XliqDovb3nlKjmiLfmlbDmja5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgY29uc3Qgc3RvcmVkVXNlciA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyJyk7XHJcbiAgICBpZiAoc3RvcmVkVXNlcikge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHNldFVzZXIoSlNPTi5wYXJzZShzdG9yZWRVc2VyKSk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgcGFyc2luZyBzdG9yZWQgdXNlciBkYXRhOicsIGVycm9yKTtcclxuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndXNlcicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xyXG4gIH0sIFtdKTtcclxuXHJcbiAgLy8g55m75b2V5Ye95pWwXHJcbiAgY29uc3QgbG9naW4gPSAodXNlckRhdGEpID0+IHtcclxuICAgIHNldFVzZXIodXNlckRhdGEpO1xyXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXInLCBKU09OLnN0cmluZ2lmeSh1c2VyRGF0YSkpO1xyXG4gIH07XHJcblxyXG4gIC8vIOazqOmUgOWHveaVsFxyXG4gIGNvbnN0IGxvZ291dCA9ICgpID0+IHtcclxuICAgIHNldFVzZXIobnVsbCk7XHJcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndXNlcicpO1xyXG4gIH07XHJcblxyXG4gIC8vIOabtOaWsOeUqOaIt+S/oeaBr1xyXG4gIGNvbnN0IHVwZGF0ZVVzZXIgPSAodXBkYXRlcykgPT4ge1xyXG4gICAgY29uc3QgdXBkYXRlZFVzZXIgPSB7IC4uLnVzZXIsIC4uLnVwZGF0ZXMgfTtcclxuICAgIHNldFVzZXIodXBkYXRlZFVzZXIpO1xyXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXInLCBKU09OLnN0cmluZ2lmeSh1cGRhdGVkVXNlcikpO1xyXG4gIH07XHJcblxyXG4gIC8vIOajgOafpeeUqOaIt+aYr+WQpuW3suiupOivgVxyXG4gIGNvbnN0IGlzQXV0aGVudGljYXRlZCA9ICgpID0+IHtcclxuICAgIHJldHVybiAhIXVzZXI7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxVc2VyQ29udGV4dC5Qcm92aWRlclxyXG4gICAgICB2YWx1ZT17e1xyXG4gICAgICAgIHVzZXIsXHJcbiAgICAgICAgaXNMb2FkaW5nLFxyXG4gICAgICAgIGxvZ2luLFxyXG4gICAgICAgIGxvZ291dCxcclxuICAgICAgICB1cGRhdGVVc2VyLFxyXG4gICAgICAgIGlzQXV0aGVudGljYXRlZFxyXG4gICAgICB9fVxyXG4gICAgPlxyXG4gICAgICB7Y2hpbGRyZW59XHJcbiAgICA8L1VzZXJDb250ZXh0LlByb3ZpZGVyPlxyXG4gICk7XHJcbn1cclxuXHJcbi8vIOiHquWumuS5iemSqeWtkO+8jOeUqOS6juWcqOe7hOS7tuS4reiuv+mXrueUqOaIt+S4iuS4i+aWh1xyXG5leHBvcnQgZnVuY3Rpb24gdXNlVXNlcigpIHtcclxuICBjb25zdCBjb250ZXh0ID0gdXNlQ29udGV4dChVc2VyQ29udGV4dCk7XHJcbiAgaWYgKGNvbnRleHQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2VVc2VyIG11c3QgYmUgdXNlZCB3aXRoaW4gYSBVc2VyUHJvdmlkZXInKTtcclxuICB9XHJcbiAgcmV0dXJuIGNvbnRleHQ7XHJcbn1cclxuXHJcbi8vIOmrmOmYtue7hOS7tu+8jOeUqOS6juS/neaKpOmcgOimgeiupOivgeeahOi3r+eUsVxyXG5leHBvcnQgZnVuY3Rpb24gd2l0aEF1dGgoV3JhcHBlZENvbXBvbmVudCkge1xyXG4gIHJldHVybiBmdW5jdGlvbiBBdXRoZW50aWNhdGVkQ29tcG9uZW50KHByb3BzKSB7XHJcbiAgICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcclxuICAgIGNvbnN0IHsgdXNlciwgaXNMb2FkaW5nIH0gPSB1c2VVc2VyKCk7XHJcblxyXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgICAgaWYgKCFpc0xvYWRpbmcgJiYgIXVzZXIpIHtcclxuICAgICAgICByb3V0ZXIucHVzaChgL2xvZ2luP3JlZGlyZWN0PSR7cm91dGVyLnBhdGhuYW1lfWApO1xyXG4gICAgICB9XHJcbiAgICB9LCBbdXNlciwgaXNMb2FkaW5nLCByb3V0ZXJdKTtcclxuXHJcbiAgICAvLyDmmL7npLrliqDovb3nirbmgIFcclxuICAgIGlmIChpc0xvYWRpbmcpIHtcclxuICAgICAgcmV0dXJuIChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICBtaW5IZWlnaHQ6ICcxMDB2aCcsXHJcbiAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJ1xyXG4gICAgICAgIH19PlxyXG4gICAgICAgICAgPGRpdj5Mb2FkaW5nLi4uPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5aaC5p6c55So5oi35pyq55m75b2V77yM6L+U5ZuebnVsbO+8iOmHjeWumuWQkeS8muWcqHVzZUVmZmVjdOS4reWkhOeQhu+8iVxyXG4gICAgaWYgKCF1c2VyKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOWmguaenOeUqOaIt+W3sueZu+W9le+8jOa4suafk+e7hOS7tlxyXG4gICAgcmV0dXJuIDxXcmFwcGVkQ29tcG9uZW50IHsuLi5wcm9wc30gLz47XHJcbiAgfTtcclxufVxyXG5cclxuLy8g55So5LqOQVBJ6K+35rGC55qE6L6F5Yqp5Ye95pWwXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFdpdGhBdXRoKHVybCwgb3B0aW9ucyA9IHt9KSB7XHJcbiAgY29uc3QgdXNlciA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXInKSB8fCAnbnVsbCcpO1xyXG4gIFxyXG4gIGlmICghdXNlcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBhdXRoZW50aWNhdGVkIHVzZXInKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHt1c2VyLnRva2VufWAsXHJcbiAgICB9LFxyXG4gIH07XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xyXG4gICAgICAuLi5kZWZhdWx0T3B0aW9ucyxcclxuICAgICAgLi4ub3B0aW9ucyxcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgIC4uLmRlZmF1bHRPcHRpb25zLmhlYWRlcnMsXHJcbiAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAvLyDlpoLmnpzlk43lupTnirbmgIHmmK80MDHvvIjmnKrmjojmnYPvvInvvIzmuIXpmaTnlKjmiLfmlbDmja7lubbph43lrprlkJHliLDnmbvlvZXpobXpnaJcclxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3VzZXInKTtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvbG9naW4nO1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU2Vzc2lvbiBleHBpcmVkJyk7XHJcbiAgICAgIH1cclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQIGVycm9yISBzdGF0dXM6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0FQSSByZXF1ZXN0IGZhaWxlZDonLCBlcnJvcik7XHJcbiAgICB0aHJvdyBlcnJvcjtcclxuICB9XHJcbn0iXSwibmFtZXMiOlsiY3JlYXRlQ29udGV4dCIsInVzZVN0YXRlIiwidXNlRWZmZWN0IiwidXNlQ29udGV4dCIsInVzZVJvdXRlciIsIlVzZXJDb250ZXh0IiwiVXNlclByb3ZpZGVyIiwiY2hpbGRyZW4iLCJ1c2VyIiwic2V0VXNlciIsImlzTG9hZGluZyIsInNldElzTG9hZGluZyIsInN0b3JlZFVzZXIiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiSlNPTiIsInBhcnNlIiwiZXJyb3IiLCJjb25zb2xlIiwicmVtb3ZlSXRlbSIsImxvZ2luIiwidXNlckRhdGEiLCJzZXRJdGVtIiwic3RyaW5naWZ5IiwibG9nb3V0IiwidXBkYXRlVXNlciIsInVwZGF0ZXMiLCJ1cGRhdGVkVXNlciIsImlzQXV0aGVudGljYXRlZCIsIlByb3ZpZGVyIiwidmFsdWUiLCJ1c2VVc2VyIiwiY29udGV4dCIsInVuZGVmaW5lZCIsIkVycm9yIiwid2l0aEF1dGgiLCJXcmFwcGVkQ29tcG9uZW50IiwiQXV0aGVudGljYXRlZENvbXBvbmVudCIsInByb3BzIiwicm91dGVyIiwicHVzaCIsInBhdGhuYW1lIiwiZGl2Iiwic3R5bGUiLCJtaW5IZWlnaHQiLCJkaXNwbGF5IiwiYWxpZ25JdGVtcyIsImp1c3RpZnlDb250ZW50IiwiZmV0Y2hXaXRoQXV0aCIsInVybCIsIm9wdGlvbnMiLCJkZWZhdWx0T3B0aW9ucyIsImhlYWRlcnMiLCJ0b2tlbiIsInJlc3BvbnNlIiwiZmV0Y2giLCJvayIsInN0YXR1cyIsIndpbmRvdyIsImxvY2F0aW9uIiwiaHJlZiIsImpzb24iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./contexts/UserContext.js\n");

/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _contexts_UserContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../contexts/UserContext */ \"./contexts/UserContext.js\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_contexts_UserContext__WEBPACK_IMPORTED_MODULE_1__.UserProvider, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\iear\\\\Pear\\\\frontend\\\\pages\\\\_app.js\",\n            lineNumber: 7,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\iear\\\\Pear\\\\frontend\\\\pages\\\\_app.js\",\n        lineNumber: 6,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBdUQ7QUFDeEI7QUFFL0IsU0FBU0MsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBRTtJQUNyQyxxQkFDRSw4REFBQ0gsK0RBQVlBO2tCQUNYLDRFQUFDRTtZQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7Ozs7O0FBRzlCO0FBRUEsaUVBQWVGLEtBQUtBLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mcm9udGVuZC8uL3BhZ2VzL19hcHAuanM/ZTBhZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBVc2VyUHJvdmlkZXIgfSBmcm9tICcuLi9jb250ZXh0cy9Vc2VyQ29udGV4dCc7XHJcbmltcG9ydCAnLi4vc3R5bGVzL2dsb2JhbHMuY3NzJztcclxuXHJcbmZ1bmN0aW9uIE15QXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfSkge1xyXG4gIHJldHVybiAoXHJcbiAgICA8VXNlclByb3ZpZGVyPlxyXG4gICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XHJcbiAgICA8L1VzZXJQcm92aWRlcj5cclxuICApO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNeUFwcDsiXSwibmFtZXMiOlsiVXNlclByb3ZpZGVyIiwiTXlBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./pages/_app.js")));
module.exports = __webpack_exports__;

})();