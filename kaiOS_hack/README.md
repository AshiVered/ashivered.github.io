# Wallace Toolbox

## About

Universal toolbox for KaiOS internal tweaking - 15 useful functions packed in one small app.

Based on [LibWallace](https://gist.github.com/plugnburn/00fa61006513cdb0a12adf61a6e425e1) and several independent researches.

## Current version

0.0.6

## Current feature list

- `1`: ADB root (requires Busybox for the operation, you may use [OmniBB](https://gitlab.com/suborg/omnibb) to install it if missing)
- `2`: Call recording on/auto/off (works on KaiOS 2.5.2 and higher, tested on Nokia 2720 Flip and Nokia 800 Tough)
- `3`: Install application package (OmniSD/GerdaPkg compatible, works when developer menu is enabled, tested on Nokias only)
- `4`: Override TTL when tethering until reboot (Qualcomm devices only)
- `5`: Edit IMEI1 (Nokia and MediaTek devices only)
- `6`: Edit IMEI2 (Nokia and MediaTek devices in DSDS configuration only)
- `7`: Toggle browser proxy on/off
- `8`: Set browser proxy host and port
- `9`: Override user agent (dangerous: affects KaiStore accessibility, can't be reset until the factory reset or manual device preferences editing in WebIDE)
- `0`: Toggle diagnostics port (Qualcomm devices only)
- `*`: Run overclocking script (Qualcomm devices only)
- `#`: Enable developer menu and privileged access (via cache injection method)
- `Call`: Edit Wi-Fi MAC address (Nokia and MediaTek devices only, temporary for MediaTeks)
- Left soft key: Edit Bluetooth MAC address (Nokia devices only)
- Right soft key: Make all pre-installed apps removable from the app menu without affecting system partition (requires Busybox for the operation)

## Installation

Use standard WebIDE connection (old Firefox or Pale Moon) or [gdeploy](https://gitlab.com/suborg/gdeploy) to install the app directly onto your device.
You can also use the `build.sh` script to build an OmniSD/GerdaPkg/WT compatible application package from the current Git snapshot.

## Credits

Created and improved by [BananaHackers](https://bananahackers.net) group members:

- Luxferre - main research and coding;
- Anthill - Unisoc-compatible rooted `adbd` version;
- fabio_malagas - Unisoc device testing.
