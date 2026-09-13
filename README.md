# YMS Management Demo

A self-contained, browser-based prototype demonstrating how a Yard Management System works operationally.

## Core management story

Appointment → ANPR identifies actual truck → YMS match engine → Gate decision → Truck Visit → Weighbridge → Yard operation → Exit ANPR → Visit closed → Appointment owner notified.

## What to demonstrate

1. Open `index.html`.
2. Start with **Simulate Valid Truck Arrival**.
3. Click through the 7-step journey:
   - Appointment
   - ANPR detection
   - Appointment matching
   - Gate-in
   - Weighbridge
   - Yard operation
   - Gate-out ANPR + notification
4. Then click **Simulate ANPR Mismatch**.
5. Show that YMS does NOT automatically open the gate when the detected plate differs from the appointment.
6. Explain that ANPR is the bridge between the physical truck and the digital appointment.

## Important positioning

ANPR is not the whole YMS. ANPR provides the actual vehicle identity at the gate. YMS uses that identity to orchestrate the complete truck visit and provide accountability.

## Technical notes

- Static HTML/CSS/JavaScript.
- No backend.
- No database.
- No camera hardware.
- No weighbridge integration.
- All operational data is simulated in JavaScript.
- Suitable for a management concept/demo and GitHub Pages.
- For production, the simulation layer would be replaced by APIs/integrations for ANPR cameras, weighbridge, CCTV, appointment management, identity/driver verification, notifications and the YMS database.

## Run

Double-click `index.html`, or serve the folder with any static web server.

## GitHub Pages

Upload the three source files and README to the repository root, then enable:
Settings → Pages → Deploy from branch → `main` → `/ (root)`.
