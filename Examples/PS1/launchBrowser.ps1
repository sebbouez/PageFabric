param($url);

if ([string]::IsNullOrEmpty($url))
{
    Write-Error 'URL was not provided' 
    exit 500
}

Write-Output "Launching $url"

start $url