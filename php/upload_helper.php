<?php
/**
 * xfTextEditor 上传通用处理函数
 * 说明：图片与文件上传共用本文件的核心逻辑。原生 PHP 实现，无框架依赖。
 * 所有注释均为中文。
 */

/**
 * 处理跨域预检（OPTIONS）与统一响应头。
 * 便于前端以 XHR 跨域上传时浏览器先发的 OPTIONS 预检能正确通过。
 */
function xf_upload_preflight()
{
    // 允许的来源可在部署时按需收紧；* 仅用于本地 / 内网演示
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-CSRF-Token');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header('HTTP/1.1 204 No Content');
        exit;
    }
}

/**
 * 统一返回 JSON 响应（严格遵循编辑器要求的 {uploaded,url,fileName,error} 结构）
 * @param bool   $success  是否成功
 * @param string $url      成功时的文件可访问 URL
 * @param string $fileName 成功时的文件名
 * @param string $message  失败时的错误信息
 * @param int    $code     HTTP 状态码（失败时使用，默认 400）
 */
function xf_upload_response($success, $url = '', $fileName = '', $message = '', $code = 400)
{
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json; charset=utf-8');
    if ($success) {
        http_response_code(200);
        echo json_encode([
            'uploaded' => 1,
            'fileName' => $fileName,
            'url'      => $url,
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code($code);
        echo json_encode([
            'uploaded' => 0,
            'error'    => ['message' => $message],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
    exit;
}

/**
 * 将 UPLOAD_ERR_* 错误码翻译为可读信息，便于前端精确提示。
 * @param int $code $_FILES['error']
 * @return string
 */
function xf_upload_error_text($code)
{
    switch ($code) {
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            return '文件体积超过允许大小';
        case UPLOAD_ERR_PARTIAL:
            return '文件仅部分上传，请重试';
        case UPLOAD_ERR_NO_FILE:
            return '未检测到上传文件';
        case UPLOAD_ERR_NO_TMP_DIR:
            return '服务器临时目录缺失';
        case UPLOAD_ERR_CANT_WRITE:
            return '文件写入失败，请检查目录权限';
        case UPLOAD_ERR_EXTENSION:
            return '上传被扩展拦截';
        default:
            return '上传失败，请重试';
    }
}

/**
 * 执行文件保存：校验大小、扩展名、MIME，生成唯一文件名并移动到存储目录。
 * @param array  $file       $_FILES['upload']
 * @param array  $allowedExt 允许的扩展名白名单（小写）
 * @param array  $allowedMime 允许的 MIME 白名单（可选，留空则不校验）
 * @param int    $maxSize    最大字节数
 * @param string $baseDir    存储根目录（物理路径）
 * @param string $baseUrl    访问根 URL
 * @return array|string      成功返回 [url, fileName]，失败返回错误字符串
 */
function xf_save_upload($file, $allowedExt, $allowedMime, $maxSize, $baseDir, $baseUrl)
{
    // 1. 上传错误码细化
    if (!isset($file) || !is_array($file)) {
        return '未检测到上传文件';
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return xf_upload_error_text($file['error']);
    }

    // 2. 大小校验
    if ($file['size'] <= 0 || $file['size'] > $maxSize) {
        return '文件过大，超过了允许的大小限制';
    }

    // 3. 扩展名校验（白名单，杜绝路径穿越）
    $name = basename($file['name']);
    $ext  = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt, true)) {
        return '文件类型不被允许';
    }

    // 4. MIME 校验（进一步防伪装，可选）
    if (!empty($allowedMime)) {
        $finfo = function_exists('finfo_open')
            ? finfo_open(FILEINFO_MIME_TYPE)
            : null;
        $mime  = $finfo ? finfo_file($finfo, $file['tmp_name']) : ($file['type'] ?? '');
        if ($finfo) finfo_close($finfo);
        if (!in_array($mime, $allowedMime, true)) {
            return '文件真实类型不被允许';
        }
    }

    // 5. 按日期分目录 + 随机文件名（避免中文/特殊字符与覆盖，且不可预测）
    $dateDir  = date('Y/m/d');
    $newName  = bin2hex(random_bytes(12)) . '.' . $ext;
    $fullDir  = rtrim($baseDir, '/') . '/' . $dateDir;
    $fullPath = $fullDir . '/' . $newName;

    if (!is_dir($fullDir)) {
        mkdir($fullDir, 0755, true);
    }

    // 6. 移动文件
    if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
        return '文件保存失败，请检查目录权限';
    }

    // 7. 拼装结果
    $url      = rtrim($baseUrl, '/') . '/' . $dateDir . '/' . $newName;
    $fileName = $dateDir . '/' . $newName;
    return [$url, $fileName];
}
