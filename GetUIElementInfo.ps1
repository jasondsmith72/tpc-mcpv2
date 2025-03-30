# GetUIElementInfo.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$WindowTitle,

    [string]$ElementName,
    [string]$AutomationId,
    [string]$ClassName
)

# Add required .NET assemblies
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Windows.Forms # For SendKeys fallback if needed later

# Function to find the main window using Get-Process and UI Automation .NET classes
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

# Function to find an element within a parent using .NET classes
function Find-Element($ParentElement, $Name, $Id, $Class) {
    $conditions = New-Object System.Collections.Generic.List[System.Windows.Automation.Condition]

    if ($Name) {
        $conditions.Add([System.Windows.Automation.PropertyCondition]::new(
            [System.Windows.Automation.AutomationElement]::NameProperty,
            $Name
        ))
    }
    if ($Id) {
        $conditions.Add([System.Windows.Automation.PropertyCondition]::new(
            [System.Windows.Automation.AutomationElement]::AutomationIdProperty,
            $Id
        ))
    }
    if ($Class) {
        $conditions.Add([System.Windows.Automation.PropertyCondition]::new(
            [System.Windows.Automation.AutomationElement]::ClassNameProperty,
            $Class
        ))
    }

    if ($conditions.Count -eq 0) {
        Write-Error "At least one identifier (ElementName, AutomationId, ClassName) must be provided."
        return $null
    }

    # Combine conditions with AndCondition if multiple are provided
    $finalCondition = $null
    if ($conditions.Count -eq 1) {
        $finalCondition = $conditions[0]
    } else {
        $finalCondition = [System.Windows.Automation.AndCondition]::new($conditions.ToArray())
    }

    # Search for the element
    try {
        # FindFirst finds the first matching element in the specified scope
        $element = $ParentElement.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $finalCondition)
        return $element
    } catch {
        Write-Error "Error finding element using .NET UI Automation: $($_.Exception.Message)"
        return $null
    }
}

# --- Main Script ---

$targetWindowElement = Get-WindowElement -Title $WindowTitle
if (-not $targetWindowElement) { exit 1 } # Error handled in function

# If no specific identifiers are given, list direct children instead
if (-not $ElementName -and -not $AutomationId -and -not $ClassName) {
    try {
        $children = $targetWindowElement.FindAll([System.Windows.Automation.TreeScope]::Children, [System.Windows.Automation.Condition]::TrueCondition)
        $childList = @()
        foreach ($child in $children) {
            try {
                $childProps = $child.Current
                $childControlType = [System.Windows.Automation.ControlType]::LookupById($childProps.ControlType.Id).ProgrammaticName
                $childList += @{
                    Name = $childProps.Name
                    AutomationId = $childProps.AutomationId
                    ClassName = $childProps.ClassName
                    ControlType = $childControlType
                }
            } catch {
                 # Ignore errors for individual children, add placeholder
                 $childList += @{ Error = "Failed to get properties for this child: $($_.Exception.Message)" }
            }
        }
        Write-Output ($childList | ConvertTo-Json -Depth 3 -Compress)
        exit 0 # Exit successfully after listing children
    } catch {
        Write-Error "Error listing child elements: $($_.Exception.Message)"
        exit 1
    }
}

# --- Original logic to find a specific element ---
$targetElement = Find-Element -ParentElement $targetWindowElement -Name $ElementName -Id $AutomationId -Class $ClassName
if (-not $targetElement) {
    Write-Error "Element not found within window '$WindowTitle' matching criteria."
    exit 1
}

# Get element properties using .NET methods
$currentProps = $targetElement.Current
$controlType = [System.Windows.Automation.ControlType]::LookupById($currentProps.ControlType.Id).ProgrammaticName

# Attempt to get Value pattern if supported
$valuePattern = $null
$value = $null
if ($targetElement.TryGetCurrentPattern([System.Windows.Automation.ValuePatternIdentifiers]::Pattern, [ref]$valuePattern)) {
    $value = $valuePattern.Current.Value
}

# Get direct children of the found element
$childrenList = @()
try {
    $children = $targetElement.FindAll([System.Windows.Automation.TreeScope]::Children, [System.Windows.Automation.Condition]::TrueCondition)
    foreach ($child in $children) {
        try {
            $childProps = $child.Current
            $childControlType = [System.Windows.Automation.ControlType]::LookupById($childProps.ControlType.Id).ProgrammaticName
            $childrenList += @{
                Name = $childProps.Name
                AutomationId = $childProps.AutomationId
                ClassName = $childProps.ClassName
                ControlType = $childControlType
            }
        } catch {
             $childrenList += @{ Error = "Failed to get properties for this child: $($_.Exception.Message)" }
        }
    }
} catch {
    # Don't fail the whole script if listing children fails, just note it
    $childrenList = @{ Error = "Failed to list child elements: $($_.Exception.Message)" }
}


# Select relevant properties and convert to JSON
$properties = @{
    Name = $currentProps.Name
    AutomationId = $currentProps.AutomationId
    ClassName = $currentProps.ClassName
    ControlType = $controlType # Use the programmatic name string
    BoundingRectangle = @{ # Convert Rect object to a simpler structure for JSON
        Left = $currentProps.BoundingRectangle.Left
        Top = $currentProps.BoundingRectangle.Top
        Width = $currentProps.BoundingRectangle.Width
        Height = $currentProps.BoundingRectangle.Height
    }
    IsEnabled = $currentProps.IsEnabled
    IsOffscreen = $currentProps.IsOffscreen
    Value = $value # Include the value if the pattern was supported
    Children = $childrenList # Add the list of children
    # Add more properties or patterns as needed
}

# Output as JSON string
try {
    Write-Output ($properties | ConvertTo-Json -Depth 5 -Compress)
} catch {
    Write-Error "Failed to convert element properties to JSON: $($_.Exception.Message)"
    # Fallback: Output basic info if JSON fails
    Write-Output "{""Name"":""$($currentProps.Name)"", ""AutomationId"":""$($currentProps.AutomationId)"", ""ClassName"":""$($currentProps.ClassName)"", ""Error"":""JSON Conversion Failed""}"
    exit 1
}
