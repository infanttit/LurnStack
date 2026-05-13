$ErrorActionPreference = "Stop"

$repoRoot = Get-Location
$mdPath = Join-Path $repoRoot "docs\\backend-api-spec.md"
$docxPath = Join-Path $repoRoot "docs\\backend-api-spec.docx"
$pdfPath = Join-Path $repoRoot "docs\\backend-api-spec.pdf"

if (!(Test-Path -LiteralPath $mdPath)) {
  throw "Missing input: $mdPath"
}

$lines = Get-Content -LiteralPath $mdPath

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

# Build a simple HTML doc and let Word import it.
$htmlPath = Join-Path $repoRoot "docs\\backend-api-spec.html"

function HtmlEscape([string]$s) {
  if ($null -eq $s) { return "" }
  return ($s -replace '&', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;' -replace '"', '&quot;')
}

$sb = New-Object System.Text.StringBuilder
$null = $sb.AppendLine("<!doctype html>")
$null = $sb.AppendLine("<html><head><meta charset='utf-8'/>")
$null = $sb.AppendLine("<style>")
$null = $sb.AppendLine("body{font-family:Arial, sans-serif; font-size:11pt; line-height:1.35;}")
$null = $sb.AppendLine("h1{font-size:20pt;} h2{font-size:14pt; margin-top:18px;} h3{font-size:12pt; margin-top:12px;}")
$null = $sb.AppendLine("code, pre{font-family:Consolas, monospace; font-size:10pt;}")
$null = $sb.AppendLine("pre{background:#f2f2f2; padding:10px; border-radius:6px;}")
$null = $sb.AppendLine("hr{border:none; border-top:1px solid #ddd; margin:14px 0;}")
$null = $sb.AppendLine("</style></head><body>")

$inCode = $false
$inList = $false
foreach ($line in $lines) {
  $trim = $line.Trim()

  if ($trim -eq '```json' -or $trim -eq '```') {
    if (-not $inCode) {
      if ($inList) { $null = $sb.AppendLine("</ul>"); $inList = $false }
      $null = $sb.AppendLine("<pre>")
      $inCode = $true
    } else {
      $null = $sb.AppendLine("</pre>")
      $inCode = $false
    }
    continue
  }

  if ($inCode) {
    $null = $sb.AppendLine((HtmlEscape $line))
    continue
  }

  if ($trim -eq "---") {
    if ($inList) { $null = $sb.AppendLine("</ul>"); $inList = $false }
    $null = $sb.AppendLine("<hr/>")
    continue
  }

  if ($line -match "^#\\s+(.*)$") {
    if ($inList) { $null = $sb.AppendLine("</ul>"); $inList = $false }
    $null = $sb.AppendLine("<h1>$(HtmlEscape $Matches[1])</h1>")
    continue
  }
  if ($line -match "^##\\s+(.*)$") {
    if ($inList) { $null = $sb.AppendLine("</ul>"); $inList = $false }
    $null = $sb.AppendLine("<h2>$(HtmlEscape $Matches[1])</h2>")
    continue
  }
  if ($line -match "^###\\s+(.*)$") {
    if ($inList) { $null = $sb.AppendLine("</ul>"); $inList = $false }
    $null = $sb.AppendLine("<h3>$(HtmlEscape $Matches[1])</h3>")
    continue
  }
  if ($line -match "^-\\s+(.*)$") {
    if (-not $inList) { $null = $sb.AppendLine("<ul>"); $inList = $true }
    $null = $sb.AppendLine("<li>$(HtmlEscape $Matches[1])</li>")
    continue
  }

  if ([string]::IsNullOrWhiteSpace($line)) {
    if ($inList) { $null = $sb.AppendLine("</ul>"); $inList = $false }
    $null = $sb.AppendLine("<p></p>")
    continue
  }

  if ($inList) { $null = $sb.AppendLine("</ul>"); $inList = $false }
  $null = $sb.AppendLine("<p>$(HtmlEscape $line)</p>")
}

if ($inList) { $null = $sb.AppendLine("</ul>") }
if ($inCode) { $null = $sb.AppendLine("</pre>") }

$null = $sb.AppendLine("</body></html>")

Set-Content -LiteralPath $htmlPath -Value $sb.ToString() -Encoding UTF8

$doc = $word.Documents.Open($htmlPath)

# 1 inch margins (points)
$doc.PageSetup.TopMargin = 72
$doc.PageSetup.BottomMargin = 72
$doc.PageSetup.LeftMargin = 72
$doc.PageSetup.RightMargin = 72

# Save
$wdFormatXMLDocument = 16
$wdExportFormatPDF = 17

$null = $doc.SaveAs([ref]$docxPath, [ref]$wdFormatXMLDocument)
$null = $doc.ExportAsFixedFormat($pdfPath, $wdExportFormatPDF)

$doc.Close([ref]0) | Out-Null
$word.Quit() | Out-Null

Write-Output "Wrote: $docxPath"
Write-Output "Wrote: $pdfPath"
