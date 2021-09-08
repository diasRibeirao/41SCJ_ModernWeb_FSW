import { CardPost } from "./styles";
import Coment from "../../components/Coment";
import imgProfile from "../../assets/profile.png"
import { useState } from "react";
import { getUser } from "../../services/security";
import { format } from "date-fns";
import { api } from "../../services/api";

function Post({ data }) {
    let signedUser = getUser();

    const [showComents, setShowComents] = useState(false);

    const toggleComents = (e) => setShowComents(!showComents);

    const [disabled, setDisabled] = useState(true);

    const [coment, setComent] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const handleDisabled = async (e) => {
        setDisabled(e.target.value.length < 10);
        setComent(e.target.value);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (coment.length < 10) 
            return alert("O comentário deve ter no mínimo 10 caracteres");

        setIsLoading(true);

        try {
            const response =  await api.post(`/questions/${data.id}/answers`, {
                description: coment
            });

            const responseArray = await api.get(`/students/${response.data.student_id}`);
            response.data["Student"] = responseArray.data;
            response.data["created_at"] = response.data.createdAt;

            data.Answers.push(response.data);
        } catch (error) {
            console.error(error);
            alert(error);
        } finally{
            setIsLoading(false);
        }
        
        setDisabled(true);
        setComent("");
    }
    
    return (
        <CardPost>
            <header>
                <img src={imgProfile} />
                <div>
                    <p>por {signedUser.studentId === data.Student.id ? "você" : data.Student.name}</p>
                    <span>em {format(new Date(data.created_at), "dd/MM/yyyy 'às' HH:mm")}</span>
                </div>
            </header>
            <main>
                <div>
                    <h2>{data.title}</h2>
                    <p>{data.description}</p>
                </div>
                {data.image && <img src={data.image} alt="imagem do post" />}
                <footer>
                    {data.Categories.map(c => <p key={c.id}>{c.description}</p>)}
                </footer>
            </main>
            <footer>
                <h3 onClick={toggleComents}>
                    {
                        data.Answers.length === 0 ?
                            "Seja o primeiro a comentar" :
                            `${data.Answers.length} Comentário${data.Answers.length > 1 ? "s" : ""}`
                    }
                </h3>
                {showComents && (
                    <>
                        {data.Answers.map(answer => <Coment data={answer} key={answer.id} />)}
                    </>
                )}

                {isLoading &&
                    <h4>Enviando Comentário...</h4>
                }
      
                {!isLoading &&
                    <div>
                        <form onSubmit={handleSubmit}>
                            <input placeholder="Comente este post" onChange={handleDisabled}/>
                            <button disabled={disabled}>Enviar</button>
                        </form>
                    </div>
                }
            </footer>
        </CardPost>
    ); 
}

export default Post;