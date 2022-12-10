          actionLock = true
          var pickPackage = new MozActivity({name: "pick"})
          pickPackage.onsuccess = function() {
            Wallace.installPkg(this.result.blob, function() {
              window.alert('App ' + pickPackage.result.blob.name + ' successfully installed')
              actionLock = false
            }, function(e) {
              if(e.toString() === 'InvalidPrivilegeLevel')
                window.alert('Insufficient privileges. You must enable developer menu (#) before trying to install packages.')
              else
                window.alert('Error installing the package file: ' + e)
              actionLock = false
            })
          }
          pickPackage.onerror = function(e) {
            window.alert('Error picking the package file: ' + e.name)
            actionLock = false
          }
          break