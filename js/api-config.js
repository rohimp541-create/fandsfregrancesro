/**
 * API & Socket configuration
 * Auto-detects base URL when served from Express
 */
const FSStore = {
  getApiBase() {
    if (window.FS_API_BASE) return window.FS_API_BASE;
    if (window.location.protocol === 'file:') {
      return 'http://localhost:3000/api';
    }
    const { protocol, hostname, port } = window.location;
    if (port === '5500' || port === '8080' || port === '5173') {
      return `${protocol}//${hostname}:3000/api`;
    }
    return `${protocol}//${hostname}${port ? `:${port}` : ''}/api`;
  },

  getSocketUrl() {
    if (window.FS_SOCKET_URL) return window.FS_SOCKET_URL;
    if (window.location.protocol === 'file:') {
      return 'http://localhost:3000';
    }
    const { protocol, hostname, port } = window.location;
    if (port === '5500' || port === '8080' || port === '5173') {
      return `${protocol}//${hostname}:3000`;
    }
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  },
};

window.FSStore = FSStore;
