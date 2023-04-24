async function search() {
    const input = document.querySelector("#symptomInput");
    const band = document.querySelector("#band");

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      mode: "no-cors",
      body: JSON.stringify({data: input.value})
    };
    
    fetch('http://127.0.0.1:5000/consult', options)
      .then(response => response.json())
      .then(response => {
        console.log(response)
        switch (response) {
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
                band.classList.add('low')
                break;
        }
      }).catch(err => console.error(err));
}