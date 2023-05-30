(function(){
  const $ = q => document.querySelector(q);

  function convertPeriod(mil) {
      var min = Math.floor(mil / 60000);
      var sec = Math.floor((mil % 60000) / 1000);
      return `${min}m e ${sec}s`;
  };
// botão enter do Registra
  $("#licence").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      $("#send").click();
    }
  });

  function renderGarage() {
    const garage = getGarage();
    $("#garage").innerHTML = "";
    garage.forEach(c => addCarToGarage(c));
  
    const vehicleCounts = countVehicles();
    $("#carCount").textContent = vehicleCounts.Carro;
    $("#motoCount").textContent = vehicleCounts.Moto;
    $("#truckCount").textContent = vehicleCounts.Caminhão;
    $("#carIsentoCount").textContent = vehicleCounts.CarroIsento + vehicleCounts.MotoIsento + vehicleCounts.CaminhãoIsento;
    $("#arrecadacaoTotal").textContent = `R$ ${arrecadacaoTotal.toFixed(2)}`;
  }
  
  

  function addCarToGarage(car) {
    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${car.name === "Caminhão" ? "Camionete" : car.name}</td>
        <td>${car.licence}</td>
        <td data-time="${car.time}">
            ${new Date(car.time)
                .toLocaleString('pt-BR', { 
                    hour: 'numeric', minute: 'numeric' 
                })}
        </td>
        <td>
            <button class="delete">x</button>
        </td>
    `;

    const isento = isCarIsento(car);
    const deleteButton = row.querySelector(".delete");
    deleteButton.style.backgroundColor = isento ? "green" : "red";
    
    

    $("#garage").appendChild(row);

    const vehicleCounts = countVehicles();
    $("#carCount").textContent = vehicleCounts.Carro;
    $("#motoCount").textContent = vehicleCounts.Moto;
    $("#truckCount").textContent = vehicleCounts.Caminhão;
    $("#carIsentoCount").textContent = vehicleCounts.CarroIsento + vehicleCounts.MotoIsento + vehicleCounts.CaminhãoIsento;
}


function isCarIsento(car) {
    const tempoPermanencia = new Date() - new Date(car.time);
    if (car.name === 'Carro' && tempoPermanencia <= 900000) {
        return true;
    } else if (car.name === 'Moto' && tempoPermanencia <= 900000) {
        return true;
    } else if (car.name === 'Caminhão' && tempoPermanencia <= 900000) {
        return true;
    }
    return false;
}

  
  function validateLicensePlate(licence) {
    const regex = /^[A-Z0-9]{7}$/;
    return regex.test(licence);
  }

  $("#licence").addEventListener("input", function() {
    this.value = this.value.toUpperCase();
  });
  
  
  
  
  function checkOut(info) {
    const entrada = new Date(info[2].dataset.time);
    const saida = new Date();
    const tempoPermanencia = saida - entrada;
  
    let valorAPagar = 0;
  
    if (tempoPermanencia <= 900000) {
      // Até 15 minutos o cliente está isento de pagamento
      valorAPagar = 0;
    } else if (tempoPermanencia <= 3600000) {
      // De 16 a 60 minutos é cobrado R$ 1,50
      valorAPagar = 1.5;
    } else {
      // Após 60 minutos de permanência é cobrado um adicional de R$ 1,00 por hora
      const horasAdicionais = Math.ceil((tempoPermanencia - 3600000) / 3600000);
      valorAPagar = 1.5 + horasAdicionais;
    }
  
    const licence = info[1].textContent;
    const msg = `O veículo ${info[0].textContent} de placa ${licence} permaneceu ${convertPeriod(tempoPermanencia)} estacionado. \n\n Valor a pagar: R$ ${valorAPagar.toFixed(2)}. \n\n Deseja encerrar?`;
  
    if (!confirm(msg)) return;
  
    const garage = getGarage().filter(c => c.licence !== licence);
    localStorage.garage = JSON.stringify(garage);
  
    arrecadacaoTotal += valorAPagar;
  
    renderGarage();

    if (tempoPermanencia <= 900000) {
      // Até 15 minutos o cliente está isento de pagamento
      valorAPagar = 0;
    } else if (tempoPermanencia <= 3600000) {
      // De 16 a 60 minutos é cobrado R$ 1,50
      valorAPagar = 1.5;
    } else {
      // Após 60 minutos de permanência é cobrado um adicional de R$ 1,00 por hora
      const horasAdicionais = Math.ceil((tempoPermanencia - 3600000) / 3600000);
      valorAPagar = 1.5 + horasAdicionais;
    }
  
    if (valorAPagar > 10.5) {
      // Exibir alerta de cobrança indevida
      alert("Cobrança indevida. Valor a pagar excede R$ 10,50.");
    }

  
  }
  

  function countVehicles() {
    const garage = getGarage();
    const counts = {
      Carro: 0,
      Moto: 0,
      Caminhão: 0,
      CarroIsento: 0,
      MotoIsento: 0,
      CaminhãoIsento: 0
    };

    garage.forEach(car => {
      counts[car.name]++;
      const tempoPermanencia = new Date() - new Date(car.time);
      if (car.name === 'Carro' && tempoPermanencia <= 900000) {
        counts.CarroIsento++;
      } else if (car.name === 'Moto' && tempoPermanencia <= 900000) {
        counts.MotoIsento++;
      } else if (car.name === 'Caminhão' && tempoPermanencia <= 900000) {
        counts.CaminhãoIsento++;
      }
    });

    return counts;
  }

  let arrecadacaoTotal = 0;


  const getGarage = () => localStorage.garage ? JSON.parse(localStorage.garage) : [];

  renderGarage();
  $("#send").addEventListener("click", e => {
      const vehicle = $("#vehicle").value;
      const licence = $("#licence").value.toUpperCase();

      if (!vehicle || !licence || !validateLicensePlate(licence)) {
          alert("Os campos são obrigatórios. A placa deve ter 7 caracteres  (exemplo: ABC7F45).");
          return;
      }

      const card = { name: vehicle, licence, time: new Date() };

      const garage = getGarage();
      garage.push(card);

      localStorage.garage = JSON.stringify(garage);

      addCarToGarage(card);
      $("#licence").value = "";
  });

  $("#garage").addEventListener("click", (e) => {
      if (e.target.className === "delete")
          checkOut(e.target.parentElement.parentElement.cells);
  });
})();    


