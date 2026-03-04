@echo off
echo 正在部署网站图标文件...
echo.

REM 创建目标目录
if not exist "assets\favicon" mkdir "assets\favicon"

REM 复制所有图标文件（请修改路径）
xcopy "C:\路径\到\favicon_package\*.*" "assets\favicon\" /Y

echo.
echo ✅ 图标文件部署完成！
echo.
echo 请确保HTML文件中的路径为：assets/favicon/
pause