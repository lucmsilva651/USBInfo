import pkg from "../../package.json" with { type: "json" };
import { $ } from "./utils/elements.js";
import dialog from "./utils/dialog.js";

document.addEventListener("DOMContentLoaded", () => {
  $("appName").textContent = pkg.packageName;
  $("content").innerHTML = initialSteps;
  document.title = pkg.packageName;
});

$("aboutAppBtn").addEventListener("click", () => {
  const message = `${pkg.packageName} ${pkg.version}\n${pkg.description}\n\n© ${new Date().getFullYear()} ${pkg.author.name}.\n\nSource code:\n${pkg.repository.url}\n\nUsing Microsoft's Fluent Icons\nhttps://developer.microsoft.com/fluentui`;
  dialog("info", `About ${pkg.packageName}`, message);
});

function loadInfo(device) {
  return `
    <div class="card">
      <div class="status">
        <div class="status-left">
          <div class="status-dot"></div>
          <p>Device Connected</p>
        </div>
        <span id="reloadBtn" title="Reload">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M3.5 12a8.5 8.5 0 1 1 17 0a8.5 8.5 0 0 1-17 0M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m5.5 6.25a.75.75 0 0 0-1.5 0V9a5 5 0 0 0-4-2a4.99 4.99 0 0 0-3.81 1.762a.75.75 0 1 0 1.143.972a3.5 3.5 0 0 1 5.83.766H13.75a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 .75-.75zM7.25 16.5a.75.75 0 0 1-.75-.75v-3a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5H8.837a3.5 3.5 0 0 0 5.83.767a.75.75 0 0 1 1.142.972A4.99 4.99 0 0 1 12 17a5 5 0 0 1-4-2v.75a.75.75 0 0 1-.75.75"/></svg>
        </span>
      </div>
      <div class="info-grid">
        <div class="label">Manufacturer:</div>
        <div class="value">${device.manufacturer || 'N/A'}</div>
        <div class="label">Product:</div>
        <div class="value">${device.product || 'N/A'}</div>
        <div class="label">Serial Number:</div>
        <div class="value">${device.serialNumber || 'N/A'}</div>
        <div class="label">USB Version:</div>
        <div class="value">${(device.deviceDescriptor.bcdUSB / 256).toFixed(1)}</div>
        <div class="label">Vendor ID:</div>
        <div class="value">0x${device.deviceDescriptor.idVendor.toString(16).padStart(4, '0')}</div>
        <div class="label">Product ID:</div>
        <div class="value">0x${device.deviceDescriptor.idProduct.toString(16).padStart(4, '0')}</div>
        <div class="label">Bus Number:</div>
        <div class="value">${device.busNumber}</div>
        <div class="label">Device Address:</div>
        <div class="value">${device.deviceAddress}</div>
        <div class="label">Device Class:</div>
        <div class="value">${device.deviceDescriptor.bDeviceClass}</div>
      </div>
    </div>
  `
}

const initialSteps = `
  <div class="placeholder">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15.267 1.997a.75.75 0 0 1 .743.648l.007.102v4.386a2.25 2.25 0 0 1 1.48 1.946l.007.17v10.5a2.25 2.25 0 0 1-2.096 2.246l-.154.005h-6.5a2.25 2.25 0 0 1-2.245-2.096l-.005-.154V9.25a2.25 2.25 0 0 1 1.513-2.127V2.747a.75.75 0 0 1 .648-.743l.101-.007zM15.254 8.5h-6.5a.75.75 0 0 0-.743.648l-.007.102v10.5c0 .38.282.693.648.743l.102.007h6.5a.75.75 0 0 0 .743-.648l.007-.102V9.25a.75.75 0 0 0-.648-.743zm-.737-5.003H9.516v3.502h5.001z"/></svg>
    <p>Connect or reconnect a USB device to view its information.</p>
  </div>
`

window.usb.onConnected((device) => {
  $("content").innerHTML = loadInfo(device);
  $("reloadBtn").addEventListener("click", () => {
    loadInfo(device);
  });
});

window.usb.onDisconnected(() => {
  $("content").innerHTML = initialSteps;
});
