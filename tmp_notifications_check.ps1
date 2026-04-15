$ErrorActionPreference = 'Stop'
$base = 'http://127.0.0.1:3000/api'

$adminLogin = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body (@{ phone='11999990000'; password='1234' } | ConvertTo-Json)
$adminToken = $adminLogin.data.accessToken
$adminHeaders = @{ Authorization = "Bearer $adminToken" }

$clientLogin = Invoke-RestMethod -Method Post -Uri "$base/auth/biometric" -ContentType 'application/json' -Body (@{ phone='48991122106'; biometricToken='test' } | ConvertTo-Json)
$clientToken = $clientLogin.data.accessToken
$clientHeaders = @{ Authorization = "Bearer $clientToken" }

$before = Invoke-RestMethod -Method Get -Uri "$base/notifications?page=1&limit=50" -Headers $clientHeaders
$beforeCount = @($before.data).Count
$beforeUnread = @($before.data | Where-Object { -not $_.isRead }).Count

$settingsBefore = Invoke-RestMethod -Method Get -Uri "$base/notifications/settings" -Headers $clientHeaders
$settingsUpdateBody = @{
  enableAppointmentNotifications = $true
  appointmentReminderMinutes = 45
  enablePaymentNotifications = $true
  enableSMSNotifications = $false
  enableEmailNotifications = $true
  quietHoursStart = '22:00'
  quietHoursEnd = '08:00'
} | ConvertTo-Json
$settingsAfter = Invoke-RestMethod -Method Post -Uri "$base/notifications/settings" -Headers $clientHeaders -ContentType 'application/json' -Body $settingsUpdateBody

$services = Invoke-RestMethod -Method Get -Uri "$base/services"
$service = @($services.data | Where-Object { $_.isActive -eq $true })[0]
if (-not $service) { throw 'Nenhum serviço ativo encontrado' }

$clients = Invoke-RestMethod -Method Get -Uri "$base/clients?page=1&limit=50" -Headers $adminHeaders
$client = @($clients.data)[0]
if (-not $client) { throw 'Nenhum cliente encontrado' }

$apptDate = (Get-Date).Date.AddDays(2).AddHours(10).ToString('o')
$createdAppointment = Invoke-RestMethod -Method Post -Uri "$base/appointments" -Headers $adminHeaders -ContentType 'application/json' -Body (@{
  clientId = $client.id
  professionalId = $adminLogin.data.user.id
  serviceId = $service.id
  date = $apptDate
  notes = 'Validação de notificações'
} | ConvertTo-Json)

$after = Invoke-RestMethod -Method Get -Uri "$base/notifications?page=1&limit=50" -Headers $clientHeaders
$afterCount = @($after.data).Count
$afterUnread = @($after.data | Where-Object { -not $_.isRead }).Count
$newNotification = @($after.data | Sort-Object createdAt -Descending)[0]

$markRead = Invoke-RestMethod -Method Put -Uri "$base/notifications/$($newNotification.id)/read" -Headers $clientHeaders
$single = Invoke-RestMethod -Method Get -Uri "$base/notifications/$($newNotification.id)" -Headers $clientHeaders
$afterRead = Invoke-RestMethod -Method Get -Uri "$base/notifications?page=1&limit=50" -Headers $clientHeaders
$afterReadUnread = @($afterRead.data | Where-Object { -not $_.isRead }).Count

[ordered]@{
  clientUser = $clientLogin.data.user
  before = [ordered]@{ count = $beforeCount; unread = $beforeUnread }
  settingsBefore = $settingsBefore.data
  settingsAfter = $settingsAfter.data
  createdAppointment = [ordered]@{
    id = $createdAppointment.data.id
    date = $createdAppointment.data.date
    clientId = $createdAppointment.data.clientId
  }
  after = [ordered]@{ count = $afterCount; unread = $afterUnread }
  newNotification = [ordered]@{
    id = $newNotification.id
    title = $newNotification.title
    type = $newNotification.type
    isRead = $newNotification.isRead
  }
  markRead = $markRead.data
  single = $single.data
  afterReadUnread = $afterReadUnread
} | ConvertTo-Json -Depth 10
