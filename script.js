const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const state={view:"control", simulation:null, step:0, mismatch:false, visits:3, notifications:3};
const appointments=[
 {id:"APT-1042",supplier:"ABC Raw Materials",purpose:"Raw Material Delivery",window:"10:40–11:00",truck:"BD-15-1234",owner:"Mohammed Ali",status:"Expected"},
 {id:"APT-1043",supplier:"XYZ Industries",purpose:"Finished Goods Pickup",window:"11:10–11:30",truck:"BD-14-4567",owner:"Supply Chain",status:"Expected"},
 {id:"APT-1044",supplier:"Company Fleet",purpose:"Internal Transfer",window:"11:20–11:45",truck:"Dhaka-Metro-TA-7788",owner:"Warehouse",status:"In Yard"},
 {id:"APT-1045",supplier:"Delta Chemicals",purpose:"Chemical Delivery",window:"12:00–12:30",truck:"BD-13-9081",owner:"Procurement",status:"Expected"}
];
const visits=[
 {id:"V-88418",truck:"BD-15-1234",company:"ABC Raw Materials",in:"10:42",step:"UNLOADING",out:"—",dwell:"18m"},
 {id:"V-88419",truck:"Dhaka-Metro-TA-7788",company:"Company Fleet",in:"10:21",step:"WAITING",out:"—",dwell:"39m"},
 {id:"V-88417",truck:"BD-14-4567",company:"XYZ Industries",in:"09:56",step:"WEIGHING",out:"—",dwell:"51m"}
];
function renderAppointments(){ $("#apptBody").innerHTML=appointments.map(a=>`<tr><td><b>${a.id}</b></td><td>${a.supplier}</td><td>${a.purpose}</td><td>${a.window}</td><td><b>${a.truck}</b></td><td>${a.owner}</td><td><span class="tag ${a.status==="In Yard"?"green":""}">${a.status}</span></td></tr>`).join("")}
function renderVisits(){ $("#visitBody").innerHTML=visits.map(v=>`<tr><td><b>${v.id}</b></td><td><b>${v.truck}</b></td><td>${v.company}</td><td>${v.in}</td><td><span class="tag ${v.step==="WAITING"?"orange":"green"}">${v.step}</span></td><td>${v.out}</td><td>${v.dwell}</td></tr>`).join("")}
let notices=[
 ["✓","Truck exited successfully","BD-14-4567 completed visit V-88417. Gate-out ANPR closed the visit.","11:02"],
 ["↗","Weight variance flagged","BD-14-4567 recorded +0.92% against expected weight.","10:48"],
 ["◷","Appointment reminder","APT-1042 expected at Gate 01 in the next 10 minutes.","10:31"]
];
function renderNotices(){ $("#notificationsList").innerHTML=notices.map(n=>`<div class="notice"><div class="notice-icon">${n[0]}</div><div><b>${n[1]}</b><p>${n[2]}</p><small>${n[3]}</small></div></div>`).join("")}
function showView(id){state.view=id;$$(".view").forEach(v=>v.classList.toggle("active",v.id===id));$$(".nav").forEach(n=>n.classList.toggle("active",n.dataset.view===id));const titles={control:"Control Tower",gate:"Gate & ANPR",appointments:"Appointments",visits:"Truck Visits",exceptions:"Exceptions",notifications:"Notifications"};$("#pageTitle").textContent=titles[id]}
$$(".nav").forEach(n=>n.onclick=()=>showView(n.dataset.view));
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.remove("hidden");clearTimeout(window.tt);window.tt=setTimeout(()=>t.classList.add("hidden"),2600)}
function clock(){const d=new Date();$("#clock").textContent=d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"})}
setInterval(clock,1000);clock();renderAppointments();renderVisits();renderNotices();

const validSteps=[
 ["Appointment expected","YMS has an expected visit waiting for the truck.","WAITING","BD-15-1234","Vehicle approaching Gate 01...",[["Appointment","APT-1042"],["Supplier","ABC Raw Materials"],["Owner","Mohammed Ali"],["Window","10:40–11:00"]]],
 ["ANPR identifies vehicle","The camera detects the number plate and stores the image, timestamp and confidence as evidence.","DETECTED","BD-15-1234","98.7% recognition confidence",[["Camera","CAM-01"],["Plate","BD-15-1234"],["Confidence","98.7%"],["Evidence","Captured ✓"]]],
 ["YMS matches appointment","The actual plate is compared with the expected appointment. A successful match allows automatic processing.","MATCHED","BD-15-1234","Appointment found • 98.7% match",[["Expected plate","BD-15-1234"],["ANPR plate","BD-15-1234"],["Appointment","APT-1042"],["Decision","ENTRY APPROVED"]]],
 ["Gate In — visit created","YMS creates a truck visit and starts the dwell-time clock. The truck is now visible inside the yard.","GATE OPEN","BD-15-1234","V-88421 created • dwell timer started",[["Visit","V-88421"],["Gate In","10:42:21"],["Status","IN YARD"],["Timer","00:00:00"]]],
 ["Weighbridge","The visit is linked to weighing. YMS compares actual net weight against the appointment expectation.","WEIGHING","BD-15-1234","Weight captured from WB-01",[["Gross","42,680 kg"],["Tare","17,450 kg"],["Net","25,230 kg"],["Variance","+230 kg / +0.92%"]]],
 ["Yard operation","The truck is assigned to an operation. Waiting time and operation time are tracked separately.","UNLOADING","BD-15-1234","Dock 02 • unloading in progress",[["Dock","DOCK 02"],["Operation","Unloading"],["Progress","67%"],["Waiting","5m 41s"]]],
 ["ANPR Gate Out","Exit ANPR identifies the truck again. YMS closes the visit and sends the outcome to the appointment owner.","GATE OUT","BD-15-1234","Visit completed • notification sent",[["Gate Out","11:07:12"],["Total dwell","24m 51s"],["Owner","Mohammed Ali"],["Notification","Sent ✓"]]]
];
const mismatchSteps=[
 ["Appointment expected","APT-1042 is waiting for BD-15-1234.","WAITING","BD-15-1234","Expected truck...",[["Appointment","APT-1042"],["Expected plate","BD-15-1234"],["Supplier","ABC Raw Materials"],["Gate","Gate 01"]]],
 ["ANPR detects a different truck","The camera sees a vehicle, but its plate does not match the appointment.","DETECTED","BD-15-5678","97.9% recognition confidence",[["Camera","CAM-01"],["Detected plate","BD-15-5678"],["Confidence","97.9%"],["Evidence","Captured ✓"]]],
 ["YMS blocks automatic entry","The match engine compares both plates and stops the automatic gate decision.","EXCEPTION","BD-15-5678","Expected BD-15-1234 • detected BD-15-5678",[["Expected","BD-15-1234"],["Detected","BD-15-5678"],["Confidence","97.9%"],["Decision","ENTRY BLOCKED"]]]
];
function openModal(mismatch=false){state.mismatch=mismatch;state.step=0;$("#simModal").classList.remove("hidden");$("#modalTitle").textContent=mismatch?"ANPR Exception Simulation":"Truck Arrival Simulation";$("#nextStep").textContent="Start";renderStep()}
function closeModal(){$("#simModal").classList.add("hidden")}
$("#closeModal").onclick=closeModal;$("#validDemo").onclick=()=>openModal(false);$("#openGate").onclick=()=>{showView("gate");openModal(false)};$("#gateSim").onclick=()=>openModal(false);$("#mismatchDemo").onclick=()=>openModal(true);
function renderStep(){
 const steps=state.mismatch?mismatchSteps:validSteps, s=steps[state.step];
 $("#progressBar").style.width=((state.step+1)/steps.length*100)+"%";$("#stepLabel").textContent=`STEP ${state.step+1} OF ${steps.length}`;$("#stepTitle").textContent=s[0];$("#stepText").textContent=s[1];$("#modalState").textContent=s[2];$("#modalPlate").textContent=s[3];$("#modalSub").textContent=s[4];$("#dataGrid").innerHTML=s[5].map(x=>`<div class="data"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
 const logs=steps.slice(0,state.step+1).map((x,i)=>`<div class="ok">✓ ${i+1}. ${x[0]}</div>`).join("");$("#eventLog").innerHTML=logs;
 $("#nextStep").textContent=state.step===steps.length-1?"Finish":"Next";$("#stepStatus").textContent=state.mismatch&&state.step===2?"Manual action required":"Automatic processing enabled";
 if(!state.mismatch && state.step===3){$("#yardKpi").textContent="4";$("#waitingKpi").textContent="2"}
 if(!state.mismatch && state.step===6){finishValid()}
 if(state.mismatch&&state.step===2) { $("#decisionAction").textContent="⚠ Gate remains closed. Operator must verify, reassign the truck, or reject entry."; }
}
function next(){const steps=state.mismatch?mismatchSteps:validSteps;if(state.step<steps.length-1){state.step++;renderStep()}else{closeModal();toast(state.mismatch?"Exception recorded — gate remains blocked.":"Visit completed — owner notified.");}}
$("#nextStep").onclick=next;
function finishValid(){if(!window.finished){window.finished=true;notices.unshift(["✓","Truck exited successfully","BD-15-1234 completed V-88421. Gate-out ANPR closed the visit and notified Mohammed Ali.","11:07"]);renderNotices();visits.unshift({id:"V-88421",truck:"BD-15-1234",company:"ABC Raw Materials",in:"10:42",step:"COMPLETED",out:"11:07",dwell:"25m"});renderVisits();$("#yardKpi").textContent="3";$("#waitingKpi").textContent="1";$("#dwellKpi").textContent="25m";toast("Gate-out ANPR complete — notification sent");}}
$("#verifyBtn").onclick=()=>{toast("Operator verification opened — truck can be reassigned to APT-1042.");showView("gate");openModal(true)};
$("#rejectBtn").onclick=()=>toast("Entry rejected — gate remains closed and audit trail updated.");
$("#newAppt").onclick=()=>toast("Demo action: appointment creation form would open here.");
$("#resetBtn").onclick=()=>location.reload();
