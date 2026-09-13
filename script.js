const state = {
  appointments: [
    {id:"APT-1042", org:"ABC Raw Materials", purpose:"Raw Material Delivery", expected:"10:40–11:00", truck:"BD-15-1234", owner:"Mohammed Ali", status:"Expected"},
    {id:"APT-1043", org:"XYZ Industries", purpose:"Finished Goods Pickup", expected:"11:00–11:30", truck:"BD-14-4567", owner:"Supply Chain", status:"Arrived"},
    {id:"APT-1044", org:"Company Fleet", purpose:"Internal Transfer", expected:"12:00–12:30", truck:"TA-7788", owner:"Warehouse", status:"Expected"},
    {id:"APT-1045", org:"Delta Chemicals", purpose:"Raw Material Delivery", expected:"13:00–14:00", truck:"Unassigned", owner:"Procurement", status:"Expected"},
  ],
  visits: [
    {id:"V-88418",truck:"BD-14-4567",type:"External",in:"09:41",operation:"Weighing",out:"—",total:"—",status:"In Yard"},
    {id:"V-88419",truck:"TA-7788",type:"Company",in:"09:58",operation:"Waiting",out:"—",total:"—",status:"Waiting"},
    {id:"V-88417",truck:"BD-15-9811",type:"External",in:"08:21",operation:"Completed",out:"09:44",total:"1h 23m",status:"Completed"},
  ],
  notifications: [
    {title:"Truck exited successfully", text:"BD-15-9811 • XYZ Industries • Total visit 1h 23m • Net material 24,860 kg.", time:"09:44"},
    {title:"Weight variance flagged", text:"BD-14-4567 • Expected 25,000 kg • Current 24,120 kg • Review required.", time:"09:37"},
    {title:"Appointment reminder", text:"APT-1042 • ABC Raw Materials • Expected arrival 10:40–11:00.", time:"09:30"}
  ],
  exceptions: [
    {id:"EX-019",title:"Truck / appointment mismatch",text:"ANPR detected BD-15-5678, but appointment APT-1046 expects BD-15-1234. The transporter may have changed the assigned vehicle.",type:"ANPR MATCH"},
    {id:"EX-018",title:"Weight variance",text:"BD-14-4567 has a preliminary variance of −880 kg against the expected quantity. Review before finalizing the visit.",type:"WEIGHT"}
  ],
  activity: [
    ["📷","ANPR detected BD-14-4567","Appointment APT-1043 matched","09:41"],
    ["⚖","Weighbridge reading recorded","BD-14-4567 • 31,560 kg gross","09:42"],
    ["✓","Gate-in completed","Visit V-88418 created","09:41"],
    ["⏱","Truck moved to waiting","BD-15-1234 • Queue position 1","09:35"]
  ],
  simulationStep:0,
  visitTimer:null,
  visitSeconds:0
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function nowTime(){
  return new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit", second:"2-digit"});
}
function toast(title,text){
  const el=document.createElement("div"); el.className="toast";
  el.innerHTML=`<strong>${title}</strong><span>${text}</span>`;
  $("#toastStack").appendChild(el);
  setTimeout(()=>el.remove(),4200);
}
function renderAppointments(){
  $("#appointmentTable").innerHTML=state.appointments.map(a=>`
    <tr><td><b>${a.id}</b></td><td>${a.org}</td><td>${a.purpose}</td><td>${a.expected}</td><td>${a.truck}</td><td>${a.owner}</td>
    <td><span class="pill ${a.status==="Arrived"?"blue":"amber"}">${a.status}</span></td></tr>`).join("");
}
function renderVisits(){
  $("#visitTable").innerHTML=state.visits.map(v=>`
    <tr><td><b>${v.id}</b></td><td>${v.truck}</td><td>${v.type}</td><td>${v.in}</td><td>${v.operation}</td><td>${v.out}</td><td>${v.total}</td>
    <td><span class="pill ${v.status==="Completed"?"green":v.status==="Waiting"?"amber":"blue"}">${v.status}</span></td></tr>`).join("");
}
function renderNotifications(){
  $("#notificationList").innerHTML=state.notifications.map(n=>`
    <div class="notification"><div class="bell">✓</div><div><b>${n.title}</b><p>${n.text}</p><time>${n.time}</time></div></div>`).join("");
}
function renderExceptions(){
  $("#exceptionList").innerHTML=state.exceptions.length ? state.exceptions.map(e=>`
    <div class="exception-card"><span class="pill red">${e.type}</span><h3>${e.title}</h3><p>${e.text}</p>
      <div class="exception-actions"><button class="resolve" data-resolve="${e.id}">✓ Resolve</button><button>View evidence</button></div>
    </div>`).join("") : `<div class="panel" style="padding:30px"><b>No active exceptions.</b><p style="font-size:11px;color:#6a7b8b">All current truck visits are following the expected workflow.</p></div>`;
  $("#exceptionBadge").textContent=state.exceptions.length;
  $$("[data-resolve]").forEach(b=>b.onclick=()=>{state.exceptions=state.exceptions.filter(x=>x.id!==b.dataset.resolve);renderExceptions();toast("Exception resolved","The event has been moved to the audit trail.");});
}
function renderActivity(){
  $("#activityFeed").innerHTML=state.activity.map(x=>`<div class="feed-item"><div class="feed-icon">${x[0]}</div><div><b>${x[1]}</b><p>${x[2]}</p><time>${x[3]}</time></div></div>`).join("");
}
function updateStats(){
  $("#statYard").textContent=state.visits.filter(v=>v.status!=="Completed").length+1;
  $("#statCompleted").textContent=8+state.visits.filter(v=>v.status==="Completed").length-1;
  $("#statWaiting").textContent=state.visits.filter(v=>v.status==="Waiting").length;
}
function showView(name){
  $$(".view").forEach(v=>v.classList.remove("active-view"));
  $("#"+name).classList.add("active-view");
  $$(".nav").forEach(n=>n.classList.toggle("active",n.dataset.view===name));
  $("#pageTitle").textContent={dashboard:"Control Tower",appointments:"Appointments",visits:"Truck Visits",exceptions:"Exceptions",notifications:"Notifications"}[name];
}
$$(".nav").forEach(n=>n.onclick=()=>showView(n.dataset.view));

function updateClock(){
  const d=new Date();
  $("#clock").textContent=d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})+" • "+d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
}
setInterval(updateClock,1000); updateClock();

function resetDemo(){
  location.reload();
}
$("#resetBtn").onclick=resetDemo;

function openSim(){ $("#simulationModal").classList.remove("hidden"); state.simulationStep=0; renderSim(); }
$("#openSimulation").onclick=openSim; $("#openSimulation2").onclick=openSim;
$("#closeModal").onclick=()=>$("#simulationModal").classList.add("hidden");
$("#simulationModal").onclick=e=>{if(e.target.id==="simulationModal")$("#simulationModal").classList.add("hidden")};

const simTexts = [
  `<div><div class="big">APT-1042</div><h3>Expected truck visit</h3><p>ABC Raw Materials is expected to deliver Raw Material A. The appointment is waiting for the actual vehicle to arrive.</p></div>`,
  `<div><div class="scan">BD-15-1234</div><h3>ANPR detected vehicle</h3><p>Gate 01 camera captured the license plate. The image and timestamp are stored as evidence.</p></div>`,
  `<div><div class="match-box"><div><span>APPOINTMENT</span><b>BD-15-1234</b></div><div><span>ANPR</span><b>BD-15-1234</b></div></div><h3 class="success" style="margin-top:16px">✓ 98.7% MATCH</h3><p>Normal path: the system can create the truck visit automatically. A mismatch would be routed to the gate operator.</p></div>`,
  `<div><div class="big">GATE IN</div><h3>Truck Visit V-88421 created</h3><p>Gate-in timestamp is recorded. The truck now becomes an active visit and its dwell-time clock starts.</p></div>`,
  `<div><div class="weight-box"><div><span>GROSS</span><b>42,680 kg</b></div><div><span>TARE</span><b>17,450 kg</b></div><div><span>NET</span><b>25,230 kg</b></div></div><p style="margin-top:15px">Expected: 25,000 kg · Variance: +230 kg (+0.92%).</p></div>`,
  `<div><div class="timer" id="simTimer">00:00:00</div><h3>LOADING / UNLOADING IN PROGRESS</h3><p>Operation start and completion are timestamped. Waiting time and operation time remain separate KPIs.</p></div>`,
  `<div><div class="big">✓ GATE OUT</div><h3>Visit completed</h3><p>Exit ANPR matched BD-15-1234. Total visit: <b>23m 33s</b>. The system closes the visit and sends the appointment owner an automatic notification.</p><div style="margin-top:16px;padding:14px;background:#e9f7f1;border-radius:7px;color:#16805e;font-size:11px;font-weight:800">🔔 NOTIFICATION SENT TO MOHAMMED ALI</div></div>`
];

function renderSim(){
  $$(".sim-step").forEach(s=>{const i=+s.dataset.step;s.classList.toggle("current",i===state.simulationStep);s.classList.toggle("done",i<state.simulationStep)});
  $("#simContent").innerHTML=simTexts[state.simulationStep];
  $("#simBack").disabled=state.simulationStep===0;
  $("#simNext").textContent=state.simulationStep===6?"Complete & Close":state.simulationStep===0?"Start Arrival →":"Continue →";
  if(state.simulationStep===5) startSimTimer();
  else stopSimTimer();
}
function startSimTimer(){
  if(state.visitTimer)return;
  state.visitTimer=setInterval(()=>{
    state.visitSeconds++;
    const h=String(Math.floor(state.visitSeconds/3600)).padStart(2,"0"),m=String(Math.floor(state.visitSeconds/60)%60).padStart(2,"0"),s=String(state.visitSeconds%60).padStart(2,"0");
    const el=$("#simTimer"); if(el)el.textContent=`${h}:${m}:${s}`;
  },1000);
}
function stopSimTimer(){clearInterval(state.visitTimer);state.visitTimer=null}
$("#simNext").onclick=()=>{
  if(state.simulationStep<6){state.simulationStep++;renderSim(); if(state.simulationStep===1)toast("ANPR detected","BD-15-1234 identified at Gate 01.");}
  else {
    stopSimTimer();
    state.visits.unshift({id:"V-88421",truck:"BD-15-1234",type:"External",in:nowTime(),operation:"Completed",out:nowTime(),total:"23m 33s",status:"Completed"});
    state.notifications.unshift({title:"Truck exited successfully",text:"BD-15-1234 • ABC Raw Materials • Total visit 23m 33s • Net material 25,230 kg.",time:nowTime()});
    state.activity.unshift(["✓","Truck exited","BD-15-1234 • V-88421 • Notification sent","just now"]);
    state.appointments[0].status="Arrived";
    renderVisits();renderNotifications();renderAppointments();renderActivity();updateStats();
    $("#simulationModal").classList.add("hidden");
    toast("Visit completed","BD-15-1234 exited. Appointment owner has been notified.");
    showView("dashboard");
  }
};
$("#simBack").onclick=()=>{if(state.simulationStep>0){state.simulationStep--;renderSim()}};

$("#newAppointment").onclick=()=>toast("Demo action","Appointment creation is represented by the workflow demo.");
renderAppointments();renderVisits();renderNotifications();renderExceptions();renderActivity();updateStats();
