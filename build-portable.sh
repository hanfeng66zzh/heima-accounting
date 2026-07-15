#!/bin/bash
set -e

APP_NAME="黑马记账"
DIST_DIR="dist/${APP_NAME}"
ELECTRON_DIR="node_modules/electron/dist"

echo "=== 构建便携版 ${APP_NAME} ==="

# 1. 清理旧构建
rm -rf "dist/${APP_NAME}"

# 2. 创建目录结构
mkdir -p "${DIST_DIR}"
mkdir -p "${DIST_DIR}/resources"

# 3. 复制 Electron 运行文件（排除不需要的大文件）
echo "复制 Electron 运行时..."
cp "${ELECTRON_DIR}/electron.exe" "${DIST_DIR}/${APP_NAME}.exe"
cp "${ELECTRON_DIR}/chrome_100_percent.pak" "${DIST_DIR}/"
cp "${ELECTRON_DIR}/chrome_200_percent.pak" "${DIST_DIR}/"
cp "${ELECTRON_DIR}/icudtl.dat" "${DIST_DIR}/"
cp "${ELECTRON_DIR}/resources.pak" "${DIST_DIR}/"
cp "${ELECTRON_DIR}/snapshot_blob.bin" "${DIST_DIR}/"
cp "${ELECTRON_DIR}/v8_context_snapshot.bin" "${DIST_DIR}/"
cp "${ELECTRON_DIR}/vk_swiftshader_icd.json" "${DIST_DIR}/"
cp "${ELECTRON_DIR}/vulkan-1.dll" "${DIST_DIR}/"

# Windows 特定 DLL
for dll in d3dcompiler_47.dll ffmpeg.dll libEGL.dll libGLESv2.dll; do
  [ -f "${ELECTRON_DIR}/${dll}" ] && cp "${ELECTRON_DIR}/${dll}" "${DIST_DIR}/"
done

# 复制 locales（语言包）
cp -r "${ELECTRON_DIR}/locales" "${DIST_DIR}/"

# 4. 创建 app 资源目录
APP_RES="${DIST_DIR}/resources/app"
mkdir -p "${APP_RES}"

# 5. 复制应用文件
echo "复制应用文件..."
cp -r out "${APP_RES}/"
cp -r node_modules "${APP_RES}/"
cp package.json "${APP_RES}/"

# 6. 创建启动脚本
echo "创建快捷启动方式..."
cat > "dist/${APP_NAME}/启动说明.txt" << 'HELP'
黑马记账 - 便携版
==================

使用方法：
  双击「黑马记账.bat」即可启动

数据存储位置：
  C:\Users\<用户名>\AppData\Roaming\黑马记账\

备份数据：
  在设置页面使用 CSV 导出功能
HELP

# 7. 检查结果
echo ""
echo "=== 构建完成 ==="
echo "输出目录: dist/${APP_NAME}/"
echo "可执行文件: dist/${APP_NAME}/${APP_NAME}.exe"
ls -lh "dist/${APP_NAME}/${APP_NAME}.exe"
echo ""
echo "双击 dist/${APP_NAME}/${APP_NAME}.exe 即可运行"
