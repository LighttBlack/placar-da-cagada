// Referências aos elementos HTML
const newPlayerNameInput = document.getElementById('newPlayerName');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const playerSelect = document.getElementById('playerSelect'); // Select para adicionar/remover PONTO
const playerToRemoveSelect = document.getElementById('playerToRemoveSelect'); // NOVO: Select para REMOVER COMPETIDOR
const addPointBtn = document.getElementById('addPointBtn');
const removePointBtn = document.getElementById('removePointBtn');
const removePlayerBtn = document.getElementById('removePlayerBtn'); // NOVO: Botão para REMOVER COMPETIDOR
const scoreTableBody = document.querySelector('#scoreTable tbody');
const historyList = document.getElementById('historyList');

// Array para armazenar os competidores e seus pontos
let players = JSON.parse(localStorage.getItem('players')) || [
    { name: 'Itallo', score: 0 },
    { name: 'Gabriel', score: 0 },
    { name: 'Josué', score: 0 },
    { name: 'Alan', score: 0 },
    { name: 'Diogo', score: 0 }
];

// Array para armazenar o histórico de ações
let historyLog = JSON.parse(localStorage.getItem('historyLog')) || [];

// Função para salvar os dados dos jogadores no armazenamento local do navegador
function savePlayers() {
    localStorage.setItem('players', JSON.stringify(players));
}

// Função para salvar o histórico no armazenamento local
function saveHistory() {
    localStorage.setItem('historyLog', JSON.stringify(historyLog));
}

// Função para formatar a data e hora
function formatDateTime(date) {
    const options = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    };
    return date.toLocaleString('pt-BR', options);
}

// Função para registrar uma ação no histórico
function addHistoryEntry(action, playerName, points, messageExtra = '') {
    const timestamp = new Date();
    const entry = {
        action: action, // 'adicionado', 'removido', 'competidor_removido'
        playerName: playerName,
        points: points, // Pontos após a ação (ou 0 se for remoção de competidor)
        timestamp: timestamp.toISOString(), // Salva como string ISO para fácil conversão
        messageExtra: messageExtra // Mensagem adicional para ações específicas
    };
    historyLog.unshift(entry); // Adiciona no início do array para mostrar os mais recentes primeiro
    // Limita o histórico a um certo número de entradas (ex: 50 últimas)
    if (historyLog.length > 50) {
        historyLog = historyLog.slice(0, 50);
    }
    saveHistory();
    updateHistoryDisplay();
}

// Função para atualizar a exibição do histórico
function updateHistoryDisplay() {
    historyList.innerHTML = ''; // Limpa as entradas existentes
    if (historyLog.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'Nenhuma ação registrada ainda.';
        listItem.style.fontStyle = 'italic';
        listItem.style.color = '#777';
        historyList.appendChild(listItem);
        return;
    }
    historyLog.forEach(entry => {
        const listItem = document.createElement('li');
        const formattedTime = formatDateTime(new Date(entry.timestamp));
        let message;
        if (entry.action === 'adicionado') {
            message = `[${formattedTime}] ${entry.playerName} ganhou um ponto. Total: ${entry.points}.`;
        } else if (entry.action === 'removido') {
            message = `[${formattedTime}] ${entry.playerName} perdeu um ponto. Total: ${entry.points}.`;
        } else if (entry.action === 'competidor_removido') {
            message = `[${formattedTime}] Competidor ${entry.playerName} removido.`;
        } else {
            message = `[${formattedTime}] Ação desconhecida para ${entry.playerName}. Total: ${entry.points}.`;
        }
        listItem.textContent = message;
        historyList.appendChild(listItem);
    });
}

// Função para atualizar o dropdown (select) de jogadores para ADICIONAR/REMOVER PONTOS
function updatePlayerSelect() {
    playerSelect.innerHTML = ''; // Limpa as opções existentes
    if (players.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Adicione competidores!';
        playerSelect.appendChild(option);
        playerSelect.disabled = true; // Desabilita o select se não houver jogadores
        addPointBtn.disabled = true;
        removePointBtn.disabled = true;
    } else {
        playerSelect.disabled = false;
        addPointBtn.disabled = false;
        removePointBtn.disabled = false;
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.name;
            option.textContent = player.name;
            playerSelect.appendChild(option);
        });
    }
}

// NOVO: Função para atualizar o dropdown (select) para REMOVER COMPETIDORES
function updatePlayerToRemoveSelect() {
    playerToRemoveSelect.innerHTML = ''; // Limpa as opções existentes
    if (players.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Nenhum para remover!';
        playerToRemoveSelect.appendChild(option);
        playerToRemoveSelect.disabled = true;
        removePlayerBtn.disabled = true;
    } else {
        playerToRemoveSelect.disabled = false;
        removePlayerBtn.disabled = false;
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.name;
            option.textContent = player.name;
            playerToRemoveSelect.appendChild(option);
        });
    }
}

// Função para atualizar a tabela do placar
function updateScoreTable() {
    scoreTableBody.innerHTML = ''; // Limpa as linhas existentes
    // Ordena os jogadores pela pontuação (do maior para o menor)
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    if (sortedPlayers.length === 0) {
        const row = scoreTableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 2; // Ocupa duas colunas
        cell.textContent = 'Nenhum competidor adicionado ainda.';
        cell.style.textAlign = 'center';
        cell.style.fontStyle = 'italic';
        cell.style.color = '#777';
    } else {
        sortedPlayers.forEach(player => {
            const row = scoreTableBody.insertRow();
            const nameCell = row.insertCell();
            const scoreCell = row.insertCell();
            nameCell.textContent = player.name;
            scoreCell.textContent = player.score;
        });
    }
}

// Lógica para adicionar um novo competidor
addPlayerBtn.addEventListener('click', () => {
    const newName = newPlayerNameInput.value.trim();
    if (newName) {
        if (!players.some(p => p.name.toLowerCase() === newName.toLowerCase())) {
            players.push({ name: newName, score: 0 });
            newPlayerNameInput.value = '';
            savePlayers();
            updatePlayerSelect(); // Atualiza os dois selects
            updatePlayerToRemoveSelect();
            updateScoreTable();
            addHistoryEntry('competidor_adicionado', newName, 0); // Opcional: registra a adição do player
        } else {
            alert('Esse nome já existe! Por favor, digite um nome diferente.');
        }
    } else {
        alert('Por favor, digite um nome para o novo competidor.');
    }
});

// Lógica para REMOVER UM COMPETIDOR (NOVO CÓDIGO)
removePlayerBtn.addEventListener('click', () => {
    const selectedPlayerName = playerToRemoveSelect.value;
    if (selectedPlayerName) {
        // Confirmação para evitar remoções acidentais
        if (confirm(`Tem certeza que deseja remover o competidor "${selectedPlayerName}" e todos os seus pontos?`)) {
            players = players.filter(player => player.name !== selectedPlayerName);
            savePlayers();
            updatePlayerSelect(); // Atualiza os dois selects
            updatePlayerToRemoveSelect();
            updateScoreTable();
            addHistoryEntry('competidor_removido', selectedPlayerName, 0); // Registra no histórico
            alert(`Competidor "${selectedPlayerName}" removido com sucesso.`);
        }
    } else {
        alert('Por favor, selecione um competidor para remover.');
    }
});


// Lógica para adicionar ponto ao competidor selecionado
addPointBtn.addEventListener('click', () => {
    const selectedPlayerName = playerSelect.value;
    if (selectedPlayerName) {
        const player = players.find(p => p.name === selectedPlayerName);
        if (player) {
            player.score += 1;
            savePlayers();
            updateScoreTable();
            addHistoryEntry('adicionado', player.name, player.score); // REGISTRA NO HISTÓRICO
        }
    } else {
        alert('Por favor, selecione um competidor para adicionar o ponto.');
    }
});

// Lógica para REMOVER ponto do competidor selecionado
removePointBtn.addEventListener('click', () => {
    const selectedPlayerName = playerSelect.value;
    if (selectedPlayerName) {
        const player = players.find(p => p.name === selectedPlayerName);
        if (player) {
            if (player.score > 0) {
                player.score -= 1;
                savePlayers();
                updateScoreTable();
                addHistoryEntry('removido', player.name, player.score); // REGISTRA NO HISTÓRICO
            } else {
                alert('Este competidor já tem 0 pontos e não pode ter pontos removidos.');
            }
        }
    } else {
        alert('Por favor, selecione um competidor para remover o ponto.');
    }
});

// Inicializa o placar, os seletores e o histórico quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    updatePlayerSelect();
    updatePlayerToRemoveSelect(); // NOVO: Inicializa o seletor de remover competidor
    updateScoreTable();
    updateHistoryDisplay();
});