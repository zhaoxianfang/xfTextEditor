<?php
/**
 * xfTextEditor 文件上传接口示例
 * 路由建议：/files/uploads/ckeditor/file/docs
 * 前端对应配置：config.filebrowserUploadUrl（拖拽/粘贴上传亦复用此接口）
 * 所有注释均为中文。
 */
require_once __DIR__ . '/upload_helper.php';

// 跨域预检处理（前端以 XHR 跨域上传时浏览器会先发 OPTIONS）
xf_upload_preflight();

// ===================== 请根据实际环境修改以下配置 =====================
$baseDir = __DIR__ . '/../public/uploads';      // 物理存储根目录
$baseUrl = 'https://cdn.example.com/uploads';   // 可访问 URL 前缀（改为你的域名）
$allowed = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
            'zip', 'rar', 'txt', 'mp3', 'mp4', 'avi'];
$allowedMime = ['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip', 'application/x-rar-compressed', 'text/plain',
    'audio/mpeg', 'video/mp4', 'video/x-msvideo'];
$maxSize = 50 * 1024 * 1024; // 50MB
// =====================================================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['upload'])) {
    xf_upload_response(false, '', '', '请求方式不正确或未携带文件');
}

$result = xf_save_upload($_FILES['upload'], $allowed, $allowedMime, $maxSize, $baseDir, $baseUrl);

if (is_array($result)) {
    list($url, $fileName) = $result;
    // 文件场景：展示名使用用户原始文件名，便于识别
    $displayName = basename($_FILES['upload']['name']);
    xf_upload_response(true, $url, $displayName);
} else {
    xf_upload_response(false, '', '', $result);
}
