const API = {
    async buscarTarefasIniciais() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=3');
            if (!response.ok) throw new Error('Erro na API');
            const dados = await response.json();
            return dados.map(item => ({
                id: Date.now() + Math.random(),
                titulo: item.title,
                descricao: 'Missão importada da Central',
                categoria: 'trabalho',
                prioridade: 'media',
                data: new Date().toISOString().split('T')[0],
                concluida: item.completed
            }));
        } catch (err) {
            console.error(err);
            return [];
        }
    }
};