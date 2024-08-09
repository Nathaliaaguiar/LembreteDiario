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
    return new Promise((resolve, reject) => {
        const permissionResult = Notification.requestPermission((result) => {
            resolve(result);
        });

        if (permissionResult) {
            permissionResult.then(resolve, reject);
        }
    });
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
    const alarmDate = document.getElementById("alarmDate").value;
    const alarmTime = document.getElementById("alarmTime").value;

    if (!task || !alarmDate || !alarmTime) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Por favor, preencha todos os campos!',
        });
        return;
    }

    const alarmData = {
        task: task,
        date: alarmDate,
        time: alarmTime
    };

    // Salva no localStorage
    localStorage.setItem("alarm", JSON.stringify(alarmData));

    setAlarm(alarmData);

    // Limpa o formulário
    event.target.reset();
});

function setAlarm(alarmData) {
    const alarmMessage = document.getElementById("alarmMessage");
    alarmMessage.innerText = `Alarme definido para: ${alarmData.task} em ${alarmData.date} às ${alarmData.time}`;
    alarmMessage.classList.add('show');

    const [year, month, day] = alarmData.date.split("-");
    const [hours, minutes] = alarmData.time.split(":");

    const alarmDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

    const timeToAlarm = alarmDate.getTime() - new Date().getTime();

    if (timeToAlarm >= 0) {
        setTimeout(() => {
            navigator.serviceWorker.ready.then(function(registration) {
                registration.showNotification('Alarme!', {
                    body: `Hora de ${alarmData.task}!`,
                    icon: 'relogio.png',
                    badge:'despertador.png'
                });
            });

            const alarmSound = document.getElementById("alarmSound");
            alarmSound.play(); // Toca o som do alarme

            Swal.fire({
                icon: 'success',
                title: 'Alarme!',
                text: `Hora de ${alarmData.task}!`,
                showConfirmButton: true,
            });

            localStorage.removeItem("alarm"); // Limpa o alarme do localStorage após tocar
            alarmMessage.classList.remove('show'); // Oculta a mensagem após o alarme tocar
        }, timeToAlarm);
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'A data e horário selecionados já passaram. Por favor, selecione uma data e horário futuros.',
        });
        localStorage.removeItem("alarm"); // Remove alarme inválido
    }
}

// Carrega o alarme salvo ao recarregar a página
window.onload = function() {
    const savedAlarm = localStorage.getItem("alarm");
    if (savedAlarm) {
        const alarmData = JSON.parse(savedAlarm);
        setAlarm(alarmData);
    }
};