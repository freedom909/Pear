/**
 * 应用程序错误代码枚举
 *
 * 错误代码格式：
 * - 前缀: E表示错误
 * - 分类: 3位数字表示错误分类
 * - 序号: 3位数字表示具体错误
 *
 * 分类说明：
 * - 000: 通用错误
 * - 100: 认证/授权错误
 * - 200: 输入验证错误
 * - 300: 业务逻辑错误
 * - 400: 数据库错误
 * - 500: 外部服务错误
 * - 600: 系统错误
 */
export enum ErrorCode {
  // 通用错误 (000)
  INTERNAL_SERVER_ERROR = 'E000001', // 内部服务器错误
  BAD_REQUEST = 'E000002', // 错误的请求
  NOT_FOUND = 'E000003', // 资源未找到
  OPERATION_FAILED = 'E000004', // 操作失败
  INVALID_INPUT = 'E000005', // 无效的输入

  // 认证/授权错误 (100)
  UNAUTHORIZED = 'E100001', // 未经授权
  FORBIDDEN = 'E100002', // 禁止访问
  INVALID_TOKEN = 'E100003', // 无效的令牌
  TOKEN_EXPIRED = 'E100004', // 令牌过期
  INVALID_CREDENTIALS = 'E100005', // 无效的凭证
  SESSION_EXPIRED = 'E100006', // 会话过期
  INSUFFICIENT_PERMISSIONS = 'E100007', // 权限不足

  // 输入验证错误 (200)
  VALIDATION_ERROR = 'E200001', // 验证错误
  INVALID_FORMAT = 'E200002', // 格式无效
  REQUIRED_FIELD_MISSING = 'E200003', // 必填字段缺失
  INVALID_ENUM_VALUE = 'E200004', // 无效的枚举值
  INVALID_DATE = 'E200005', // 无效的日期
  INVALID_EMAIL = 'E200006', // 无效的邮箱
  INVALID_PHONE = 'E200007', // 无效的电话号码
  INVALID_PASSWORD = 'E200008', // 无效的密码

  // 业务逻辑错误 (300)
  DUPLICATE_ENTRY = 'E300001', // 重复条目
  RESOURCE_LOCKED = 'E300002', // 资源被锁定
  DEPENDENCY_ERROR = 'E300003', // 依赖错误
  STATE_CONFLICT = 'E300004', // 状态冲突
  BUSINESS_RULE_VIOLATION = 'E300005', // 业务规则违反
  OPERATION_NOT_ALLOWED = 'E300006', // 不允许的操作
  QUOTA_EXCEEDED = 'E300007', // 配额超限

  // 数据库错误 (400)
  DATABASE_ERROR = 'E400001', // 数据库错误
  CONNECTION_ERROR = 'E400002', // 连接错误
  QUERY_ERROR = 'E400003', // 查询错误
  TRANSACTION_ERROR = 'E400004', // 事务错误
  DEADLOCK_ERROR = 'E400005', // 死锁错误
  DATA_INTEGRITY_ERROR = 'E400006', // 数据完整性错误

  // 外部服务错误 (500)
  EXTERNAL_SERVICE_ERROR = 'E500001', // 外部服务错误
  SERVICE_UNAVAILABLE = 'E500002', // 服务不可用
  TIMEOUT_ERROR = 'E500003', // 超时错误
  RATE_LIMIT_EXCEEDED = 'E500004', // 速率限制超出
  API_ERROR = 'E500005', // API错误
  INTEGRATION_ERROR = 'E500006', // 集成错误

  // 系统错误 (600)
  SYSTEM_ERROR = 'E600001', // 系统错误
  CONFIGURATION_ERROR = 'E600002', // 配置错误
  INITIALIZATION_ERROR = 'E600003', // 初始化错误
  RESOURCE_EXHAUSTED = 'E600004', // 资源耗尽
  FILE_SYSTEM_ERROR = 'E600005', // 文件系统错误
  NETWORK_ERROR = 'E600006', // 网络错误
}

/**
 * 错误代码到HTTP状态码的映射
 */
export const ErrorCodeToStatusCode: Record<ErrorCode, number> = {
  // 通用错误
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.OPERATION_FAILED]: 400,
  [ErrorCode.INVALID_INPUT]: 400,

  // 认证/授权错误
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.SESSION_EXPIRED]: 401,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,

  // 输入验证错误
  [ErrorCode.VALIDATION_ERROR]: 422,
  [ErrorCode.INVALID_FORMAT]: 400,
  [ErrorCode.REQUIRED_FIELD_MISSING]: 400,
  [ErrorCode.INVALID_ENUM_VALUE]: 400,
  [ErrorCode.INVALID_DATE]: 400,
  [ErrorCode.INVALID_EMAIL]: 400,
  [ErrorCode.INVALID_PHONE]: 400,
  [ErrorCode.INVALID_PASSWORD]: 400,

  // 业务逻辑错误
  [ErrorCode.DUPLICATE_ENTRY]: 409,
  [ErrorCode.RESOURCE_LOCKED]: 423,
  [ErrorCode.DEPENDENCY_ERROR]: 424,
  [ErrorCode.STATE_CONFLICT]: 409,
  [ErrorCode.BUSINESS_RULE_VIOLATION]: 422,
  [ErrorCode.OPERATION_NOT_ALLOWED]: 403,
  [ErrorCode.QUOTA_EXCEEDED]: 429,

  // 数据库错误
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.CONNECTION_ERROR]: 503,
  [ErrorCode.QUERY_ERROR]: 500,
  [ErrorCode.TRANSACTION_ERROR]: 500,
  [ErrorCode.DEADLOCK_ERROR]: 500,
  [ErrorCode.DATA_INTEGRITY_ERROR]: 500,

  // 外部服务错误
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.TIMEOUT_ERROR]: 504,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.API_ERROR]: 502,
  [ErrorCode.INTEGRATION_ERROR]: 502,

  // 系统错误
  [ErrorCode.SYSTEM_ERROR]: 500,
  [ErrorCode.CONFIGURATION_ERROR]: 500,
  [ErrorCode.INITIALIZATION_ERROR]: 500,
  [ErrorCode.RESOURCE_EXHAUSTED]: 503,
  [ErrorCode.FILE_SYSTEM_ERROR]: 500,
  [ErrorCode.NETWORK_ERROR]: 503,
};

export default ErrorCode;
