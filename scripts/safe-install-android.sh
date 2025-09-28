#!/usr/bin/env bash
set -euo pipefail

# --- CONFIG ---
PACKAGE="com.yourdomain.vafmpnavigator"
APK_GLOB="${1:-build-*.apk}"         # You can pass a path, else it picks newest build-*.apk
PUSH_DEST="/sdcard/Download"         # Where to copy the APK on device
ADB_BIN="${ADB_BIN:-adb}"            # Override with env var if needed
# --------------

echo "➡️  Checking for connected device…"
if ! $ADB_BIN devices | awk 'NR>1 && $2=="device"{print $1}' | grep -q . ; then
  echo "❌ No Android device found. Plug in your phone and enable USB debugging."
  echo "   Tip: $ADB_BIN devices"
  exit 1
fi

# Pick newest matching APK (or use the one passed as $1)
if [[ -f "$APK_GLOB" ]]; then
  APK="$APK_GLOB"
else
  APK="$(ls -t $APK_GLOB 2>/dev/null | head -n 1 || true)"
fi

if [[ -z "${APK:-}" || ! -f "$APK" ]]; then
  echo "❌ Could not find an APK matching: $APK_GLOB"
  echo "   Pass a file explicitly: scripts/safe-install-android.sh path/to/app.apk"
  exit 1
fi

echo "📦 Using APK: $APK"

echo "🧹 Uninstalling existing app (if present): $PACKAGE"
set +e
$ADB_BIN uninstall "$PACKAGE" >/dev/null 2>&1
set -e

echo "📲 Installing APK fresh…"
$ADB_BIN install -r "$APK" >/dev/null
echo "✅ Install complete."

echo "📤 Copying APK to device Downloads…"
$ADB_BIN push "$APK" "$PUSH_DEST/" >/dev/null
echo "✅ Copied to $PUSH_DEST/$(basename "$APK")"

echo "🚀 Launching app…"
$ADB_BIN shell monkey -p "$PACKAGE" -c android.intent.category.LAUNCHER 1 >/dev/null
echo "✅ Launched $PACKAGE"

echo "🎉 Done."
