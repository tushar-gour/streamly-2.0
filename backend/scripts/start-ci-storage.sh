#!/usr/bin/env bash
set -euo pipefail

mkdir -p "$RUNNER_TEMP/streamly-storage/data"
curl --fail --location --retry 2 --output "$RUNNER_TEMP/streamly-storage/weed.tar.gz" https://github.com/seaweedfs/seaweedfs/releases/download/4.55/linux_amd64.tar.gz
echo "f156c609eeaf9e5fcfeea33fd70411222005f83760aa95893c9d58eff006b45c  $RUNNER_TEMP/streamly-storage/weed.tar.gz" | sha256sum --check
tar -xzf "$RUNNER_TEMP/streamly-storage/weed.tar.gz" -C "$RUNNER_TEMP/streamly-storage" weed
AWS_ACCESS_KEY_ID=streamlytest AWS_SECRET_ACCESS_KEY=streamlytest-secret "$RUNNER_TEMP/streamly-storage/weed" mini -dir="$RUNNER_TEMP/streamly-storage/data" -ip=127.0.0.1 -ip.bind=127.0.0.1 -s3.port=19000 -master.telemetry=false > "$RUNNER_TEMP/streamly-storage/server.log" 2>&1 &
echo $! > "$RUNNER_TEMP/streamly-storage/pid"
for i in $(seq 1 60); do
  status=$(curl --silent --output /dev/null --write-out '%{http_code}' http://127.0.0.1:19000/ || true)
  if [ "$status" = 403 ]; then exit 0; fi
  sleep 1
done
cat "$RUNNER_TEMP/streamly-storage/server.log"
exit 1
