const DEFAULT_DEV_SERVER_PORT = 5173;
const DEV_SERVER_HOST = "127.0.0.1";

export function getDevServerUrl(portValue: string | undefined): string {
  return `http://${DEV_SERVER_HOST}:${_getDevServerPort(portValue)}`;
}

function _getDevServerPort(value: string | undefined): number {
  if (!value) {
    return DEFAULT_DEV_SERVER_PORT;
  }
  const port = Number(value);
  return Number.isInteger(port) && port > 0 && port <= 65535
    ? port
    : DEFAULT_DEV_SERVER_PORT;
}
