// InfinitySignalMapper.js

export function mapInfinitySignal(state) {
  switch (state) {
    case 'ready':
      return 'Signal: ✅ System ready for execution';
    case 'standby':
      return 'Signal: 💤 Awaiting voice command';
    case 'override':
      return 'Signal: 🚨 Manual override activated';
    case 'error':
      return 'Signal: ❌ Error detected in AI module';
    default:
      return 'Signal: ⚠️ Unknown system state';
  }
}


