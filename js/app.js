// Seleção de Elementos
const form = document.getElementById('form-tarefa');
const inputTitulo = document.getElementById('input-titulo');
const inputDescricao = document.getElementById('input-descricao');
const selectPrioridade = document.getElementById('select-prioridade');
const inputData = document.getElementById('input-data');
const selectCategoria = document.getElementById('select-categoria');
const detalhesTarefa = document.getElementById('detalhes-tarefa'); // Para mostrar/esconder
const listaTarefas = document.getElementById('lista-tarefas');
const inputBusca = document.getElementById('input-busca');
const botoesFiltro = document.querySelectorAll('.btn-filtro');
const btnTema = document.getElementById('btn-tema');

// Elementos de Estatísticas
const statTotal = document.getElementById('stat-total');
const statAtivas = document.getElementById('stat-ativas');
const statConcluidas = document.getElementById('stat-concluidas');

// Estado
let tarefas = Storage.getTarefas();
let filtroAtual = 'todas';
let termoBusca = '';

// Lógica para mostrar detalhes ao focar no input
inputTitulo.addEventListener('focus', () => {
    detalhesTarefa.style.display = 'flex';
});

// Lógica para o Botão de Tema
btnTema.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    btnTema.textContent = document.body.classList.contains('light-mode') ? '🌙 Modo Escuro' : '☀️ Modo Claro';
});

// Renderização
function renderizarTarefas() {
    listaTarefas.innerHTML = '';

    let filtradas = tarefas.filter(tarefa => {
        // Filtro por texto (Título)
        const matchBusca = tarefa.titulo.toLowerCase().includes(termoBusca.toLowerCase()) || 
                           (tarefa.descricao && tarefa.descricao.toLowerCase().includes(termoBusca.toLowerCase()));

        // Filtro por categoria de status
        const hoje = new Date().toISOString().split('T')[0];
        let matchFiltro = true;

        if (filtroAtual === 'hoje') {
            matchFiltro = tarefa.data === hoje;
        } else if (filtroAtual === 'proximas') {
            matchFiltro = tarefa.data > hoje && !tarefa.concluida;
        } else if (filtroAtual === 'concluidas') {
            matchFiltro = tarefa.concluida;
        } else if (filtroAtual === 'todas') {
            matchFiltro = true;
        }

        return matchBusca && matchFiltro;
    });

    // Ordena por prioridade (Alta > Média > Baixa)
    const prioridadePeso = { alta: 3, media: 2, baixa: 1 };
    filtradas.sort((a, b) => prioridadePeso[b.prioridade] - prioridadePeso[a.prioridade]);

    if (filtradas.length === 0) {
        listaTarefas.innerHTML = '<p style="text-align:center; color:#666; padding: 2rem;">Nenhuma missão encontrada.</p>';
        atualizarEstatisticas();
        return;
    }

    filtradas.forEach(tarefa => {
        const li = document.createElement('li');
        li.className = `tarefa-item ${tarefa.concluida ? 'concluida' : ''} prioridade-${tarefa.prioridade}`;
        
        // Formata a data
        let dataFormatada = '';
        if (tarefa.data) {
            const [ano, mes, dia] = tarefa.data.split('-');
            dataFormatada = `<span class="tag">📅 ${dia}/${mes}</span>`;
        }

        li.innerHTML = `
            <div class="tarefa-info">
                <h3 class="tarefa-titulo">${tarefa.titulo}</h3>
                <p>${tarefa.descricao || ''}</p>
                <div class="tags">
                    <span class="tag">${tarefa.categoria}</span>
                    ${dataFormatada}
                </div>
            </div>
            <div class="tarefa-acoes">
                <button class="btn-acao concluir" onclick="alternarConclusao('${tarefa.id}')">${tarefa.concluida ? '↩' : '✓'}</button>
                <button class="btn-acao editar" onclick="editarTarefa('${tarefa.id}')">✎</button>
                <button class="btn-acao deletar" onclick="deletarTarefa('${tarefa.id}')">🗑</button>
            </div>
        `;
        listaTarefas.appendChild(li);
    });

    atualizarEstatisticas();
}

function atualizarEstatisticas() {
    statTotal.textContent = tarefas.length;
    statAtivas.textContent = tarefas.filter(t => !t.concluida).length;
    statConcluidas.textContent = tarefas.filter(t => t.concluida).length;
}

// CRUD
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const novaTarefa = {
        id: Date.now().toString(),
        titulo: inputTitulo.value,
        descricao: inputDescricao.value,
        prioridade: selectPrioridade.value,
        categoria: selectCategoria.value,
        data: inputData.value,
        concluida: false
    };

    tarefas.push(novaTarefa);
    Storage.salvarTarefas(tarefas);
    
    form.reset();
    detalhesTarefa.style.display = 'none';
    inputTitulo.focus();
    renderizarTarefas();
});

window.deletarTarefa = (id) => {
    if (confirm('Deseja realmente excluir esta missão?')) {
        tarefas = tarefas.filter(t => t.id !== id);
        Storage.salvarTarefas(tarefas);
        renderizarTarefas();
    }
};

window.alternarConclusao = (id) => {
    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa) {
        tarefa.concluida = !tarefa.concluida;
        Storage.salvarTarefas(tarefas);
        renderizarTarefas();
    }
};

window.editarTarefa = (id) => {
    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa) {
        // Preenche o formulário com os dados atuais para edição
        inputTitulo.value = tarefa.titulo;
        inputDescricao.value = tarefa.descricao;
        selectPrioridade.value = tarefa.prioridade;
        selectCategoria.value = tarefa.categoria;
        inputData.value = tarefa.data;
        detalhesTarefa.style.display = 'flex';

        // Remove a tarefa antiga para não duplicar (ou podemos atualizar)
        tarefas = tarefas.filter(t => t.id !== id);
        Storage.salvarTarefas(tarefas);
        renderizarTarefas();
    }
};

// Eventos de Busca e Filtro
inputBusca.addEventListener('input', (e) => {
    termoBusca = e.target.value;
    renderizarTarefas();
});

botoesFiltro.forEach(btn => {
    btn.addEventListener('click', (e) => {
        botoesFiltro.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        filtroAtual = e.target.dataset.filtro;
        renderizarTarefas();
    });
});

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    if (tarefas.length === 0) {
        const iniciais = await API.buscarTarefasIniciais();
        tarefas = [...iniciais, ...tarefas];
        Storage.salvarTarefas(tarefas);
    }
    renderizarTarefas();
});