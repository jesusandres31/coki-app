param(
  [string]$BaseUrl = "http://127.0.0.1:8090",
  [string]$SuperuserEmail = "test@test.com",
  [Parameter(Mandatory)] [string]$Password
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Invoke-PocketBase {
  param(
    [Parameter(Mandatory)] [string]$Method,
    [Parameter(Mandatory)] [string]$Path,
    [hashtable]$Body,
    [hashtable]$Headers
  )

  $params = @{
    Method      = $Method
    Uri         = "$BaseUrl$Path"
    ContentType = "application/json"
  }

  if ($Headers) {
    $params.Headers = $Headers
  }

  if ($Body) {
    $params.Body = $Body | ConvertTo-Json -Depth 12
  }

  try {
    return Invoke-RestMethod @params
  }
  catch {
    $details = $_.ErrorDetails.Message
    if (-not $details) {
      $details = $_.Exception.Message
    }
    throw "$Method $Path failed: $details"
  }
}

$auth = Invoke-PocketBase -Method Post -Path "/api/collections/_superusers/auth-with-password" -Body @{
  identity = $SuperuserEmail
  password = $Password
}
$headers = @{ Authorization = $auth.token }

function Get-Record {
  param(
    [Parameter(Mandatory)] [string]$Collection,
    [Parameter(Mandatory)] [string]$Id
  )

  try {
    return Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/collections/$Collection/records/$Id" -Headers $headers
  }
  catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
      return $null
    }
    throw
  }
}

function Upsert-Record {
  param(
    [Parameter(Mandatory)] [string]$Collection,
    [Parameter(Mandatory)] [string]$Id,
    [Parameter(Mandatory)] [hashtable]$Data
  )

  $existing = Get-Record -Collection $Collection -Id $Id
  if ($existing) {
    return Invoke-PocketBase -Method Patch -Path "/api/collections/$Collection/records/$Id" -Headers $headers -Body $Data
  }

  $createData = @{}
  foreach ($key in $Data.Keys) {
    $createData[$key] = $Data[$key]
  }
  $createData.id = $Id

  return Invoke-PocketBase -Method Post -Path "/api/collections/$Collection/records" -Headers $headers -Body $createData
}

function Upsert-Client {
  param(
    [Parameter(Mandatory)] [string]$Id,
    [Parameter(Mandatory)] [string]$Name,
    [Parameter(Mandatory)] [string]$Phone,
    [Parameter(Mandatory)] [string]$Address,
    [Parameter(Mandatory)] [string]$UserId
  )

  $existing = Get-Record -Collection "clients" -Id $Id
  $data = @{
    name       = $Name
    phone      = $Phone
    address    = $Address
    updated_by = $UserId
  }

  if (-not $existing) {
    $data.balance = 0
    $data.created_by = $UserId
  }

  return Upsert-Record -Collection "clients" -Id $Id -Data $data
}

function Ensure-Movement {
  param(
    [Parameter(Mandatory)] [string]$Id,
    [Parameter(Mandatory)] [string]$ClientId,
    [Parameter(Mandatory)] [string]$TypeId,
    [Parameter(Mandatory)] [double]$Amount,
    [Parameter(Mandatory)] [string]$Description
  )

  $existing = Get-Record -Collection "payment_account_movements" -Id $Id
  if ($existing) {
    return $existing
  }

  return Upsert-Record -Collection "payment_account_movements" -Id $Id -Data @{
    client      = $ClientId
    type        = $TypeId
    delta       = $Amount
    description = $Description
  }
}

$adminRole = Upsert-Record -Collection "roles" -Id "testroleadmin01" -Data @{ name = "admin" }
$null = Upsert-Record -Collection "roles" -Id "testroleregul01" -Data @{ name = "regular" }

$appUser = Upsert-Record -Collection "users" -Id "testuseradmin01" -Data @{
  username        = "testadmin"
  email           = $SuperuserEmail
  emailVisibility = $true
  verified        = $true
  password        = $Password
  passwordConfirm = $Password
  role            = $adminRole.id
}

$kgUnit = Upsert-Record -Collection "measureunits" -Id "testunitkilog01" -Data @{
  name       = "kg"
  created_by = $appUser.id
  updated_by = $appUser.id
}
$unitUnit = Upsert-Record -Collection "measureunits" -Id "testunitpiece01" -Data @{
  name       = "uni"
  created_by = $appUser.id
  updated_by = $appUser.id
}

$openState = Upsert-Record -Collection "invoicestates" -Id "tststateopen001" -Data @{ name = "open" }
$draftState = Upsert-Record -Collection "invoicestates" -Id "tststatedraft01" -Data @{ name = "draft" }
$voidState = Upsert-Record -Collection "invoicestates" -Id "tststatevoid001" -Data @{ name = "void" }

$bakeryType = Upsert-Record -Collection "product_types" -Id "testptypebakery" -Data @{ name = "Panificados" }
$pastryType = Upsert-Record -Collection "product_types" -Id "testptypepastry" -Data @{ name = "Pasteleria" }
$beverageType = Upsert-Record -Collection "product_types" -Id "testptypebevers" -Data @{ name = "Bebidas" }

$null = Upsert-Record -Collection "configs" -Id "testconfig00001" -Data @{
  company             = "Coki - Datos de prueba"
  retrieve_last_price = $true
}

$clients = @(
  @{ id = "testclient00001"; name = "Almacen San Martin"; phone = "3794-555101"; address = "San Martin 1250, Corrientes" },
  @{ id = "testclient00002"; name = "Cafe del Centro"; phone = "3794-555102"; address = "Junin 845, Corrientes" },
  @{ id = "testclient00003"; name = "Kiosco La Plaza"; phone = "3794-555103"; address = "25 de Mayo 430, Corrientes" },
  @{ id = "testclient00004"; name = "Laura Gomez"; phone = "3794-555104"; address = "Belgrano 2210, Corrientes" },
  @{ id = "testclient00005"; name = "Mercado Norte"; phone = "3794-555105"; address = "Av. Armenia 1890, Corrientes" }
)

foreach ($client in $clients) {
  $null = Upsert-Client -Id $client.id -Name $client.name -Phone $client.phone -Address $client.address -UserId $appUser.id
}

$products = @(
  @{ id = "testproduct0001"; name = "Pan frances"; price = 2500; unit = $kgUnit.id; types = @($bakeryType.id) },
  @{ id = "testproduct0002"; name = "Pan integral"; price = 3200; unit = $kgUnit.id; types = @($bakeryType.id) },
  @{ id = "testproduct0003"; name = "Medialuna de manteca"; price = 800; unit = $unitUnit.id; types = @($bakeryType.id, $pastryType.id) },
  @{ id = "testproduct0004"; name = "Factura surtida"; price = 900; unit = $unitUnit.id; types = @($bakeryType.id, $pastryType.id) },
  @{ id = "testproduct0005"; name = "Torta de chocolate"; price = 18000; unit = $unitUnit.id; types = @($pastryType.id) },
  @{ id = "testproduct0006"; name = "Sandwich de miga"; price = 2500; unit = $unitUnit.id; types = @($bakeryType.id) },
  @{ id = "testproduct0007"; name = "Cafe molido 250 g"; price = 6500; unit = $unitUnit.id; types = @($beverageType.id) },
  @{ id = "testproduct0008"; name = "Jugo de naranja"; price = 2800; unit = $unitUnit.id; types = @($beverageType.id) }
)

foreach ($product in $products) {
  $null = Upsert-Record -Collection "products" -Id $product.id -Data @{
    name         = $product.name
    unit_price   = $product.price
    measure_unit = $product.unit
    product_type = $product.types
    created_by   = $appUser.id
    updated_by   = $appUser.id
  }
}

$movementTypesResponse = Invoke-PocketBase -Method Get -Path "/api/collections/payment_account_movement_types/records?perPage=100" -Headers $headers
$movementTypeByName = @{}
foreach ($movementType in $movementTypesResponse.items) {
  $movementTypeByName[$movementType.name] = $movementType.id
}

$invoices = @(
  @{
    id = "testinvoice0001"; client = "testclient00001"; date = "2026-08-04 12:00:00.000Z"; discount = 0; state = $openState.id; paid = 5000
    items = @(
      @{ id = "testlineitem001"; product = "testproduct0001"; amount = 5; price = 2500; discount = 0 },
      @{ id = "testlineitem002"; product = "testproduct0002"; amount = 2; price = 3200; discount = 5 }
    )
  },
  @{
    id = "testinvoice0002"; client = "testclient00002"; date = "2026-08-07 12:00:00.000Z"; discount = 10; state = $openState.id; paid = 27000
    items = @(
      @{ id = "testlineitem003"; product = "testproduct0003"; amount = 24; price = 800; discount = 0 },
      @{ id = "testlineitem004"; product = "testproduct0004"; amount = 12; price = 900; discount = 0 }
    )
  },
  @{
    id = "testinvoice0003"; client = "testclient00003"; date = "2026-08-10 12:00:00.000Z"; discount = 0; state = $draftState.id; paid = 0
    items = @(
      @{ id = "testlineitem005"; product = "testproduct0005"; amount = 1; price = 18000; discount = 0 },
      @{ id = "testlineitem006"; product = "testproduct0008"; amount = 4; price = 2800; discount = 0 }
    )
  },
  @{
    id = "testinvoice0004"; client = "testclient00004"; date = "2026-08-12 12:00:00.000Z"; discount = 0; state = $openState.id; paid = 0
    items = @(
      @{ id = "testlineitem007"; product = "testproduct0005"; amount = 1; price = 18000; discount = 5 },
      @{ id = "testlineitem008"; product = "testproduct0006"; amount = 6; price = 2500; discount = 0 }
    )
  },
  @{
    id = "testinvoice0005"; client = "testclient00005"; date = "2026-08-13 12:00:00.000Z"; discount = 0; state = $voidState.id; paid = 0
    items = @(
      @{ id = "testlineitem009"; product = "testproduct0001"; amount = 8; price = 2500; discount = 0 }
    )
  },
  @{
    id = "testinvoice0006"; client = "testclient00001"; date = "2026-08-15 12:00:00.000Z"; discount = 0; state = $openState.id; paid = 10000
    items = @(
      @{ id = "testlineitem010"; product = "testproduct0007"; amount = 3; price = 6500; discount = 0 },
      @{ id = "testlineitem011"; product = "testproduct0008"; amount = 6; price = 2800; discount = 0 }
    )
  }
)

$movementSequence = 1
foreach ($invoiceSpec in $invoices) {
  $subtotal = 0.0
  foreach ($item in $invoiceSpec.items) {
    $itemTotal = [Math]::Round($item.amount * $item.price * (1 - $item.discount / 100), 2)
    $subtotal += $itemTotal
  }

  $invoiceTotal = [Math]::Round($subtotal * (1 - $invoiceSpec.discount / 100), 2)
  $null = Upsert-Record -Collection "invoices" -Id $invoiceSpec.id -Data @{
    client     = $invoiceSpec.client
    date       = $invoiceSpec.date
    discount   = $invoiceSpec.discount
    total      = $invoiceTotal
    state      = $invoiceSpec.state
    created_by = $appUser.id
    updated_by = $appUser.id
  }

  foreach ($item in $invoiceSpec.items) {
    $itemTotal = [Math]::Round($item.amount * $item.price * (1 - $item.discount / 100), 2)
    $null = Upsert-Record -Collection "invoices_products" -Id $item.id -Data @{
      invoice    = $invoiceSpec.id
      product    = $item.product
      amount     = $item.amount
      unit_price = $item.price
      discount   = $item.discount
      total      = $itemTotal
      created_by = $appUser.id
      updated_by = $appUser.id
    }
  }

  if ($invoiceSpec.state -eq $openState.id) {
    $debtId = "testmovement{0:D3}" -f $movementSequence
    $movementSequence++
    $null = Ensure-Movement -Id $debtId -ClientId $invoiceSpec.client -TypeId $movementTypeByName.debt -Amount $invoiceTotal -Description "Factura $($invoiceSpec.id)"

    if ($invoiceSpec.paid -gt 0) {
      $paymentId = "testmovement{0:D3}" -f $movementSequence
      $movementSequence++
      $null = Ensure-Movement -Id $paymentId -ClientId $invoiceSpec.client -TypeId $movementTypeByName.payment -Amount $invoiceSpec.paid -Description "Pago factura $($invoiceSpec.id)"
    }
  }
}

$summary = [ordered]@{}
foreach ($collection in @("users", "clients", "products", "invoices", "invoices_products", "roles", "measureunits", "invoicestates", "product_types", "configs", "payment_account_movements", "payment_account_movement_types")) {
  $response = Invoke-PocketBase -Method Get -Path "/api/collections/$collection/records?perPage=1" -Headers $headers
  $summary[$collection] = $response.totalItems
}

$summary | Format-Table -AutoSize
