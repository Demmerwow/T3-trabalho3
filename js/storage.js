const Storage = {
    KEY: 'vice_task_v2',
    getTarefas() {
        const json = localStorage.getItem(this.KEY);
        return json ? JSON.parse(json) : [];
    },
    salvarTarefas(tarefas) {
        localStorage.setItem(this.KEY, JSON.stringify(tarefas));
    }
};