import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import './App.css';
import {
    Container,
    Conteudo,
    Header,
    Form,
    Campo,
    Label,
    Input,
    Select,
    Button,
    HeaderChat,
    Img,
    NomeUsuario,
    Chatbox,
    ConteudoChat,
    MsgEnviada,
    DetMsgEnviar,
    TextMsgEnviar,
    MsgRecebida,
    DetMsgRecebida,
    TextMsgRecebida,
    SandMsg,
    InputMsg,
    ButtonMsg
} from '../src/styles/style'
import api from './config/api';

let socket;

function App() {

    const ENDPOINT = 'http://localhost:8080/';

    const [logado, setLogado] = useState(false);
    const [usuarioId, setUsuarioId] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [sala, setSala] = useState("");
    
    // const [logado, setLogado] = useState(true);
    // const [name, setName] = useState("Joao");
    // const [sala, setSala] = useState("1");
    
    const [mensagem, setMensagem] = useState("");
    const [listaMensagem, setListaMensagem] = useState([]);
    
    const conecatarSala = async e => {
        e.preventDefault();
        const headers = {
            'Content-Type': 'application/json'
        }
        await api.post("/validar-acesso", { email }, { headers })
        .then((response) => {
            //console.log(response.data.mensagem);
            setUsuarioId(response.data.usuario.id);
                setName(response.data.usuario.name);
                socket.emit("sala_conectada", sala);
                setLogado(true);
                listarMensagens();
            })
            .catch((err) => {
                if (err.response) {
                    console.log(err.response.data.mensagem);
                } else {
                    console.log("Api fora do ar!");
                }
            })
        }
        
        const listarMensagens = async () => {
            await api.get('/listar-messsages/' + sala)
            .then((response) => {
                console.log(response.data.messages)
                setListaMensagem(response.data.messages);
            })
            .catch((err) => {
                if (err.response) {
                    console.log(err.response.data.mensagem);
                } else {
                    console.log("Api fora do ar!");
                }
            })
    }

    const sendMassage = async e => {
        e.preventDefault();

        const conteudo = {
            sala: sala,
            conteudo: {
                mensagem: mensagem,
                usuario: {
                    id: usuarioId,
                    name: name
                }
            }
        }
        console.log(conteudo)
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
        });
    });

    return (
        <Container>
            {!logado ?
                <Conteudo>
                    <Header>Only chat</Header>
                    <Form onSubmit={conecatarSala}>
                        <Campo>
                            <Label>Nome: </Label>
                            <Input type="text" placeholder="E-mail" name="email" value={email} onChange={(text) => {
                                setEmail(text.target.value)
                            }
                            } />
                        </Campo>
                        <Campo>
                            <Label>Sala: </Label>
                            <Select name="sala" value={sala} onChange={(text) => { setSala(text.target.value) }}>
                                <option value="">Selecione</option>
                                <option value="1">Node.js</option>
                                <option value="2">React</option>
                                <option value="3">React Native</option>
                                <option value="4">PHP</option>
                            </Select>
                        </Campo>
                        <Button>Acessar</Button>
                    </Form>
                </Conteudo>
                :
                <ConteudoChat>
                    <HeaderChat>
                        <Img src="chat.png" alt={name} />
                        <NomeUsuario>Chat</NomeUsuario>
                    </HeaderChat>
                    <Chatbox>
                        {listaMensagem.map((msg, key) => {
                            return (
                                <div key={key}>
                                    {usuarioId === msg.usuario.id ?
                                        <MsgEnviada >
                                            <DetMsgEnviar>
                                                <TextMsgEnviar>{msg.usuario.name}: {msg.mensagem}</TextMsgEnviar>
                                            </DetMsgEnviar>
                                        </MsgEnviada>
                                        :
                                        <MsgRecebida>
                                            <DetMsgRecebida>
                                                <TextMsgRecebida>{msg.usuario.name}: {msg.mensagem}</TextMsgRecebida>
                                            </DetMsgRecebida>
                                        </MsgRecebida>
                                    }
                                </div>
                            )
                        })}
                    </Chatbox>
                    <SandMsg onSubmit={sendMassage}>
                        <InputMsg type="text" name="mensagem" value={mensagem} placeholder="Mensagem..." onChange={(text) => { setMensagem(text.target.value) }} />
                        <ButtonMsg>Enviar</ButtonMsg>
                    </SandMsg>
                </ConteudoChat>
            }
        </Container>
    );
}

export default App;
