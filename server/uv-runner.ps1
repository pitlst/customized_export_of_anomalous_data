#requires -Version 5.1
# 单项目 uv 自动运行器（支持 .git 在祖先目录）
# 将此脚本放在 uv 项目子目录下运行（如 backend/uv-runner.ps1）
# 需要 uv 和 git 在 PATH 中

# ==================== 配置区 ====================
$CheckIntervalMinutes = 5
$MaxRestarts = 5
$LogDir = Join-Path $PSScriptRoot ".uv-runner-logs"

# 自定义启动命令（留空则自动探测）
$CustomCommand = "uv run main.py"

# 工具路径
$GitPath = "git"

# ==================== 日志 ====================
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logLine = "[$timestamp] [$Level] $Message"
    Write-Host $logLine
    if (!(Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
    $logFile = Join-Path $LogDir "runner-$(Get-Date -Format 'yyyyMMdd').log"
    Add-Content -Path $logFile -Value $logLine -ErrorAction SilentlyContinue
}

# ==================== 路径探测 ====================
$ScriptDir = $PSScriptRoot

# 1. 找 uv 项目目录：当前目录必须有 pyproject.toml
$ProjectPath = $null
if (Test-Path (Join-Path $ScriptDir "pyproject.toml")) {
    $ProjectPath = $ScriptDir
} else {
    Write-Error "当前目录 ($ScriptDir) 缺少 pyproject.toml，请将脚本放在 uv 项目目录下"
    exit 1
}

# 2. 找 Git 根目录：从脚本目录向上递归查找 .git
$GitRoot = $ScriptDir
$foundGit = $false
while ($GitRoot -and (Split-Path $GitRoot -Parent) -ne $GitRoot) {
    if (Test-Path (Join-Path $GitRoot ".git")) {
        $foundGit = $true
        break
    }
    $GitRoot = Split-Path $GitRoot -Parent
}

if (!$foundGit) {
    Write-Error "未找到 .git 仓库（已从 $ScriptDir 向上回溯到根目录）"
    exit 1
}

$ProjectName = Split-Path $ProjectPath -Leaf

# ==================== 启动命令探测 ====================
function Get-StartCommand {
    if ($CustomCommand) { return $CustomCommand }
    
    $candidates = @("main.py", "app.py", "run.py", "server.py", "manage.py", "web_app.py")
    foreach ($c in $candidates) {
        if (Test-Path (Join-Path $ProjectPath $c)) {
            return "uv run python $c"
        }
    }
    
    $pyproject = Join-Path $ProjectPath "pyproject.toml"
    try {
        $content = Get-Content $pyproject -Raw
        if ($content -match '(?m)^\[project\.scripts\]\s*$') {
            $lines = $content -split "`n"
            $inScripts = $false
            foreach ($line in $lines) {
                if ($line -match '^\[project\.scripts\]\s*$') { $inScripts = $true; continue }
                if ($inScripts -and $line -match '^\s*(\w+)\s*=\s*["'']([^"'']+)["'']') {
                    return "uv run $($matches[1])"
                }
                if ($inScripts -and $line -match '^\[') { break }
            }
        }
    } catch {}
    
    Write-Log "未找到明确入口，默认使用 'uv run python'" "WARN"
    return "uv run python"
}

# ==================== 进程管理 ====================
function Start-Project {
    $command = Get-StartCommand
    Write-Log "启动命令: $command"
    
    $appLog = Join-Path $LogDir "app.log"
    $errLog = Join-Path $LogDir "app-error.log"
    
    $cmd = "cd /d `"$ProjectPath`" && $command >> `"$appLog`" 2>> `"$errLog`""
    
    try {
        $proc = Start-Process -FilePath "cmd.exe" `
            -ArgumentList "/c", $cmd `
            -WorkingDirectory $ProjectPath `
            -WindowStyle Hidden `
            -PassThru `
            -ErrorAction Stop
    } catch {
        Write-Log "启动失败: $_" "ERROR"
        return $null
    }
    
    if ($proc) {
        Write-Log "进程已启动 (PID: $($proc.Id))"
        return $proc
    }
    return $null
}

function Stop-Project {
    param([System.Diagnostics.Process]$Proc)
    if ($Proc -and !$Proc.HasExited) {
        Write-Log "正在停止进程树 (PID: $($Proc.Id))..."
        try {
            $result = & taskkill /T /F /PID $Proc.Id 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Log "进程树已终止"
            } else {
                Write-Log "taskkill 退出码 $LASTEXITCODE : $result" "WARN"
            }
            $Proc.WaitForExit(3000) | Out-Null
        } catch {
            Write-Log "停止进程时出错: $_" "WARN"
            try {
                Stop-Process -Id $Proc.Id -Force -ErrorAction SilentlyContinue
            } catch {}
        }
    }
}

# ==================== Git 操作（在 Git 根目录执行） ====================
function Test-GiteaUpdate {
    try {
        $fetch = & $GitPath -C $GitRoot fetch origin 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Log "git fetch 失败: $fetch" "ERROR"
            return $false
        }
        
        $local = & $GitPath -C $GitRoot rev-parse HEAD 2>$null
        $remote = & $GitPath -C $GitRoot rev-parse origin/HEAD 2>$null
        
        if ($LASTEXITCODE -ne 0) {
            $branch = & $GitPath -C $GitRoot rev-parse --abbrev-ref origin/HEAD 2>$null
            if ($branch) { $remote = & $GitPath -C $GitRoot rev-parse $branch 2>$null }
        }
        
        if ($local -and $remote -and ($local -ne $remote)) {
            Write-Log "检测到更新: 本地 $local -> 远程 $remote"
            return $true
        }
    } catch {
        Write-Log "检查更新时出错: $_" "ERROR"
    }
    return $false
}

function Update-Code {
    Write-Log "正在拉取最新代码..."
    
    $stash = & $GitPath -C $GitRoot stash push -m "uv-runner-auto-stash" 2>&1
    $stashed = ($LASTEXITCODE -eq 0) -and ($stash -notmatch "No local changes")
    
    $pull = & $GitPath -C $GitRoot pull origin 2>&1
    $ok = $LASTEXITCODE -eq 0
    
    if ($stashed) {
        $pop = & $GitPath -C $GitRoot stash pop 2>&1
        if ($LASTEXITCODE -ne 0) { Write-Log "stash pop 失败，可能需要手动解决冲突: $pop" "WARN" }
    }
    
    if ($ok) { Write-Log "代码拉取成功"; return $true }
    else { Write-Log "代码拉取失败: $pull" "ERROR"; return $false }
}

# ==================== 启动时检查更新 ====================
Write-Log "========================================"
Write-Log "uv 项目自动运行器启动"
Write-Log "uv 项目目录: $ProjectPath"
Write-Log "Git 根目录: $GitRoot"
Write-Log "项目名称: $ProjectName"
Write-Log "检查间隔: $CheckIntervalMinutes 分钟"
Write-Log "最大崩溃重试: $MaxRestarts 次"
Write-Log "========================================"

# 启动时先检查一次 Gitea 更新
Write-Log "启动时检查 Gitea 更新..."
$hasUpdateOnStart = Test-GiteaUpdate

if ($hasUpdateOnStart) {
    if (Update-Code) {
        Write-Log "启动时更新完成，准备启动最新版本"
    } else {
        Write-Log "启动时更新失败，使用现有代码启动" "WARN"
    }
} else {
    Write-Log "启动时无更新，使用当前代码启动"
}

# ==================== 启动项目 ====================
$process = Start-Project
$restartCount = 0

if (!$process) {
    Write-Log "首次启动失败，脚本退出" "ERROR"
    exit 1
}

# 使用 trap 捕获未处理异常，防止脚本退出
trap {
    Write-Log "捕获到未处理异常: $_" "ERROR"
    continue
}

# ==================== 主循环 ====================
while ($true) {
    try {
        Start-Sleep -Seconds ($CheckIntervalMinutes * 60)
        
        # 检查进程是否存活
        $hasExited = $false
        if ($null -eq $process) {
            $hasExited = $true
        } elseif ($process.HasExited) {
            $hasExited = $true
        }
        
        if ($hasExited) {
            $restartCount++
            if ($restartCount -gt $MaxRestarts) {
                Write-Log "连续 $MaxRestarts 次重启失败，脚本自动退出" "ERROR"
                Stop-Project -Proc $process
                exit 1
            }
            
            Write-Log "进程意外退出，第 $restartCount/$MaxRestarts 次重启..."
            $process = Start-Project
            
            if ($process -and !$process.HasExited) {
                $restartCount = 0
                Write-Log "重启成功，计数清零"
            }
            continue
        }
        
        # 定时检查 Gitea 更新
        Write-Log "定时检查 Gitea 更新..."
        if (Test-GiteaUpdate) {
            Stop-Project -Proc $process
            
            if (Update-Code) {
                $process = Start-Project
            } else {
                Write-Log "拉取失败，尝试用现有代码重启..." "WARN"
                $process = Start-Project
            }
            
            if ($process -and !$process.HasExited) {
                $restartCount = 0
                Write-Log "更新后启动成功，计数清零"
            }
        } else {
            Write-Log "无更新"
        }
    } catch {
        Write-Log "主循环异常: $_" "ERROR"
        Start-Sleep -Seconds 10
    }
}