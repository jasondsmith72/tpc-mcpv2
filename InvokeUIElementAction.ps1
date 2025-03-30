# InvokeUIElementAction.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$WindowTitle,

    [Parameter(Mandatory=$true)]
    [ValidateSet('Click', 'SetValue', 'Focus')] # Add more actions as needed
    [string]$Action,

    [string]$ElementName,
    [string]$AutomationId,
    [string]$ClassName,

    # Parameter for SetValue action
    [string]$ValueToSet
)

# Add required .NET assemblies
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Windows.Forms # For SendKeys fallback

# Function to find the main window using Get-Process and UI Automation .NET classes (same as in GetUIElementInfo.ps1)
function Get-WindowElement($Title) {
    $process = Get-Process | Where-Object { $_.MainWindowTitle -like "*$Title*" -and $_.MainWindowHandle -ne 0 } | Select-Object -First 1
    if (-not $process) {
        Write-Error "Window process with title like '$Title' not found."
        return $null
    }
     if ($process.MainWindowHandle -eq 0) {
         Write-Error "Found process for '$Title', but it has no main window handle (possibly minimized or background)."
         return $null
    }
    try {
        $windowElement = [System.Windows.Automation.AutomationElement]::FromHandle($process.MainWindowHandle)
        return $windowElement
    } catch {
        Write-Error "Failed to get AutomationElement from handle for window '$Title': $($_.Exception.Message)"
        return $null
    }
}

# Function to find an element within a parent using .NET classes (same as in GetUIElementInfo.ps1)
function Find-Element($ParentElement, $Name, $Id, $Class) {
    $conditions = New-Object System.Collections.Generic.List[System.Windows.Automation.Condition]
    if ($Name) { $conditions.Add([System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::NameProperty, $Name)) }
    if ($Id) { $conditions.Add([System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::AutomationIdProperty, $Id)) }
    if ($Class) { $conditions.Add([System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::ClassNameProperty, $Class)) }

    if ($conditions.Count -eq 0) {
        Write-Error "At least one identifier (ElementName, AutomationId, ClassName) must be provided."
        return $null
    }

    $finalCondition = if ($conditions.Count -eq 1) { $conditions[0] } else { [System.Windows.Automation.AndCondition]::new($conditions.ToArray()) }

    try {
        $element = $ParentElement.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $finalCondition)
        return $element
    } catch {
        Write-Error "Error finding element using .NET UI Automation: $($_.Exception.Message)"
        return $null
    }
}

# --- Main Script ---

$targetWindowElement = Get-WindowElement -Title $WindowTitle
if (-not $targetWindowElement) { exit 1 }

$targetElement = Find-Element -ParentElement $targetWindowElement -Name $ElementName -Id $AutomationId -Class $ClassName
if (-not $targetElement) {
    Write-Error "Element not found within window '$WindowTitle' matching criteria."
    exit 1
}

# Perform the requested action using .NET methods
try {
    $elementNameForMsg = try { $targetElement.Current.Name } catch { "(Name unavailable)" } # Get name safely for messages
    switch ($Action) {
        'Click' {
            $invokePattern = $null
            if ($targetElement.TryGetCurrentPattern([System.Windows.Automation.InvokePatternIdentifiers]::Pattern, [ref]$invokePattern)) {
                 $invokePattern.Invoke()
                 Write-Output "Successfully invoked (clicked) element '$elementNameForMsg'."
            } else {
                 Write-Warning "Element '$elementNameForMsg' does not support InvokePattern. Attempting fallback click via SetFocus + Enter."
                 try {
                    $targetElement.SetFocus()
                    Start-Sleep -Milliseconds 150 # Slightly longer pause for focus shift
                    [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
                    Write-Output "Attempted fallback click via SetFocus + Enter key on '$elementNameForMsg'."
                 } catch {
                    Write-Error "Failed to perform fallback click on element '$elementNameForMsg': $($_.Exception.Message)"
                    exit 1
                 }
            }
        }
        'SetValue' {
            if ($ValueToSet -eq $null) {
                Write-Error "ValueToSet parameter is required for SetValue action."
                exit 1
            }
            $valuePattern = $null
            if ($targetElement.TryGetCurrentPattern([System.Windows.Automation.ValuePatternIdentifiers]::Pattern, [ref]$valuePattern)) {
                $valuePattern.SetValue($ValueToSet)
                Write-Output "Successfully set value on element '$elementNameForMsg'."
            } else {
                # Fallback: Try SetFocus + SendKeys (less reliable, might clear existing text)
                Write-Warning "Element '$elementNameForMsg' does not support ValuePattern. Attempting fallback SetValue via SetFocus + SendKeys."
                 try {
                    $targetElement.SetFocus()
                    Start-Sleep -Milliseconds 150
                    # Clear existing value first? This is risky. SendKeys might just append.
                    # For simplicity, just send the keys. User might need to clear manually first.
                    [System.Windows.Forms.SendKeys]::SendWait($ValueToSet)
                    Write-Output "Attempted fallback SetValue via SetFocus + SendKeys on '$elementNameForMsg'."
                 } catch {
                    Write-Error "Failed to perform fallback SetValue on element '$elementNameForMsg': $($_.Exception.Message)"
                    exit 1
                 }
            }
        }
        'Focus' {
             try {
                 $targetElement.SetFocus()
                 Write-Output "Successfully set focus to element '$elementNameForMsg'."
             } catch {
                 Write-Error "Failed to set focus on element '$elementNameForMsg': $($_.Exception.Message)"
                 exit 1
             }
        }
        default {
            Write-Error "Unsupported action: $Action"
            exit 1
        }
    }
} catch {
    Write-Error "Error performing action '$Action' on element '$elementNameForMsg': $($_.Exception.Message)"
    exit 1
}

# Indicate success
exit 0
