#!/bin/bash
# Stop any running Telegram bot (Python or Node) before starting a fresh one.
# Run this if you get "409 Conflict: terminated by other getUpdates request"

echo "Stopping any running CivicOne Telegram bots..."

# Python bot
pkill -f "run_telegram_bot" 2>/dev/null && echo "  Stopped Python bot" || true
pkill -f "telegram_bot" 2>/dev/null && echo "  Stopped Python bot" || true

# Node bot
pkill -f "telegram-bot/index.js" 2>/dev/null && echo "  Stopped Node bot" || true

# Remove stale lock
LOCK="${TELEGRAM_BOT_LOCK_PATH:-/tmp/civicone-telegram-bot.lock}"
if [ -f "$LOCK" ]; then
  rm -f "$LOCK"
  echo "  Removed lock file: $LOCK"
fi

echo "Done. You can now start the bot with: npm start"
