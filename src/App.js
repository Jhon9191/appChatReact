import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import socketIOClient from 'socket.io-client';
import './App.css';

let socket;

function App() {

    const ENDPOINT = 'http://localhost:8080/';
    
    const [logado, setLogado] = useState(false);
    const [name, setName] = useState("");
    const [sala, setSala] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [listaMensagem, setListaMensagem] = useState([]);
    
    const conecatarSala = () => {
        setLogado(true);
        socket.emit("sala_conectada", sala);
    }
    
    const sendMassage = async () => {
        const conteudo = {
            sala: sala,
            conteudo: {
                name: name,
                mensagem: mensagem
            }
        }
        await socket.emit("enviar_mensagem", conteudo);
        setListaMensagem([...listaMensagem, conteudo.conteudo]);
        setMensagem("");
    }
    
    useEffect(() => {
        socket = socketIOClient(ENDPOINT)
    }, []);

    useEffect(() => {
        socket.on("mensagem_dados", (dados) => {
            setListaMensagem([...listaMensagem, dados]);
            console.log(dados);
        });
    });

    return (
        <div className="App">
            <h1>Chat</h1>
            {!logado ?
                <>
                    <label>Nome: </label>
                    <input type="text" placeholder="Nome" name="nome" value={name} onChange={(text) => {
                        setName(text.target.value)
                    }
                    } />
                    <br></br>
                    <label>Sala: </label>
                    {/*<input type="text" placeholder="Sala" value={sala} onChange={(text) => {
                        setSala(text.target.value)
                    }
                    } />
                    */}
                    <select name="sala" value={sala} onChange={(text) => { setSala(text.target.value) }}>
                        <option value="">Selecione</option>
                        <option value="1">Node.js</option>
                        <option value="2">React</option>
                        <option value="3">React Native</option>
                        <option value="4">PHP</option>
                    </select>
                    <br></br>
                    <button onClick={conecatarSala}>Acessar</button>
                </>
                :
                <>
                    {listaMensagem.map((msg, key)=>{
                        return(
                            <div key={key} >
                                {msg.name} : {msg.mensagem}
                            </div>
                        )
                    })}
                    <input type="text" name="mensagem" value={mensagem} placeholder="Mensagem..." onChange={(text) => { setMensagem(text.target.value) }} />
                    <button onClick={sendMassage}>Enviar</button>
                </>
            }
        </div>
    );
}

export default App;
