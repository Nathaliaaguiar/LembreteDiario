// Registrar o Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
        console.log('Service Worker registrado com sucesso:', registration);
    })
    .catch(function(error) {
        console.log('Falha ao registrar o Service Worker:', error);
    });
}

// Solicitar permissão para notificações
function askNotificationPermission() {
    return Notification.requestPermission();
}

// Solicitar permissão ao carregar a página
askNotificationPermission().then(permission => {
    if (permission === 'granted') {
        console.log('Permissão concedida para notificações.');
    } else {
        console.log('Permissão negada para notificações.');
    }
});

document.getElementById("alarmForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const task = document.getElementById("task").value;
    const alarmTime = document.getElementById("alarmTime").value;
    const days = Array.from(document.querySelectorAll('input[name="days"]:checked')).map(el => el.value);

    if (!task || !alarmTime || days.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Por favor, preencha todos os campos e selecione ao menos um dia!',
        });
        return;
    }

    const alarmData = {
        task: task,
        time: alarmTime,
        days: days
    };

    let alarms = JSON.parse(localStorage.getItem("alarms")) || [];
    alarms.push(alarmData);
    localStorage.setItem("alarms", JSON.stringify(alarms));

    displayAlarms();
    setAlarms();

    // Limpa o formulário
    event.target.reset();
});

function setAlarms() {
    let alarms = JSON.parse(localStorage.getItem("alarms")) || [];
    const daysOfWeek = {
        'domingo': 0,
        'segunda': 1,
        'terça': 2,
        'quarta': 3,
        'quinta': 4,
        'sexta': 5,
        'sábado': 6
    };

    alarms.forEach(alarmData => {
        const [hours, minutes] = alarmData.time.split(":");

        const now = new Date();
        let nextAlarmDate = new Date();
        nextAlarmDate.setHours(hours, minutes, 0, 0);

        // Calcula o dia da semana para o alarme
        const dayOfWeek = now.getDay();
        const alarmDays = alarmData.days.map(day => daysOfWeek[day]);

        // Adiciona uma semana se o alarme for para um dia da semana futuro
        if (alarmDays.includes(dayOfWeek)) {
            let timeToAlarm = nextAlarmDate.getTime() - now.getTime();
            if (timeToAlarm < 0) {
                // Se o horário já passou, define o alarme para o próximo dia da semana correspondente
                nextAlarmDate.setDate(nextAlarmDate.getDate() + 7);
                timeToAlarm = nextAlarmDate.getTime() - now.getTime();
            }

            setTimeout(() => {
                navigator.serviceWorker.ready.then(function(registration) {
                    registration.showNotification('Alarme!', {
                        body: `Hora de ${alarmData.task}!`,
                        icon: 'relogio.png',
                        badge: 'despertador.png'
                    });
                });

                // Toca o som do alarme sem exibir o aviso de áudio
                const alarmSound = new Audio('alarme1.mp3');
                alarmSound.play().catch(error => {
                    console.error('Erro ao tocar o som do alarme:', error);
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Alarme!',
                    text: `Hora de ${alarmData.task}!`,
                    showConfirmButton: true,
                });

                // Não remove o alarme após tocar, pois ele é recorrente
            }, timeToAlarm);
        }
    });
}

function removeAlarm(alarmToRemove) {
    let alarms = JSON.parse(localStorage.getItem("alarms")) || [];
    alarms = alarms.filter(alarm => !(alarm.time === alarmToRemove.time && alarm.task === alarmToRemove.task));
    localStorage.setItem("alarms", JSON.stringify(alarms));
    displayAlarms();
}

function displayAlarms() {
    const alarmList = document.getElementById("alarmList");
    alarmList.innerHTML = '';

    let alarms = JSON.parse(localStorage.getItem("alarms")) || [];

    alarms.forEach(alarm => {
        const alarmItem = document.createElement("div");
        alarmItem.className = "alarm-item";

        const alarmText = document.createElement("span");
        alarmText.textContent = `Tarefa: ${alarm.task}, Hora: ${alarm.time}, Dias: ${alarm.days.join(', ')}`;

        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-btn";
        removeBtn.textContent = "Remover";
        removeBtn.onclick = function() {
            removeAlarm(alarm);
        };

        alarmItem.appendChild(alarmText);
        alarmItem.appendChild(removeBtn);
        alarmList.appendChild(alarmItem);
    });
}

// Carrega os alarmes salvos ao recarregar a página
window.onload = function() {
    displayAlarms();
    setAlarms();
};