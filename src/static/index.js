import pkg from "../../package.json" with { type: "json" };
import { $ } from "./utils/elements.js";
import dialog from "./utils/dialog.js";

document.addEventListener("DOMContentLoaded", () => {
  $("appName").textContent = pkg.packageName;
  document.title = pkg.packageName;
});

$("aboutAppBtn").addEventListener("click", () => {
  console.log("click")
  const message = `${pkg.packageName} is © ${new Date().getFullYear()} ${pkg.author.name}.\n\nSource code:\n${pkg.repository.url}\n\nUsing Microsoft's Fluent Icons\nhttps://developer.microsoft.com/fluentui`;
  dialog("info", `About ${pkg.packageName}`, message);
});

window.usb.onConnected((device) => {
  const html = `
    <div class="card">
      <div class="status">
        <div class="status-dot connected"></div>
        <p>Device Connected</p>
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
  `;
  
  const dot = document.querySelector('.status-dot');
  if (dot) {
    dot.classList.remove('disconnected');
    dot.classList.add('connected');
  }

  $("content").innerHTML = html;
});

window.usb.onDisconnected(() => {
  const dot = document.querySelector('.status-dot');
  if (dot) {
    dot.classList.remove('connected');
    dot.classList.add('disconnected');
  }
  
  const title = document.querySelector('.status p');
  if (title) {
    title.textContent = 'Device Disconnected';
  }
});
