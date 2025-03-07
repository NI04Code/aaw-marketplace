#!/bin/sh
echo "Waiting db init"
sleep 10
echo "Migrating"
node dist/src/db/migrate.js
echo "Starting Server"
node dist/src/server.js

