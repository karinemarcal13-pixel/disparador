let leads=JSON.parse(localStorage.getItem("leadsStudio"))||[];
let selecionados=new Set(),fila=[],filaIndex=0,leadSelecionado=null;

const $=id=>document.getElementById(id);
function salvar(){localStorage.setItem("leadsStudio",JSON.stringify(leads))}
function escapar(t){const d=document.createElement("div");d.textContent=t;return d.innerHTML}

$("formLead").addEventListener("submit",e=>{
 e.preventDefault();
 const nome=$("nome").value.trim(),telefone=$("telefone").value.trim(),oferta=$("oferta").value.trim();
 if(!nome||!telefone||!oferta)return alert("Preencha todos os campos.");
 leads.push({id:Date.now(),nome,telefone,oferta,status:"novo"});
 salvar();$("formLead").reset();
 $("oferta").value=`Oi, {nome}! Tudo bem? 🤍

Sou a Karine, do Studio. Estou com alguns horários disponíveis para novas clientes este mês e queria te apresentar meu trabalho.

Se tiver interesse, posso te passar os horários disponíveis. ✨`;
 renderizar();
});

function filtrados(){
 const q=$("pesquisa").value.toLowerCase().trim(),st=$("filtroStatus").value;
 return leads.filter(l=>(l.nome.toLowerCase().includes(q)||l.telefone.includes(q))&&(st==="todos"||l.status===st));
}

function renderizar(){
 const arr=filtrados();$("listaLeads").innerHTML="";
 $("mensagemVazia").style.display=arr.length?"none":"block";
 arr.forEach(l=>{
  const d=document.createElement("div");d.className="lead";
  d.innerHTML=`<div class="lead-check-wrap"><input class="lead-check" type="checkbox" ${selecionados.has(l.id)?"checked":""} onchange="alternarSelecao(${l.id},this.checked)"></div>
  <div class="lead-info"><div class="avatar">${escapar(l.nome[0].toUpperCase())}</div><div><h3>${escapar(l.nome)}</h3><div class="telefone">${escapar(l.telefone)}</div></div></div>
  <div class="acoes"><select class="status" onchange="alterarStatus(${l.id},this.value)">
  <option value="novo" ${l.status==="novo"?"selected":""}>Novo</option><option value="contatado" ${l.status==="contatado"?"selected":""}>Contatado</option><option value="respondeu" ${l.status==="respondeu"?"selected":""}>Respondeu</option><option value="agendou" ${l.status==="agendou"?"selected":""}>Agendou</option></select>
  <button class="btn-enviar" onclick="abrirWhatsApp(${l.id})">💬 Enviar</button><button class="btn-excluir" onclick="excluirLead(${l.id})">🗑</button></div>`;
  $("listaLeads").appendChild(d);
 });
 $("selecionarTodos").checked=arr.length>0&&arr.every(l=>selecionados.has(l.id));
 atualizar();
}

function atualizar(){
 $("totalLeads").textContent=leads.length;
 $("totalContatados").textContent=leads.filter(l=>l.status==="contatado").length;
 $("totalResponderam").textContent=leads.filter(l=>l.status==="respondeu").length;
 $("totalAgendaram").textContent=leads.filter(l=>l.status==="agendou").length;
 $("contadorSelecionados").textContent=`${selecionados.size} selecionado${selecionados.size===1?"":"s"}`;
 $("btnFila").disabled=selecionados.size===0;
}

function alternarSelecao(id,marcado){marcado?selecionados.add(id):selecionados.delete(id);atualizar();}
$("selecionarTodos").addEventListener("change",e=>{filtrados().forEach(l=>e.target.checked?selecionados.add(l.id):selecionados.delete(l.id));renderizar()});
$("pesquisa").addEventListener("input",renderizar);$("filtroStatus").addEventListener("change",renderizar);

function alterarStatus(id,status){const l=leads.find(x=>x.id===id);if(l){l.status=status;salvar();renderizar()}}
function excluirLead(id){const l=leads.find(x=>x.id===id);if(l&&confirm(`Deseja excluir o lead ${l.nome}?`)){leads=leads.filter(x=>x.id!==id);selecionados.delete(id);salvar();renderizar()}}

function prepararMensagem(l){return l.oferta.replace(/\{nome\}/gi,l.nome.split(" ")[0])}
function telefoneBR(t){let n=t.replace(/\D/g,"");if(n.length===10||n.length===11)n="55"+n;return n}

function abrirWhatsApp(id){
 const l=leads.find(x=>x.id===id);if(!l)return;leadSelecionado=l;
 $("nomeModal").textContent=`Para: ${l.nome}`;$("mensagemModal").value=prepararMensagem(l);$("modal").classList.add("ativo");
}
function fecharModal(){$("modal").classList.remove("ativo");leadSelecionado=null}

$("btnWhatsApp").addEventListener("click",()=>{
 if(!leadSelecionado)return;const msg=$("mensagemModal").value.trim();if(!msg)return alert("Digite uma mensagem.");
 leadSelecionado.status="contatado";salvar();renderizar();
 window.open(`https://wa.me/${telefoneBR(leadSelecionado.telefone)}?text=${encodeURIComponent(msg)}`,"_blank");
 fecharModal();
});

$("btnFila").addEventListener("click",()=>{
 fila=leads.filter(l=>selecionados.has(l.id));filaIndex=0;
 if(!fila.length)return;
 $("filaModal").classList.add("ativo");mostrarFilaAtual();
});

function mostrarFilaAtual(){
 if(filaIndex>=fila.length){
  $("filaInfo").textContent="Fila concluída.";
  $("filaLeadAtual").innerHTML="<h3>Todos os leads selecionados foram processados.</h3><p>Você pode fechar esta janela.</p>";
  $("btnFilaWhatsApp").style.display="none";$("btnProximo").style.display="none";return;
 }
 const l=fila[filaIndex];
 $("filaInfo").textContent=`Lead ${filaIndex+1} de ${fila.length}`;
 $("filaLeadAtual").innerHTML=`<h3>${escapar(l.nome)}</h3><p>${escapar(l.telefone)}</p>`;
 $("btnFilaWhatsApp").style.display="block";$("btnProximo").style.display="block";
 $("btnProximo").textContent=filaIndex===fila.length-1?"Finalizar":"Próximo lead →";
}

$("btnFilaWhatsApp").addEventListener("click",()=>{
 const l=fila[filaIndex];if(!l)return;
 l.status="contatado";salvar();renderizar();
 window.open(`https://wa.me/${telefoneBR(l.telefone)}?text=${encodeURIComponent(prepararMensagem(l))}`,"_blank");
});

$("btnProximo").addEventListener("click",()=>{
 if(filaIndex<fila.length-1){filaIndex++;mostrarFilaAtual()}else{fila=[];selecionados.clear();renderizar();fecharFila()}
});
function fecharFila(){$("filaModal").classList.remove("ativo");fila=[];filaIndex=0}
$("modal").addEventListener("click",e=>{if(e.target===$("modal"))fecharModal()});
$("filaModal").addEventListener("click",e=>{if(e.target===$("filaModal"))fecharFila()});
renderizar();
