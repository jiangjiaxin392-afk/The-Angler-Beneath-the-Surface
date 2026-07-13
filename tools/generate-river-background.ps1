Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$width = 1920
$height = 1080
$output = Join-Path $PSScriptRoot '..\public\images\river-background.png'

$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

$colour = @{
  Ink = '#101C26'; InkBlue = '#182A34'; InkSoft = '#20343A'; BankMid = '#30484A'
  Forest = '#2E4942'; ForestMid = '#49675C'; ForestLight = '#668176'
  HillShadow = '#78958D'; RiverDeep = '#3D6F73'; River = '#4F8583'
  RiverLight = '#78AAA2'; RiverGlint = '#9CC7BD'; Mist = '#A8C3BC'
  Sky = '#BFD9D7'; SkyLight = '#D9E7E1'; CloudShade = '#C8DCD7'
  Paper = '#E8E0C5'; Yellow = '#DFBA62'; YellowDark = '#9B7D42'
}

function New-Brush([string]$hex) {
  return New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function Fill-Rect([int]$x, [int]$y, [int]$w, [int]$h, [string]$hex) {
  $brush = New-Brush $hex
  $graphics.FillRectangle($brush, $x, $y, $w, $h)
  $brush.Dispose()
}

function Fill-Poly([object[]]$coords, [string]$hex) {
  $points = New-Object System.Collections.Generic.List[System.Drawing.Point]
  foreach ($coord in $coords) {
    $points.Add((New-Object System.Drawing.Point([int]$coord[0], [int]$coord[1])))
  }
  $brush = New-Brush $hex
  $graphics.FillPolygon($brush, $points.ToArray())
  $brush.Dispose()
}

function Get-Hash([int]$value) {
  $n = [math]::Abs(([math]::Sin($value * 12.9898) * 43758.5453))
  return $n - [math]::Floor($n)
}

function Draw-Pine([int]$x, [int]$ground, [int]$treeHeight, [string]$dark, [string]$light) {
  $trunkTop = $ground - [int]($treeHeight * 0.46)
  $top = $ground - $treeHeight
  $crownOne = $ground - [int]($treeHeight * 0.58)
  $crownTwoTop = $ground - [int]($treeHeight * 0.84)
  $crownTwoBase = $ground - [int]($treeHeight * 0.34)
  $crownThreeTop = $ground - [int]($treeHeight * 0.64)
  $crownThreeBase = $ground - [int]($treeHeight * 0.08)
  Fill-Rect ($x - 3) $trunkTop 6 ([int]($treeHeight * 0.46)) $dark
  Fill-Poly @(
    @($x, $top),
    @(($x - 10), $crownOne),
    @(($x + 10), $crownOne)
  ) $dark
  Fill-Poly @(
    @($x, $crownTwoTop),
    @(($x - 16), $crownTwoBase),
    @(($x + 16), $crownTwoBase)
  ) $dark
  Fill-Poly @(
    @($x, $crownThreeTop),
    @(($x - 21), $crownThreeBase),
    @(($x + 21), $crownThreeBase)
  ) $dark
  Fill-Rect ($x - 6) ($ground - [int]($treeHeight * 0.72)) 4 ([int]($treeHeight * 0.19)) $light
  Fill-Rect ($x - 12) ($ground - [int]($treeHeight * 0.43)) 7 3 $light
  Fill-Rect ($x + 3) ($ground - [int]($treeHeight * 0.27)) 8 3 $light
}

function Draw-Rock([int]$x, [int]$y, [int]$w, [int]$h) {
  $left = $x - [int]($w * 0.5)
  $right = $x + [int]($w * 0.5)
  $bottom = $y + [int]($h * 0.4)
  $upperLeft = $x - [int]($w * 0.38)
  $upperLeftY = $y - [int]($h * 0.22)
  $peakX = $x - [int]($w * 0.12)
  $peakY = $y - [int]($h * 0.5)
  $upperRight = $x + [int]($w * 0.28)
  $upperRightY = $y - [int]($h * 0.36)
  Fill-Poly @(
    @($left, $bottom),
    @($upperLeft, $upperLeftY),
    @($peakX, $peakY),
    @($upperRight, $upperRightY),
    @($right, $bottom)
  ) $colour.InkBlue
  $litLeft = $x - [int]($w * 0.31)
  $litLeftY = $y - [int]($h * 0.2)
  $litPeakX = $x - [int]($w * 0.1)
  $litPeakY = $y - [int]($h * 0.4)
  $litRight = $x + [int]($w * 0.18)
  $litRightY = $y - [int]($h * 0.27)
  $litBottomX = $x + [int]($w * 0.02)
  $litBottomY = $y - [int]($h * 0.04)
  Fill-Poly @(
    @($litLeft, $litLeftY),
    @($litPeakX, $litPeakY),
    @($litRight, $litRightY),
    @($litBottomX, $litBottomY)
  ) $colour.BankMid
  Fill-Rect ($x - [int]($w * 0.18)) ($y - [int]($h * 0.28)) ([int]($w * 0.24)) 4 $colour.ForestMid
}

# Sky with restrained horizontal pixel texture.
Fill-Rect 0 0 $width $height $colour.Sky
Fill-Rect 0 285 $width 195 $colour.SkyLight
for ($x = 20; $x -lt $width; $x += 76) {
  $y = 100 + (($x * 11) % 142)
  $w = 12 + (($x / 4) % 28)
  Fill-Rect $x $y $w 2 $colour.CloudShade
}

# Pixel sun is part of the static lighting design.
$sunRows = @(64, 88, 104, 116, 116, 104, 88, 64)
for ($i = 0; $i -lt $sunRows.Count; $i++) {
  $rowWidth = $sunRows[$i]
  Fill-Rect (1540 - [int]($rowWidth / 2)) (89 + $i * 14) $rowWidth 14 $colour.Paper
}
Fill-Rect 1506 107 26 12 $colour.Yellow
Fill-Rect 1494 125 18 8 $colour.Yellow

# Distant mountain layer, with separate lit faces and sparse rock ledges.
Fill-Poly @(
  @(0, 382), @(0, 300), @(140, 258), @(270, 322), @(420, 236), @(590, 326),
  @(760, 250), @(930, 318), @(1110, 226), @(1290, 320), @(1470, 248),
  @(1640, 324), @(1800, 260), @(1920, 316), @(1920, 452), @(0, 452)
) $colour.HillShadow

Fill-Poly @(@(0,300),@(140,258),@(270,322),@(420,236),@(420,348),@(270,348),@(140,286),@(0,336)) $colour.Mist
Fill-Poly @(@(590,326),@(760,250),@(930,318),@(1110,226),@(1110,348),@(930,348),@(760,282)) $colour.Mist
Fill-Poly @(@(1290,320),@(1470,248),@(1640,324),@(1800,260),@(1800,362),@(1640,362),@(1470,282)) $colour.Mist

foreach ($mark in @(
  @(390,264,28),@(430,288,34),@(735,286,30),@(1080,268,30),@(1126,282,38),
  @(1445,290,26),@(1776,302,22),@(1812,316,30)
)) { Fill-Rect $mark[0] $mark[1] $mark[2] 4 $colour.SkyLight }

# Mid hills and textured tree line.
Fill-Poly @(
  @(0, 440), @(0, 350), @(180, 302), @(340, 382), @(520, 292), @(700, 382),
  @(900, 326), @(1080, 394), @(1270, 312), @(1460, 390), @(1640, 326),
  @(1920, 370), @(1920, 500), @(0, 500)
) $colour.ForestMid

for ($x = 4; $x -lt $width; $x += 31) {
  $h = 58 + [int]((Get-Hash ($x + 91)) * 66)
  Draw-Pine $x 465 $h $colour.Forest $colour.ForestLight
}
for ($x = 17; $x -lt $width; $x += 47) {
  $h = 70 + [int]((Get-Hash ($x + 211)) * 70)
  Draw-Pine $x 492 $h $colour.InkSoft $colour.ForestMid
}

# Static river base. Animated glints and ripples are added at runtime.
Fill-Rect 0 478 $width 462 $colour.RiverDeep
Fill-Poly @(@(0,526),@(1920,500),@(1920,742),@(0,812)) $colour.River
Fill-Poly @(@(0,520),@(1920,498),@(1920,552),@(0,584)) $colour.RiverLight
Fill-Poly @(@(0,724),@(1920,696),@(1920,760),@(0,798)) $colour.RiverDeep

$waterPalette = @($colour.RiverGlint, $colour.Mist, $colour.ForestLight, $colour.RiverLight, $colour.RiverDeep)
for ($row = 0; $row -lt 27; $row++) {
  $depth = $row / 26.0
  $y = 500 + ($row * 16)
  $spacing = 66 + [int]($depth * 88)
  for ($x = -80; $x -lt ($width + 120); $x += $spacing) {
    $hash = Get-Hash ($x + $row * 137)
    $w = 8 + [int]($hash * (22 + $depth * 54))
    $shade = $waterPalette[($row + [int]($hash * 10)) % $waterPalette.Count]
    Fill-Rect ($x + [int]($hash * 22)) $y $w $(if (($row % 6) -eq 0) { 3 } else { 2 }) $shade
    if ($hash -gt 0.76) { Fill-Rect ($x + $w + 8) ($y + 4) (5 + [int]($hash * 13)) 2 $shade }
  }
}

# Submerged darker forms suggest structure without revealing exact fish positions.
for ($i = 0; $i -lt 22; $i++) {
  $x = 560 + (($i * 173) % 1260)
  $y = 590 + (($i * 83) % 250)
  $w = 18 + (($i * 19) % 46)
  Fill-Rect $x $y $w 3 $colour.RiverDeep
  if (($i % 3) -eq 0) { Fill-Rect ($x + 8) ($y + 5) ([int]($w * 0.55)) 2 $colour.ForestMid }
}

# Foreground bank, ledges, stones and intentional clusters of vegetation.
Fill-Poly @(
  @(0,760),@(140,742),@(270,790),@(430,770),@(600,845),@(760,860),@(900,920),
  @(1920,900),@(1920,1080),@(0,1080)
) $colour.InkSoft
Fill-Poly @(
  @(0,790),@(136,770),@(276,814),@(426,798),@(596,858),@(742,876),@(840,914),
  @(692,904),@(522,850),@(350,836),@(180,806),@(0,838)
) $colour.BankMid
Fill-Poly @(
  @(0,830),@(150,800),@(300,846),@(470,820),@(650,900),@(850,930),@(1920,940),
  @(1920,1080),@(0,1080)
) $colour.Ink

Draw-Rock 76 835 92 54
Draw-Rock 452 843 78 48
Draw-Rock 648 905 118 62
Draw-Rock 780 924 76 44

for ($i = 0; $i -lt 82; $i++) {
  $x = ($i * 109 + 27) % 880
  $y = 838 + (($i * 47) % 210)
  $w = 5 + (($i * 13) % 25)
  $h = 2 + (($i * 7) % 5)
  $shade = if (($i % 4) -eq 0) { $colour.ForestLight } elseif (($i % 3) -eq 0) { $colour.BankMid } else { $colour.ForestMid }
  Fill-Rect $x $y $w $h $shade
}

for ($cluster = 0; $cluster -lt 7; $cluster++) {
  $baseX = 26 + $cluster * 118
  $baseY = 850 + (($cluster * 31) % 100)
  for ($blade = 0; $blade -lt 7; $blade++) {
    $bx = $baseX + $blade * 7
    $bh = 10 + (($blade * 9 + $cluster * 5) % 26)
    Fill-Rect $bx ($baseY - $bh) 3 $bh $(if (($blade % 2) -eq 0) { $colour.ForestMid } else { $colour.ForestLight })
  }
}

$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()

Write-Output "Generated $output"
