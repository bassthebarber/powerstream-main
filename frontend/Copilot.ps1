param(
  [Parameter(Mandatory=$true)]
  [ValidateSet("deploy","unpower")]
  [string] $Action,

  [ValidateSet("dev","production")]
  [string] $Mode = "production",

  [switch] $Open
)

switch ($Action) {
  "deploy"   { ./PowerDeploy.ps1 -Mode $Mode -Open:$Open }
  "unpower"  { ./UnpowerBlower.ps1 }
}
