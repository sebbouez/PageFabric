param($artifacts, $ftp_uri, $ftp_user, $ftp_pass);

function UploadToFtp($artifacts, $ftp_uri, $user, $pass) {
    $webclient = New-Object System.Net.WebClient 
    $webclient.Credentials = New-Object System.Net.NetworkCredential($user,$pass)  
    
    Write-Host "Starting ftp upload"

    foreach ($item in Get-ChildItem -recurse $artifacts) { 
        $relpath = [system.io.path]::GetFullPath($item.FullName).SubString([system.io.path]::GetFullPath($artifacts).Length + 1)

        if ((Get-ItemProperty $item.FullName).Mode[0] -eq "d") {
                    
            try {
                Write-Host "Creating $($item.Name)"
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
        else {     
            Write-Host "Uploading $item"
            $uri = New-Object System.Uri($ftp_uri + $relpath)
            $webclient.UploadFile($uri, $item.FullName)
        }

        Write-Host "Upload done." -foregroundcolor green
    }
}

UploadToFtp $artifacts $ftp_uri $ftp_user $ftp_pass
