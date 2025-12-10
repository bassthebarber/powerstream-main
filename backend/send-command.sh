# Create file backend/send-command.sh
cat > send-command.sh <<'EOF'
#!/bin/bash
COMMAND=$1
ARGS=$2
curl -s -X POST http://localhost:5008/api/copilot/command \
  -H "Content-Type: application/json" \
  -d "{\"command\":\"$COMMAND\",\"args\":$ARGS}"
echo
EOF

chmod +x send-command.sh
./send-command.sh "build powerfeed" '{"layout":"default"}'
