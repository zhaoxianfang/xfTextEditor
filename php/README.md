# xfTextEditor 上传接口详细说明（PHP 版）

> 本文档面向后端开发者，说明 xfTextEditor 富文本编辑器所有「上传类接口」的请求参数、响应参数、
> 响应结构与完整 PHP 示例。所有说明均为中文。
>
> 编辑器前端通过 CKEditor 的 `fileTools` / `uploadwidget` 机制，以 **XHR + FormData** 方式上传文件，
> 并要求后端返回统一的 **JSON** 结构。

---

## 目录

1. [总览](#1-总览)
2. [接口清单](#2-接口清单)
3. [通用请求参数](#3-通用请求参数)
4. [通用响应结构](#4-通用响应结构)
5. [图片上传接口](#5-图片上传接口)
6. [文件上传接口](#6-文件上传接口)
7. [拖拽 / 粘贴上传](#7-拖拽--粘贴上传uploadfile)
8. [参数逐项说明](#8-参数逐项说明)
9. [完整 PHP 示例](#9-完整-php-示例)
10. [安全与最佳实践](#10-安全与最佳实践)
11. [常见问题](#11-常见问题)

---

## 1. 总览

编辑器共有 **三类上传入口**，但底层都复用同一套上传机制：

| 入口 | 触发方式 | 前端配置项 | 推荐后端路由 |
| --- | --- | --- | --- |
| 图片上传 | 「图像」按钮 / image2 / 拖拽图片 | `filebrowserImageUploadUrl` | `/files/uploads/ckeditor/img/docs` |
| 文件上传 | 「上传」按钮 / uploadfile 弹窗 | `filebrowserUploadUrl` | `/files/uploads/ckeditor/file/docs` |
| 拖拽/粘贴上传 | 将文件拖入或粘贴到编辑区 | 复用 `filebrowserUploadUrl` | `/files/uploads/ckeditor/file/docs` |

> 前端在地址后追加 `?responseType=json` 与 `_token=xxx`（CSRF Token）两个查询参数。
> `responseType=json` 是前后端约定的「返回 JSON」标志，后端可据此判断是否走 JSON 响应。

---

## 2. 接口清单

### 2.1 图片上传接口

- **请求地址**：`/files/uploads/ckeditor/img/docs?_token={token}&responseType=json`
- **请求方法**：`POST`
- **Content-Type**：`multipart/form-data`
- **用途**：编辑器内插入图片（含 image2 增强图片、拖拽图片）。

### 2.2 文件上传接口

- **请求地址**：`/files/uploads/ckeditor/file/docs?_token={token}&responseType=json`
- **请求方法**：`POST`
- **Content-Type**：`multipart/form-data`
- **用途**：上传普通文件（文档、压缩包等），编辑器以链接形式插入。

---

## 3. 通用请求参数

编辑器以 FormData 提交，包含以下字段：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `upload` | FormData | File | 是 | 文件本体。结构为 `{ file: Blob, name: 文件名 }`，PHP 中通过 `$_FILES['upload']` 读取。 |
| `ckCsrfToken` | FormData | String | 是 | CKEditor `fileTools` 自动附加的 CSRF 令牌，用于基础防护。 |
| `_token` | URL 查询参数 | String | 否* | 业务框架（如 Laravel）注入的 CSRF Token，由前端从页面 `<meta name="csrf-token">` 读取并拼接。 |
| `responseType` | URL 查询参数 | String | 否* | 固定值 `json`，约定后端返回 JSON。 |

> `*`：是否必填取决于你的框架是否在 URL 中强制校验 `_token`。若使用 Laravel 等框架，
> 该参数通常为必填；若自定义接口，可忽略并仅依赖 `ckCsrfToken` 或自行实现校验。

### PHP 中读取文件示例

```php
// 文件本体
if (!isset($_FILES['upload']) || $_FILES['upload']['error'] !== UPLOAD_ERR_OK) {
    // 返回失败响应（见第 4 节）
    echo json_encode(['uploaded' => 0, 'error' => ['message' => '未检测到上传文件']]);
    exit;
}
$file = $_FILES['upload'];
$originalName = $file['name'];      // 原始文件名，如 "photo.png"
$tmpPath      = $file['tmp_name'];  // 服务器临时路径
$size         = $file['size'];      // 字节数
$mime         = $file['type'];      // MIME，如 "image/png"
$errorCode    = $file['error'];     // 错误码，0 表示成功
```

---

## 4. 通用响应结构

无论图片还是文件，**成功与失败都必须返回 HTTP 200 + JSON**（CKEditor 通过解析 JSON 判定成败，
而非 HTTP 状态码）。

### 4.1 成功响应

```json
{
  "uploaded": 1,
  "fileName": "2026/07/10/abc123.png",
  "url": "https://cdn.example.com/uploads/2026/07/10/abc123.png"
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `uploaded` | Number | 是 | **固定为 `1`** 表示上传成功。缺失或为 `0` 均视为失败。 |
| `url` | String | 是 | 上传后文件的**完整可访问 URL**（或站点根相对路径）。这是编辑器实际插入到内容里的地址。 |
| `fileName` | String | 否 | 服务器侧最终文件名 / 相对路径，用于状态展示。 |

### 4.2 失败响应

```json
{
  "uploaded": 0,
  "error": {
    "message": "文件类型不被允许"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `uploaded` | Number | 是 | **固定为 `0`** 表示失败。 |
| `error.message` | String | 是 | 失败原因，将以提示框形式展示给终端用户。 |

> 注意：即使失败，也请确保 `uploaded` 为 `0`，否则前端会当作成功并尝试读取 `url`。

---

## 5. 图片上传接口

### 5.1 请求特点

- 仅接受图片类型：`image/jpeg`、`image/png`、`image/gif`、`image/webp`、`image/bmp` 等。
- 建议限制大小（如 10MB 以内）。
- 建议生成唯一文件名（避免覆盖、避免中文/特殊字符导致的问题）。

### 5.2 服务器端处理流程

1. 校验 `$_FILES['upload']` 是否存在且无错误。
2. 校验 MIME / 扩展名是否为允许的图片类型。
3. 校验文件大小。
4. 计算存储路径（可按日期分目录）。
5. 移动临时文件到目标目录 `move_uploaded_file()`。
6. 生成可访问 URL。
7. 返回成功 JSON。

### 5.3 响应示例（图片）

```json
{
  "uploaded": 1,
  "fileName": "2026/07/10/a1b2c3.png",
  "url": "https://cdn.example.com/uploads/2026/07/10/a1b2c3.png"
}
```

---

## 6. 文件上传接口

### 6.1 请求特点

- 接受任意文件类型（文档、压缩包、音视频等），但建议做白名单限制。
- 大小限制通常高于图片（如 50MB）。

### 6.2 响应示例（文件）

```json
{
  "uploaded": 1,
  "fileName": "报告.pdf",
  "url": "https://cdn.example.com/uploads/2026/07/10/report_a1b2.pdf"
}
```

> 文件上传成功后，编辑器会以 `<a href="url" target="_blank">fileName</a>` 形式插入到内容中。

---

## 7. 拖拽 / 粘贴上传（uploadfile）

`uploadfile` 插件基于 `uploadwidget`，当用户**拖拽或粘贴**文件到编辑区时：

- 图片：走 `filebrowserImageUploadUrl`。
- 其他文件：走 `filebrowserUploadUrl`。
- 上传过程中显示占位符，完成后自动替换为最终链接/图片。

后端无需做特殊处理，复用第 5、6 节的接口与响应结构即可。

---

## 8. 参数逐项说明

### 8.1 请求参数

| 参数 | 说明 |
| --- | --- |
| `upload` | 文件字段。CKEditor 内部构造为 `{ file: 原生File对象, name: 文件名 }`，PHP 侧表现为标准 `$_FILES['upload']`。 |
| `ckCsrfToken` | 由 `fileTools` 在发送前自动追加到 FormData，用于对抗 CSRF。可与业务 `_token` 二选一或并存校验。 |
| `_token` | 业务框架 CSRF Token，前端从 `<meta name="csrf-token" content="...">` 读取并拼接到 URL。 |
| `responseType=json` | 前后端约定标记，提示后端「本次请求期望 JSON 响应」。 |

### 8.2 响应参数

| 参数 | 说明 |
| --- | --- |
| `uploaded` | 成败标志。**1=成功，0=失败**。这是前端唯一判定依据，务必准确。 |
| `url` | 文件可访问地址。应可被浏览器直接打开（图片）或下载（文件）。相对路径需以 `/` 开头。 |
| `fileName` | 展示用文件名。不影响功能，但影响用户体验。 |
| `error.message` | 失败时的可读原因，将直接展示给用户。 |

---

## 9. 完整 PHP 示例

> 以下示例使用**原生 PHP**编写，不依赖任何框架，便于直接复用。请根据实际环境调整
> 存储根目录、URL 前缀与允许类型。

### 9.1 公共处理函数 `upload_helper.php`

```php
<?php
/**
 * xfTextEditor 上传通用处理函数
 * 说明：图片与文件上传共用本文件的核心逻辑。
 */

/**
 * 统一返回 JSON 响应
 * @param bool   $success 是否成功
 * @param string $url     成功时的文件 URL
 * @param string $fileName 成功时的文件名
 * @param string $message 失败时的错误信息
 */
function xf_upload_response($success, $url = '', $fileName = '', $message = '')
{
    header('Content-Type: application/json; charset=utf-8');
    if ($success) {
        echo json_encode([
            'uploaded' => 1,
            'fileName' => $fileName,
            'url'      => $url,
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'uploaded' => 0,
            'error'    => ['message' => $message],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
    exit;
}

/**
 * 执行文件保存
 * @param array  $file        $_FILES['upload']
 * @param array  $allowedExt  允许的扩展名白名单
 * @param int    $maxSize     最大字节数
 * @param string $baseDir     存储根目录（物理路径）
 * @param string $baseUrl     访问根 URL
 * @return array|string       成功返回 [url, fileName]，失败返回错误字符串
 */
function xf_save_upload($file, $allowedExt, $maxSize, $baseDir, $baseUrl)
{
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return '上传失败，请重试';
    }

    // 校验大小
    if ($file['size'] > $maxSize) {
        return '文件过大，超过了允许的大小限制';
    }

    // 获取并校验扩展名
    $name = $file['name'];
    $ext  = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt, true)) {
        return '文件类型不被允许';
    }

    // 生成唯一文件名，避免中文/特殊字符与覆盖
    $dateDir  = date('Y/m/d');
    $newName  = bin2hex(random_bytes(8)) . '.' . $ext;
    $fullDir  = rtrim($baseDir, '/') . '/' . $dateDir;
    $fullPath = $fullDir . '/' . $newName;

    if (!is_dir($fullDir)) {
        mkdir($fullDir, 0755, true);
    }

    if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
        return '文件保存失败，请检查目录权限';
    }

    $url      = rtrim($baseUrl, '/') . '/' . $dateDir . '/' . $newName;
    $fileName = $dateDir . '/' . $newName;
    return [$url, $fileName];
}
```

### 9.2 图片上传 `upload_image.php`

```php
<?php
/**
 * 图片上传接口
 * 路由建议：/files/uploads/ckeditor/img/docs
 */
require_once __DIR__ . '/upload_helper.php';

// 基础配置
$baseDir = __DIR__ . '/../public/uploads';   // 物理存储根目录
$baseUrl = 'https://cdn.example.com/uploads'; // 可访问 URL 前缀（请改为你的域名）
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
$maxSize = 10 * 1024 * 1024; // 10MB

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['upload'])) {
    xf_upload_response(false, '', '', '请求方式不正确或未携带文件');
}

$result = xf_save_upload($_FILES['upload'], $allowed, $maxSize, $baseDir, $baseUrl);

if (is_array($result)) {
    list($url, $fileName) = $result;
    xf_upload_response(true, $url, $fileName);
} else {
    xf_upload_response(false, '', '', $result);
}
```

### 9.3 文件上传 `upload_file.php`

```php
<?php
/**
 * 文件上传接口
 * 路由建议：/files/uploads/ckeditor/file/docs
 */
require_once __DIR__ . '/upload_helper.php';

$baseDir = __DIR__ . '/../public/uploads';
$baseUrl = 'https://cdn.example.com/uploads';
$allowed = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
            'zip', 'rar', 'txt', 'mp3', 'mp4', 'avi'];
$maxSize = 50 * 1024 * 1024; // 50MB

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['upload'])) {
    xf_upload_response(false, '', '', '请求方式不正确或未携带文件');
}

$result = xf_save_upload($_FILES['upload'], $allowed, $maxSize, $baseDir, $baseUrl);

if (is_array($result)) {
    list($url, $fileName) = $result;
    // 文件场景建议保留原始文件名用于展示
    $displayName = $_FILES['upload']['name'];
    xf_upload_response(true, $url, $displayName);
} else {
    xf_upload_response(false, '', '', $result);
}
```

---

## 10. 安全与最佳实践

1. **扩展名 + MIME 双重校验**：仅依赖扩展名不够，建议同时校验 `$file['type']` 或使用 `finfo`。
2. **重命名文件**：务必生成随机文件名（如 `bin2hex(random_bytes(8))`），避免路径遍历与覆盖。
3. **限制目录权限**：上传目录应禁止执行脚本（服务器配置 `<Directory>` 关闭 PHP 执行）。
4. **大小限制**：前后端双重限制，避免大文件拖垮服务。
5. **CSRF 校验**：校验 `ckCsrfToken` 或业务 `_token`，防止跨站上传。
6. **返回标准 JSON**：严格按第四节的字段返回，否则前端解析失败。
7. **URL 稳定性**：`url` 必须是长期可访问地址，避免使用临时路径。
8. **错误处理**：任何异常都应返回 `uploaded=0` + `error.message`，不要抛出裸 PHP 错误（会被前端当作解析失败）。

---

## 11. 常见问题

### Q1：上传后图片显示为破图？
`url` 必须是完整可访问地址。检查：
- 域名/协议是否正确（http/https 一致）；
- 路径是否以 `/` 开头；
- CDN/存储桶是否已正确配置跨域与访问权限。

### Q2：前端报 `responseError` / 解析失败？
后端返回的不是合法 JSON。请确认：
- 没有在 JSON 前输出任何 HTML/警告（如 PHP Notice）；
- 响应头为 `application/json`；
- 字段名拼写为 `uploaded`（小写）、`url`、`error.message`。

### Q3：中文文件名乱码或失败？
已通过 `xf_save_upload` 重命名为随机名，仅将原始名用于展示，可规避该问题。

### Q4：Laravel 等框架报 419 TokenMismatch？
前端在 URL 中拼接了 `_token`（取自 `<meta name="csrf-token">`）。请确保页面已输出该 meta 标签，
或在框架路由中给上传接口加上 `csrf` 例外（排除校验）。

### Q5：拖拽上传走了哪个接口？
图片走图片接口，其他文件走文件接口，由 `uploadfile` 插件按类型自动选择，后端无需区分处理。
