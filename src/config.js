const isAndroid = () => /android/i.test(navigator.userAgent);

export const BACKEND_URL = isAndroid()
  ? 'http://10.0.2.2:5000' // Android emulator localhost
  : 'http://localhost:5000'; // Web or iOS localhost
