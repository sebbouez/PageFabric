param($artifacts, $ftp_uri, $ftp_user, $ftp_pass);

function UploadToFtp($artifacts, $ftp_uri, $user, $pass)
{
    $webclient = New-Object System.Net.WebClient 
    $webclient.Credentials = New-Object System.Net.NetworkCredential($user,$pass)  
    
    Write-Host "starting ftp upload"

    foreach($item in Get-ChildItem -recurse $artifacts)
    { 
        $relpath = [system.io.path]::GetFullPath($item.FullName).SubString([system.io.path]::GetFullPath($artifacts).Length + 1)

        if ($item.Attributes -eq "Directory")
        {
            try 
            {
                Write-Host "creating $($item.Name)"
                $makeDirectory = [System.Net.WebRequest]::Create($ftp_uri+$relpath);
                $makeDirectory.Credentials = New-Object System.Net.NetworkCredential($user,$pass) 
                $makeDirectory.Method = [System.Net.WebRequestMethods+FTP]::MakeDirectory;
                $makeDirectory.GetResponse();
            
            }
            catch [Net.WebException] {
                Write-Host "$($item.Name) probably already exists"
            }

            continue;
        }
        
        Write-Host "uploading $item"
        $uri = New-Object System.Uri($ftp_uri+$relpath) 
        $webclient.UploadFile($uri, $item.FullName)
    }

    Write-Host "Upload done." -foregroundcolor green
}

UploadToFtp $artifacts $ftp_uri $ftp_user $ftp_pass
