import AddNote from "./AddNote";
import Notes from "./Notes";


export default function Home(props) {
    return (
        <div>
            <AddNote showAlert={props.showAlert} />
            <Notes showAlert={props.showAlert} />
        </div>
    )
}
