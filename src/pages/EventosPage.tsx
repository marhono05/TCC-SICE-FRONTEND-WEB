import { Link } from "react-router";

export default function EventosPage(){
    return(
        <>
            <div>
                <h1>Eventos</h1>
                <p>Essa é a página de Eventos</p>
                <Link to="/login">Voltar a tela de login</Link>
            </div>
        </>
    )
}