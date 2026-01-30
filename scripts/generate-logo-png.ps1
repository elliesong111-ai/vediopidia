# Generate logo-mage.png (400x400) using .NET System.Drawing - black circle, white MAGE text
Add-Type -AssemblyName System.Drawing
$size = 400
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::Black)
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(20,255,255,255), 2)
$g.DrawEllipse($pen, 4, 4, $size-8, $size-8)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$font = New-Object System.Drawing.Font("Arial", 48, [System.Drawing.FontStyle]::Bold)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center
$rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
$g.DrawString("MAGE", $font, $brush, $rect, $sf)
$g.Dispose()
$outPath = Join-Path $PSScriptRoot "..\assets\logo-mage.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created $outPath"
