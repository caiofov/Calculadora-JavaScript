//DOM - document; BOM - browser
class CalcController{
    constructor(){
        //"_" indica que o atributo é privado, ou seja, não deve ser acessado
         //"eL" significa que está se referindo ao elemento do html
        this._currentDate;
        this._locale = 'pt-BR'
        this._audio = new Audio("assets/click.mp3") //classe para audio
        this._audioOnOff = false;
        this._lastNumber=''
        this._lastOperator=''
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        
        this._operation=[];

        this.initialize();
        this.initButtonsEvents();
        this.setLastNumberToDisplay();
        this.initKeyboard();

    }

    initialize(){
        
        this.setdisplayDateTime();
        //Função executada em um intervalo de tempo (em milessegundos)
        setInterval(()=>{
            this.setdisplayDateTime();
            //"setTimeOut" é uma função que espera alguns segundos para executar o que foi pedido

        },1000) ;
        //usamos uma arrow function
        
        this.setLastNumberToDisplay();
        this.pasteFromClipBoard();

        // ligar/desligar o audio com dois cliques em AC
        document.querySelectorAll('.btn-ac').forEach(btn =>{
            btn.addEventListener('dblclick', e=>{
                this.toggleAudio();
            });
        });

    }

    toggleAudio(){ //liga e desliga o audio

        this._audioOnOff = !(this._audioOnOff);
        console.log("audio:", this._audioOnOff);

    }

    playAudio(){
        if (this._audioOnOff){
            this._audio.currentTime = 0; //volta para o inicio do audio sempre que precisar tocar de novo
            this._audio.play(); //toca o audio
        }
    }

    pasteFromClipBoard(){
        document.addEventListener('paste', e=>{

            let text = e.clipboardData.getData('Text');

            this.displayCalc = parseFloat(text); //passa apenas números

        })
    }

    /*esta função é necessária por causa do modelo que foi criada a nossa 
    calculadora, que é SGV e não input*/
    copyToClipBoard(){ /*Cria um input com o conteúdo que está no display da calculadora 
        e depois remove para não aparecer no canto da tela */

        let input = document.createElement('input'); //cria um elemento input dinamicamente
        input.value = this.displayCalc;

        document.body.appendChild(input); //adiciona o input no body
    
        input.select(); //seleciona o conteúdo

        document.execCommand("Copy"); //dá um comando para executar a cópia

        input.remove() //remove para não parecer na tela
    }

    initKeyboard(){
        document.addEventListener('keyup', e=>{
            //"key" retorna o 'texto' da tecla pressionada (no caso, soltada - keyup)
            
            this.playAudio();
            
            switch(e.key){
                case 'Escape': //esc
                    this.clearAll();
                    break;
                
                case 'Backspace':
                    this.clearEntry();
                    break;

                case 'Enter':
                case '=':
                    this.calc();
                    break;
                
                case '+':
                case '-':
                case '/':
                case '*':
                case '%':
                    this.addOperation(e.key);
                    break;
               
                case '.':
                case',':
                    this.addDot();
                    break;
                
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;

                case 'c':
                    if (e.ctrlKey){ //verifica se o ctrl estava pressionado enquanto o 'c' era
                        this.copyToClipBoard();
                    }
            }
        });
    }

    addEventListenerAll(element, events, fn){
        events.split(' ').forEach(event =>{
            element.addEventListener(event, fn, false) /*"false" indica que a função será abortada assim que o 
            evento acontecer, para não correr o risco de o usuário realizar dois cliques por conta das camadas*/
        
        })
    }

    clearAll(){
        this._operation = []; //esvazia o array (limpa todos os itens)
        this._lastNumber ='';
        this._lastOperator='';
        this.setLastNumberToDisplay();
    }

    clearEntry(){
        this._operation.pop() //pop() elimina o último item de um array
        this.setLastNumberToDisplay();
    }

    setError(){
        this.displayCalc="Error"; //exibe mensagem de erro na tela da calculadora
    }

    isOperator(value){
        return (['+','-','*','%','/'].indexOf(value) > -1)
        /* indexOf = retorna o index do elemento, 
        não encontrar retorna -1*/
        /* se for um operador, vai ser maior que -1, então retorna TRUE,
        caso contrário, vai retornar FALSE*/
    }

    pushOperation(value){
        this._operation.push(value);
        
        if(this._operation.length > 3){
            this.calc();
        }
    }

    getResult(){ 
        //"try/catch" é o try/except do python
        try{
            return eval(this._operation.join("")); //"join" é inverso do "split"
        }
        catch(e){
            setTimeout(()=>{
                this.setError();
            }, 1);
        }
    }

    calc(){
        console.log("calc", this._operation);
        this.setLastNumberToDisplay();

        let last ="";
        

        this._lastOperator = this.getLastItem();
        
        if (this._operation.length < 3){
            let firstItem =  this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if(this._operation.length > 3){
            last = this._operation.pop()
            this._lastNumber = this.getResult();
        }
        else if(this._operation.length === 3){
            this._lastNumber = this.getLastItem(false)
        }
                
        let result = this.getResult();

        if (last==="%"){
            result /= 100;
            this._operation =[result];
        }
        else{
            this._operation = [result];
            if (last){
                this._operation.push(last)
            }
        }
        
        this.setLastNumberToDisplay();

    }

    addOperation(value){

        if (isNaN(this.getLastOperation())){ //string

            if(this.isOperator(value)){
                this.setLastOperation(value);
                /*se selecionar um operador e o último item já tiver 
                sido um operador, irá trocar pelo novo digitado */
            }
            else if(!isNaN(value)){
                this.pushOperation(value); //push adiicona um item no final de um array
            }
        }
        else{ //number

            if(this.isOperator(value)){
                this.pushOperation(value);
            }
            else{
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);

            }
        }
        this.setLastNumberToDisplay()
    }

    getLastItem(isOperator = true){ //retorna o último item do tipo especificado (operador ou numero)
        let lastItem;

        for(let i = (this._operation.length)-1; i >=0 ; i--){
            
            if(this.isOperator(this._operation[i]) === isOperator){
                lastItem = this._operation[i];
                break;
            }
        }

        if(!lastItem){
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
            //condição ?- então (executa se for true) / :- se não (executa se for false)
        }

        return lastItem;
    }

    setLastNumberToDisplay(){
        let lastNumberToDisplay = this.getLastItem(false);
        if (!lastNumberToDisplay){
            lastNumberToDisplay = 0;
        }
        this.displayCalc = lastNumberToDisplay;

    }

    setLastOperation(value){
        this._operation[this._operation.length - 1] = value;
        //trocar o último item do array
    }

    getLastOperation(){
        return this._operation[this._operation.length - 1] 
        // retorna ultimo elemento do array
    }

    addDot(){
        let lastOperation = this.getLastOperation();

        if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1){
            return
        }

        if(this.isOperator(lastOperation) || !lastOperation){
            this.pushOperation('0.');
        }
        else{
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay();
    }

    exectBtn(value){
        this.playAudio();

        switch(value){

            case 'ac':
                this.clearAll();
                break;
            
            case 'ce':
                this.clearEntry();
                break;
            
            case 'soma':
                this.addOperation('+');
                break;
            
            case 'subtracao':
                this.addOperation('-');
                break;
            
            case 'divisao':
                this.addOperation('/');
                break;
            
            case 'multiplicacao':
                this.addOperation('*');
                break;

            case 'porcento':
                this.addOperation('%');
                break;
            
            case 'igual':
                this.calc();
                break;
            
            case 'ponto':
                this.addDot();
                break;
        
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value)); //parseInt -> faz o casting para inteiro
                break;
        
            default:
                this.setError();
                break;


        }
    }

    initButtonsEvents(){ // ">" significa filho
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");
        //"All" traz todos os elementos que combinam com o que foi pedido (retorna uma lista de elementos nesse caso)

        buttons.forEach((btn, index)=>{ //para cara botão na lista buttons
            this.addEventListenerAll(btn, "click drag", e=>{
                let textBtn = btn.className.baseVal.replace("btn-","");
                //troca "btn-" do nome da classe do botão por nada, ou seja, remove
                this.exectBtn(textBtn);
            
            });

            this.addEventListenerAll(btn,"mouseover mouseup mousedown", e=>{
                btn.style.cursor= "pointer"; //muda o mouse para a mãozinha (mostra que é uam área clicável)
            
            });
        
        });
        

    
    }

    setdisplayDateTime(){ /*essa função foi útil porque, quando executamos a "setInterval", 
    ela demora um segundo para responder, então, para termos um resultado mais rápido, 
    precisamos repetir o código. Fizemos isso com essa função*/
        this.displayDate = this.currentDate.toLocaleDateString(this._locale,{
            day:"2-digit",
            month:"long",
            year:"numeric",
        })
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale)
    }
    //para acessar as variáveis com "_", faremos métodos chamados de "getters" e "setters"

    get displayCalc(){ //retorna o valor do _displayCalc
        return this._displayCalcEl.innerHTML; /*"innerHTML" insere no elemento HTML que está se referindo 
        um outro elemento em formato HTML*/
    }
    set displayCalc(value){ //armazena um novo valor para _displayCalc
        
        if(value.toString().length > 10){ //limita a 10 caracteres o display da calculadora
            this.setError();
        }
        
        this._displayCalcEl.innerHTML = value;
    }

    get currentDate(){ //retorna _currentDate
        return new Date()
    }
    set currentDate(value){ //novo valor para _currentDate
        this._currentDate = value;
    }

    get displayTime(){
        return this._timeEl.innerHTML;

    }
    set displayTime(value){
        this._timeEl.innerHTML = value;

    }

    get displayDate(){
        return this._dateEl.innerHTML;
    }
    set displayDate(value){
        this._dateEl.innerHTML = value;
    }
}