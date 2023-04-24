async function search() {
    const input = document.querySelector("#symptomInput");
    const band = document.querySelector("#band");

    console.log(JSON.stringify({data: input.value}));
    await fetch('http://localhost:5000/consult', {
      method: 'POST',
      mode: "no-cors",
      body: JSON.stringify({data: input.value}),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.text())
    .then(text => {
      console.log(text);
      switch (text) {
        case 'GRAU DE RISCO BAIXO':
          band.classList.add('low');
          break;
        case 'GRAU DE RISCO MODERADO':
          band.classList.add('moderate');
          break;
        case 'GRAU DE RISCO ALTO':
          band.classList.add('high');
          break;
        default:
          band.classList.add('low');
          break;
      }
    }).catch(err => console.error(err));
}
