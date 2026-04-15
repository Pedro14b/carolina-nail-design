$ErrorActionPreference = 'Continue'
$base = 'http://127.0.0.1:3000/api'

$clientLogin = Invoke-RestMethod -Method Post -Uri "$base/auth/biometric" -ContentType 'application/json' -Body (@{ phone='48991122106'; biometricToken='test' } | ConvertTo-Json)
$clientHeaders = @{ Authorization = "Bearer $($clientLogin.data.accessToken)" }

try {
  $notifications = Invoke-RestMethod -Method Get -Uri "$base/notifications?page=1&limit=20" -Headers $clientHeaders
  $items = @($notifications.data)
  $summary = [ordered]@{
    count = $items.Count
    first = if ($items.Count -gt 0) {
      [ordered]@{
        id = $items[0].id
        title = $items[0].title
        isRead = $items[0].isRead
        createdAt = $items[0].createdAt
      }
    } else { $null }
  }
  $summary | ConvertTo-Json -Depth 6

  if ($items.Count -gt 0) {
    $id = $items[0].id
    try {
      $mark = Invoke-RestMethod -Method Put -Uri "$base/notifications/$id/read" -Headers $clientHeaders
      [ordered]@{ markRead = $mark } | ConvertTo-Json -Depth 6
    } catch {
      [ordered]@{
        markReadError = if ($_.ErrorDetails.Message) { $_.ErrorDetails.Message } else { $_.Exception.Message }
        attemptedId = $id
      } | ConvertTo-Json -Depth 6
    }
  }
} catch {
  [ordered]@{
    listError = if ($_.ErrorDetails.Message) { $_.ErrorDetails.Message } else { $_.Exception.Message }
  } | ConvertTo-Json -Depth 6
}
