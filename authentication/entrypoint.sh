#!/bin/sh
echo "Migrating"
node dist/src/db/migrate.js
echo "Starting Server"
node dist/src/server.js
