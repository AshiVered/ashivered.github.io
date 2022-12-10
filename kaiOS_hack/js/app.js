window.addEventListener('DOMContentLoaded', function() {
  var actionLock = false,
      currentHardware = Wallace.getSystemProperty('ro.hardware'),
      enableNokiaActions = (Wallace.getSystemProperty('ro.product.brand') === 'Nokia'),
      enableSim2Actions = (Wallace.getSystemProperty('persist.radio.multisim.config') === 'dsds'),
      enableQualcommActions = (currentHardware === 'qcom'),
      enableMtkActions = (currentHardware === 'mt6572' || currentHardware.slice(0,5) === 'mt673'),
      currentKaiosVersion = Wallace.getSystemPreference('b2g.version'),
      enableCallRecordingActions = (parseInt(currentKaiosVersion.replace(/[^\d]/g,'')) >= 252),
      enableImeiActions = enableNokiaActions || enableMtkActions
  
  if(!enableNokiaActions)
    [].forEach.call(document.querySelectorAll('.nokiaonly'), function(el) {
      el.classList.remove('danger')
      el.classList.add('disabled')
    })

  if(!enableImeiActions)
    [].forEach.call(document.querySelectorAll('.imeionly'), function(el) {
      el.classList.remove('danger')
      el.classList.add('disabled')
    })

  if(!enableSim2Actions)
    [].forEach.call(document.querySelectorAll('.sim2only'), function(el) {
      el.classList.remove('danger')
      el.classList.add('disabled')
    })

  if(!enableQualcommActions)
    [].forEach.call(document.querySelectorAll('.qualcommonly'), function(el) {
      el.classList.remove('danger')
      el.classList.add('disabled')
    })

  if(!enableCallRecordingActions)
    document.querySelector('.callrec').classList.add('disabled')
  
  var overclockScript = [
    'echo 96 > /sys/devices/system/cpu/cpufreq/interactive/target_loads',
    'echo 1094400 > /sys/devices/system/cpu/cpufreq/interactive/hispeed_freq',
    'echo 24 > /sys/devices/system/cpu/cpufreq/interactive/go_hispeed_load',
    'echo 0 > /sys/module/msm_thermal/core_control/enabled'
  ].join(' && ')
  
  var rootingScript = [
    'mount -o remount,rw /',
    'sleep 0.5',
    'stop adbd',
    'mv /sbin/adbd /sbin/adbd.orig',
    'cp /data/local/tmp/adbd /sbin/adbd',
    'chown root:root /sbin/adbd && chmod 750 /sbin/adbd',
    'mount -o remount,ro /',
    'rm /data/local/tmp/adbd',
    'sleep 0.5',
    'start adbd'
  ].join(';')
  
  window.addEventListener('keydown', function(e) {
    if(!actionLock) {
      switch(e.key) {
        case '1': //enable ADB root access until reboot
          Wallace.extractAppAsset('wallace-toolbox.bananahackers.net', 'rsrc/adbd.bin', '/data/local/tmp/adbd', function() {  
            Wallace.runCmd(rootingScript, function() {
              window.alert('Rooted ADB access until reboot')
            }, function() {
              window.alert('Something went wrong: ' + this.error.name)
            })
          })
          break
        case '2': //call recording AUTO/ON/OFF
          if(enableCallRecordingActions) {
            Wallace.getSystemSetting('callrecording.mode', function(curMode) {
              var nextMode = 'on'
              if(curMode === 'auto') nextMode = 'off'
              else if(curMode === 'on') nextMode = 'auto'
              Wallace.enableCallRecording(nextMode, 'wav', function() {
                var msgs = {
                  'on': 'set to manual',
                  'auto': 'set to automatic',
                  'off': 'disabled'
                }
                window.alert('Call recording ' + msgs[nextMode])
              }, function(e) {
                window.alert('Error: ' + e)
              })
            }, function(e) {
              window.alert('Error: ' + e)
            })
          } else window.alert('Sorry, call recording is implemented in KaiOS 2.5.2 and above, but you have ' + currentKaiosVersion)
          break
        case '3': //install app package
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
        case '4': //override TTL
          if(enableQualcommActions) {
            actionLock = true
            var newTTL = parseInt(window.prompt('New TTL value', 64))
            if(newTTL && newTTL < 256) {
              Wallace.fixTTL(newTTL, function() {
                window.alert('TTL fixed at the value ' + newTTL + ' until reboot')
                actionLock = false
              }, function(e) {
                window.alert('Error: ' + e)
                actionLock = false
              }, enableMtkActions ? 'ccmni0' : 'rmnet_data0')
            }
            else {
              window.alert('Invalid TTL value')
              actionLock = false
            }
          }
          else window.alert('Error: TTL can be overridden on Qualcomm platform only')
          break
        case '5': //Edit IMEI1
          if(enableNokiaActions) {
            if(window.confirm('Are you sure you really want to change IMEI1?')) {
              var newIMEI = window.prompt('New IMEI1', Wallace.generateRandomIMEI())
              if(newIMEI) {
                actionLock = true
                Wallace.setNokiaIMEI(1, newIMEI, function() {
                  if(window.confirm('IMEI1 changed to ' + newIMEI + '. Reboot to apply?'))
                    Wallace.reboot()
                  actionLock = false
                }, function(e) {
                  window.alert('Error: invalid IMEI')
                  actionLock = false
                })
              }
            }
            break
          } else if(enableMtkActions) {
            if(window.confirm('Are you sure you really want to change IMEI1?')) {
              var newIMEI = window.prompt('New IMEI1', Wallace.generateRandomIMEI())
              if(newIMEI) {
                actionLock = true
                Wallace.setMtkIMEI(1, newIMEI, function() {
                  if(window.confirm('IMEI1 changed to ' + newIMEI + '. Reboot to apply?'))
                    Wallace.reboot()
                  actionLock = false
                }, function(e) {
                  window.alert('Error: invalid IMEI')
                  actionLock = false
                })
              }
            }
            break
          } else window.alert('Error: IMEI editor is implemented for Nokia and MTK handsets only')
          break
        case '6': //Edit IMEI2
          if(enableNokiaActions) {
            if(enableSim2Actions) {
              if(window.confirm('Are you sure you really want to change IMEI2?')) {
                var newIMEI = window.prompt('New IMEI2', Wallace.generateRandomIMEI())
                if(newIMEI) {
                  actionLock = true
                  Wallace.setNokiaIMEI(2, newIMEI, function() {
                    if(window.confirm('IMEI2 changed to ' + newIMEI + '. Reboot to apply?'))
                      Wallace.reboot()
                    actionLock = false
                  }, function(e) {
                    window.alert('Error: invalid IMEI')
                    actionLock = false
                  })
                }
              }
              break
            } else window.alert('Error: trying to change IMEI2 on a single-SIM configuration')
          } else if(enableMtkActions) {
            if(enableSim2Actions) {
              if(window.confirm('Are you sure you really want to change IMEI2?')) {
                var newIMEI = window.prompt('New IMEI2', Wallace.generateRandomIMEI())
                if(newIMEI) {
                  actionLock = true
                  Wallace.setMtkIMEI(2, newIMEI, function() {
                    if(window.confirm('IMEI2 changed to ' + newIMEI + '. Reboot to apply?'))
                      Wallace.reboot()
                    actionLock = false
                  }, function(e) {
                    window.alert('Error: invalid IMEI')
                    actionLock = false
                  })
                }
              }
              break
            } else window.alert('Error: trying to change IMEI2 on a single-SIM configuration')
          } else window.alert('Error: IMEI editor is implemented for Nokia and MTK handsets only')
          break
        case '7': //Proxy on/off
          Wallace.getSystemSetting('browser.proxy.enabled', function(res) {
            var newVal = !(res === true)
            Wallace.setSystemSetting('browser.proxy.enabled', newVal, function() {
              window.alert('Proxy ' + (newVal ? 'enabled' : 'disabled') + ' successfully')
            }, function(e) {
              window.alert('Error ' + (newVal ? 'enabling' : 'disabling') + ' proxy: ' + e)
            })
          }, function(e) {
            window.alert('Error: ' + e)
          })
          break
        case '8': //Set proxy host/port
          actionLock = true
          Wallace.getSystemSetting('browser.proxy.host', function(oldHost) {
            Wallace.getSystemSetting('browser.proxy.port', function(oldPort) {
              var newHost = window.prompt('Proxy host', oldHost || '')
              var newPort = Number(window.prompt('Proxy port', oldPort || ''))
              if(newHost && newPort) {
                Wallace.setSystemSetting('browser.proxy.host', newHost, function() {
                  Wallace.setSystemSetting('browser.proxy.port', newPort, function() {
                    window.alert('Proxy set successfully')
                    actionLock = false
                  }, function(e) {
                    window.alert('Error setting proxy port: ' + e)
                    actionLock = false
                  })
                }, function(e) {
                  window.alert('Error setting proxy host: ' + e)
                  actionLock = false
                })
              }
              else {
                window.alert('Error: Cannot set empty values for host or port')
                actionLock = false
              }
            }, function(e) {
              window.alert('Error: ' + e)
              actionLock = false
            })
          }, function(e) {
            window.alert('Error: ' + e)
            actionLock = false
          })
          break
        case '9': //override the user agent
          if(window.confirm('Do you want to change the user agent? You will not be able to revert it without WebIDE or factory reset!')) {
            actionLock = true
            var newUA = window.prompt('User agent', navigator.userAgent)
            if(newUA === '') newUA = navigator.userAgent
            Wallace.setUserAgent(newUA)
            actionLock = false
          }
          break
        case '*': //run overclock script
           if(enableQualcommActions) {
             actionLock = true
             Wallace.runCmd(overclockScript, function() {
               window.alert('Overclocking until reboot')
               actionLock = false
             }, function(e) {
               window.alert('Error: ' + e)
               actionLock = false
             })
           }
           else alert('Error: Overclocking is enabled for Qualcomm devices only')
          break
        case '0': //toggle diag port
          if(enableQualcommActions) {
            Wallace.toggleDiagPort(function() {
              window.alert('Diagnostics port enabled')
            }, function() {
              window.alert('Diagnostics port disabled')
            }, function(e) {
              window.alert('Error toggling diag port: ' + e)
            })
          }
          else window.alert('Error: DIAG port can be used on Qualcomm platform only')
          break
        case '#': //developer menu
          if(window.confirm('Enable developer menu and reboot?'))
            Wallace.runCmd('echo -n root > /cache/__post_reset_cmd__;cp /cache/__post_reset_cmd__ /persist/__post_reset_cmd__', function() {
              Wallace.reboot()
            }, function(e) {
              window.alert('Error: ' + e)
            })
          break
        case 'Call': //set Wi-Fi MAC address
          if(enableNokiaActions) {
            var newMAC = window.prompt('New Wi-Fi MAC', Wallace.generateRandomMAC())
            if(newMAC) {
             actionLock = true
             Wallace.setNokiaWlanMAC(newMAC, function() {
               if(window.confirm('MAC changed to ' + newMAC + '. Reboot to apply?'))
                 Wallace.reboot()
                 actionLock = false
             }, function(e) {
               window.alert('Error: invalid MAC')
               actionLock = false
             })
            }
          }
          else if(enableMtkActions) {
            var newMAC = window.prompt('New Wi-Fi MAC', Wallace.generateRandomMAC())
            if(newMAC) {
             actionLock = true
             Wallace.setMtkWlanMAC(newMAC, function() {
               window.alert('MAC changed to ' + newMAC + '. Toggle Wi-Fi off and on to apply until reboot')
               actionLock = false
             }, function(e) {
               window.alert('Error: invalid MAC')
               actionLock = false
             })
            }
          }
          else window.alert('Error: Wi-Fi MAC changer is currently available on Nokia and MTK handsets only')
          break  
        case 'SoftLeft': //set Bluetooth MAC address
          if(enableNokiaActions) {
            var newMAC = window.prompt('New Bluetooth MAC', Wallace.generateRandomMAC())
            if(newMAC) {
             actionLock = true
             Wallace.setNokiaBluetoothMAC(newMAC, function() {
               if(window.confirm('MAC changed to ' + newMAC + '. Reboot to apply?'))
                 Wallace.reboot()
                 actionLock = false
             }, function(e) {
               window.alert('Error: invalid MAC')
               actionLock = false
             })
            }
          }
          else window.alert('Error: Bluetooth MAC changer is currently available on Nokia handsets only')
          break  
        case 'SoftRight':
          if(window.confirm('Do you really want to make all pre-installed apps removable from the menu (requires Busybox) and reboot?')) {
            Wallace.runCmd('busybox sed -i \'s#"removable": false#"removable": true#g\' /data/local/webapps/webapps.json', function() {
              Wallace.reboot()
            }, function(e) {
              window.alert('Error: ' + e)
            })
          }  
          break
        default:
          break
      }
    }
  })
}, false)
