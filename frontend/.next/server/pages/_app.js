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

/***/ "(pages-dir-node)/./components/Navigation.js":
/*!**********************************!*\
  !*** ./components/Navigation.js ***!
  \**********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Navigation)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/router */ \"(pages-dir-node)/./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/link */ \"(pages-dir-node)/./node_modules/next/link.js\");\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _contexts_UserContext__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../contexts/UserContext */ \"(pages-dir-node)/./contexts/UserContext.js\");\n/* harmony import */ var _Navigation_module_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Navigation.module.css */ \"(pages-dir-node)/./components/Navigation.module.css\");\n/* harmony import */ var _Navigation_module_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_Navigation_module_css__WEBPACK_IMPORTED_MODULE_4__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_contexts_UserContext__WEBPACK_IMPORTED_MODULE_3__]);\n_contexts_UserContext__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\n\nfunction Navigation() {\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_1__.useRouter)();\n    const { user, loading, logout } = (0,_contexts_UserContext__WEBPACK_IMPORTED_MODULE_3__.useUser)();\n    const handleLogout = async ()=>{\n        await logout();\n        router.push('/');\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"nav\", {\n        className: (_Navigation_module_css__WEBPACK_IMPORTED_MODULE_4___default().nav),\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: (_Navigation_module_css__WEBPACK_IMPORTED_MODULE_4___default().container),\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                    href: \"/\",\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                        className: (_Navigation_module_css__WEBPACK_IMPORTED_MODULE_4___default().logo),\n                        children: \"Pear\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\Pear-main\\\\frontend\\\\components\\\\Navigation.js\",\n                        lineNumber: 19,\n                        columnNumber: 11\n                    }, this)\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\Pear-main\\\\frontend\\\\components\\\\Navigation.js\",\n                    lineNumber: 18,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: (_Navigation_module_css__WEBPACK_IMPORTED_MODULE_4___default().links),\n                    children: !loading && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {\n                        children: user ? /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {\n                            children: [\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                                    href: \"/dashboard\",\n                                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                        className: `${(_Navigation_module_css__WEBPACK_IMPORTED_MODULE_4___default().link)} ${router.pathname === '/dashboard' ? (_Navigation_module_css__WEBPACK_IMPORTED_MODULE_4___default().active) : ''}`,\n                                        children: \"Dashboard\"\n                                    }, void 0, false, {\n                                        fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\Pear-main\\\\frontend\\\\components\\\\Navigation.js\",\n                                        lineNumber: 28,\n                                        columnNumber: 21\n                                    }, this)\n                                }, void 0, false, {\n                                    fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\Pear-main\\\\frontend\\\\components\\\\Navigation.js\",\n                                    lineNumber: 27,\n                                    columnNumber: 19\n                                }, this),\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                    onClick: handleLogout,\n                                    className: (_Navigation_module_css__WEBPACK_IMPORTED_MODULE_4___default().logoutButton),\n                                    children: \"Logout\"\n                                }, void 0, false, {\n                                    fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\Pear-main\\\\frontend\\\\components\\\\Navigation.js\",\n                                    lineNumber: 32,\n                                    columnNumber: 19\n                                }, this)\n                            ]\n                        }, void 0, true) : /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {\n                            href: \"/\",\n                            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                className: `${(_Navigation_module_css__WEBPACK_IMPORTED_MODULE_4___default().link)} ${router.pathname === '/' ? (_Navigation_module_css__WEBPACK_IMPORTED_MODULE_4___default().active) : ''}`,\n                                children: \"Login\"\n                            }, void 0, false, {\n                                fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\Pear-main\\\\frontend\\\\components\\\\Navigation.js\",\n                                lineNumber: 38,\n                                columnNumber: 19\n                            }, this)\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\Pear-main\\\\frontend\\\\components\\\\Navigation.js\",\n                            lineNumber: 37,\n                            columnNumber: 17\n                        }, this)\n                    }, void 0, false)\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\Pear-main\\\\frontend\\\\components\\\\Navigation.js\",\n                    lineNumber: 22,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\Pear-main\\\\frontend\\\\components\\\\Navigation.js\",\n            lineNumber: 17,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\Pear-main\\\\frontend\\\\components\\\\Navigation.js\",\n        lineNumber: 16,\n        columnNumber: 5\n    }, this);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL2NvbXBvbmVudHMvTmF2aWdhdGlvbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUF3QztBQUNYO0FBQ3FCO0FBQ0w7QUFFOUIsU0FBU0k7SUFDdEIsTUFBTUMsU0FBU0wsc0RBQVNBO0lBQ3hCLE1BQU0sRUFBRU0sSUFBSSxFQUFFQyxPQUFPLEVBQUVDLE1BQU0sRUFBRSxHQUFHTiw4REFBT0E7SUFFekMsTUFBTU8sZUFBZTtRQUNuQixNQUFNRDtRQUNOSCxPQUFPSyxJQUFJLENBQUM7SUFDZDtJQUVBLHFCQUNFLDhEQUFDQztRQUFJQyxXQUFXVCxtRUFBVTtrQkFDeEIsNEVBQUNVO1lBQUlELFdBQVdULHlFQUFnQjs7OEJBQzlCLDhEQUFDRixrREFBSUE7b0JBQUNjLE1BQUs7OEJBQ1QsNEVBQUNDO3dCQUFLSixXQUFXVCxvRUFBVztrQ0FBRTs7Ozs7Ozs7Ozs7OEJBR2hDLDhEQUFDVTtvQkFBSUQsV0FBV1QscUVBQVk7OEJBQ3pCLENBQUNJLHlCQUNBO2tDQUNHRCxxQkFDQzs7OENBQ0UsOERBQUNMLGtEQUFJQTtvQ0FBQ2MsTUFBSzs4Q0FDVCw0RUFBQ0M7d0NBQUtKLFdBQVcsR0FBR1Qsb0VBQVcsQ0FBQyxDQUFDLEVBQUVFLE9BQU9lLFFBQVEsS0FBSyxlQUFlakIsc0VBQWEsR0FBRyxJQUFJO2tEQUFFOzs7Ozs7Ozs7Ozs4Q0FJOUYsOERBQUNtQjtvQ0FBT0MsU0FBU2Q7b0NBQWNHLFdBQVdULDRFQUFtQjs4Q0FBRTs7Ozs7Ozt5REFLakUsOERBQUNGLGtEQUFJQTs0QkFBQ2MsTUFBSztzQ0FDVCw0RUFBQ0M7Z0NBQUtKLFdBQVcsR0FBR1Qsb0VBQVcsQ0FBQyxDQUFDLEVBQUVFLE9BQU9lLFFBQVEsS0FBSyxNQUFNakIsc0VBQWEsR0FBRyxJQUFJOzBDQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBV3JHIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXEFkbWluaXN0cmF0b3JcXERlc2t0b3BcXFBlYXItbWFpblxcZnJvbnRlbmRcXGNvbXBvbmVudHNcXE5hdmlnYXRpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9yb3V0ZXInO1xyXG5pbXBvcnQgTGluayBmcm9tICduZXh0L2xpbmsnO1xyXG5pbXBvcnQgeyB1c2VVc2VyIH0gZnJvbSAnLi4vY29udGV4dHMvVXNlckNvbnRleHQnO1xyXG5pbXBvcnQgc3R5bGVzIGZyb20gJy4vTmF2aWdhdGlvbi5tb2R1bGUuY3NzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE5hdmlnYXRpb24oKSB7XHJcbiAgY29uc3Qgcm91dGVyID0gdXNlUm91dGVyKCk7XHJcbiAgY29uc3QgeyB1c2VyLCBsb2FkaW5nLCBsb2dvdXQgfSA9IHVzZVVzZXIoKTtcclxuXHJcbiAgY29uc3QgaGFuZGxlTG9nb3V0ID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgYXdhaXQgbG9nb3V0KCk7XHJcbiAgICByb3V0ZXIucHVzaCgnLycpO1xyXG4gIH07XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8bmF2IGNsYXNzTmFtZT17c3R5bGVzLm5hdn0+XHJcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtzdHlsZXMuY29udGFpbmVyfT5cclxuICAgICAgICA8TGluayBocmVmPVwiL1wiPlxyXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtzdHlsZXMubG9nb30+UGVhcjwvc3Bhbj5cclxuICAgICAgICA8L0xpbms+XHJcblxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtzdHlsZXMubGlua3N9PlxyXG4gICAgICAgICAgeyFsb2FkaW5nICYmIChcclxuICAgICAgICAgICAgPD5cclxuICAgICAgICAgICAgICB7dXNlciA/IChcclxuICAgICAgICAgICAgICAgIDw+XHJcbiAgICAgICAgICAgICAgICAgIDxMaW5rIGhyZWY9XCIvZGFzaGJvYXJkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgJHtzdHlsZXMubGlua30gJHtyb3V0ZXIucGF0aG5hbWUgPT09ICcvZGFzaGJvYXJkJyA/IHN0eWxlcy5hY3RpdmUgOiAnJ31gfT5cclxuICAgICAgICAgICAgICAgICAgICAgIERhc2hib2FyZFxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPC9MaW5rPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUxvZ291dH0gY2xhc3NOYW1lPXtzdHlsZXMubG9nb3V0QnV0dG9ufT5cclxuICAgICAgICAgICAgICAgICAgICBMb2dvdXRcclxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8Lz5cclxuICAgICAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICAgICAgPExpbmsgaHJlZj1cIi9cIj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgJHtzdHlsZXMubGlua30gJHtyb3V0ZXIucGF0aG5hbWUgPT09ICcvJyA/IHN0eWxlcy5hY3RpdmUgOiAnJ31gfT5cclxuICAgICAgICAgICAgICAgICAgICBMb2dpblxyXG4gICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L0xpbms+XHJcbiAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgPC8+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvbmF2PlxyXG4gICk7XHJcbn0iXSwibmFtZXMiOlsidXNlUm91dGVyIiwiTGluayIsInVzZVVzZXIiLCJzdHlsZXMiLCJOYXZpZ2F0aW9uIiwicm91dGVyIiwidXNlciIsImxvYWRpbmciLCJsb2dvdXQiLCJoYW5kbGVMb2dvdXQiLCJwdXNoIiwibmF2IiwiY2xhc3NOYW1lIiwiZGl2IiwiY29udGFpbmVyIiwiaHJlZiIsInNwYW4iLCJsb2dvIiwibGlua3MiLCJsaW5rIiwicGF0aG5hbWUiLCJhY3RpdmUiLCJidXR0b24iLCJvbkNsaWNrIiwibG9nb3V0QnV0dG9uIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./components/Navigation.js\n");

/***/ }),

/***/ "(pages-dir-node)/./components/Navigation.module.css":
/*!******************************************!*\
  !*** ./components/Navigation.module.css ***!
  \******************************************/
/***/ ((module) => {

eval("// Exports\nmodule.exports = {\n\t\"nav\": \"Navigation_nav__NZulV\",\n\t\"container\": \"Navigation_container__ClVVs\",\n\t\"logo\": \"Navigation_logo__ZzKRw\",\n\t\"links\": \"Navigation_links__Q6o2d\",\n\t\"link\": \"Navigation_link__JUJnE\",\n\t\"active\": \"Navigation_active__SA7aP\",\n\t\"logoutButton\": \"Navigation_logoutButton__QDOiD\"\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL2NvbXBvbmVudHMvTmF2aWdhdGlvbi5tb2R1bGUuY3NzIiwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXEFkbWluaXN0cmF0b3JcXERlc2t0b3BcXFBlYXItbWFpblxcZnJvbnRlbmRcXGNvbXBvbmVudHNcXE5hdmlnYXRpb24ubW9kdWxlLmNzcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBFeHBvcnRzXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0XCJuYXZcIjogXCJOYXZpZ2F0aW9uX25hdl9fTlp1bFZcIixcblx0XCJjb250YWluZXJcIjogXCJOYXZpZ2F0aW9uX2NvbnRhaW5lcl9fQ2xWVnNcIixcblx0XCJsb2dvXCI6IFwiTmF2aWdhdGlvbl9sb2dvX19aektSd1wiLFxuXHRcImxpbmtzXCI6IFwiTmF2aWdhdGlvbl9saW5rc19fUTZvMmRcIixcblx0XCJsaW5rXCI6IFwiTmF2aWdhdGlvbl9saW5rX19KVUpuRVwiLFxuXHRcImFjdGl2ZVwiOiBcIk5hdmlnYXRpb25fYWN0aXZlX19TQTdhUFwiLFxuXHRcImxvZ291dEJ1dHRvblwiOiBcIk5hdmlnYXRpb25fbG9nb3V0QnV0dG9uX19RRE9pRFwiXG59O1xuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(pages-dir-node)/./components/Navigation.module.css\n");

/***/ }),

/***/ "(pages-dir-node)/./contexts/UserContext.js":
/*!*********************************!*\
  !*** ./contexts/UserContext.js ***!
  \*********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   UserProvider: () => (/* binding */ UserProvider),\n/* harmony export */   useUser: () => (/* binding */ useUser)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _utils_api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/api */ \"(pages-dir-node)/./utils/api.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_utils_api__WEBPACK_IMPORTED_MODULE_2__]);\n_utils_api__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n// Create the context\nconst UserContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)();\n// Custom hook to use the user context\nconst useUser = ()=>{\n    return (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(UserContext);\n};\n// Provider component\nconst UserProvider = ({ children })=>{\n    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    // Function to fetch user data\n    const fetchUserData = async ()=>{\n        try {\n            const token = localStorage.getItem('token');\n            if (!token) {\n                setLoading(false);\n                return;\n            }\n            const response = await _utils_api__WEBPACK_IMPORTED_MODULE_2__[\"default\"].get('/api/user');\n            setUser(response.data);\n            setLoading(false);\n        } catch (err) {\n            console.error('Error fetching user data:', err);\n            setError('Failed to load user data');\n            setLoading(false);\n            // If unauthorized, clear token\n            if (err.response && err.response.status === 401) {\n                localStorage.removeItem('token');\n            }\n        }\n    };\n    // Function to handle logout\n    const logout = ()=>{\n        localStorage.removeItem('token');\n        setUser(null);\n    };\n    // Check authentication status on mount\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"UserProvider.useEffect\": ()=>{\n            fetchUserData();\n        }\n    }[\"UserProvider.useEffect\"], []);\n    // Value to be provided to consumers\n    const value = {\n        user,\n        loading,\n        error,\n        fetchUserData,\n        logout\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(UserContext.Provider, {\n        value: value,\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\Pear-main\\\\frontend\\\\contexts\\\\UserContext.js\",\n        lineNumber: 64,\n        columnNumber: 5\n    }, undefined);\n};\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL2NvbnRleHRzL1VzZXJDb250ZXh0LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQXVFO0FBQ3hDO0FBRS9CLHFCQUFxQjtBQUNyQixNQUFNSyw0QkFBY0wsb0RBQWFBO0FBRWpDLHNDQUFzQztBQUMvQixNQUFNTSxVQUFVO0lBQ3JCLE9BQU9KLGlEQUFVQSxDQUFDRztBQUNwQixFQUFFO0FBRUYscUJBQXFCO0FBQ2QsTUFBTUUsZUFBZSxDQUFDLEVBQUVDLFFBQVEsRUFBRTtJQUN2QyxNQUFNLENBQUNDLE1BQU1DLFFBQVEsR0FBR1QsK0NBQVFBLENBQUM7SUFDakMsTUFBTSxDQUFDVSxTQUFTQyxXQUFXLEdBQUdYLCtDQUFRQSxDQUFDO0lBQ3ZDLE1BQU0sQ0FBQ1ksT0FBT0MsU0FBUyxHQUFHYiwrQ0FBUUEsQ0FBQztJQUVuQyw4QkFBOEI7SUFDOUIsTUFBTWMsZ0JBQWdCO1FBQ3BCLElBQUk7WUFDRixNQUFNQyxRQUFRQyxhQUFhQyxPQUFPLENBQUM7WUFFbkMsSUFBSSxDQUFDRixPQUFPO2dCQUNWSixXQUFXO2dCQUNYO1lBQ0Y7WUFFQSxNQUFNTyxXQUFXLE1BQU1mLHNEQUFPLENBQUM7WUFDL0JNLFFBQVFTLFNBQVNFLElBQUk7WUFDckJULFdBQVc7UUFDYixFQUFFLE9BQU9VLEtBQUs7WUFDWkMsUUFBUVYsS0FBSyxDQUFDLDZCQUE2QlM7WUFDM0NSLFNBQVM7WUFDVEYsV0FBVztZQUVYLCtCQUErQjtZQUMvQixJQUFJVSxJQUFJSCxRQUFRLElBQUlHLElBQUlILFFBQVEsQ0FBQ0ssTUFBTSxLQUFLLEtBQUs7Z0JBQy9DUCxhQUFhUSxVQUFVLENBQUM7WUFDMUI7UUFDRjtJQUNGO0lBRUEsNEJBQTRCO0lBQzVCLE1BQU1DLFNBQVM7UUFDYlQsYUFBYVEsVUFBVSxDQUFDO1FBQ3hCZixRQUFRO0lBQ1Y7SUFFQSx1Q0FBdUM7SUFDdkNQLGdEQUFTQTtrQ0FBQztZQUNSWTtRQUNGO2lDQUFHLEVBQUU7SUFFTCxvQ0FBb0M7SUFDcEMsTUFBTVksUUFBUTtRQUNabEI7UUFDQUU7UUFDQUU7UUFDQUU7UUFDQVc7SUFDRjtJQUVBLHFCQUNFLDhEQUFDckIsWUFBWXVCLFFBQVE7UUFBQ0QsT0FBT0E7a0JBQzFCbkI7Ozs7OztBQUdQLEVBQUUiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcQWRtaW5pc3RyYXRvclxcRGVza3RvcFxcUGVhci1tYWluXFxmcm9udGVuZFxcY29udGV4dHNcXFVzZXJDb250ZXh0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNvbnRleHQsIHVzZVN0YXRlLCB1c2VDb250ZXh0LCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCBhcGkgZnJvbSAnLi4vdXRpbHMvYXBpJztcclxuXHJcbi8vIENyZWF0ZSB0aGUgY29udGV4dFxyXG5jb25zdCBVc2VyQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQoKTtcclxuXHJcbi8vIEN1c3RvbSBob29rIHRvIHVzZSB0aGUgdXNlciBjb250ZXh0XHJcbmV4cG9ydCBjb25zdCB1c2VVc2VyID0gKCkgPT4ge1xyXG4gIHJldHVybiB1c2VDb250ZXh0KFVzZXJDb250ZXh0KTtcclxufTtcclxuXHJcbi8vIFByb3ZpZGVyIGNvbXBvbmVudFxyXG5leHBvcnQgY29uc3QgVXNlclByb3ZpZGVyID0gKHsgY2hpbGRyZW4gfSkgPT4ge1xyXG4gIGNvbnN0IFt1c2VyLCBzZXRVc2VyXSA9IHVzZVN0YXRlKG51bGwpO1xyXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xyXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XHJcblxyXG4gIC8vIEZ1bmN0aW9uIHRvIGZldGNoIHVzZXIgZGF0YVxyXG4gIGNvbnN0IGZldGNoVXNlckRhdGEgPSBhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCB0b2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpO1xyXG4gICAgICBcclxuICAgICAgaWYgKCF0b2tlbikge1xyXG4gICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkuZ2V0KCcvYXBpL3VzZXInKTtcclxuICAgICAgc2V0VXNlcihyZXNwb25zZS5kYXRhKTtcclxuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdXNlciBkYXRhOicsIGVycik7XHJcbiAgICAgIHNldEVycm9yKCdGYWlsZWQgdG8gbG9hZCB1c2VyIGRhdGEnKTtcclxuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBJZiB1bmF1dGhvcml6ZWQsIGNsZWFyIHRva2VuXHJcbiAgICAgIGlmIChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3Rva2VuJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBGdW5jdGlvbiB0byBoYW5kbGUgbG9nb3V0XHJcbiAgY29uc3QgbG9nb3V0ID0gKCkgPT4ge1xyXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3Rva2VuJyk7XHJcbiAgICBzZXRVc2VyKG51bGwpO1xyXG4gIH07XHJcblxyXG4gIC8vIENoZWNrIGF1dGhlbnRpY2F0aW9uIHN0YXR1cyBvbiBtb3VudFxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBmZXRjaFVzZXJEYXRhKCk7XHJcbiAgfSwgW10pO1xyXG5cclxuICAvLyBWYWx1ZSB0byBiZSBwcm92aWRlZCB0byBjb25zdW1lcnNcclxuICBjb25zdCB2YWx1ZSA9IHtcclxuICAgIHVzZXIsXHJcbiAgICBsb2FkaW5nLFxyXG4gICAgZXJyb3IsXHJcbiAgICBmZXRjaFVzZXJEYXRhLFxyXG4gICAgbG9nb3V0XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxVc2VyQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17dmFsdWV9PlxyXG4gICAgICB7Y2hpbGRyZW59XHJcbiAgICA8L1VzZXJDb250ZXh0LlByb3ZpZGVyPlxyXG4gICk7XHJcbn07Il0sIm5hbWVzIjpbImNyZWF0ZUNvbnRleHQiLCJ1c2VTdGF0ZSIsInVzZUNvbnRleHQiLCJ1c2VFZmZlY3QiLCJhcGkiLCJVc2VyQ29udGV4dCIsInVzZVVzZXIiLCJVc2VyUHJvdmlkZXIiLCJjaGlsZHJlbiIsInVzZXIiLCJzZXRVc2VyIiwibG9hZGluZyIsInNldExvYWRpbmciLCJlcnJvciIsInNldEVycm9yIiwiZmV0Y2hVc2VyRGF0YSIsInRva2VuIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsInJlc3BvbnNlIiwiZ2V0IiwiZGF0YSIsImVyciIsImNvbnNvbGUiLCJzdGF0dXMiLCJyZW1vdmVJdGVtIiwibG9nb3V0IiwidmFsdWUiLCJQcm92aWRlciJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(pages-dir-node)/./contexts/UserContext.js\n");

/***/ }),

/***/ "(pages-dir-node)/./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _contexts_UserContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../contexts/UserContext */ \"(pages-dir-node)/./contexts/UserContext.js\");\n/* harmony import */ var _components_Navigation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/Navigation */ \"(pages-dir-node)/./components/Navigation.js\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles/globals.css */ \"(pages-dir-node)/./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_3__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_contexts_UserContext__WEBPACK_IMPORTED_MODULE_1__, _components_Navigation__WEBPACK_IMPORTED_MODULE_2__]);\n([_contexts_UserContext__WEBPACK_IMPORTED_MODULE_1__, _components_Navigation__WEBPACK_IMPORTED_MODULE_2__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_contexts_UserContext__WEBPACK_IMPORTED_MODULE_1__.UserProvider, {\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_Navigation__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {}, void 0, false, {\n                fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\Pear-main\\\\frontend\\\\pages\\\\_app.js\",\n                lineNumber: 8,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\Pear-main\\\\frontend\\\\pages\\\\_app.js\",\n                lineNumber: 9,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\Administrator\\\\Desktop\\\\Pear-main\\\\frontend\\\\pages\\\\_app.js\",\n        lineNumber: 7,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3BhZ2VzL19hcHAuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBdUQ7QUFDTDtBQUNuQjtBQUUvQixTQUFTRSxNQUFNLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxFQUFFO0lBQ3JDLHFCQUNFLDhEQUFDSiwrREFBWUE7OzBCQUNYLDhEQUFDQyw4REFBVUE7Ozs7OzBCQUNYLDhEQUFDRTtnQkFBVyxHQUFHQyxTQUFTOzs7Ozs7Ozs7Ozs7QUFHOUI7QUFFQSxpRUFBZUYsS0FBS0EsRUFBQyIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxBZG1pbmlzdHJhdG9yXFxEZXNrdG9wXFxQZWFyLW1haW5cXGZyb250ZW5kXFxwYWdlc1xcX2FwcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBVc2VyUHJvdmlkZXIgfSBmcm9tICcuLi9jb250ZXh0cy9Vc2VyQ29udGV4dCc7XHJcbmltcG9ydCBOYXZpZ2F0aW9uIGZyb20gJy4uL2NvbXBvbmVudHMvTmF2aWdhdGlvbic7XHJcbmltcG9ydCAnLi4vc3R5bGVzL2dsb2JhbHMuY3NzJztcclxuXHJcbmZ1bmN0aW9uIE15QXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfSkge1xyXG4gIHJldHVybiAoXHJcbiAgICA8VXNlclByb3ZpZGVyPlxyXG4gICAgICA8TmF2aWdhdGlvbiAvPlxyXG4gICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XHJcbiAgICA8L1VzZXJQcm92aWRlcj5cclxuICApO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNeUFwcDsiXSwibmFtZXMiOlsiVXNlclByb3ZpZGVyIiwiTmF2aWdhdGlvbiIsIk15QXBwIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./pages/_app.js\n");

/***/ }),

/***/ "(pages-dir-node)/./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "(pages-dir-node)/./utils/api.js":
/*!**********************!*\
  !*** ./utils/api.js ***!
  \**********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ \"axios\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([axios__WEBPACK_IMPORTED_MODULE_0__]);\naxios__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n// Create an axios instance with default config\nconst api = axios__WEBPACK_IMPORTED_MODULE_0__[\"default\"].create({\n    baseURL: 'http://localhost:3000',\n    timeout: 10000,\n    headers: {\n        'Content-Type': 'application/json'\n    }\n});\n// Add a request interceptor to include auth token\napi.interceptors.request.use((config)=>{\n    const token = localStorage.getItem('token');\n    if (token) {\n        config.headers['Authorization'] = `Bearer ${token}`;\n    }\n    return config;\n}, (error)=>{\n    return Promise.reject(error);\n});\n// Add a response interceptor to handle common errors\napi.interceptors.response.use((response)=>{\n    return response;\n}, (error)=>{\n    // Handle 401 Unauthorized errors\n    if (error.response && error.response.status === 401) {\n        localStorage.removeItem('token');\n        // Redirect to login page if needed\n        if (false) {}\n    }\n    return Promise.reject(error);\n});\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (api);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3V0aWxzL2FwaS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUEwQjtBQUUxQiwrQ0FBK0M7QUFDL0MsTUFBTUMsTUFBTUQsb0RBQVksQ0FBQztJQUN2QkcsU0FBUztJQUNUQyxTQUFTO0lBQ1RDLFNBQVM7UUFDUCxnQkFBZ0I7SUFDbEI7QUFDRjtBQUVBLGtEQUFrRDtBQUNsREosSUFBSUssWUFBWSxDQUFDQyxPQUFPLENBQUNDLEdBQUcsQ0FDMUIsQ0FBQ0M7SUFDQyxNQUFNQyxRQUFRQyxhQUFhQyxPQUFPLENBQUM7SUFDbkMsSUFBSUYsT0FBTztRQUNURCxPQUFPSixPQUFPLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxPQUFPLEVBQUVLLE9BQU87SUFDckQ7SUFDQSxPQUFPRDtBQUNULEdBQ0EsQ0FBQ0k7SUFDQyxPQUFPQyxRQUFRQyxNQUFNLENBQUNGO0FBQ3hCO0FBR0YscURBQXFEO0FBQ3JEWixJQUFJSyxZQUFZLENBQUNVLFFBQVEsQ0FBQ1IsR0FBRyxDQUMzQixDQUFDUTtJQUNDLE9BQU9BO0FBQ1QsR0FDQSxDQUFDSDtJQUNDLGlDQUFpQztJQUNqQyxJQUFJQSxNQUFNRyxRQUFRLElBQUlILE1BQU1HLFFBQVEsQ0FBQ0MsTUFBTSxLQUFLLEtBQUs7UUFDbkROLGFBQWFPLFVBQVUsQ0FBQztRQUN4QixtQ0FBbUM7UUFDbkMsSUFBSSxLQUE2QixFQUFFLEVBRWxDO0lBQ0g7SUFDQSxPQUFPSixRQUFRQyxNQUFNLENBQUNGO0FBQ3hCO0FBR0YsaUVBQWVaLEdBQUdBLEVBQUMiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcQWRtaW5pc3RyYXRvclxcRGVza3RvcFxcUGVhci1tYWluXFxmcm9udGVuZFxcdXRpbHNcXGFwaS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xyXG5cclxuLy8gQ3JlYXRlIGFuIGF4aW9zIGluc3RhbmNlIHdpdGggZGVmYXVsdCBjb25maWdcclxuY29uc3QgYXBpID0gYXhpb3MuY3JlYXRlKHtcclxuICBiYXNlVVJMOiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJywgLy8gQmFja2VuZCBBUEkgVVJMXHJcbiAgdGltZW91dDogMTAwMDAsXHJcbiAgaGVhZGVyczoge1xyXG4gICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICB9XHJcbn0pO1xyXG5cclxuLy8gQWRkIGEgcmVxdWVzdCBpbnRlcmNlcHRvciB0byBpbmNsdWRlIGF1dGggdG9rZW5cclxuYXBpLmludGVyY2VwdG9ycy5yZXF1ZXN0LnVzZShcclxuICAoY29uZmlnKSA9PiB7XHJcbiAgICBjb25zdCB0b2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpO1xyXG4gICAgaWYgKHRva2VuKSB7XHJcbiAgICAgIGNvbmZpZy5oZWFkZXJzWydBdXRob3JpemF0aW9uJ10gPSBgQmVhcmVyICR7dG9rZW59YDtcclxuICAgIH1cclxuICAgIHJldHVybiBjb25maWc7XHJcbiAgfSxcclxuICAoZXJyb3IpID0+IHtcclxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XHJcbiAgfVxyXG4pO1xyXG5cclxuLy8gQWRkIGEgcmVzcG9uc2UgaW50ZXJjZXB0b3IgdG8gaGFuZGxlIGNvbW1vbiBlcnJvcnNcclxuYXBpLmludGVyY2VwdG9ycy5yZXNwb25zZS51c2UoXHJcbiAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgfSxcclxuICAoZXJyb3IpID0+IHtcclxuICAgIC8vIEhhbmRsZSA0MDEgVW5hdXRob3JpemVkIGVycm9yc1xyXG4gICAgaWYgKGVycm9yLnJlc3BvbnNlICYmIGVycm9yLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XHJcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpO1xyXG4gICAgICAvLyBSZWRpcmVjdCB0byBsb2dpbiBwYWdlIGlmIG5lZWRlZFxyXG4gICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvJztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcclxuICB9XHJcbik7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhcGk7Il0sIm5hbWVzIjpbImF4aW9zIiwiYXBpIiwiY3JlYXRlIiwiYmFzZVVSTCIsInRpbWVvdXQiLCJoZWFkZXJzIiwiaW50ZXJjZXB0b3JzIiwicmVxdWVzdCIsInVzZSIsImNvbmZpZyIsInRva2VuIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsImVycm9yIiwiUHJvbWlzZSIsInJlamVjdCIsInJlc3BvbnNlIiwic3RhdHVzIiwicmVtb3ZlSXRlbSIsIndpbmRvdyIsImxvY2F0aW9uIiwiaHJlZiJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(pages-dir-node)/./utils/api.js\n");

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = import("axios");;

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

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

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("(pages-dir-node)/./pages/_app.js")));
module.exports = __webpack_exports__;

})();