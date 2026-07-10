<?php
/**
 * xfTextEditor 图片上传接口示例
 * 路由建议：/files/uploads/ckeditor/img/docs
 * 前端对应配置：config.filebrowserImageUploadUrl
 * 所有注释均为中文。
 */
require_once __DIR__ . '/upload_helper.php';

// 跨域预检处理（前端以 XHR 跨域上传时浏览器会先发 OPTIONS）
xf_upload_preflight();

// ===================== 请根据实际环境修改以下配置 =====================
$baseDir = __DIR__ . '/../public/uploads';      // 物理存储根目录
$baseUrl = 'https://cdn.example.com/uploads';   // 可访问 URL 前缀（改为你的域名）
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
$allowedMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
$maxSize = 10 * 1024 * 1024; // 10MB
// =====================================================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['upload'])) {
    xf_upload_response(false, '', '', '请求方式不正确或未携带文件');
}

$result = xf_save_upload($_FILES['upload'], $allowed, $allowedMime, $maxSize, $baseDir, $baseUrl);

if (is_array($result)) {
    list($url, $fileName) = $result;
    xf_upload_response(true, $url, $fileName);
} else {
    xf_upload_response(false, '', '', $result);
}
