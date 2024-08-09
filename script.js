document.getElementById("alarmForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const form = event.target;
    const task = document.getElementById("task").value;
    const alarmTime = document.getElementById("alarmTime").value;

    if (!task || !alarmTime) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Por favor, preencha todos os campos!',
        });
        return;
    }

    const alarmData = {
        task: task,
        time: alarmTime
    };

    // Salva no localStorage
    localStorage.setItem("alarm", JSON.stringify(alarmData));

    setAlarm(alarmData);

    // Limpa o formulário
    form.reset();
});

function setAlarm(alarmData) {
    const alarmMessage = document.getElementById("alarmMessage");
    alarmMessage.innerText = `Alarme definido para: ${alarmData.task} às ${alarmData.time}`;
    alarmMessage.classList.add('show');

    const alarmDate = new Date();
    const [hours, minutes] = alarmData.time.split(":");
    alarmDate.setHours(hours);
    alarmDate.setMinutes(minutes);
    alarmDate.setSeconds(0);

    const timeToAlarm = alarmDate.getTime() - new Date().getTime();

    if (timeToAlarm >= 0) {
        setTimeout(() => {
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
            text: 'O horário selecionado já passou. Por favor, selecione um horário futuro.',
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